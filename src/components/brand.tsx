import { APP_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden>
      {/* gabled canal house with a heart window */}
      <path d="M6 30V13l4-4V5h4v2l2-2 10 8v17z" fill="var(--oranje)" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 23.5s-4.5-2.6-4.5-5.4a2.3 2.3 0 0 1 4.5-.8 2.3 2.3 0 0 1 4.5.8c0 2.8-4.5 5.4-4.5 5.4z" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-display text-xl font-extrabold tracking-tight", className)}>
      <LogoMark />
      {APP_NAME}
    </span>
  );
}
