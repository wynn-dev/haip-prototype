"use server";

import { refresh } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { issueCode, verifyCode } from "@/lib/otp";
import { institutionForEmail } from "@/lib/options";
import { profileSchema, type ProfileInput } from "@/lib/profile-schema";

type Result = { error?: string; ok?: boolean; demoCode?: string | null; institution?: string };

export async function saveProfile(input: ProfileInput, opts: { finish?: boolean } = {}): Promise<Result> {
  const user = await requireUser({ onboarded: false });
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const p = parsed.data;

  const taken = await db
    .select({ id: schema.profiles.userId })
    .from(schema.profiles)
    .where(and(eq(schema.profiles.username, p.username), ne(schema.profiles.userId, user.id)));
  if (taken.length) return { error: "That username is taken" };

  if (opts.finish && !user.ageVerifiedAt) return { error: "Finish the 18+ ID check first" };

  const { role, listing, ...profile } = p;
  const row = {
    ...profile,
    maxRent: role === "tenant" ? profile.maxRent : null,
    areas: role === "tenant" ? profile.areas : [],
    updatedAt: new Date(),
  };
  await db
    .insert(schema.profiles)
    .values({ userId: user.id, ...row })
    .onConflictDoUpdate({ target: schema.profiles.userId, set: row });

  if (role === "renter" && listing) {
    await db
      .insert(schema.listings)
      .values({ userId: user.id, ...listing })
      .onConflictDoUpdate({ target: schema.listings.userId, set: listing });
  } else {
    await db.delete(schema.listings).where(eq(schema.listings.userId, user.id));
  }

  await db
    .update(schema.users)
    .set({ role, ...(opts.finish && !user.onboardedAt ? { onboardedAt: new Date() } : {}) })
    .where(eq(schema.users.id, user.id));

  refresh();
  return { ok: true };
}

/**
 * 18+ check. In production this hands off to an identity provider (e.g. iDIN
 * via the user's bank, or an ID-document + selfie liveness check) and stores
 * only the yes/no result, never the document. Here it's simulated.
 */
export async function verifyAge(method: "idin" | "id_scan"): Promise<Result> {
  const user = await requireUser({ onboarded: false });
  await db
    .update(schema.users)
    .set({ ageVerifiedAt: new Date(), ageVerificationMethod: `${method} (demo)` })
    .where(eq(schema.users.id, user.id));
  refresh();
  return { ok: true };
}

export async function sendStudentCode(email: string): Promise<Result> {
  const user = await requireUser({ onboarded: false });
  const institution = institutionForEmail(email);
  if (!institution) return { error: "Use the e-mail address from your Dutch university or hogeschool." };
  const code = await issueCode(user.id, "student", email.trim().toLowerCase());
  return { ok: true, demoCode: code, institution };
}

export async function confirmStudentCode(code: string): Promise<Result> {
  const user = await requireUser({ onboarded: false });
  const row = await verifyCode(user.id, "student", code);
  if (!row) return { error: "That code is wrong or expired." };
  await db
    .update(schema.users)
    .set({
      studentEmail: row.target,
      studentInstitution: institutionForEmail(row.target),
      studentVerifiedAt: new Date(),
    })
    .where(eq(schema.users.id, user.id));
  refresh();
  return { ok: true };
}

export async function setLookingStatus(status: "looking" | "found_house" | "paused") {
  const user = await requireUser();
  await db.update(schema.profiles).set({ lookingStatus: status }).where(eq(schema.profiles.userId, user.id));
  refresh();
}
