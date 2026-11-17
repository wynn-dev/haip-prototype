import Link from "next/link";
import { PersonAvatar } from "@/components/person-avatar";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { getConversations } from "@/lib/conversations";
import { cn } from "@/lib/utils";

export const metadata = { title: "Matches" };

const ago = (d: Date) => {
  const s = (Date.now() - +new Date(d)) / 1000;
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};

export default async function MatchesPage() {
  const user = await requireUser();
  const convos = await getConversations(user.id);
  const fresh = convos.filter((c) => !c.last);
  const chats = convos.filter((c) => c.last);

  return (
    <main className="flex flex-1 flex-col px-5 pt-5">
      <h1 className="font-display text-4xl font-extrabold">Matches</h1>
      {convos.length === 0 && (
        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <div className="text-6xl">🫖</div>
          <p className="max-w-64 text-muted-foreground">No matches yet. When someone you liked likes you back, they&apos;ll show up here.</p>
          <Link href="/app" className={buttonVariants({ variant: "ink", size: "xl" })}>Go swipe</Link>
        </div>
      )}

      {fresh.length > 0 && (
        <section className="mt-5">
          <h2 className="mb-3 text-xs font-bold tracking-widest text-muted-foreground uppercase">New, say hoi</h2>
          <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-2 scrollbar-none">
            {fresh.map((c) => (
              <Link key={c.matchId} href={`/app/chat/${c.matchId}`} className="flex w-20 shrink-0 flex-col items-center gap-1.5">
                <div className="relative">
                  <PersonAvatar name={c.card.username} src={c.card.photoUrl} className="size-20 text-2xl shadow-[3px_3px_0_0_var(--oranje)]" />
                  <span className="absolute -right-1 -bottom-1 rounded-full border-[1.5px] border-ink bg-butter px-1.5 text-[10px] font-bold">{c.card.score}%</span>
                </div>
                <span className="w-full truncate text-center text-sm font-semibold">{c.card.username}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {chats.length > 0 && (
        <section className="mt-5">
          <h2 className="mb-1 text-xs font-bold tracking-widest text-muted-foreground uppercase">Chats</h2>
          <ul className="divide-y divide-ink/10">
            {chats.map((c) => (
              <li key={c.matchId}>
                <Link href={`/app/chat/${c.matchId}`} className="flex items-center gap-3 py-3">
                  <PersonAvatar name={c.card.username} src={c.card.photoUrl} className="size-14 text-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg font-bold">{c.card.username}</span>
                      <span className="chip px-1.5 py-0 text-[10px]">{c.kind === "tenant_tenant" ? "🤝 team up" : c.card.role === "renter" ? "🏠 room" : "🎒 tenant"}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{ago(c.last!.createdAt)}</span>
                    </div>
                    <p className={cn("truncate text-sm", c.needsReply ? "font-semibold text-ink" : "text-muted-foreground")}>
                      {c.last!.senderId === user.id ? "You: " : ""}{c.last!.body}
                    </p>
                  </div>
                  {c.needsReply && <span className="size-2.5 rounded-full bg-oranje" />}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
