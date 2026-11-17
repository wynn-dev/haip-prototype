"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, MessageCircleHeart, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/app", label: "Discover", icon: Layers, match: (p: string) => p === "/app" },
  { href: "/app/matches", label: "Matches", icon: MessageCircleHeart, match: (p: string) => p.startsWith("/app/matches") || p.startsWith("/app/chat") },
  { href: "/app/me", label: "Me", icon: UserRound, match: (p: string) => p.startsWith("/app/me") || p.startsWith("/app/safety") },
];

export function TabBar({ unread }: { unread: number }) {
  const path = usePathname();
  if (path.startsWith("/app/chat/")) return null;
  return (
    <nav className="sticky bottom-0 z-20 border-t-2 border-ink bg-paper pb-safe">
      <ul className="grid grid-cols-3">
        {TABS.map((t) => {
          const active = t.match(path);
          return (
            <li key={t.href}>
              <Link href={t.href} className="flex flex-col items-center gap-0.5 pt-2 pb-1 text-[11px] font-semibold">
                <span className={cn("relative grid h-8 w-14 place-items-center rounded-full transition-colors", active && "bg-butter ring-[1.5px] ring-ink")}>
                  <t.icon className="size-5" strokeWidth={active ? 2.5 : 2} />
                  {t.href === "/app/matches" && unread > 0 && (
                    <span className="absolute -top-1 right-1 grid min-w-4 place-items-center rounded-full border-[1.5px] border-ink bg-oranje px-1 text-[10px] leading-4">{unread}</span>
                  )}
                </span>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
