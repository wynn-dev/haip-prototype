import "server-only";
import { createHmac } from "node:crypto";
import { eq, or } from "drizzle-orm";
import { db, schema } from "@/db";

const pepper = process.env.AUTH_SECRET ?? "dev";
const norm = (s: string) => s.trim().toLowerCase().replace(/[\s()-]/g, "");
/** Keyed hash: lets us recognise a banned e-mail/phone without storing it. */
export const identityHash = (value: string) => createHmac("sha256", pepper).update(norm(value)).digest("hex");

export async function isBanned(email: string, phone: string) {
  const [row] = await db
    .select({ id: schema.bannedIdentities.id })
    .from(schema.bannedIdentities)
    .where(or(eq(schema.bannedIdentities.emailHash, identityHash(email)), eq(schema.bannedIdentities.phoneHash, identityHash(phone))))
    .limit(1);
  return !!row;
}

export async function ban(email: string, phone: string, reason: string) {
  await db
    .insert(schema.bannedIdentities)
    .values({ emailHash: identityHash(email), phoneHash: identityHash(phone), reason })
    .onConflictDoNothing();
}

export async function unban(email: string) {
  await db.delete(schema.bannedIdentities).where(eq(schema.bannedIdentities.emailHash, identityHash(email)));
}
