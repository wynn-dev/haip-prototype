import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { PersonAvatar } from "@/components/person-avatar";
import { requireUser } from "@/lib/auth";
import { REPORT_REASONS, labelOf } from "@/lib/options";
import { UnblockButton } from "./unblock-button";

export const metadata = { title: "Safety centre" };

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
  const statusTone = { open: "bg-butter", upheld: "bg-polder text-paper", dismissed: "bg-paper-2" } as const;

  return (
    <main className="flex flex-col gap-6 px-5 pt-4 pb-8">
      <Link href="/app/me" className="flex items-center gap-1 text-sm font-semibold"><ArrowLeft className="size-4" /> Me</Link>
      <div>
        <h1 className="font-display text-4xl font-extrabold">Safety centre</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Report or block anyone from the ••• menu on their card or chat. Reports go to a real person on our team.
        </p>
      </div>

      <section>
        <h2 className="mb-2 text-xs font-bold tracking-widest text-muted-foreground uppercase">Blocked ({blocked.length})</h2>
        {blocked.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nobody. Lovely.</p>
        ) : (
          <ul className="ink-card divide-y divide-ink/10 p-0">
            {blocked.map((b) => (
              <li key={b.id} className="flex items-center gap-3 px-4 py-2.5">
                <PersonAvatar name={b.username} src={b.photoUrl} className="size-9 grayscale" />
                <span className="flex-1 font-semibold">{b.username}</span>
                <UnblockButton id={b.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-xs font-bold tracking-widest text-muted-foreground uppercase">Your reports</h2>
        {reports.length === 0 ? (
          <p className="text-sm text-muted-foreground">You haven&apos;t reported anyone.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {reports.map(({ r, username }) => (
              <li key={r.id} className="ink-card flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-semibold">{username ?? "Removed account"}</p>
                  <p className="text-xs text-muted-foreground">{labelOf(REPORT_REASONS, r.reason)} · {new Date(r.createdAt).toLocaleDateString("en-NL")}</p>
                </div>
                <span className={`chip ${statusTone[r.status]}`}>{r.status === "open" ? "In review" : r.status === "upheld" ? "Action taken" : "No action"}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link href="/contact" className="ink-card block bg-lilac/40 p-4">
        <p className="font-display text-lg font-bold">Need to talk to someone?</p>
        <p className="text-sm">Our moderation team answers within 24 hours. In danger? Call 112.</p>
      </Link>
    </main>
  );
}
