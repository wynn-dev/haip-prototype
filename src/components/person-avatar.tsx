import { cn } from "@/lib/utils";

const BG = ["var(--butter)", "var(--lilac)", "#9fd7ff", "#ffb4a2", "#b8e3c6"];

export function PersonAvatar({
  name,
  src,
  className,
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
  const bg = BG[(name.charCodeAt(0) + name.length) % BG.length];
  return (
    <div
      className={cn("relative grid shrink-0 place-items-center overflow-hidden rounded-full border-2 border-ink", className)}
      style={{ background: bg }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <span className="font-display text-[1.1em] font-extrabold uppercase">{name.slice(0, 1)}</span>
      )}
    </div>
  );
}
