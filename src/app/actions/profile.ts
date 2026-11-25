"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { and, eq, ne } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { issueCode, verifyCode } from "@/lib/otp";
import { ageFromDob } from "@/lib/matching";
import { institutionForEmail } from "@/lib/options";
import { profileSchema, type ProfileInput } from "@/lib/profile-schema";

function isOwnUpload(u: string, kind: "avatars" | "listings", uid: string) {
  const base = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");
  return (base !== "" && u.startsWith(`${base}/${kind}/${uid}/`)) || u.startsWith(`/uploads/${uid}/`);
}

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

  if (opts.finish && !user.ageVerifiedAt) return { error: "Finish the age check first" };

  // Photos must be our own uploads for this user (or unchanged): no third-party URLs,
  // which would let a profile track the IP address of everyone who views it.
  const [current] = await db.select({ photoUrl: schema.profiles.photoUrl }).from(schema.profiles).where(eq(schema.profiles.userId, user.id));
  const [currentListing] = await db.select({ photos: schema.listings.photos }).from(schema.listings).where(eq(schema.listings.userId, user.id));
  const known = new Set([current?.photoUrl, ...(currentListing?.photos ?? [])].filter(Boolean));
  const ownUpload = (u: string, kind: "avatars" | "listings") => known.has(u) || isOwnUpload(u, kind, user.id);
  if (p.photoUrl && !ownUpload(p.photoUrl, "avatars")) return { error: "Upload your photo with the photo button." };
  if (p.listing?.photos.some((u) => !ownUpload(u, "listings"))) return { error: "Upload listing photos with the + button." };

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
export async function verifyAge(input: "idin" | "id_scan"): Promise<Result> {
  const user = await requireUser({ onboarded: false });
  const method = z.enum(["idin", "id_scan"]).parse(input);
  // A real provider returns the verified date of birth; the simulation trusts the one given at sign-up,
  // and is labelled as simulated everywhere users see the result.
  if (ageFromDob(user.dateOfBirth) < 18) return { error: "You need to be 18 or older." };
  await db
    .update(schema.users)
    .set({ ageVerifiedAt: new Date(), ageVerificationMethod: `${method} (simulated)` })
    .where(eq(schema.users.id, user.id));
  refresh();
  return { ok: true };
}

export async function sendStudentCode(input: string): Promise<Result> {
  const user = await requireUser({ onboarded: false });
  const email = String(input ?? "").trim().toLowerCase().slice(0, 254);
  const institution = institutionForEmail(email);
  if (!institution || !z.email().safeParse(email).success)
    return { error: "Use the e-mail address from your Dutch university or hogeschool." };
  // one student address can verify only one account
  const [taken] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(and(eq(schema.users.studentEmail, email), ne(schema.users.id, user.id)))
    .limit(1);
  if (taken) return { error: "That student e-mail address is already linked to another account." };
  const issued = await issueCode(user.id, "student", email);
  if ("error" in issued) return { error: issued.error };
  return { ok: true, demoCode: issued.code, institution };
}

export async function confirmStudentCode(code: string): Promise<Result> {
  const user = await requireUser({ onboarded: false });
  const r = await verifyCode(user.id, "student", String(code ?? "").slice(0, 12));
  if (!r.ok) return { error: r.error };
  await db
    .update(schema.users)
    .set({
      studentEmail: r.row.target,
      studentInstitution: institutionForEmail(r.row.target),
      studentVerifiedAt: new Date(),
    })
    .where(eq(schema.users.id, user.id));
  refresh();
  return { ok: true };
}

export async function setLookingStatus(input: "looking" | "found_house" | "paused") {
  const user = await requireUser();
  const status = z.enum(["looking", "found_house", "paused"]).parse(input);
  await db.update(schema.profiles).set({ lookingStatus: status }).where(eq(schema.profiles.userId, user.id));
  refresh();
}
