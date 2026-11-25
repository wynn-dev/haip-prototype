"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/* ───────────── navigation ───────────── */

/** Compact top bar for pushed screens: back · centred title · trailing action. */
export function NavBar({
  title,
  back,
  backLabel = "Back",
  trailing,
  leading,
  className,
}: {
  title?: React.ReactNode;
  /** replaces the back button, e.g. a Cancel button */
  leading?: React.ReactNode;
  back?: string | true;
  backLabel?: string;
  trailing?: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const backEl =
    back === true ? (
      <button onClick={() => router.back()} className="-my-2 flex items-center py-2 pr-2 text-tint active:opacity-60">
        <ChevronLeft className="-ml-1.5 size-7" strokeWidth={2.2} />
        <span className="-ml-0.5">{backLabel}</span>
      </button>
    ) : back ? (
      <Link href={back} className="-my-2 flex items-center py-2 pr-2 text-tint active:opacity-60">
        <ChevronLeft className="-ml-1.5 size-7" strokeWidth={2.2} />
        <span className="-ml-0.5">{backLabel}</span>
      </Link>
    ) : null;
  return (
    <header
      className={cn(
        "sticky top-0 z-20 grid h-11 grid-cols-[1fr_auto_1fr] items-center bg-bg/80 px-4 backdrop-blur-xl backdrop-saturate-150",
        className,
      )}
    >
      <div className="justify-self-start">{leading ?? backEl}</div>
      <div className="truncate text-[17px] font-semibold">{title}</div>
      <div className="justify-self-end">{trailing}</div>
    </header>
  );
}

/* ───────────── controls ───────────── */

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn("relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-200", checked ? "bg-tint-fill" : "bg-fill-2")}
    >
      <span
        className={cn(
          "absolute top-[2px] left-[2px] size-[27px] rounded-full bg-white shadow-[0_3px_8px_rgb(0_0_0/0.15),0_1px_1px_rgb(0_0_0/0.16)] transition-transform duration-200",
          checked && "translate-x-5",
        )}
      />
    </button>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: readonly { value: T; label: string }[];
  value: T | undefined;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("grid auto-cols-fr grid-flow-col rounded-[9px] bg-fill p-[2px]", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "h-8 rounded-[7px] px-2 text-[13px] font-medium whitespace-nowrap transition-all",
            value === o.value
              ? "bg-surface font-semibold shadow-[0_3px_8px_rgb(0_0_0/0.12),0_3px_1px_rgb(0_0_0/0.04)] dark:bg-[#7c7c80] dark:ring-1 dark:ring-white/40"
              : "text-label",
          )}
        >
          {o.label}
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
  return (
    <div className="flex items-center gap-3">
      <span className="min-w-10 text-right text-label-2 tabular-nums">{format(value)}</span>
      <div className="flex h-9 items-center rounded-[8px] bg-fill">
        <button type="button" aria-label="Decrease" disabled={value <= min} onClick={() => onChange(Math.max(min, value - step))} className="h-full w-[46px] text-xl leading-none disabled:text-label-3">−</button>
        <span className="h-4 w-px bg-separator" />
        <button type="button" aria-label="Increase" disabled={value >= max} onClick={() => onChange(Math.min(max, value + step))} className="h-full w-[46px] text-xl leading-none disabled:text-label-3">+</button>
      </div>
    </div>
  );
}

type Opt = { value: string; label: string };

/** Multi-select tags. */
export function Chips({
  options,
  value,
  onChange,
  single,
  className,
}: {
  options: readonly Opt[] | readonly string[];
  value: string[];
  onChange: (v: string[]) => void;
  single?: boolean;
  className?: string;
}) {
  const opts: Opt[] = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {opts.map((o) => {
        const on = value.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(single ? (on ? [] : [o.value]) : on ? value.filter((v) => v !== o.value) : [...value, o.value])}
            className={cn(
              "inline-flex h-9 items-center gap-1 rounded-full px-3.5 text-[15px] transition-colors active:scale-[0.97]",
              on ? "bg-label text-on-label" : "bg-fill text-label",
            )}
          >
            {on && <Check className="-ml-0.5 size-3.5" strokeWidth={3} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Selectable list rows with a trailing checkmark (single choice). */
export function CheckList<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string; detail?: string; icon?: React.ElementType }[];
  value: T | undefined;
  onChange: (v: T) => void;
}) {
  return (
    <div className="group-list">
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)} className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left active:bg-fill">
          {o.icon && <o.icon className="size-6 shrink-0 text-label-2" strokeWidth={1.75} />}
          <span className="min-w-0 flex-1">
            <span className="block font-medium">{o.label}</span>
            {o.detail && <span className="block text-[13px] leading-snug text-label-2">{o.detail}</span>}
          </span>
          {value === o.value && <Check className="size-5 shrink-0 text-tint" strokeWidth={2.75} />}
        </button>
      ))}
    </div>
  );
}

