"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, MessageCircle, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/app", label: "Home", icon: House, match: (p: string) => p === "/app" },
  { href: "/app/matches", label: "Chats", icon: MessageCircle, match: (p: string) => p.startsWith("/app/matches") || p.startsWith("/app/chat") },
  { href: "/app/me", label: "Profile", icon: UserRound, match: (p: string) => p.startsWith("/app/me") || p.startsWith("/app/safety") },
];

export function TabBar({ unread }: { unread: number }) {
  const path = usePathname();
  if (path.startsWith("/app/chat/")) return null;
  return (
    <nav className="shrink-0 border-t-[0.5px] border-separator bg-surface/80 pb-safe backdrop-blur-xl backdrop-saturate-150">
      <ul className="grid grid-cols-3">
        {TABS.map((t) => {
          const active = t.match(path);
          return (
            <li key={t.href}>
              <Link href={t.href} className={cn("flex flex-col items-center gap-0.5 pt-1.5 pb-1 text-[11px] font-medium", active ? "text-tint" : "text-label-2")}>
                <span className="relative">
                  <t.icon className={cn("size-[26px]", active && "fill-current/15")} strokeWidth={active ? 2.2 : 1.8} />
                  {t.href === "/app/matches" && unread > 0 && (
                    <span className="absolute -top-1 -right-2.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-danger-fill px-1 text-[12px] font-semibold text-white">{unread}</span>
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
