"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { currentUser } from "@/lib/auth";
import { deleteUserMedia } from "@/lib/r2";
import { clearSession } from "@/lib/session";

/**
 * Permanently delete the account: profile, listing, photos (from storage too),
 * swipes, blocks and login codes go. Deliberately kept, without your identity:
 * - messages, so the person you talked to keeps their side of the conversation
 *   (your name is removed);
 * - reports about you, and the ban if you were removed, so deleting an account
 *   can't be used to escape moderation;
 * - reports you filed, anonymised.
 * Removed users can delete their account too (right to erasure).
 */
export async function deleteAccount(confirm: string) {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (String(confirm ?? "").trim().toUpperCase() !== "DELETE") return { error: 'Type "DELETE" to confirm' };

  const [p] = await db.select({ username: schema.profiles.username }).from(schema.profiles).where(eq(schema.profiles.userId, user.id));
  if (p) await db.update(schema.reports).set({ reportedUsername: p.username }).where(eq(schema.reports.reportedId, user.id));
  try {
    await deleteUserMedia(user.id);
  } catch (e) {
    console.error("photo cleanup failed, continuing with account deletion", e);
  }
  await db.delete(schema.users).where(eq(schema.users.id, user.id));
  await clearSession();
  redirect("/?deleted=1");
}
