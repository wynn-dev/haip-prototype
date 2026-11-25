import "server-only";
import { and, asc, desc, eq, inArray, or, sql } from "drizzle-orm";
import { db, schema } from "@/db";

/**
 * Trusted-reporter prioritisation. The spec says this kicks in once the company
 * passes a revenue/employee threshold (EU DSA-style "trusted flagger" duty).
 * Toggle with PRIORITISE_TRUSTED_REPORTERS=false.
 */
export const PRIORITISE_TRUSTED = process.env.PRIORITISE_TRUSTED_REPORTERS !== "false";
const MIN_RESOLVED = 3;
const MIN_ACCURACY = 0.7;

/** How serious a report is, before anything else. Severity always outranks reporter trust. */
const SEVERITY: Record<string, number> = { underage: 60, scam: 50, harassment: 50, discrimination: 40, fake: 30, inappropriate: 20, other: 10 };
const TRUSTED_BONUS = 25;
const EXTRA_REPORTER = 15;

/**
 * A reporter's record counts *people* they reported, not reports, so repeats
 * can't inflate it. Removals later reversed on appeal ("overturned") count as wrong.
 */
export async function reporterStats() {
  const rows = await db
    .select({
      reporterId: schema.reports.reporterId,
      upheld: sql<number>`count(distinct ${schema.reports.reportedId}) filter (where ${schema.reports.status} = 'upheld')::int`,
      resolved: sql<number>`count(distinct ${schema.reports.reportedId}) filter (where ${schema.reports.status} <> 'open')::int`,
    })
    .from(schema.reports)
    .groupBy(schema.reports.reporterId);
  return new Map(
    rows
      .filter((r) => r.reporterId)
      .map((r) => [
        r.reporterId!,
        { ...r, accuracy: r.resolved ? r.upheld / r.resolved : 0, trusted: r.resolved >= MIN_RESOLVED && r.upheld / r.resolved >= MIN_ACCURACY },
      ]),
  );
}

export async function reportQueue() {
  const reporter = sql<string | null>`(select username from profiles where user_id = ${schema.reports.reporterId})`;
  const open = await db
    .select({
      r: schema.reports,
      reportedName: sql<string | null>`coalesce(${schema.profiles.username}, ${schema.reports.reportedUsername})`,
      reportedPhoto: schema.profiles.photoUrl,
      reporterName: reporter,
    })
    .from(schema.reports)
    .leftJoin(schema.profiles, eq(schema.profiles.userId, schema.reports.reportedId))
    .where(eq(schema.reports.status, "open"))
    .orderBy(desc(schema.reports.createdAt));
  const stats = await reporterStats();

  // distinct people reporting the same person
  const reporters = new Map<string, Set<string>>();
  for (const o of open) {
    if (!o.r.reportedId) continue;
    const set = reporters.get(o.r.reportedId) ?? new Set();
    set.add(o.r.reporterId ?? `anon-${o.r.id}`);
    reporters.set(o.r.reportedId, set);
  }

  const evidence = await conversations(open.map((o) => o.r));

  return open
    .map((o) => {
      const st = o.r.reporterId ? stats.get(o.r.reporterId) : undefined;
      const trusted = PRIORITISE_TRUSTED && !!st?.trusted;
      const pileOn = o.r.reportedId ? (reporters.get(o.r.reportedId)?.size ?? 1) : 1;
      return {
        ...o,
        reporterStats: st,
        trusted,
        pileOn,
        messages: evidence.get(o.r.id) ?? [],
        priority: (SEVERITY[o.r.reason] ?? 10) + (trusted ? TRUSTED_BONUS : 0) + Math.min(pileOn - 1, 4) * EXTRA_REPORTER,
      };
    })
    .sort((a, b) => b.priority - a.priority || +a.r.createdAt - +b.r.createdAt);
}

/** The chat between reporter and reported person (kept when the report closed it), as evidence. */
async function conversations(reports: (typeof schema.reports.$inferSelect)[]) {
  const out = new Map<number, { mine: boolean; body: string; at: Date }[]>();
  const pairs = reports.filter((r) => r.reporterId && r.reportedId);
  if (!pairs.length) return out;
  const ms = await db
    .select()
    .from(schema.matches)
    .where(or(...pairs.map((r) => { const [a, b] = [r.reporterId!, r.reportedId!].sort(); return and(eq(schema.matches.userA, a), eq(schema.matches.userB, b)); })));
  if (!ms.length) return out;
  const msgs = await db
    .select()
    .from(schema.messages)
    .where(inArray(schema.messages.matchId, ms.map((m) => m.id)))
    .orderBy(asc(schema.messages.id));
  for (const r of pairs) {
    const [a, b] = [r.reporterId!, r.reportedId!].sort();
    const m = ms.find((x) => x.userA === a && x.userB === b);
    if (!m) continue;
    out.set(r.id, msgs.filter((x) => x.matchId === m.id).slice(-30).map((x) => ({ mine: x.senderId === r.reporterId, body: x.body, at: x.createdAt })));
  }
  return out;
}
