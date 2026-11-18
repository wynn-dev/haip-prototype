"use server";

import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { blockedIds, getDeck, interactionKind, loadRow, toPerson } from "@/lib/deck";
import { passesHardFilters, scoreMatch } from "@/lib/matching";

export type SwipeResult = { ok: true; matchId: string | null } | { ok: false; error: string };

export async function swipe(targetId: string, direction: "like" | "pass"): Promise<SwipeResult> {
  const user = await requireUser();
  const [meRow, themRow] = await Promise.all([loadRow(user.id), loadRow(targetId)]);
  if (!meRow || !themRow || themRow.user.status !== "active")
    return { ok: false, error: "That profile is no longer available." };
  const me = toPerson(meRow);
  const them = toPerson(themRow);
  // server re-checks the filters so the deck can't be bypassed
  if (!passesHardFilters(me, them) || (await blockedIds(user.id)).has(targetId))
    return { ok: false, error: "That profile is no longer available." };

  const { score } = scoreMatch(me, them);
  await db
    .insert(schema.swipes)
    .values({ swiperId: user.id, targetId, direction, score })
    .onConflictDoNothing();

  let matchId: string | null = null;
  if (direction === "like") {
    const [back] = await db
      .select()
      .from(schema.swipes)
      .where(
        and(
          eq(schema.swipes.swiperId, targetId),
          eq(schema.swipes.targetId, user.id),
          eq(schema.swipes.direction, "like"),
        ),
      );
    if (back) {
      const [a, b] = [user.id, targetId].sort();
      const [m] = await db
        .insert(schema.matches)
        .values({ userA: a, userB: b, kind: interactionKind(me, them)!, score })
        .onConflictDoNothing()
        .returning({ id: schema.matches.id });
      matchId = m?.id ?? null;
    }
  }
  return { ok: true, matchId };
}

/** Next page of the deck, skipping cards the client already holds. */
export async function loadMoreCards(exclude: string[]) {
  const user = await requireUser();
  return (await getDeck(user, { exclude: exclude.slice(0, 500) })).cards;
}
