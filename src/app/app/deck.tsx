"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Heart, Inbox, MoreHorizontal, X } from "lucide-react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { toast } from "sonner";
import { swipe } from "@/app/actions/swipe";
import { PersonAvatar } from "@/components/person-avatar";
import { ProfileCard } from "@/components/profile-card";
import { SafetyDrawer } from "@/components/report-sheet";
import { buttonVariants } from "@/components/ui/button";
import type { CardData } from "@/lib/deck";
import { cn } from "@/lib/utils";

const THRESHOLD = 110;

function SwipeCard({
  card,
  onDecide,
  forced,
  onMore,
}: {
  card: CardData;
  onDecide: (d: "like" | "pass") => void;
  forced: "like" | "pass" | null;
  onMore: () => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-10, 10]);
  const likeOpacity = useTransform(x, [30, THRESHOLD], [0, 1]);
  const passOpacity = useTransform(x, [-THRESHOLD, -30], [1, 0]);

  const fly = (d: "like" | "pass") =>
    animate(x, d === "like" ? 520 : -520, { duration: 0.3, ease: [0.4, 0, 1, 1] }).then(() => onDecide(d));

  useEffect(() => {
    if (forced) void fly(forced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forced]);

  return (
    <motion.div
      className="absolute inset-0 touch-pan-y"
      style={{ x, rotate }}
      drag="x"
      dragDirectionLock
      dragSnapToOrigin
      dragElastic={0.85}
      onDragEnd={(_, info: PanInfo) => {
        if (info.offset.x > THRESHOLD || info.velocity.x > 700) void fly("like");
        else if (info.offset.x < -THRESHOLD || info.velocity.x < -700) void fly("pass");
      }}
      initial={{ scale: 0.95, opacity: 0.6 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="h-full overflow-y-auto overscroll-contain rounded-[28px] shadow-[var(--shadow-card)] scrollbar-none [container-type:size]">
        <ProfileCard c={card} fill />
      </div>
      <button
        onClick={onMore}
        className="absolute top-5 left-4 grid size-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md"
        aria-label="Report or block"
      >
        <MoreHorizontal className="size-5" />
      </button>
      <motion.div style={{ opacity: likeOpacity }} className="pointer-events-none absolute inset-0 grid place-items-center rounded-[28px] bg-positive/15">
        <span className="grid size-24 place-items-center rounded-full bg-positive text-white shadow-lg"><Heart className="size-11 fill-white" /></span>
      </motion.div>
      <motion.div style={{ opacity: passOpacity }} className="pointer-events-none absolute inset-0 grid place-items-center rounded-[28px] bg-black/10">
        <span className="grid size-24 place-items-center rounded-full bg-surface text-label shadow-lg"><X className="size-11" strokeWidth={2.5} /></span>
      </motion.div>
    </motion.div>
  );
}

export function Deck({
  initial,
  me,
}: {
  initial: CardData[];
  me: { username: string; photoUrl: string | null };
}) {
  const [cards, setCards] = useState(initial);
  const [forced, setForced] = useState<"like" | "pass" | null>(null);
  const [match, setMatch] = useState<{ id: string; card: CardData } | null>(null);
  const [safety, setSafety] = useState(false);
  const [, start] = useTransition();
  const top = cards[0];

  const decide = (d: "like" | "pass") => {
    const card = cards[0];
    if (!card) return;
    setForced(null);
    setCards((c) => c.slice(1));
    start(async () => {
      const r = await swipe(card.userId, d);
      if (!r.ok) return void toast.error(r.error);
      if (r.matchId) setMatch({ id: r.matchId, card });
    });
  };

  const press = (d: "like" | "pass") => {
    if (!top || forced) return;
    setForced(d);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <p className="px-4 pb-3 text-[15px] text-label-2">
        {cards.length > 0 ? `${cards.length} ${cards.length === 1 ? "person matches" : "people match"} your filters` : "Nobody new right now"}
      </p>

      <div className="relative mx-3 min-h-0 flex-1">
        {cards.length === 0 ? (
          <EmptyDeck />
        ) : (
          <>
            {cards[1] && (
              <div className="absolute inset-0 scale-[0.95] overflow-hidden rounded-[28px] opacity-60 [container-type:size]">
                <ProfileCard c={cards[1]} fill />
              </div>
            )}
            <AnimatePresence>
              <SwipeCard key={top.userId} card={top} onDecide={decide} forced={forced} onMore={() => setSafety(true)} />
            </AnimatePresence>
          </>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-center gap-8 py-4">
        <button
          onClick={() => press("pass")}
          disabled={!top}
          className="grid size-[60px] place-items-center rounded-full bg-surface shadow-[var(--shadow-float)] transition-transform active:scale-90 disabled:opacity-40"
          aria-label="Pass"
          title="Pass"
        >
          <X className="size-7 text-label-2" strokeWidth={2.5} />
        </button>
        <button
          onClick={() => press("like")}
          disabled={!top}
          className="grid size-[60px] place-items-center rounded-full bg-label shadow-[var(--shadow-float)] transition-transform active:scale-90 disabled:opacity-40"
          aria-label="Like"
          title="Like"
        >
          <Heart className="size-7 fill-on-label text-on-label" strokeWidth={0} />
        </button>
      </div>

      {top && (
        <SafetyDrawer open={safety} onOpenChange={setSafety} targetId={top.userId} name={top.username} onDone={() => setCards((c) => c.slice(1))} />
      )}

      <AnimatePresence>
        {match && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg/85 px-8 text-center backdrop-blur-2xl"
          >
            <motion.div initial={{ scale: 0.9, y: 12 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} className="flex flex-col items-center">
              <div className="flex items-center">
                <PersonAvatar name={me.username} src={me.photoUrl} className="size-28 text-5xl ring-4 ring-bg" />
                <PersonAvatar name={match.card.username} src={match.card.photoUrl} className="-ml-6 size-28 text-5xl ring-4 ring-bg" />
              </div>
              <h2 className="mt-7 text-[34px] font-bold tracking-[-0.03em]">It&apos;s a match</h2>
              <p className="mt-1 max-w-72 text-[17px] text-label-2">You and {match.card.username} liked each other. Say hello.</p>
            </motion.div>
            <div className="mt-10 flex w-full max-w-sm flex-col gap-1">
              <Link href={`/app/chat/${match.id}`} className={buttonVariants({ variant: "filled", size: "xl" })}>Send a message</Link>
              <button onClick={() => setMatch(null)} className={cn(buttonVariants({ variant: "plain", size: "xl" }), "font-medium")}>Keep browsing</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyDeck() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-[28px] bg-surface p-8 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-fill">
        <Inbox className="size-8 text-label-2" strokeWidth={1.5} />
      </span>
      <h2 className="mt-2 text-[22px] font-bold tracking-[-0.02em]">You&apos;re all caught up</h2>
      <p className="text-[15px] text-label-2">New people join every day. A wider budget, more cities or a bigger age range will show you more.</p>
      <Link href="/app/me/edit" className={cn(buttonVariants({ variant: "tinted", size: "xl" }), "mt-3")}>Adjust preferences</Link>
    </div>
  );
}
