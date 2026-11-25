"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUp, ChevronLeft, Flag, HeartOff, UserRound } from "lucide-react";
import { toast } from "sonner";
import { sendMessage } from "@/app/actions/chat";
import { unmatch } from "@/app/actions/safety";
import { Row, Section } from "@/components/ios";
import { PersonAvatar } from "@/components/person-avatar";
import { ProfileCard } from "@/components/profile-card";
import { SafetyDrawer } from "@/components/report-sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import type { CardData } from "@/lib/deck";
import { cn } from "@/lib/utils";

type Msg = { id: number; senderId: string | null; body: string; createdAt: Date | string };

/** Conversation starters depend on who you are in the match. */
const ICEBREAKERS = {
  tenant: ["Is the room still available?", "Could I come by for a viewing?", "What are the housemates like?"],
  renter: ["Hi! When would you like to come and see the room?", "Tell me a bit about yourself", "When would you want to move in?"],
  team: ["Want to look for a place together?", "Which neighbourhoods are you looking at?", "What's your max budget?"],
};

// Fixed time zone so server and browser render identical text (no hydration mismatch).
const TZ = "Europe/Amsterdam";
const dayKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TZ });
const dayLabel = (d: Date) => {
  const today = dayKey(new Date());
  const yesterday = dayKey(new Date(Date.now() - 864e5));
  const k = dayKey(d);
  if (k === today) return "Today";
  if (k === yesterday) return "Yesterday";
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short", timeZone: TZ });
};
const timeOf = (d: Date) => d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: TZ });

export function Chat({
  matchId,
  meId,
  myRole,
  other,
  kind,
  initial,
}: {
  matchId: string;
  meId: string;
  myRole: "renter" | "tenant";
  other: CardData;
  kind: "renter_tenant" | "tenant_tenant";
  initial: Msg[];
}) {
  const icebreakers = kind === "tenant_tenant" ? ICEBREAKERS.team : ICEBREAKERS[myRole];
  const [confirmUnmatch, setConfirmUnmatch] = useState(false);
  const router = useRouter();
  const [msgs, setMsgs] = useState<Msg[]>(initial);
  const [text, setText] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [safety, setSafety] = useState(false);
  const [pending, start] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);
  const lastId = msgs.at(-1)?.id ?? 0;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs.length]);

  useEffect(() => {
    const t = setInterval(async () => {
      const r = await fetch(`/api/chat/${matchId}?after=${lastId}`);
      if (r.status === 404) {
        toast("This match has ended");
        router.replace("/app/matches");
        return;
      }
      const { messages } = (await r.json()) as { messages: Msg[] };
      if (messages?.length) setMsgs((cur) => [...cur, ...messages.filter((m) => !cur.some((c) => c.id === m.id))]);
    }, 3000);
    return () => clearInterval(t);
  }, [matchId, lastId, router]);

  const send = (body: string) => {
    if (!body.trim()) return;
    setText("");
    start(async () => {
      const r = await sendMessage(matchId, body);
      if (r.error) return void toast.error(r.error);
      setMsgs((cur) => (cur.some((c) => c.id === r.message!.id) ? cur : [...cur, r.message!]));
    });
  };

  return (
    <main className="flex h-dvh flex-col bg-surface sm:h-full">
      <header className="z-10 grid shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b-[0.5px] border-separator bg-surface/85 px-2 pt-1 pb-1.5 backdrop-blur-xl">
        <Link href="/app/matches" className="grid size-11 place-items-center justify-self-start text-tint active:opacity-60" aria-label="Back to chats">
          <ChevronLeft className="size-8" strokeWidth={2.2} />
        </Link>
        <button className="flex flex-col items-center gap-0.5 active:opacity-60" onClick={() => setMenuOpen(true)}>
          <PersonAvatar name={other.username} src={other.photoUrl} className="size-11 text-lg" />
          <span className="flex items-center text-[12px]">{other.username} <ChevronLeft className="size-3 rotate-180 text-label-3" strokeWidth={3} /></span>
        </button>
        <span />
      </header>

      <div className="flex-1 overflow-y-auto px-3 pt-4 pb-2">
        <p className="mx-auto mb-5 max-w-72 text-center text-[12px] leading-snug text-label-2">
          {other.score}% match · Never pay a deposit before you&apos;ve seen the place and signed a contract.
        </p>
        {msgs.length === 0 && (
          <div className="flex flex-col items-end gap-2 pt-6">
            <p className="w-full pb-1 text-center text-[13px] text-label-2">Tap to send</p>
            {icebreakers.map((q) => (
              <button key={q} onClick={() => send(q)} className="rounded-[18px] border border-tint/40 px-3.5 py-2 text-[17px] text-tint active:bg-tint/10">
                {q}
              </button>
            ))}
          </div>
        )}
        <ul className="flex flex-col">
          {msgs.map((m, i) => {
            const mine = m.senderId === meId;
            const prev = msgs[i - 1];
            const next = msgs[i + 1];
            const d = new Date(m.createdAt);
            const showDay = !prev || dayKey(new Date(prev.createdAt)) !== dayKey(d);
            const tail = next?.senderId !== m.senderId;
            return (
              <li key={m.id} className="flex flex-col">
                {showDay && (
                  <p className="py-2 text-center text-[11px] font-medium text-label-2">
                    {dayLabel(d)} {timeOf(d)}
                  </p>
                )}
                <div className={cn("flex", mine ? "justify-end" : "justify-start", tail ? "mb-2" : "mb-0.5")}>
                  <div
                    className={cn(
                      "max-w-[75%] rounded-[18px] px-3 py-[7px] text-[17px] leading-[22px] break-words whitespace-pre-wrap",
                      mine ? "bg-tint-fill text-white" : "bg-fill text-label",
                      tail && (mine ? "rounded-br-[6px]" : "rounded-bl-[6px]"),
                    )}
                  >
                    {m.body}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <div ref={endRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex shrink-0 items-end gap-2 px-3 pt-1.5 pb-safe">
        <div className="mb-2 flex min-h-9 flex-1 items-end rounded-[18px] border border-separator pr-1 pl-3.5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(text); } }}
            rows={1}
            maxLength={2000}
            placeholder="Message"
            className="field-sizing-content max-h-32 flex-1 resize-none bg-transparent py-[6px] text-[17px] leading-[22px] outline-none placeholder:text-label-3"
          />
          <button type="submit" disabled={!text.trim() || pending} className="-my-2 -mr-2 grid size-11 shrink-0 place-items-center disabled:opacity-0" aria-label="Send">
            <span className="grid size-[28px] place-items-center rounded-full bg-tint-fill text-white">
              <ArrowUp className="size-[18px]" strokeWidth={3} />
            </span>
          </button>
        </div>
      </form>

      <Drawer open={menuOpen} onOpenChange={setMenuOpen}>
        <DrawerContent className="mx-auto max-w-[430px] bg-bg pb-8">
          <DrawerTitle className="sr-only">Options for {other.username}</DrawerTitle>
          <div className="flex flex-col items-center gap-2 pt-4 pb-6">
            <PersonAvatar name={other.username} src={other.photoUrl} className="size-20 text-3xl" />
            <p className="text-[22px] font-bold tracking-[-0.02em]">{other.username}</p>
          </div>
          <Section>
            <Row icon={UserRound} iconBg="bg-tint-fill" label="View profile" chevron onClick={() => { setMenuOpen(false); setProfileOpen(true); }} />
          </Section>
          <Section className="mt-6">
            <Row
              icon={HeartOff}
              iconBg="bg-tile"
              label="Unmatch"
              destructive
              onClick={() => { setMenuOpen(false); setConfirmUnmatch(true); }}
            />
            <Row icon={Flag} iconBg="bg-danger-fill" label="Report or block" destructive onClick={() => { setMenuOpen(false); setSafety(true); }} />
          </Section>
        </DrawerContent>
      </Drawer>

      <Drawer open={profileOpen} onOpenChange={setProfileOpen}>
        <DrawerContent className="mx-auto h-[94dvh] max-w-[430px] bg-bg">
          <DrawerTitle className="sr-only">{other.username}&apos;s profile</DrawerTitle>
          <div className="overflow-y-auto px-3 pb-8">
            <ProfileCard c={other} />
          </div>
        </DrawerContent>
      </Drawer>
      <SafetyDrawer open={safety} onOpenChange={setSafety} targetId={other.userId} name={other.username} onDone={() => router.replace("/app/matches")} />
      <Dialog open={confirmUnmatch} onOpenChange={setConfirmUnmatch}>
        <DialogContent showCloseButton={false} className="max-w-[300px] gap-0 overflow-hidden rounded-[14px] border-0 bg-surface/95 p-0 text-center backdrop-blur-xl">
          <DialogHeader className="items-center gap-1 px-4 pt-5 pb-4 text-center">
            <DialogTitle className="text-[17px] font-semibold">Unmatch {other.username}?</DialogTitle>
            <DialogDescription className="text-[13px] leading-snug">
              The chat closes for both of you and you won&apos;t see each other again. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 border-t-[0.5px] border-separator text-[17px]">
            <button className="h-11 text-tint active:bg-fill" onClick={() => setConfirmUnmatch(false)}>Cancel</button>
            <button
              className="h-11 border-l-[0.5px] border-separator font-semibold text-danger active:bg-fill"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await unmatch(matchId);
                  toast("Unmatched");
                  router.replace("/app/matches");
                })
              }
            >
              Unmatch
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
