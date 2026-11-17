"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
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
  email: z.email("That email doesn't look right").transform((s) => s.toLowerCase().trim()),
  phone: z
    .string()
    .transform((s) => s.replace(/[\s()-]/g, ""))
    .pipe(z.string().regex(/^\+?\d{8,15}$/, "Use international format, e.g. +31 6 1234 5678")),
  password: z.string().min(8, "Password needs at least 8 characters"),
  dob: z.iso.date("Pick your date of birth"),
  consent: z.literal("on", { error: "Please accept the data terms" }),
});

export async function signup(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(fd));
  const values = keep(fd, "email", "phone", "dob");
  if (!parsed.success) return { error: parsed.error.issues[0].message, values };
  const { email, phone, password, dob } = parsed.data;
  if (ageFromDob(dob) < 18) return { error: "Sorry, you need to be 18 or older to use this app.", values };

  const existing = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email));
  if (existing.length) return { error: "There's already an account with that email. Log in instead?", values };

  const [u] = await db
    .insert(schema.users)
    .values({ email, phone: phone.startsWith("+") ? phone : `+${phone}`, passwordHash: await bcrypt.hash(password, 10), dateOfBirth: dob })
    .returning({ id: schema.users.id });

  const code = await issueCode(u.id, "login", phone);
  await setSession({ uid: u.id, stage: "2fa" });
  redirect(code ? `/verify?demo=${code}` : "/verify");
}

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").toLowerCase().trim();
  const password = String(fd.get("password") ?? "");
  const [u] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (!u || !(await bcrypt.compare(password, u.passwordHash))) return { error: "Email or password is wrong.", values: { email } };
  const code = await issueCode(u.id, "login", u.phone);
  await setSession({ uid: u.id, stage: "2fa" });
  redirect(code ? `/verify?demo=${code}` : "/verify");
}

export async function verifyLogin(_: FormState, fd: FormData): Promise<FormState> {
  const s = await getSession();
  if (!s) redirect("/login");
  const ok = await verifyCode(s.uid, "login", String(fd.get("code") ?? ""));
  if (!ok) return { error: "That code is wrong or expired." };
  await db
    .update(schema.users)
    .set({ phoneVerifiedAt: new Date() })
    .where(eq(schema.users.id, s.uid));
  await setSession({ uid: s.uid, stage: "full" });
  redirect("/app");
}

export async function resendCode(): Promise<FormState> {
  const s = await getSession();
  if (!s) redirect("/login");
  const [u] = await db.select().from(schema.users).where(eq(schema.users.id, s.uid));
  if (!u) redirect("/login");
  const code = await issueCode(u.id, "login", u.phone);
  return { ok: true, demoCode: code };
}

export async function logout() {
  await clearSession();
  redirect("/");
}
