import { APP_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

/** App icon: a black squircle with a simple two-roof mark. */
export function AppIcon({ className }: { className?: string }) {
  return (
    <span className={cn("grid size-16 place-items-center rounded-[22%] bg-label text-on-label shadow-[0_8px_24px_rgb(0_0_0/0.18)]", className)}>
      <svg viewBox="0 0 32 32" className="size-[58%]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
        <path d="M3 27V15l7-6 7 6v12z" />
        <path d="M15 27V13l7-6 7 6v14" />
        <path d="M9 27v-5h2v5" />
      </svg>
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-[17px] font-semibold tracking-[-0.02em]", className)}>
      <AppIcon className="size-7 rounded-[8px] shadow-none" />
      {APP_NAME}
    </span>
  );
}
