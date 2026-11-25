"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, isNull, or, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { currentUser, requireAdmin } from "@/lib/auth";
import { ban, unban } from "@/lib/identity";

const reportId = z.number().int().positive();

export async function resolveReport(id: number, outcome: "upheld" | "dismissed", removalReason?: string) {
  await requireAdmin();
  if (!reportId.safeParse(id).success || !["upheld", "dismissed"].includes(outcome)) return { error: "Invalid request" };
  const reason = String(removalReason ?? "").trim().slice(0, 1000);
  const [r] = await db.select().from(schema.reports).where(eq(schema.reports.id, id));
  if (!r) return { error: "Report not found" };

  if (outcome === "upheld" && reason && r.reportedId) {
    await removeUser(r.reportedId, reason);
    // every open report about this person was right, so each counts towards its reporter's record
    await db
      .update(schema.reports)
      .set({ status: "upheld", resolvedAt: new Date() })
      .where(and(eq(schema.reports.reportedId, r.reportedId), eq(schema.reports.status, "open")));
  } else {
    await db.update(schema.reports).set({ status: outcome, resolvedAt: new Date() }).where(eq(schema.reports.id, id));
  }
  refresh();
  return { ok: true };
}

/**
 * Remove someone: they're signed out everywhere, hidden from everyone, their
 * chats close, and their e-mail/phone are banned from signing up again (as
 * hashes). They can still log in to read the reason and appeal.
 */
async function removeUser(userId: string, reason: string) {
  const [u] = await db
    .update(schema.users)
    .set({ status: "removed", removalReason: reason, removedAt: new Date(), sessionVersion: sql`${schema.users.sessionVersion} + 1` })
    .where(eq(schema.users.id, userId))
    .returning({ email: schema.users.email, phone: schema.users.phone });
  if (!u) return;
  await ban(u.email, u.phone, reason);
  await db
    .update(schema.matches)
    .set({ endedAt: new Date(), endedReason: "removed" })
    .where(and(or(eq(schema.matches.userA, userId), eq(schema.matches.userB, userId)), isNull(schema.matches.endedAt)));
}

export async function resolveAppeal(appealId: number, accept: boolean, response: string) {
  await requireAdmin();
  if (!reportId.safeParse(appealId).success) return { error: "Invalid request" };
  const [a] = await db.select().from(schema.appeals).where(and(eq(schema.appeals.id, appealId), eq(schema.appeals.status, "pending")));
  if (!a) return { error: "Appeal not found" };
  await db
    .update(schema.appeals)
    .set({ status: accept ? "accepted" : "rejected", response: String(response ?? "").trim().slice(0, 1000) || null, resolvedAt: new Date() })
    .where(eq(schema.appeals.id, appealId));
  if (accept) {
    const [u] = await db
      .update(schema.users)
      .set({ status: "active", removalReason: null, removedAt: null })
      .where(eq(schema.users.id, a.userId))
      .returning({ email: schema.users.email });
    if (u) await unban(u.email);
    // the removal was wrong, so the reports behind it no longer count as correct
    await db
      .update(schema.reports)
      .set({ status: "overturned" })
      .where(and(eq(schema.reports.reportedId, a.userId), eq(schema.reports.status, "upheld")));
  }
  refresh();
  return { ok: true };
}

export async function markContactHandled(id: number) {
  await requireAdmin();
  if (!reportId.safeParse(id).success) return;
  await db.update(schema.contactRequests).set({ status: "handled" }).where(eq(schema.contactRequests.id, id));
  refresh();
}

/** Called by a removed user from /removed. One pending appeal at a time. */
export async function submitAppeal(_: unknown, fd: FormData) {
  const u = await currentUser();
  if (!u) redirect("/login");
  if (u.status !== "removed") redirect("/app");
  const message = String(fd.get("message") ?? "").trim();
  if (message.length < 20) return { error: "Please explain in at least 20 characters." };
  if (message.length > 3000) return { error: "Please keep it under 3,000 characters." };
  const pending = await db
    .select({ id: schema.appeals.id })
    .from(schema.appeals)
    .where(and(eq(schema.appeals.userId, u.id), eq(schema.appeals.status, "pending")));
  if (pending.length) return { error: "You already have an appeal in review." };
  await db.insert(schema.appeals).values({ userId: u.id, message });
  refresh();
  return { ok: true };
}
