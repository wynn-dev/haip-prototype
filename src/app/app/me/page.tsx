import Link from "next/link";
import { BadgeCheck, ChevronRight, Download, GraduationCap, LifeBuoy, LogOut, Pencil, Shield, ShieldCheck, FileText } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { ProfileCard } from "@/components/profile-card";
import { requireUser } from "@/lib/auth";
import { loadRow, toCard } from "@/lib/deck";
import { StatusSwitch } from "./status-switch";
import { DeleteAccount } from "./delete-account";

export const metadata = { title: "Me" };

function Row({ href, icon: Icon, label, sub, download }: { href: string; icon: React.ElementType; label: string; sub?: string; download?: boolean }) {
  const inner = (
    <>
      <span className="grid size-9 place-items-center rounded-xl border-[1.5px] border-ink bg-paper"><Icon className="size-4.5" /></span>
      <span className="flex-1">
        <span className="block font-semibold">{label}</span>
        {sub && <span className="block text-xs text-muted-foreground">{sub}</span>}
      </span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </>
  );
  const cls = "flex items-center gap-3 px-4 py-3";
  return download ? <a href={href} download className={cls}>{inner}</a> : <Link href={href} className={cls}>{inner}</Link>;
}

export default async function MePage() {
  const user = await requireUser();
  const row = (await loadRow(user.id))!;
  const card = toCard(row, null, true);

  return (
    <main className="flex flex-col gap-6 px-5 pt-5 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl font-extrabold">Me</h1>
        <Link href="/app/me/edit" className="flex items-center gap-1.5 rounded-full border-2 border-ink bg-butter px-3 py-1.5 text-sm font-semibold shadow-[2px_2px_0_0_var(--ink)]">
          <Pencil className="size-3.5" /> Edit
        </Link>
      </div>

      <StatusSwitch value={row.profile.lookingStatus} />

      <section>
        <h2 className="mb-2 text-xs font-bold tracking-widest text-muted-foreground uppercase">How others see you</h2>
        <div className="rotate-[-1deg]">
          <ProfileCard c={card} showScore={false} className="shadow-[5px_5px_0_0_var(--ink)]" />
        </div>
      </section>

      <section className="ink-card divide-y divide-ink/10 overflow-hidden p-0">
        <Row href="/app/me/verify" icon={user.studentVerifiedAt ? GraduationCap : BadgeCheck} label="Verification" sub={[user.ageVerifiedAt ? "18+ ✓" : "18+ pending", user.studentVerifiedAt ? `Student ✓ ${user.studentInstitution}` : "Student: not verified"].join(" · ")} />
        <Row href="/app/safety" icon={Shield} label="Safety centre" sub="Blocked people, your reports" />
        <Row href="/contact" icon={LifeBuoy} label="Talk to a human" sub="Our team reads every message" />
        {user.isAdmin && <Row href="/admin" icon={ShieldCheck} label="Moderation" sub="Reports, appeals, contact" />}
      </section>

      <section className="ink-card divide-y divide-ink/10 overflow-hidden p-0">
        <Row href="/privacy" icon={FileText} label="What data we keep" sub="And what we do with it" />
        <Row href="/api/me/export" icon={Download} label="Export my data" sub="Profile, swipes, matches & messages (JSON)" download />
      </section>

      <div className="flex flex-col gap-2">
        <form action={logout}>
          <button className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-ink bg-card py-3 font-semibold">
            <LogOut className="size-4" /> Log out
          </button>
        </form>
        <DeleteAccount />
      </div>
      <p className="text-center text-xs text-muted-foreground">Signed in as {user.email}. Only you can see this.</p>
    </main>
  );
}
