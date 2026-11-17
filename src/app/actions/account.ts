"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession, clearSession } from "@/lib/session";

/**
 * Permanently delete the account. Cascades remove profile, listing, swipes,
 * matches and messages. Reports filed *about* others are kept but anonymised
 * (reporter set null) so moderation decisions stay auditable.
 */
export async function deleteAccount(confirm: string) {
  const s = await getSession();
  if (!s || s.stage !== "full") redirect("/login");
  if (confirm.trim().toUpperCase() !== "DELETE") return { error: 'Type "DELETE" to confirm' };
  await db.delete(schema.users).where(eq(schema.users.id, s.uid));
  await clearSession();
  redirect("/?deleted=1");
}
