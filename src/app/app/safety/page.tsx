import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { LargeTitle, NavBar, Row, Section } from "@/components/ios";
import { PersonAvatar } from "@/components/person-avatar";
import { requireUser } from "@/lib/auth";
import { REPORT_REASONS, labelOf } from "@/lib/options";
import { UnblockButton } from "./unblock-button";

export const metadata = { title: "Safety centre" };

const STATUS = { open: "In review", upheld: "Action taken", dismissed: "No action" } as const;

export default async function SafetyPage() {
  const user = await requireUser();
  const [blocked, reports] = await Promise.all([
    db
      .select({ id: schema.blocks.blockedId, username: schema.profiles.username, photoUrl: schema.profiles.photoUrl })
      .from(schema.blocks)
      .innerJoin(schema.profiles, eq(schema.profiles.userId, schema.blocks.blockedId))
      .where(eq(schema.blocks.blockerId, user.id)),
    db
      .select({ r: schema.reports, username: schema.profiles.username })
      .from(schema.reports)
      .leftJoin(schema.profiles, eq(schema.profiles.userId, schema.reports.reportedId))
      .where(eq(schema.reports.reporterId, user.id))
      .orderBy(desc(schema.reports.createdAt)),
  ]);

  return (
    <main className="flex flex-col gap-8 pb-10">
      <div>
        <NavBar back="/app/me" backLabel="Profile" />
        <LargeTitle sub="Report or block anyone from the menu on their card or in a chat. Reports are reviewed by people, not bots.">Safety</LargeTitle>
      </div>

      <Section header="Blocked" footer={blocked.length ? "Blocked people can't see you, and you won't see them." : undefined}>
        {blocked.length === 0 ? (
          <Row label={<span className="text-label-2">Nobody</span>} />
        ) : (
          blocked.map((b) => (
            <div key={b.id} className="flex min-h-11 items-center gap-3 px-4 py-2">
              <PersonAvatar name={b.username} src={b.photoUrl} className="size-8 text-sm" />
              <span className="flex-1">{b.username}</span>
              <UnblockButton id={b.id} />
            </div>
          ))
        )}
      </Section>

      <Section header="Your reports">
        {reports.length === 0 ? (
          <Row label={<span className="text-label-2">You haven&apos;t reported anyone</span>} />
        ) : (
          reports.map(({ r, username }) => (
            <Row
              key={r.id}
              label={username ?? "Deleted account"}
              detail={`${labelOf(REPORT_REASONS, r.reason)} · ${new Date(r.createdAt).toLocaleDateString("en-GB")}`}
              value={<span className={r.status === "upheld" ? "text-green" : undefined}>{STATUS[r.status]}</span>}
            />
          ))
        )}
      </Section>

      <Section footer="In immediate danger? Call 112.">
        <Row label="Contact our team" tint href="/contact" />
      </Section>
    </main>
  );
}
