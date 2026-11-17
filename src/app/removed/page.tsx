import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { logout } from "@/app/actions/auth";
import { Wordmark } from "@/components/brand";
import { getSession } from "@/lib/session";
import { AppealForm } from "./appeal-form";

export const metadata = { title: "Account removed" };

export default async function RemovedPage() {
  const s = await getSession();
  if (!s || s.stage !== "full") redirect("/login");
  const [u] = await db.select().from(schema.users).where(eq(schema.users.id, s.uid));
  if (!u) redirect("/login");
  if (u.status !== "removed") redirect("/app");
  const appeals = await db.select().from(schema.appeals).where(eq(schema.appeals.userId, u.id)).orderBy(desc(schema.appeals.id));
  const latest = appeals[0];

  return (
    <main className="flex flex-1 flex-col gap-5 px-5 pt-5 pb-8">
      <Wordmark />
      <div>
        <h1 className="font-display text-4xl leading-none font-extrabold">Your account was removed</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Removed on {u.removedAt ? new Date(u.removedAt).toLocaleDateString("en-NL", { dateStyle: "long" }) : "–"}. Your profile is hidden and you can&apos;t swipe or chat.
        </p>
      </div>
      <section className="ink-card border-brick bg-brick/5 p-4">
        <p className="text-xs font-bold tracking-widest text-brick uppercase">Reason</p>
        <p className="mt-1 text-[15px]">{u.removalReason}</p>
      </section>

      {latest?.status === "pending" ? (
        <section className="ink-card bg-butter/50 p-4">
          <p className="font-display text-lg font-bold">Appeal in review ⏳</p>
          <p className="text-sm">A different team member than the one who removed you will look at it. We&apos;ll reply by e-mail.</p>
        </section>
      ) : latest?.status === "rejected" ? (
        <section className="ink-card p-4">
          <p className="font-display text-lg font-bold">Appeal rejected</p>
          {latest.response && <p className="mt-1 text-sm">&ldquo;{latest.response}&rdquo;</p>}
          <p className="mt-2 text-xs text-muted-foreground">You can still export or delete your data, or contact us.</p>
        </section>
      ) : (
        <AppealForm />
      )}

      <div className="mt-auto flex flex-col gap-2 text-center text-sm">
        <a href="/api/me/export" download className="font-semibold underline">Export my data</a>
        <a href="/contact" className="font-semibold underline">Talk to a human</a>
        <form action={logout}><button className="font-semibold underline">Log out</button></form>
      </div>
    </main>
  );
}
