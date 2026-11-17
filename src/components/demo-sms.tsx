"use client";

import { MessageCircle } from "lucide-react";

/** Looks like an iOS notification. Stands in for SMS/e-mail until a provider is configured. */
export function DemoSms({ code, from = "Messages" }: { code: string; from?: string }) {
  return (
    <div className="animate-in slide-in-from-top-6 fade-in flex items-start gap-3 rounded-[22px] bg-surface/90 p-3.5 shadow-[0_8px_30px_rgb(0_0_0/0.12)] backdrop-blur-xl duration-500">
      <span className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-green text-white">
        <MessageCircle className="size-5 fill-white" strokeWidth={0} />
      </span>
      <div className="min-w-0 flex-1 text-[15px] leading-snug">
        <div className="flex items-center justify-between">
          <b className="font-semibold">{from}</b>
          <span className="text-[13px] text-label-2">now</span>
        </div>
        <p>
          Your verification code is <span className="font-semibold tabular-nums">{code}</span>
        </p>
        <p className="mt-0.5 text-[12px] text-label-2">Demo: no SMS provider connected yet</p>
      </div>
    </div>
  );
}
