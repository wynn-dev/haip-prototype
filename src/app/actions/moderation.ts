"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { getSession } from "@/lib/session";

export async function resolveReport(reportId: number, outcome: "upheld" | "dismissed", removalReason?: string) {
  await requireAdmin();
  const [r] = await db.select().from(schema.reports).where(eq(schema.reports.id, reportId));
  if (!r) return { error: "Report not found" };
  if (outcome === "upheld" && removalReason?.trim()) {
    await removeUser(r.reportedId, removalReason);
    // every open report about this user was right, so it counts towards those reporters' accuracy
    await db
      .update(schema.reports)
      .set({ status: "upheld", resolvedAt: new Date() })
      .where(and(eq(schema.reports.reportedId, r.reportedId), eq(schema.reports.status, "open")));
  } else {
    await db.update(schema.reports).set({ status: outcome, resolvedAt: new Date() }).where(eq(schema.reports.id, reportId));
  }
  refresh();
  return { ok: true };
}

async function removeUser(userId: string, reason: string) {
  await db
    .update(schema.users)
    .set({ status: "removed", removalReason: reason.trim(), removedAt: new Date() })
    .where(eq(schema.users.id, userId));
}

export async function resolveAppeal(appealId: number, accept: boolean, response: string) {
  await requireAdmin();
  const [a] = await db.select().from(schema.appeals).where(eq(schema.appeals.id, appealId));
  if (!a) return { error: "Appeal not found" };
  await db
    .update(schema.appeals)
    .set({ status: accept ? "accepted" : "rejected", response: response.trim() || null, resolvedAt: new Date() })
    .where(eq(schema.appeals.id, appealId));
  if (accept) {
    await db
      .update(schema.users)
      .set({ status: "active", removalReason: null, removedAt: null })
      .where(eq(schema.users.id, a.userId));
  }
  refresh();
  return { ok: true };
}

export async function markContactHandled(id: number) {
  await requireAdmin();
  await db.update(schema.contactRequests).set({ status: "handled" }).where(eq(schema.contactRequests.id, id));
  refresh();
}

/** Called by a removed user from /removed. One pending appeal at a time. */
export async function submitAppeal(_: unknown, fd: FormData) {
  const s = await getSession();
  if (!s || s.stage !== "full") redirect("/login");
  const message = String(fd.get("message") ?? "").trim();
  if (message.length < 20) return { error: "Please explain in at least 20 characters." };
  const [u] = await db.select().from(schema.users).where(eq(schema.users.id, s.uid));
  if (!u || u.status !== "removed") redirect("/app");
  const pending = await db
    .select()
    .from(schema.appeals)
    .where(and(eq(schema.appeals.userId, u.id), eq(schema.appeals.status, "pending")));
  if (pending.length) return { error: "You already have an appeal in review." };
  await db.insert(schema.appeals).values({ userId: u.id, message });
  refresh();
  return { ok: true };
}
