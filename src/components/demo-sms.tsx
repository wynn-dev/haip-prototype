"use client";

import { useEffect, useState } from "react";
import { Mail, MessageCircle, X } from "lucide-react";

/**
 * Looks like an iOS notification. Stands in for an SMS or e-mail until a
 * delivery provider is configured. Tap × to dismiss; it also hides itself.
 */
export function DemoSms({ code, channel = "sms" }: { code: string; channel?: "sms" | "email" }) {
  const [open, setOpen] = useState(true);
  // callers pass key={code}, so a new code remounts this and shows it again
  useEffect(() => {
    const t = setTimeout(() => setOpen(false), 15000);
    return () => clearTimeout(t);
  }, []);
  if (!open) return null;
  const Icon = channel === "sms" ? MessageCircle : Mail;
  return (
    <div role="status" className="animate-in slide-in-from-top-6 fade-in flex items-start gap-3 rounded-[22px] bg-surface/95 p-3.5 shadow-[0_8px_30px_rgb(0_0_0/0.14)] backdrop-blur-xl duration-500">
      <span className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-tint-fill text-white">
        <Icon className="size-5" strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1 text-[15px] leading-snug">
        <b className="font-semibold">{channel === "sms" ? "Messages" : "Mail"}</b>
        <p>
          Your verification code is <span className="font-semibold tabular-nums">{code}</span>
        </p>
        <p className="mt-0.5 text-[12px] text-label-2">
          Demo: shown here because no {channel === "sms" ? "SMS" : "e-mail"} provider is connected.
        </p>
      </div>
      <button type="button" onClick={() => setOpen(false)} aria-label="Dismiss" className="-m-2 grid size-11 shrink-0 place-items-center text-label-2">
        <X className="size-4" />
      </button>
    </div>
  );
}
