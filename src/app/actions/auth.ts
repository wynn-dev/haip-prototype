"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { currentUser } from "@/lib/auth";
import { isBanned } from "@/lib/identity";
import { ageFromDob } from "@/lib/matching";
import { issueCode, verifyCode } from "@/lib/otp";
import { clearSession, getSession, setSession } from "@/lib/session";

export type FormState =
  | { error?: string; ok?: boolean; demoCode?: string | null; values?: Record<string, string> }
  | undefined;

/** Echo back non-secret fields so a failed submit doesn't wipe the form. */
const keep = (fd: FormData, ...keys: string[]) =>
  Object.fromEntries(keys.map((k) => [k, String(fd.get(k) ?? "")]));

const signupSchema = z.object({
  email: z.email("That e-mail address doesn't look right").max(254).transform((s) => s.toLowerCase().trim()),
  phone: z
    .string()
    .transform((s) => s.replace(/[\s()-]/g, ""))
    .pipe(z.string().regex(/^\+?\d{8,15}$/, "Use international format, e.g. +31 6 1234 5678")),
  password: z.string().min(8, "Password needs at least 8 characters").max(200),
  dob: z.iso.date("Enter your date of birth"),
  consent: z.literal("on", { error: "Please confirm you've read how we use your data" }),
});

const toVerify = (code: string | null) => redirect(code ? `/verify?demo=${code}` : "/verify");

export async function signup(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(fd));
  const values = keep(fd, "email", "phone", "dob");
  if (!parsed.success) return { error: parsed.error.issues[0].message, values };
  const { email, password, dob } = parsed.data;
  const phone = parsed.data.phone.startsWith("+") ? parsed.data.phone : `+${parsed.data.phone}`;
  const age = ageFromDob(dob);
  if (age < 18) return { error: "Sorry, you need to be 18 or older to use this app.", values };
  if (age > 100) return { error: "Check your date of birth.", values };
  if (await isBanned(email, phone))
    return { error: "This e-mail address or phone number can't be used to create an account. Contact us if you think this is a mistake.", values };

  const [u] = await db
    .insert(schema.users)
    .values({ email, phone, passwordHash: await bcrypt.hash(password, 10), dateOfBirth: dob })
    .onConflictDoNothing({ target: schema.users.email })
    .returning({ id: schema.users.id });
  if (!u) return { error: "There's already an account with that e-mail address. Log in instead?", values };

  const issued = await issueCode(u.id, "login", phone, { enforceGap: false });
  await setSession({ uid: u.id, stage: "2fa", v: 0 });
  toVerify("code" in issued ? issued.code : null);
}

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").toLowerCase().trim();
  const password = String(fd.get("password") ?? "");
  const [u] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (!u || !(await bcrypt.compare(password, u.passwordHash)))
    return { error: "E-mail or password is wrong.", values: { email } };
  const issued = await issueCode(u.id, "login", u.phone, { enforceGap: false });
  if ("error" in issued) return { error: issued.error, values: { email } };
  await setSession({ uid: u.id, stage: "2fa", v: u.sessionVersion });
  toVerify(issued.code);
}

export async function verifyLogin(_: FormState, fd: FormData): Promise<FormState> {
  const s = await getSession();
  if (!s) redirect("/login");
  const r = await verifyCode(s.uid, "login", String(fd.get("code") ?? ""));
  if (!r.ok) return { error: r.error };
  const [u] = await db
    .update(schema.users)
    .set({ phoneVerifiedAt: new Date() })
    .where(eq(schema.users.id, s.uid))
    .returning({ v: schema.users.sessionVersion });
  if (!u) redirect("/login");
  await setSession({ uid: s.uid, stage: "full", v: u.v });
  redirect("/app");
}

export async function resendCode(): Promise<FormState> {
  const s = await getSession();
  if (!s) redirect("/login");
  const [u] = await db.select().from(schema.users).where(eq(schema.users.id, s.uid));
  if (!u) redirect("/login");
  const issued = await issueCode(u.id, "login", u.phone);
  if ("error" in issued) return { error: issued.error };
  return { ok: true, demoCode: issued.code };
}

/** Logging out signs you out everywhere: every existing session token stops working. */
export async function logout() {
  const u = await currentUser();
  if (u) await db.update(schema.users).set({ sessionVersion: sql`${schema.users.sessionVersion} + 1` }).where(eq(schema.users.id, u.id));
  await clearSession();
  redirect("/");
}
