import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "./session";

/** The logged-in (2FA-complete) user, or null. Revoked tokens (old session version) count as logged out. */
export const currentUser = cache(async () => {
  const s = await getSession();
  if (!s || s.stage !== "full") return null;
  const [u] = await db.select().from(schema.users).where(eq(schema.users.id, s.uid)).limit(1);
  if (!u || u.sessionVersion !== s.v) return null;
  return u;
});

/** For route handlers and actions that must not redirect: an active, onboarded-or-not user, or null. */
export async function activeUser() {
  const u = await currentUser();
  return u && u.status === "active" ? u : null;
}

/** Gate for the main app. Sends people to the right step of the funnel. */
export async function requireUser(opts: { onboarded?: boolean } = { onboarded: true }) {
  const s = await getSession();
  if (!s) redirect("/login");
  if (s.stage === "2fa") redirect("/verify");
  const u = await currentUser();
  if (!u) redirect("/login");
  if (u.status === "removed") redirect("/removed");
  if (opts.onboarded && !u.onboardedAt) redirect("/onboarding");
  return u;
}

export async function requireAdmin() {
  const u = await requireUser({ onboarded: false });
  if (!u.isAdmin) redirect("/app");
  return u;
}
