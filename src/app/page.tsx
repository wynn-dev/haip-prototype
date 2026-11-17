import Link from "next/link";
import { redirect } from "next/navigation";
import { Wordmark } from "@/components/brand";
import { HouseArt } from "@/components/house-art";
import { LegalFooter } from "@/components/legal-footer";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export default async function Landing() {
  const s = await getSession();
  if (s?.stage === "full") redirect("/app");

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-5 pt-5">
        <Wordmark />
        <Link href="/login" className="text-sm font-semibold underline decoration-2 underline-offset-4">
          Log in
        </Link>
      </header>

      <section className="px-5 pt-8">
        <p className="chip mb-4 bg-butter">🇳🇱 for students in the Netherlands</p>
        <h1 className="font-display text-[2.9rem] leading-[0.95] font-extrabold">
          Find your people <span className="text-oranje">before</span> you find the place.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          Swipe on housemates who match how you actually live: budget, area, contract length,
          cleaning standards, sleep schedule, allergies. Match both ways and you can chat.
        </p>
      </section>

      <div className="relative mx-5 mt-7 overflow-hidden rounded-2xl border-2 border-ink shadow-[5px_5px_0_0_var(--ink)]">
        <HouseArt seed="landing-grachten" count={4} className="h-48 w-full" />
        <div className="absolute top-3 right-3 rotate-6 rounded-lg border-2 border-ink bg-polder px-2 py-0.5 font-display text-lg font-extrabold text-paper">
          JA! 92%
        </div>
      </div>

      <section className="grid grid-cols-3 gap-2 px-5 pt-6 text-center">
        {[
          ["🏠", "Have a room", "find a tenant"],
          ["🎒", "Need a room", "find a place"],
          ["🤝", "Team up", "hunt together"],
        ].map(([e, t, s]) => (
          <div key={t} className="rounded-xl border-[1.5px] border-ink/70 bg-card px-1 py-3">
            <div className="text-2xl">{e}</div>
            <div className="mt-1 text-xs font-bold">{t}</div>
            <div className="text-[11px] text-muted-foreground">{s}</div>
          </div>
        ))}
      </section>

      <div className="mt-auto flex flex-col gap-2.5 px-5 pt-8">
        <Link href="/signup" className={cn(buttonVariants({ variant: "ink", size: "xl" }), "h-13")}>
          Get started, it&apos;s free
        </Link>
        <p className="text-center text-xs text-muted-foreground">
          Verified 18+ · phone 2FA · optional student check
        </p>
      </div>
      <LegalFooter />
    </main>
  );
}
