"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { blockedIds, getDeck, interactionKind, isDiscoverable, loadRow, toPerson } from "@/lib/deck";
import { passesHardFilters, scoreMatch } from "@/lib/matching";

export type SwipeResult = { ok: true; matchId: string | null } | { ok: false; error: string };

const input = z.object({ targetId: z.uuid(), direction: z.enum(["like", "pass"]) });
const GONE = { ok: false as const, error: "That profile is no longer available." };

export async function swipe(targetId: string, direction: "like" | "pass"): Promise<SwipeResult> {
  const user = await requireUser();
  const p = input.safeParse({ targetId, direction });
  if (!p.success || p.data.targetId === user.id) return GONE;

  const [meRow, themRow] = await Promise.all([loadRow(user.id), loadRow(p.data.targetId)]);
  // the server re-checks everything the deck checks, so the deck can't be bypassed
  if (!meRow || !themRow || !isDiscoverable(themRow)) return GONE;
  const me = toPerson(meRow);
  const them = toPerson(themRow);
  if (!passesHardFilters(me, them) || (await blockedIds(user.id)).has(themRow.user.id)) return GONE;

  const { score } = scoreMatch(me, them);
  await db
    .insert(schema.swipes)
    .values({ swiperId: user.id, targetId: themRow.user.id, direction: p.data.direction, score })
    .onConflictDoNothing();

  // a swipe is final: if you passed on someone before, a later "like" doesn't count
  const [mine] = await db
    .select({ direction: schema.swipes.direction })
    .from(schema.swipes)
    .where(and(eq(schema.swipes.swiperId, user.id), eq(schema.swipes.targetId, themRow.user.id)));
  if (mine?.direction !== "like") return { ok: true, matchId: null };

  const [back] = await db
    .select({ d: schema.swipes.direction })
    .from(schema.swipes)
    .where(and(eq(schema.swipes.swiperId, themRow.user.id), eq(schema.swipes.targetId, user.id), eq(schema.swipes.direction, "like")));
  if (!back) return { ok: true, matchId: null };

  const [a, b] = [user.id, themRow.user.id].sort();
  const [m] = await db
    .insert(schema.matches)
    .values({ userA: a, userB: b, kind: interactionKind(me, them)!, score })
    .onConflictDoNothing()
    .returning({ id: schema.matches.id });
  return { ok: true, matchId: m?.id ?? null };
}

/** Next page of the deck, skipping cards the client already holds. */
export async function loadMoreCards(exclude: string[]) {
  const user = await requireUser();
  const ids = z.array(z.uuid()).max(1000).safeParse(exclude);
  return (await getDeck(user, { exclude: ids.success ? ids.data : [] })).cards;
}
