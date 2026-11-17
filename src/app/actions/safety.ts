"use server";

import { refresh } from "next/cache";
import { and, eq, or } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { currentUser, requireUser } from "@/lib/auth";

async function deleteMatchBetween(a: string, b: string) {
  const [x, y] = [a, b].sort();
  await db.delete(schema.matches).where(and(eq(schema.matches.userA, x), eq(schema.matches.userB, y)));
}

export async function blockUser(targetId: string) {
  const user = await requireUser();
  if (targetId === user.id) return { error: "You can't block yourself" };
  await db.insert(schema.blocks).values({ blockerId: user.id, blockedId: targetId }).onConflictDoNothing();
  await deleteMatchBetween(user.id, targetId);
  refresh();
  return { ok: true };
}

export async function unblockUser(targetId: string) {
  const user = await requireUser();
  await db
    .delete(schema.blocks)
    .where(and(eq(schema.blocks.blockerId, user.id), eq(schema.blocks.blockedId, targetId)));
  refresh();
  return { ok: true };
}

export async function unmatch(matchId: string) {
  const user = await requireUser();
  await db
    .delete(schema.matches)
    .where(
      and(
        eq(schema.matches.id, matchId),
        or(eq(schema.matches.userA, user.id), eq(schema.matches.userB, user.id)),
      ),
    );
  refresh();
  return { ok: true };
}

const reportSchema = z.object({
  targetId: z.uuid(),
  reason: z.enum(["fake", "scam", "harassment", "discrimination", "inappropriate", "underage", "other"]),
  details: z.string().max(1000).default(""),
  alsoBlock: z.boolean().default(true),
});

/** Reporting always blocks too (by default) so the reporter never sees them again. */
export async function reportUser(input: z.input<typeof reportSchema>) {
  const user = await requireUser();
  const p = reportSchema.safeParse(input);
  if (!p.success) return { error: p.error.issues[0].message };
  if (p.data.targetId === user.id) return { error: "That's you" };
  await db.insert(schema.reports).values({
    reporterId: user.id,
    reportedId: p.data.targetId,
    reason: p.data.reason,
    details: p.data.details,
  });
  if (p.data.alsoBlock) {
    await db.insert(schema.blocks).values({ blockerId: user.id, blockedId: p.data.targetId }).onConflictDoNothing();
    await deleteMatchBetween(user.id, p.data.targetId);
  }
  refresh();
  return { ok: true };
}

const contactSchema = z.object({
  channel: z.enum(["user", "authority"]),
  name: z.string().trim().min(2, "Add your name"),
  email: z.email("Add a valid e-mail"),
  organisation: z.string().trim().optional(),
  subject: z.string().trim().min(3, "Add a subject"),
  body: z.string().trim().min(10, "Tell us a bit more (10+ characters)"),
});

export async function contactTeam(_: unknown, fd: FormData) {
  const p = contactSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: p.error.issues[0].message };
  if (p.data.channel === "authority" && !p.data.organisation) return { error: "Add your organisation" };
  const u = await currentUser();
  await db.insert(schema.contactRequests).values({ ...p.data, organisation: p.data.organisation || null, userId: u?.id ?? null });
  return { ok: true };
}
