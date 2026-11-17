"use client";

import { MessageSquareText } from "lucide-react";

/** Stand-in for a real SMS/e-mail while no delivery provider is configured. */
export function DemoSms({ code, from = "SMS" }: { code: string; from?: string }) {
  return (
    <div className="animate-in slide-in-from-top-4 fade-in flex items-start gap-3 rounded-2xl border-2 border-ink bg-card p-3 shadow-[3px_3px_0_0_var(--ink)] duration-500">
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-polder text-paper">
        <MessageSquareText className="size-5" />
      </div>
      <div className="min-w-0 text-sm">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <b className="text-ink">{from}</b> · now · <span className="rounded bg-butter px-1 text-[10px] font-bold text-ink">DEMO</span>
        </div>
        <p>
          Your code is <b className="font-mono tracking-wider">{code}</b>. Don&apos;t share it with anyone.
        </p>
      </div>
    </div>
  );
}
