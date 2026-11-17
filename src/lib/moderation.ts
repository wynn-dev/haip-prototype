import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";

/**
 * Trusted-reporter prioritisation. The spec says this kicks in once the company
 * passes a revenue/employee threshold (EU DSA-style "trusted flagger" duty).
 * Toggle with PRIORITISE_TRUSTED_REPORTERS=false.
 */
export const PRIORITISE_TRUSTED = process.env.PRIORITISE_TRUSTED_REPORTERS !== "false";
const MIN_RESOLVED = 3;
const MIN_ACCURACY = 0.7;

export async function reporterStats() {
  const rows = await db
    .select({
      reporterId: schema.reports.reporterId,
      upheld: sql<number>`count(*) filter (where ${schema.reports.status} = 'upheld')::int`,
      resolved: sql<number>`count(*) filter (where ${schema.reports.status} <> 'open')::int`,
    })
    .from(schema.reports)
    .groupBy(schema.reports.reporterId);
  return new Map(
    rows
      .filter((r) => r.reporterId)
      .map((r) => [
        r.reporterId!,
        {
          ...r,
          accuracy: r.resolved ? r.upheld / r.resolved : 0,
          trusted: r.resolved >= MIN_RESOLVED && r.upheld / r.resolved >= MIN_ACCURACY,
        },
      ]),
  );
}

export async function reportQueue() {
  const reporter = sql<string>`(select username from profiles where user_id = ${schema.reports.reporterId})`;
  const open = await db
    .select({ r: schema.reports, reportedName: schema.profiles.username, reportedPhoto: schema.profiles.photoUrl, reporterName: reporter })
    .from(schema.reports)
    .leftJoin(schema.profiles, eq(schema.profiles.userId, schema.reports.reportedId))
    .where(eq(schema.reports.status, "open"))
    .orderBy(desc(schema.reports.createdAt));
  const stats = await reporterStats();
  const countByReported = new Map<string, number>();
  for (const o of open) countByReported.set(o.r.reportedId, (countByReported.get(o.r.reportedId) ?? 0) + 1);

  return open
    .map((o) => {
      const st = o.r.reporterId ? stats.get(o.r.reporterId) : undefined;
      const trusted = PRIORITISE_TRUSTED && !!st?.trusted;
      const pileOn = countByReported.get(o.r.reportedId) ?? 1;
      const severe = ["scam", "underage", "harassment"].includes(o.r.reason);
      return {
        ...o,
        reporterStats: st,
        trusted,
        pileOn,
        priority: (trusted ? 100 : 0) + (severe ? 30 : 0) + Math.min(pileOn, 5) * 10,
      };
    })
    .sort((a, b) => b.priority - a.priority || +a.r.createdAt - +b.r.createdAt);
}
