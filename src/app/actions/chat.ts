"use server";

import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { openMatchFor } from "@/lib/chat";

export async function sendMessage(matchId: string, body: string) {
  const user = await requireUser();
  const text = String(body ?? "").trim().slice(0, 2000);
  if (!text) return { error: "Empty message" };
  const m = await openMatchFor(user.id, matchId);
  if (!m) return { error: "This chat has ended" };
  const [msg] = await db.insert(schema.messages).values({ matchId: m.id, senderId: user.id, body: text }).returning();
  return { ok: true, message: msg };
}
