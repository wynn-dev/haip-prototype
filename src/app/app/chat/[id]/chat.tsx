"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUp, MoreVertical, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { sendMessage } from "@/app/actions/chat";
import { unmatch } from "@/app/actions/safety";
import { PersonAvatar } from "@/components/person-avatar";
import { ProfileCard } from "@/components/profile-card";
import { SafetyDrawer } from "@/components/report-sheet";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import type { CardData } from "@/lib/deck";
import { cn } from "@/lib/utils";

type Msg = { id: number; senderId: string; body: string; createdAt: Date | string };

const ICEBREAKERS = {
  renter_tenant: ["Is the room still available? 🙂", "Could I come by for a viewing?", "What are the housemates like?"],
  tenant_tenant: ["Want to hunt for a place together?", "Which neighbourhoods are you looking at?", "What's your max budget, honestly?"],
};

export function Chat({ matchId, meId, other, kind, initial }: { matchId: string; meId: string; other: CardData; kind: "renter_tenant" | "tenant_tenant"; initial: Msg[] }) {
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
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  useEffect(() => {
    const t = setInterval(async () => {
      const r = await fetch(`/api/chat/${matchId}?after=${lastId}`);
      if (r.status === 404) {
        toast("This match has ended.");
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
    <main className="flex h-dvh flex-col sm:h-[calc(100dvh-3rem)]">
      <header className="flex items-center gap-3 border-b-2 border-ink bg-paper px-3 py-2.5">
        <Link href="/app/matches" className="grid size-9 place-items-center rounded-full" aria-label="Back"><ArrowLeft className="size-5" /></Link>
        <button className="flex min-w-0 flex-1 items-center gap-2.5 text-left" onClick={() => setProfileOpen(true)}>
          <PersonAvatar name={other.username} src={other.photoUrl} className="size-10" />
          <span className="min-w-0">
            <span className="block truncate font-display text-lg leading-tight font-bold">{other.username}</span>
            <span className="block text-xs text-muted-foreground">{other.score}% match · tap for profile</span>
          </span>
        </button>
        <button onClick={() => setMenuOpen(true)} className="grid size-9 place-items-center rounded-full" aria-label="Chat options"><MoreVertical className="size-5" /></button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto mb-6 max-w-72 rounded-2xl border-[1.5px] border-dashed border-ink/40 p-3 text-center text-xs text-muted-foreground">
          <ShieldAlert className="mx-auto mb-1 size-4 text-oranje" />
          Never pay a deposit or rent before you&apos;ve seen the place and signed a contract. Report anyone who asks.
        </div>
        {msgs.length === 0 && (
          <div className="flex flex-col items-center gap-2">
            <p className="mb-1 font-display text-xl font-bold">Break the ice</p>
            {ICEBREAKERS[kind].map((q) => (
              <button key={q} onClick={() => send(q)} className="chip px-3 py-1.5 text-sm hover:bg-butter">{q}</button>
            ))}
          </div>
        )}
        <ul className="flex flex-col gap-1.5">
          {msgs.map((m, i) => {
            const mine = m.senderId === meId;
            const tail = msgs[i + 1]?.senderId !== m.senderId;
            return (
              <li key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[78%] border-[1.5px] border-ink px-3.5 py-2 text-[15px] leading-snug break-words whitespace-pre-wrap",
                    mine ? "rounded-2xl bg-ink text-paper" : "rounded-2xl bg-card",
                    tail && (mine ? "rounded-br-sm" : "rounded-bl-sm"),
                  )}
                >
                  {m.body}
                </div>
              </li>
            );
          })}
        </ul>
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(text); }}
        className="flex items-end gap-2 border-t-2 border-ink bg-paper px-3 pt-2 pb-safe"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(text); } }}
          rows={1}
          maxLength={2000}
          placeholder="Message…"
          className="mb-2 max-h-32 min-h-11 flex-1 resize-none rounded-2xl border-[1.5px] border-ink/30 bg-card px-4 py-2.5 text-base outline-none field-sizing-content focus:border-ink"
        />
        <button type="submit" disabled={!text.trim() || pending} className="mb-2 grid size-11 shrink-0 place-items-center rounded-full border-2 border-ink bg-oranje disabled:opacity-40" aria-label="Send">
          <ArrowUp className="size-5" strokeWidth={3} />
        </button>
      </form>

      <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
        <SheetContent side="bottom" className="mx-auto h-[92dvh] max-w-[440px] overflow-y-auto rounded-t-3xl border-2 border-ink bg-paper p-3">
          <SheetTitle className="sr-only">{other.username}&apos;s profile</SheetTitle>
          <ProfileCard c={other} />
        </SheetContent>
      </Sheet>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="bottom" className="mx-auto max-w-[440px] gap-2 rounded-t-3xl border-2 border-ink bg-paper p-4 pb-8">
          <SheetTitle className="font-display text-xl font-bold">{other.username}</SheetTitle>
          <Button variant="paper" size="xl" onClick={() => { setMenuOpen(false); setProfileOpen(true); }}>View profile</Button>
          <Button
            variant="paper"
            size="xl"
            onClick={() =>
              start(async () => {
                await unmatch(matchId);
                toast("Unmatched.");
                router.replace("/app/matches");
              })
            }
          >
            Unmatch
          </Button>
          <Button variant="paper" size="xl" className="text-brick" onClick={() => { setMenuOpen(false); setSafety(true); }}>Report or block</Button>
        </SheetContent>
      </Sheet>
      <SafetyDrawer open={safety} onOpenChange={setSafety} targetId={other.userId} name={other.username} onDone={() => router.replace("/app/matches")} />
    </main>
  );
}
