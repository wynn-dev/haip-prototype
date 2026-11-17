import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { Wordmark } from "@/components/brand";
import { requireUser } from "@/lib/auth";
import { getDeck, likesLeft, loadRow } from "@/lib/deck";
import { Deck } from "./deck";

export const metadata = { title: "Discover" };

export default async function DiscoverPage() {
  const user = await requireUser();
  const [cards, left, me] = await Promise.all([getDeck(user), likesLeft(user.id), loadRow(user.id)]);
  return (
    <main className="flex h-[calc(100dvh-4.5rem)] flex-col sm:h-[calc(100dvh-3rem-4.5rem)]">
      <header className="flex items-center justify-between px-5 pt-4 pb-3">
        <Wordmark />
        <Link href="/app/me/edit" className="flex items-center gap-1.5 rounded-full border-[1.5px] border-ink bg-card px-3 py-1.5 text-xs font-semibold">
          <SlidersHorizontal className="size-3.5" /> Preferences
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
