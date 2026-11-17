import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "./session";

export const currentUser = cache(async () => {
  const s = await getSession();
  if (!s || s.stage !== "full") return null;
  const [u] = await db.select().from(schema.users).where(eq(schema.users.id, s.uid)).limit(1);
  return u ?? null;
});

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
