"use server";

import { and, eq, or } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";

export async function sendMessage(matchId: string, body: string) {
  const user = await requireUser();
  const text = body.trim().slice(0, 2000);
  if (!text) return { error: "Empty message" };
  const [m] = await db
    .select()
    .from(schema.matches)
    .where(and(eq(schema.matches.id, matchId), or(eq(schema.matches.userA, user.id), eq(schema.matches.userB, user.id))));
  if (!m) return { error: "This chat no longer exists" };
  const [msg] = await db.insert(schema.messages).values({ matchId, senderId: user.id, body: text }).returning();
  return { ok: true, message: msg };
}
