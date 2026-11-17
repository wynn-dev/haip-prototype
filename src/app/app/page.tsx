import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDeck, likesLeft, loadRow } from "@/lib/deck";
import { Deck } from "./deck";

export const metadata = { title: "Discover" };

export default async function DiscoverPage() {
  const user = await requireUser();
  const [cards, left, me] = await Promise.all([getDeck(user), likesLeft(user.id), loadRow(user.id)]);
  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between px-4 pt-3 pb-2">
        <h1 className="text-[34px] leading-[41px] font-bold tracking-[-0.03em]">Discover</h1>
        <Link href="/app/me/edit" aria-label="Preferences" className="grid size-9 place-items-center rounded-full bg-fill active:opacity-60">
          <SlidersHorizontal className="size-[18px]" strokeWidth={2.2} />
        </Link>
      </header>
      <Deck
        key={cards.map((c) => c.userId).join()}
        initial={cards}
        initialLikesLeft={left}
        me={{ username: me!.profile.username, photoUrl: me!.profile.photoUrl }}
      />
    </main>
  );
}
