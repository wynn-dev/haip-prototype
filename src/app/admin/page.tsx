import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { LargeTitle, NavBar } from "@/components/ios";
import { PersonAvatar } from "@/components/person-avatar";
import { requireAdmin } from "@/lib/auth";
import { PRIORITISE_TRUSTED, reportQueue } from "@/lib/moderation";
import { REPORT_REASONS, labelOf } from "@/lib/options";
import { AppealActions, ContactDone, ReportActions } from "./actions";

export const metadata = { title: "Moderation" };

function Card({ children }: { children: React.ReactNode }) {
  return <li className="group-list p-4">{children}</li>;
}

function Heading({ title, count }: { title: string; count: number }) {
  return (
    <h2 className="flex items-baseline gap-2 px-4 pb-2 text-[22px] font-bold tracking-[-0.02em]">
      {title} <span className="text-[17px] font-normal text-label-2">{count}</span>
    </h2>
  );
}

export default async function AdminPage() {
  await requireAdmin();
  const [queue, appeals, contact] = await Promise.all([
    reportQueue(),
    db
      .select({ a: schema.appeals, email: schema.users.email, reason: schema.users.removalReason, username: schema.profiles.username })
      .from(schema.appeals)
      .innerJoin(schema.users, eq(schema.users.id, schema.appeals.userId))
      .leftJoin(schema.profiles, eq(schema.profiles.userId, schema.appeals.userId))
      .where(eq(schema.appeals.status, "pending"))
      .orderBy(schema.appeals.createdAt),
    db.select().from(schema.contactRequests).where(eq(schema.contactRequests.status, "new")).orderBy(desc(schema.contactRequests.channel), schema.contactRequests.createdAt),
  ]);

  return (
    <main className="flex flex-col gap-8 pb-12">
      <div>
        <NavBar back="/app/me" backLabel="Profile" />
        <LargeTitle sub={`Internal team. Trusted-reporter priority is ${PRIORITISE_TRUSTED ? "on" : "off"} (3+ resolved reports, 70%+ upheld).`}>Moderation</LargeTitle>
      </div>

      <section>
        <Heading title="Reports" count={queue.length} />
        {queue.length === 0 && <p className="px-4 text-[15px] text-label-2">Queue is empty.</p>}
        <ul className="flex flex-col gap-3 px-4">
          {queue.map((q) => (
            <Card key={q.r.id}>
              <div className="flex items-center gap-3">
                <PersonAvatar name={q.reportedName ?? "?"} src={q.reportedPhoto} className="size-10 text-base" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{q.reportedName ?? "No profile"}</p>
                  <p className="text-[13px] text-label-2">{labelOf(REPORT_REASONS, q.r.reason)} · by {q.reporterName ?? "deleted user"}</p>
                </div>
                <span className="text-[13px] text-label-2 tabular-nums">P{q.priority}</span>
              </div>
              {(q.trusted || q.pileOn > 1) && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {q.trusted && <span className="tag bg-green/15 text-green">Trusted reporter · {q.reporterStats!.upheld}/{q.reporterStats!.resolved} upheld</span>}
                  {q.pileOn > 1 && <span className="tag bg-orange/15 text-orange">{q.pileOn} open reports</span>}
                </div>
              )}
              {q.r.details && <p className="mt-3 rounded-[10px] bg-fill px-3 py-2 text-[15px]">{q.r.details}</p>}
              <ReportActions id={q.r.id} reason={labelOf(REPORT_REASONS, q.r.reason)} />
            </Card>
          ))}
        </ul>
      </section>

      <section>
        <Heading title="Appeals" count={appeals.length} />
        {appeals.length === 0 && <p className="px-4 text-[15px] text-label-2">No pending appeals.</p>}
        <ul className="flex flex-col gap-3 px-4">
          {appeals.map(({ a, email, reason, username }) => (
            <Card key={a.id}>
              <p className="font-semibold">{username ?? email}</p>
              <p className="text-[13px] text-red">Removed: {reason}</p>
              <p className="mt-3 rounded-[10px] bg-fill px-3 py-2 text-[15px]">{a.message}</p>
              <AppealActions id={a.id} />
            </Card>
          ))}
        </ul>
      </section>

      <section>
        <Heading title="Inbox" count={contact.length} />
        {contact.length === 0 && <p className="px-4 text-[15px] text-label-2">Nothing new.</p>}
        <ul className="flex flex-col gap-3 px-4">
          {contact.map((c) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {c.channel === "authority" && <span className="tag mb-2 bg-tint/15 text-tint">Authority · {c.organisation}</span>}
                  <p className="font-semibold">{c.subject}</p>
                  <p className="text-[13px] text-label-2">{c.name} · {c.email}</p>
                </div>
                <ContactDone id={c.id} />
              </div>
              <p className="mt-2 text-[15px] whitespace-pre-wrap">{c.body}</p>
            </Card>
          ))}
        </ul>
      </section>
    </main>
  );
}
