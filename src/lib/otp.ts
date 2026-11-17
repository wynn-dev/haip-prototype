import "server-only";
import { createHash, randomInt } from "node:crypto";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { db, schema } from "@/db";

const hash = (code: string) =>
  createHash("sha256").update(`${process.env.AUTH_SECRET ?? "dev"}:${code}`).digest("hex");

/** True when no real SMS/e-mail provider is configured: codes are shown in-app. */
export const DEMO_DELIVERY = !process.env.SMS_PROVIDER_KEY;

/**
 * Creates a code and "delivers" it. In demo mode the code is returned so the UI
 * can show it as a fake notification. Wire Twilio/MessageBird/Resend here.
 */
export async function issueCode(userId: string, purpose: "login" | "student", target: string) {
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
  return DEMO_DELIVERY ? code : null;
}

export async function activeCode(userId: string, purpose: "login" | "student") {
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

export async function verifyCode(userId: string, purpose: "login" | "student", code: string) {
  const row = await activeCode(userId, purpose);
  if (!row || row.codeHash !== hash(code.trim())) return null;
  await db
    .update(schema.otpCodes)
    .set({ consumedAt: new Date() })
    .where(eq(schema.otpCodes.id, row.id));
  return row;
}
