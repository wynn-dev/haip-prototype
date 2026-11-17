"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Heart, MoreHorizontal, X } from "lucide-react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { toast } from "sonner";
import { swipe } from "@/app/actions/swipe";
import { HouseArt } from "@/components/house-art";
import { PersonAvatar } from "@/components/person-avatar";
import { ProfileCard } from "@/components/profile-card";
import { SafetyDrawer } from "@/components/report-sheet";
import { buttonVariants } from "@/components/ui/button";
import type { CardData } from "@/lib/deck";
import { DAILY_LIKES } from "@/lib/options";
import { cn } from "@/lib/utils";

const THRESHOLD = 110;

function SwipeCard({
  card,
  onDecide,
  forced,
}: {
  card: CardData;
  onDecide: (d: "like" | "pass") => void;
  forced: "like" | "pass" | null;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-14, 14]);
  const yes = useTransform(x, [20, THRESHOLD], [0, 1]);
  const no = useTransform(x, [-THRESHOLD, -20], [1, 0]);

  const fly = (d: "like" | "pass") =>
    animate(x, d === "like" ? 600 : -600, { duration: 0.28, ease: "easeIn" }).then(() => onDecide(d));

  // button presses animate the same card out
  useEffect(() => {
    if (forced) void fly(forced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forced]);

  return (
    <motion.div
      className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragDirectionLock
      dragSnapToOrigin
      dragElastic={0.9}
      onDragEnd={(_, info: PanInfo) => {
        if (info.offset.x > THRESHOLD || info.velocity.x > 700) void fly("like");
        else if (info.offset.x < -THRESHOLD || info.velocity.x < -700) void fly("pass");
      }}
      initial={{ scale: 0.96, y: 10 }}
      animate={{ scale: 1, y: 0 }}
    >
      <div className="h-full overflow-y-auto overscroll-contain rounded-[1.6rem] shadow-[5px_5px_0_0_var(--ink)] scrollbar-none">
        <ProfileCard c={card} />
        <div className="h-24" />
      </div>
      <motion.div style={{ opacity: yes }} className="pointer-events-none absolute top-10 left-5 -rotate-12 rounded-xl border-4 border-polder bg-paper/90 px-3 py-1 font-display text-4xl font-extrabold text-polder">
        JA!
      </motion.div>
      <motion.div style={{ opacity: no }} className="pointer-events-none absolute top-10 right-5 rotate-12 rounded-xl border-4 border-brick bg-paper/90 px-3 py-1 font-display text-4xl font-extrabold text-brick">
        NEE
      </motion.div>
    </motion.div>
  );
}

export function Deck({
  initial,
  initialLikesLeft,
  me,
}: {
  initial: CardData[];
  initialLikesLeft: number;
  me: { username: string; photoUrl: string | null };
}) {
  const [cards, setCards] = useState(initial);
  const [likes, setLikes] = useState(initialLikesLeft);
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
      setLikes(r.likesLeft);
      if (!r.ok) {
        toast.error(r.error);
        if (d === "like" && r.likesLeft === 0) setCards((c) => [card, ...c]);
        return;
      }
      if (r.matchId) setMatch({ id: r.matchId, card });
    });
  };

  const press = (d: "like" | "pass") => {
    if (!top || forced) return;
    if (d === "like" && likes <= 0) return void toast.error("Out of likes for today ☕ Come back tomorrow.");
    setForced(d);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between px-5 pb-2">
        <div className="flex items-center gap-1.5" title="Likes refill on a rolling 24h window">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={cn("h-2 w-5 rounded-full border-[1.5px] border-ink", i < Math.ceil((likes / DAILY_LIKES) * 5) ? "bg-oranje" : "bg-paper")} />
          ))}
          <span className="ml-1 font-mono text-xs">{likes} likes left</span>
        </div>
        {top && (
          <button onClick={() => setSafety(true)} className="grid size-8 place-items-center rounded-full border-[1.5px] border-ink bg-card" aria-label="Report or block">
            <MoreHorizontal className="size-4" />
          </button>
        )}
      </div>

      <div className="relative mx-4 flex-1">
        {cards.length === 0 ? (
          <EmptyDeck />
        ) : (
          <>
            {cards[1] && (
              <div className="absolute inset-0 translate-y-2 scale-[0.96] overflow-hidden rounded-[1.6rem] opacity-70">
                <ProfileCard c={cards[1]} />
              </div>
            )}
            <AnimatePresence>
              <SwipeCard key={top.userId} card={top} onDecide={decide} forced={forced} />
            </AnimatePresence>
          </>
        )}
      </div>

      <div className="relative z-10 -mt-14 flex items-center justify-center gap-6 pb-4">
        <button
          onClick={() => press("pass")}
          disabled={!top}
          className="grid size-16 place-items-center rounded-full border-2 border-ink bg-card shadow-[3px_3px_0_0_var(--ink)] transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-40"
          aria-label="Pass"
        >
          <X className="size-8 text-brick" strokeWidth={3} />
        </button>
        <button
          onClick={() => press("like")}
          disabled={!top}
          className="grid size-[4.5rem] place-items-center rounded-full border-2 border-ink bg-oranje shadow-[3px_3px_0_0_var(--ink)] transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-40"
          aria-label="Like"
        >
          <Heart className="size-8 fill-paper text-ink" strokeWidth={2.5} />
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
            className="fixed inset-0 z-50 mx-auto flex max-w-[440px] flex-col items-center justify-center gap-6 bg-oranje px-8 text-center"
          >
            <motion.h2 initial={{ scale: 0.5, rotate: -8 }} animate={{ scale: 1, rotate: -4 }} transition={{ type: "spring", bounce: 0.6 }} className="font-display text-6xl leading-none font-extrabold">
              Gezellig!
            </motion.h2>
            <p className="text-lg font-semibold">You and {match.card.username} like each other.</p>
            <div className="flex items-center">
              <PersonAvatar name={me.username} src={me.photoUrl} className="size-24 -rotate-6 text-3xl shadow-[3px_3px_0_0_var(--ink)]" />
              <PersonAvatar name={match.card.username} src={match.card.photoUrl} className="-ml-4 size-24 rotate-6 text-3xl shadow-[3px_3px_0_0_var(--ink)]" />
            </div>
            <div className="flex w-full flex-col gap-2">
              <Link href={`/app/chat/${match.id}`} className={cn(buttonVariants({ variant: "ink", size: "xl" }))}>Say hoi 👋</Link>
              <button onClick={() => setMatch(null)} className="py-2 font-semibold underline underline-offset-4">Keep swiping</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyDeck() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 rounded-[1.6rem] border-2 border-dashed border-ink/40 p-6 text-center">
      <div className="w-40 overflow-hidden rounded-2xl border-2 border-ink">
        <HouseArt seed="empty-street" className="h-28 w-full" />
      </div>
      <h2 className="font-display text-2xl font-extrabold">That&apos;s everyone for now</h2>
      <p className="text-sm text-muted-foreground">
        New people join every day. Widening your budget, cities or age range shows you more.
      </p>
      <Link href="/app/me/edit" className={buttonVariants({ variant: "paper", size: "xl" })}>Tweak my preferences</Link>
    </div>
  );
}
