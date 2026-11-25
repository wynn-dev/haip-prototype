import "server-only";
import { and, eq, isNull, or } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";

/**
 * The chat `userId` may use right now: they're in it, it hasn't ended
 * (unmatch/block/report/removal), and the other person is still an active account.
 */
export async function openMatchFor(userId: string, matchId: string) {
  if (!z.uuid().safeParse(matchId).success) return null;
  const [m] = await db
    .select()
    .from(schema.matches)
    .where(and(eq(schema.matches.id, matchId), or(eq(schema.matches.userA, userId), eq(schema.matches.userB, userId)), isNull(schema.matches.endedAt)));
  if (!m) return null;
  const otherId = m.userA === userId ? m.userB : m.userA;
  if (!otherId) return null;
  const [other] = await db.select({ status: schema.users.status }).from(schema.users).where(eq(schema.users.id, otherId));
  if (!other || other.status !== "active") return null;
  return { ...m, otherId };
}
