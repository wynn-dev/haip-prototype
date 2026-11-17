import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { PersonAvatar } from "@/components/person-avatar";
import { requireAdmin } from "@/lib/auth";
import { PRIORITISE_TRUSTED, reportQueue } from "@/lib/moderation";
import { REPORT_REASONS, labelOf } from "@/lib/options";
import { AppealActions, ContactDone, ReportActions } from "./actions";

export const metadata = { title: "Moderation" };

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
    <main className="flex flex-col gap-7 px-5 pt-4 pb-10">
      <Link href="/app/me" className="flex items-center gap-1 text-sm font-semibold"><ArrowLeft className="size-4" /> App</Link>
      <div>
        <p className="chip mb-2 bg-ink text-paper">internal team</p>
        <h1 className="font-display text-4xl font-extrabold">Moderation</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Trusted-reporter priority: <b>{PRIORITISE_TRUSTED ? "on" : "off"}</b> (3+ resolved reports, at least 70% upheld).
        </p>
      </div>

      <section>
        <h2 className="mb-2 font-display text-2xl font-bold">Reports <span className="text-muted-foreground">({queue.length})</span></h2>
        {queue.length === 0 && <p className="text-sm text-muted-foreground">Queue empty 🎉</p>}
        <ul className="flex flex-col gap-3">
          {queue.map((q) => (
            <li key={q.r.id} className="ink-card p-4">
              <div className="flex items-center gap-3">
                <PersonAvatar name={q.reportedName ?? "?"} src={q.reportedPhoto} className="size-10" />
                <div className="flex-1">
                  <p className="font-semibold">{q.reportedName ?? "(no profile)"}</p>
                  <p className="text-xs text-muted-foreground">{labelOf(REPORT_REASONS, q.r.reason)} · {new Date(q.r.createdAt).toLocaleString("en-NL")}</p>
                </div>
                <span className="font-mono text-xs">P{q.priority}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {q.trusted && <span className="chip bg-polder text-paper">⭐ trusted reporter {q.reporterStats!.upheld}/{q.reporterStats!.resolved}</span>}
                {q.pileOn > 1 && <span className="chip bg-butter">{q.pileOn} open reports</span>}
                <span className="chip">by {q.reporterName ?? "deleted user"}</span>
              </div>
              {q.r.details && <p className="mt-2 rounded-xl bg-paper-2 p-2 text-sm">&ldquo;{q.r.details}&rdquo;</p>}
              <ReportActions id={q.r.id} reason={labelOf(REPORT_REASONS, q.r.reason)} />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-display text-2xl font-bold">Appeals <span className="text-muted-foreground">({appeals.length})</span></h2>
        {appeals.length === 0 && <p className="text-sm text-muted-foreground">No pending appeals.</p>}
        <ul className="flex flex-col gap-3">
          {appeals.map(({ a, email, reason, username }) => (
            <li key={a.id} className="ink-card p-4">
              <p className="font-semibold">{username ?? email}</p>
              <p className="text-xs text-brick">Removed for: {reason}</p>
              <p className="mt-2 rounded-xl bg-paper-2 p-2 text-sm">&ldquo;{a.message}&rdquo;</p>
              <AppealActions id={a.id} />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-display text-2xl font-bold">Inbox <span className="text-muted-foreground">({contact.length})</span></h2>
        {contact.length === 0 && <p className="text-sm text-muted-foreground">Inbox zero.</p>}
        <ul className="flex flex-col gap-3">
          {contact.map((c) => (
            <li key={c.id} className={`ink-card p-4 ${c.channel === "authority" ? "bg-canal/10" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  {c.channel === "authority" && <span className="chip mb-1 bg-canal text-paper">🚓 authority · {c.organisation}</span>}
                  <p className="font-semibold">{c.subject}</p>
                  <p className="text-xs text-muted-foreground">{c.name} · {c.email}</p>
                </div>
                <ContactDone id={c.id} />
              </div>
              <p className="mt-2 text-sm whitespace-pre-wrap">{c.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
