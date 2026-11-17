import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { LargeTitle } from "@/components/ios";
import { PersonAvatar } from "@/components/person-avatar";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { getConversations } from "@/lib/conversations";
import { cn } from "@/lib/utils";

export const metadata = { title: "Chats" };

const ago = (d: Date) => {
  const date = new Date(d);
  const s = (Date.now() - +date) / 1000;
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  if (s < 7 * 86400) return date.toLocaleDateString("en-GB", { weekday: "short" });
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

export default async function MatchesPage() {
  const user = await requireUser();
  const convos = await getConversations(user.id);
  const fresh = convos.filter((c) => !c.last);
  const chats = convos.filter((c) => c.last);

  return (
    <main className="flex flex-1 flex-col bg-surface">
      <LargeTitle>Chats</LargeTitle>

      {convos.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-10 pb-20 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-fill"><MessageCircle className="size-8 text-label-2" strokeWidth={1.5} /></span>
          <h2 className="mt-2 text-[22px] font-bold tracking-[-0.02em]">No matches yet</h2>
          <p className="text-[15px] text-label-2">When someone you liked likes you back, you can message them here.</p>
          <Link href="/app" className={cn(buttonVariants({ variant: "tinted", size: "xl" }), "mt-3")}>Start browsing</Link>
        </div>
      )}

      {fresh.length > 0 && (
        <section className="pt-2">
          <h2 className="px-4 pb-3 text-[15px] font-semibold">New matches</h2>
          <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-none">
            {fresh.map((c) => (
              <Link key={c.matchId} href={`/app/chat/${c.matchId}`} className="flex w-[72px] shrink-0 flex-col items-center gap-1.5 active:opacity-60">
                <div className="relative">
                  <PersonAvatar name={c.card.username} src={c.card.photoUrl} className="size-[72px] text-3xl" />
                  <span className="absolute -right-0.5 -bottom-0.5 size-4 rounded-full border-[3px] border-surface bg-tint" />
                </div>
                <span className="w-full truncate text-center text-[13px]">{c.card.username}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {chats.length > 0 && (
        <section className="pt-2">
          <h2 className="px-4 pb-1 text-[15px] font-semibold">Messages</h2>
          <ul>
            {chats.map((c) => (
              <li key={c.matchId}>
                <Link href={`/app/chat/${c.matchId}`} className="flex items-center gap-3 pl-4 active:bg-fill">
                  <span className="relative">
                    {c.needsReply && <span className="absolute top-1/2 -left-3 size-2.5 -translate-y-1/2 rounded-full bg-tint" />}
                    <PersonAvatar name={c.card.username} src={c.card.photoUrl} className="size-[52px] text-2xl" />
                  </span>
                  <div className="min-w-0 flex-1 border-b-[0.5px] border-separator py-3 pr-4">
                    <div className="flex items-baseline gap-2">
                      <span className="truncate font-semibold">{c.card.username}</span>
                      <span className="shrink-0 text-[13px] text-label-2">
                        {c.kind === "tenant_tenant" ? "Team up" : c.card.role === "renter" ? "Room" : "Tenant"}
                      </span>
                      <span className="ml-auto shrink-0 text-[15px] text-label-2">{ago(c.last!.createdAt)}</span>
                    </div>
                    <p className="line-clamp-2 text-[15px] leading-snug text-label-2">
                      {c.last!.senderId === user.id ? "You: " : ""}{c.last!.body}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
