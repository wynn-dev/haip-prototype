import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDeck, loadRow } from "@/lib/deck";
import { Deck } from "./deck";

export const metadata = { title: "Discover" };

export default async function DiscoverPage() {
  const user = await requireUser();
  const [cards, me] = await Promise.all([getDeck(user), loadRow(user.id)]);
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
        me={{ username: me!.profile.username, photoUrl: me!.profile.photoUrl }}
      />
    </main>
  );
}
