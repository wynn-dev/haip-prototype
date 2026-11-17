"use client";

import { cn } from "@/lib/utils";

type Opt = { value: string; label: string; emoji?: string };

export function Pills({
  options,
  value,
  onChange,
  className,
  tone = "butter",
}: {
  options: readonly Opt[] | readonly string[];
  value: string[];
  onChange: (v: string[]) => void;
  className?: string;
  tone?: "butter" | "oranje" | "brick" | "lilac";
}) {
  const opts: Opt[] = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const on = { butter: "bg-butter", oranje: "bg-oranje", brick: "bg-brick text-paper", lilac: "bg-lilac" }[tone];
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {opts.map((o) => {
        const active = value.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? value.filter((v) => v !== o.value) : [...value, o.value])}
            className={cn(
              "rounded-full border-[1.5px] border-ink px-3 py-1.5 text-sm font-medium transition-all active:scale-95",
              active ? cn(on, "shadow-[2px_2px_0_0_var(--ink)]") : "bg-card text-ink/80",
            )}
          >
            {o.emoji && <span className="mr-1">{o.emoji}</span>}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string; emoji?: string }[];
  value: T | undefined;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-2xl border-[1.5px] border-ink bg-card p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex flex-col items-center rounded-xl px-1 py-2 text-xs font-semibold transition-colors",
            value === o.value ? "bg-ink text-paper" : "text-ink/70 hover:bg-paper-2",
          )}
        >
          {o.emoji && <span className="text-lg leading-none">{o.emoji}</span>}
          <span className={o.emoji ? "mt-1" : ""}>{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export function Stepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  format = String,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  format?: (n: number) => string;
}) {
  const btn =
    "grid size-10 place-items-center rounded-xl border-[1.5px] border-ink bg-card text-lg font-bold active:scale-95 disabled:opacity-30";
  return (
    <div className="flex items-center gap-2">
      <button type="button" className={btn} disabled={value <= min} onClick={() => onChange(Math.max(min, value - step))} aria-label="Less">−</button>
      <span className="min-w-16 text-center font-mono text-lg">{format(value)}</span>
      <button type="button" className={btn} disabled={value >= max} onClick={() => onChange(Math.min(max, value + step))} aria-label="More">+</button>
    </div>
  );
}
