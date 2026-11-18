import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDeck, loadRow } from "@/lib/deck";
import type { Exclusion } from "@/lib/matching";
import { Deck } from "./deck";

export const metadata = { title: "Home" };

export default async function DiscoverPage() {
  const user = await requireUser();
  const [{ cards, stats }, me] = await Promise.all([getDeck(user), loadRow(user.id)]);
  const p = me!.profile;
  const label: Record<Exclusion, string> = {
    city: user.role === "renter" ? "Looking in other cities" : `Not in your cities (${p.areas.join(", ")})`,
    budget: `Above your budget (€${p.maxRent})`,
    age: `Outside your age range (${p.prefAgeMax >= 99 ? `${p.prefAgeMin}+` : `${p.prefAgeMin}–${p.prefAgeMax}`})`,
    gender: "Not a gender you chose",
    dealbreakers: "Ruled out by your dealbreakers",
    allergies: "Pets or smoke you're allergic to",
    "their-preferences": "Their preferences don't include you",
  };
  const hints = stats.excluded.map((e) => ({ label: label[e.reason], count: e.count }));
  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between px-4 pt-3 pb-2">
        <h1 className="text-[34px] leading-[41px] font-bold tracking-[-0.03em]">Home</h1>
        <Link href="/app/me/edit" className="flex h-9 items-center gap-1.5 rounded-full bg-fill px-3.5 text-[15px] font-medium active:opacity-60">
          <SlidersHorizontal className="size-[17px]" strokeWidth={2.2} /> Filters
        </Link>
      </header>
      <Deck
        key={cards.map((c) => c.userId).join()}
        initial={cards}
        total={stats.total}
        seen={stats.seen}
        hints={hints}
        me={{ username: me!.profile.username, photoUrl: me!.profile.photoUrl }}
      />
    </main>
  );
}
