import "server-only";
import { desc, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { matchesFor, rowsFor, toCard, loadRow, toPerson } from "@/lib/deck";

export async function getConversations(userId: string) {
  const ms = await matchesFor(userId);
  if (!ms.length) return [];
  const otherIds = ms.map((m) => (m.userA === userId ? m.userB : m.userA)).filter((x): x is string => !!x);
  const [rows, meRow, last] = await Promise.all([
    rowsFor(otherIds),
    loadRow(userId),
    db
      .selectDistinctOn([schema.messages.matchId])
      .from(schema.messages)
      .where(inArray(schema.messages.matchId, ms.map((m) => m.id)))
      .orderBy(schema.messages.matchId, desc(schema.messages.id)),
  ]);
  const me = meRow ? toPerson(meRow) : null;
  const byId = new Map(rows.map((r) => [r.user.id, r]));
  const lastBy = new Map(last.map((m) => [m.matchId, m]));
  return ms
    .map((m) => {
      const otherId = m.userA === userId ? m.userB : m.userA;
      const row = otherId ? byId.get(otherId) : undefined;
      if (!row || row.user.status !== "active") return null;
      const lastMsg = lastBy.get(m.id) ?? null;
      return {
        matchId: m.id,
        kind: m.kind,
        createdAt: m.createdAt,
        card: toCard(row, me, true),
        last: lastMsg,
        needsReply: !lastMsg || lastMsg.senderId !== userId,
      };
    })
    .filter((x) => x !== null)
    .sort((a, b) => +(b.last?.createdAt ?? b.createdAt) - +(a.last?.createdAt ?? a.createdAt));
}

