import "server-only";
import { createHash, randomInt } from "node:crypto";
import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { db, schema } from "@/db";

const hash = (code: string) =>
  createHash("sha256").update(`${process.env.AUTH_SECRET ?? "dev"}:${code}`).digest("hex");

/** True when no real SMS/e-mail provider is configured: codes are shown in-app. */
export const DEMO_DELIVERY = !process.env.SMS_PROVIDER_KEY;

/** Wrong guesses allowed per code before it's burned. */
export const MAX_OTP_ATTEMPTS = 5;
/** Minimum gap between codes, and maximum codes per hour (SMS-pumping protection). */
const RESEND_GAP_MS = 30_000;
const MAX_PER_HOUR = 8;

type Purpose = "login" | "student";

/**
 * Creates a code and "delivers" it. Any older unused code for the same purpose
 * is invalidated. In demo mode the code is returned so the UI can show it as a
 * fake notification. Wire Twilio/MessageBird/Resend here.
 */
export async function issueCode(
  userId: string,
  purpose: Purpose,
  target: string,
  { enforceGap = true }: { enforceGap?: boolean } = {},
): Promise<{ code: string | null } | { error: string }> {
  const [recent] = await db
    .select({
      last: sql<Date | null>`max(${schema.otpCodes.createdAt})`,
      n: sql<number>`count(*) filter (where ${schema.otpCodes.createdAt} > now() - interval '1 hour')::int`,
    })
    .from(schema.otpCodes)
    .where(and(eq(schema.otpCodes.userId, userId), eq(schema.otpCodes.purpose, purpose)));
  if (enforceGap && recent?.last && Date.now() - +new Date(recent.last) < RESEND_GAP_MS)
    return { error: "A code was just sent. Wait 30 seconds before asking for a new one." };
  if ((recent?.n ?? 0) >= MAX_PER_HOUR) return { error: "Too many codes requested. Try again in an hour." };

  await db
    .update(schema.otpCodes)
    .set({ consumedAt: new Date() })
    .where(and(eq(schema.otpCodes.userId, userId), eq(schema.otpCodes.purpose, purpose), isNull(schema.otpCodes.consumedAt)));

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await db.insert(schema.otpCodes).values({
    userId,
    purpose,
    target,
    codeHash: hash(code),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });
  if (!DEMO_DELIVERY) {
    // TODO: send via provider
  }
  return { code: DEMO_DELIVERY ? code : null };
}

async function activeCode(userId: string, purpose: Purpose) {
  const [row] = await db
    .select()
    .from(schema.otpCodes)
    .where(
      and(
        eq(schema.otpCodes.userId, userId),
        eq(schema.otpCodes.purpose, purpose),
        isNull(schema.otpCodes.consumedAt),
        gt(schema.otpCodes.expiresAt, new Date()),
      ),
    )
    .orderBy(desc(schema.otpCodes.id))
    .limit(1);
  return row ?? null;
}

/** Checks a code. Wrong guesses count; after MAX_OTP_ATTEMPTS the code is burned. */
export async function verifyCode(userId: string, purpose: Purpose, code: string) {
  const row = await activeCode(userId, purpose);
  if (!row) return { ok: false as const, error: "That code has expired. Ask for a new one." };
  if (row.codeHash !== hash(code.trim())) {
    const attempts = row.attempts + 1;
    await db
      .update(schema.otpCodes)
      .set({ attempts, ...(attempts >= MAX_OTP_ATTEMPTS ? { consumedAt: new Date() } : {}) })
      .where(eq(schema.otpCodes.id, row.id));
    return {
      ok: false as const,
      error: attempts >= MAX_OTP_ATTEMPTS ? "Too many wrong tries. Ask for a new code." : "That code is wrong. Check it and try again.",
    };
  }
  await db.update(schema.otpCodes).set({ consumedAt: new Date() }).where(eq(schema.otpCodes.id, row.id));
  return { ok: true as const, row };
}
