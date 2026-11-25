"use server";

import { refresh } from "next/cache";
import { and, eq, isNull, or } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { currentUser, requireUser } from "@/lib/auth";

const id = z.uuid();

/**
 * Close the chat between two people. Messages are kept (not deleted) so a
 * report can still be reviewed; neither person can see or send messages any more.
 */
async function endMatchBetween(a: string, b: string, reason: "blocked" | "reported" | "unmatched") {
  const [x, y] = [a, b].sort();
  await db
    .update(schema.matches)
    .set({ endedAt: new Date(), endedReason: reason })
    .where(and(eq(schema.matches.userA, x), eq(schema.matches.userB, y), isNull(schema.matches.endedAt)));
}

async function exists(userId: string) {
  const [u] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.id, userId));
  return !!u;
}

export async function blockUser(targetId: string) {
  const user = await requireUser();
  if (!id.safeParse(targetId).success || !(await exists(targetId))) return { error: "That person doesn't exist" };
  if (targetId === user.id) return { error: "You can't block yourself" };
  await db.insert(schema.blocks).values({ blockerId: user.id, blockedId: targetId }).onConflictDoNothing();
  await endMatchBetween(user.id, targetId, "blocked");
  refresh();
  return { ok: true };
}

export async function unblockUser(targetId: string) {
  const user = await requireUser();
  if (!id.safeParse(targetId).success) return { error: "That person doesn't exist" };
  await db.delete(schema.blocks).where(and(eq(schema.blocks.blockerId, user.id), eq(schema.blocks.blockedId, targetId)));
  refresh();
  return { ok: true };
}

export async function unmatch(matchId: string) {
  const user = await requireUser();
  if (!id.safeParse(matchId).success) return { error: "This chat doesn't exist" };
  await db
    .update(schema.matches)
    .set({ endedAt: new Date(), endedReason: "unmatched" })
    .where(and(eq(schema.matches.id, matchId), or(eq(schema.matches.userA, user.id), eq(schema.matches.userB, user.id)), isNull(schema.matches.endedAt)));
  refresh();
  return { ok: true };
}

const reportSchema = z.object({
  targetId: z.uuid(),
  reason: z.enum(["fake", "scam", "harassment", "discrimination", "inappropriate", "underage", "other"]),
  details: z.string().trim().max(1000).default(""),
  alsoBlock: z.boolean().default(true),
});

/**
 * Report someone. One open report per person you report (repeats are ignored,
 * so nobody can inflate their reporter record). Also blocks them by default;
 * the conversation is kept so our team can read it.
 */
export async function reportUser(input: z.input<typeof reportSchema>) {
  const user = await requireUser();
  const p = reportSchema.safeParse(input);
  if (!p.success) return { error: "Choose a reason for the report" };
  if (p.data.targetId === user.id) return { error: "You can't report yourself" };
  const [target] = await db
    .select({ username: schema.profiles.username })
    .from(schema.users)
    .leftJoin(schema.profiles, eq(schema.profiles.userId, schema.users.id))
    .where(eq(schema.users.id, p.data.targetId));
  if (!target) return { error: "That person doesn't exist" };

  await db
    .insert(schema.reports)
    .values({
      reporterId: user.id,
      reportedId: p.data.targetId,
      reportedUsername: target.username,
      reason: p.data.reason,
      details: p.data.details,
    })
    .onConflictDoNothing(); // the partial unique index allows one open report per pair
  if (p.data.alsoBlock) {
    await db.insert(schema.blocks).values({ blockerId: user.id, blockedId: p.data.targetId }).onConflictDoNothing();
    await endMatchBetween(user.id, p.data.targetId, "reported");
  }
  refresh();
  return { ok: true };
}

const contactSchema = z.object({
  channel: z.enum(["user", "authority"]),
  name: z.string().trim().min(2, "Add your name").max(100),
  email: z.email("Add a valid e-mail address").max(254),
  organisation: z.string().trim().max(150).optional(),
  subject: z.string().trim().min(3, "Add a subject").max(150),
  body: z.string().trim().min(10, "Tell us a bit more (10+ characters)").max(5000),
});

export async function contactTeam(_: unknown, fd: FormData) {
  const p = contactSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: p.error.issues[0].message };
  if (p.data.channel === "authority" && !p.data.organisation) return { error: "Add your organisation" };
  const u = await currentUser();
  await db.insert(schema.contactRequests).values({ ...p.data, organisation: p.data.organisation || null, userId: u?.id ?? null });
  return { ok: true };
}
