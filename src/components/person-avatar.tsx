import { cn } from "@/lib/utils";

// Muted, iOS-contact-style gradients for people without a photo
const GRADIENTS = [
  "from-[#a1a1aa] to-[#71717a]",
  "from-[#93c5fd] to-[#3b82f6]",
  "from-[#86efac] to-[#22c55e]",
  "from-[#fdba74] to-[#f97316]",
  "from-[#c4b5fd] to-[#8b5cf6]",
  "from-[#f9a8d4] to-[#ec4899]",
];

export function gradientFor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

export function PersonAvatar({ name, src, className }: { name: string; src?: string | null; className?: string }) {
  return (
    <div className={cn("relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-b text-white", gradientFor(name), className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" draggable={false} />
      ) : (
        <span className="text-[0.42em] font-semibold uppercase">{name.slice(0, 1)}</span>
      )}
    </div>
  );
}
