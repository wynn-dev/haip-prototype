import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { logout } from "@/app/actions/auth";
import { AppIcon } from "@/components/brand";
import { Row, Section } from "@/components/ios";
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
    <main className="flex flex-1 flex-col gap-8 pt-10 pb-10">
      <div className="flex flex-col items-center gap-3 px-8 text-center">
        <AppIcon className="size-14" />
        <h1 className="mt-3 text-[28px] leading-tight font-bold tracking-[-0.03em]">Your account has been removed</h1>
        <p className="text-[15px] text-label-2">
          {u.removedAt ? new Date(u.removedAt).toLocaleDateString("en-GB", { dateStyle: "long" }) : ""}. Your profile is hidden and you can&apos;t browse or chat.
        </p>
      </div>

      <Section header="Reason">
        <p className="px-4 py-3 text-[15px] leading-relaxed">{u.removalReason}</p>
      </Section>

      {latest?.status === "pending" ? (
        <Section header="Appeal" footer="A different team member than the one who removed you reviews it. We'll reply by e-mail.">
          <Row label="In review" value="Submitted" />
        </Section>
      ) : latest?.status === "rejected" ? (
        <Section header="Appeal" footer="You can still export or delete your data, or contact us.">
          <Row label="Rejected" />
          {latest.response && <p className="px-4 py-3 text-[15px] text-label-2">{latest.response}</p>}
        </Section>
      ) : (
        <AppealForm />
      )}

      <Section>
        <Row label="Export my data" tint href="/api/me/export" download chevron={false} />
        <Row label="Contact us" tint href="/contact" chevron={false} />
        <form action={logout}><button className="flex min-h-11 w-full items-center px-4 text-tint">Log out</button></form>
      </Section>
    </main>
  );
}
