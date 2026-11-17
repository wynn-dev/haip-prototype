import { cn } from "@/lib/utils";

const FACADES = ["#c2412d", "#2f4bd8", "#1f8a5b", "#ff5b1f", "#7a4b2a", "#b48ae6", "#e0a526"];
const SKIES = ["#ffd36e", "#c9b8ff", "#9fd7ff", "#ffb4a2", "#b8e3c6"];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Generated canal-house row. Used as the placeholder "photo" for listings
 * without uploads, and as decoration. Deterministic per seed.
 */
export function HouseArt({ seed, className, count = 3 }: { seed: string; className?: string; count?: number }) {
  const h = hash(seed);
  const sky = SKIES[h % SKIES.length];
  const w = 300 / count;
  const houses = Array.from({ length: count }, (_, i) => {
    const hh = hash(seed + i);
    const height = 150 + (hh % 60);
    const color = FACADES[(hh >> 3) % FACADES.length];
    const gable = (hh >> 6) % 3; // 0 step, 1 bell, 2 spout
    const x = i * w;
    const top = 240 - height;
    const cols = 2 + ((hh >> 9) % 2);
    const rows = 3;
    const winW = (w - 24) / cols - 6;
    const roof =
      gable === 0
        ? `M${x} ${top + 20} h${w * 0.2} v-10 h${w * 0.15} v-10 h${w * 0.3} v10 h${w * 0.15} v10 h${w * 0.2}`
        : gable === 1
          ? `M${x} ${top + 20} q${w * 0.15} 0 ${w * 0.2} -14 q${w * 0.1} -12 ${w * 0.3} -12 q${w * 0.2} 0 ${w * 0.3} 12 q${w * 0.05} 14 ${w * 0.2} 14`
          : `M${x} ${top + 20} L${x + w / 2} ${top - 14} L${x + w} ${top + 20}`;
    return (
      <g key={i}>
        <path d={`${roof} V240 H${x} Z`} fill={color} stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
        {Array.from({ length: rows * cols }, (_, k) => {
          const r = Math.floor(k / cols);
          const c = k % cols;
          const wx = x + 12 + c * (winW + 6) + 3;
          const wy = top + 32 + r * 40;
          if (wy + 30 > 230) return null;
          return <rect key={k} x={wx} y={wy} width={winW} height={26} rx={winW / 2 > 8 ? 4 : 2} fill="#fffaf2" stroke="var(--ink)" strokeWidth="2.5" />;
        })}
        <rect x={x + w / 2 - 10} y={208} width={20} height={32} rx={10} fill="var(--ink)" />
      </g>
    );
  });
  return (
    <svg viewBox="0 0 300 260" preserveAspectRatio="xMidYMax slice" className={cn("block", className)} aria-hidden>
      <rect width="300" height="260" fill={sky} />
      <circle cx={40 + (h % 200)} cy={50} r={18} fill="#fffaf2" stroke="var(--ink)" strokeWidth="2.5" />
      {houses}
      <rect y="240" width="300" height="20" fill="#2f4bd8" stroke="var(--ink)" strokeWidth="3" />
      <path d="M10 250 q10 -5 20 0 t20 0 M120 252 q10 -5 20 0 t20 0 M220 249 q10 -5 20 0 t20 0" stroke="#9fd7ff" strokeWidth="2" fill="none" />
    </svg>
  );
}
