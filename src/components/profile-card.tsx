"use client";

import { useState } from "react";
import { BadgeCheck, MoreHorizontal, Check, GraduationCap, Home, IdCard, TriangleAlert } from "lucide-react";
import type { CardData } from "@/lib/deck";
import { CLEANLINESS, FEATURES, GENDERS, GUESTS, LOOKING_STATUS, PETS, SLEEP, labelOf } from "@/lib/options";
import { gradientFor } from "@/components/person-avatar";
import { cn } from "@/lib/utils";

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "Flexible";

function Photos({ c, fill }: { c: CardData; fill?: boolean }) {
  const photos = c.role === "renter" ? [...(c.listing?.photos ?? []), ...(c.photoUrl ? [c.photoUrl] : [])] : c.photoUrl ? [c.photoUrl] : [];
  const [i, setI] = useState(0);
  const src = photos[i];
  const subtitle =
    c.role === "renter" && c.listing
      ? `€${c.listing.rent} · ${[c.listing.neighbourhood, c.listing.city].filter(Boolean).join(", ")}`
      : `Up to €${c.maxRent} · ${c.areas.join(", ")}`;

  return (
    <div className={cn("relative w-full overflow-hidden bg-fill select-none", fill ? "h-[calc(100cqh-56px)] min-h-[320px]" : "aspect-[4/5]")}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" draggable={false} />
      ) : (
        <div className={cn("grid size-full place-items-center bg-gradient-to-b text-white/90", gradientFor(c.username))}>
          {c.role === "renter" ? <Home className="size-16" strokeWidth={1.25} /> : <span className="text-[120px] font-semibold uppercase">{c.username[0]}</span>}
        </div>
      )}

      {/* keeps the photo indicators and buttons readable on bright photos */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/35 to-transparent" />
      {photos.length > 1 && (
        <>
          <div className="absolute inset-x-3 top-2.5 flex gap-1 drop-shadow-[0_1px_2px_rgb(0_0_0/0.4)]">
            {photos.map((p, k) => (
              <span key={p} className={cn("h-[3px] flex-1 rounded-full", k === i ? "bg-white" : "bg-white/40")} />
            ))}
          </div>
          <button type="button" aria-label="Previous photo" className="absolute inset-y-0 left-0 w-1/3" onClick={() => setI((x) => Math.max(0, x - 1))} />
          <button type="button" aria-label="Next photo" className="absolute inset-y-0 right-0 w-1/3" onClick={() => setI((x) => Math.min(photos.length - 1, x + 1))} />
        </>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-5 pt-20 pb-5 text-white">
        <div className="flex items-center gap-1.5">
          <h2 className="text-[28px] leading-tight font-bold tracking-[-0.03em]">{c.username}</h2>
          <span className="text-[28px] leading-tight font-normal tracking-[-0.02em] opacity-90">{c.age}</span>
          {c.ageVerified && <BadgeCheck className="ml-0.5 size-6 fill-[#0a63e0] text-white" strokeWidth={2} aria-label="18+ checked" />}
        </div>
        <p className="mt-0.5 truncate text-[15px] opacity-90">{subtitle}</p>
      </div>
    </div>
  );
}

function Rows({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="group-list bg-surface-2 [--group-bg:var(--surface-2)]">
      {rows.map(([k, v]) => (
        <div key={k} className="flex min-h-11 items-center justify-between gap-4 px-4 py-2 text-[15px]">
          <dt className="text-label-2">{k}</dt>
          <dd className="text-right font-medium">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 px-1 text-[13px] font-semibold tracking-wide text-label-2 uppercase">{title}</h3>
      {children}
    </section>
  );
}

/** Everything a potential housemate needs, on one scrollable card. */
/** `fill`: photo sized to the scroll container (needs `container-type: size` on it), leaving a peek of the details. */
export function ProfileCard({
  c,
  showScore = true,
  fill,
  onMore,
  footer,
  className,
}: {
  c: CardData;
  showScore?: boolean;
  fill?: boolean;
  /** shows a ••• button (report/block) that scrolls with the photo */
  onMore?: () => void;
  /** rendered right under the photo, e.g. a "More about …" button (with `fill`, photo + this = the card's height) */
  footer?: React.ReactNode;
  className?: string;
}) {
  const l = c.listing;
  return (
    <article className={cn("relative overflow-hidden rounded-[28px] bg-surface", className)}>
      <Photos c={c} fill={fill} />
      {footer && <div className="grid h-14 place-items-center bg-surface">{footer}</div>}
      {onMore && (
        <button
          type="button"
          onClick={onMore}
          aria-label="Report or block"
          className="absolute top-3 left-2 grid size-11 place-items-center"
        >
          <span className="grid size-8 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md">
            <MoreHorizontal className="size-5" />
          </span>
        </button>
      )}
      {showScore && (
        <span className="absolute top-5 right-4 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-[13px] font-semibold text-white backdrop-blur-md">
          {c.score}% match
        </span>
      )}

      <div className="flex flex-col gap-6 px-4 pt-5 pb-6">
        {c.lookingStatus !== "looking" && (
          <p className="tag self-start">
            {c.role === "renter" && c.lookingStatus === "found_house" ? "Room filled" : labelOf(LOOKING_STATUS, c.lookingStatus)} · not shown to others
          </p>
        )}

        {(c.reasons.length > 0 || c.warnings.length > 0) && (
          <ul className="flex flex-col gap-2.5 px-1">
            {c.reasons.map((r) => (
              <li key={r} className="flex items-center gap-3 text-[15px]">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-tint-fill text-white"><Check className="size-3" strokeWidth={3.5} /></span>
                {r}
              </li>
            ))}
            {c.warnings.map((w) => (
              <li key={w} className="flex items-center gap-3 text-[15px] text-label-2">
                <TriangleAlert className="size-5 shrink-0 text-caution" strokeWidth={2} />
                {w}
              </li>
            ))}
          </ul>
        )}

        {c.bio && <p className="px-1 text-[17px] leading-relaxed">{c.bio}</p>}

        {l ? (
          <Block title={l.title}>
            <Rows
              rows={[
                ["Rent", `€${l.rent} / month`],
                ...(l.address ? ([["Address", l.address]] as [string, string][]) : []),
                ["Contract", `${l.durationMonths} months`],
                ["Available", fmtDate(l.availableFrom)],
                ["Household", `${l.householdSize} people`],
                ["Free rooms", String(l.roomsAvailable)],
              ]}
            />
            {l.features.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5 px-1">
                {l.features.map((f) => <span key={f} className="tag">{labelOf(FEATURES, f)}</span>)}
              </div>
            )}
          </Block>
        ) : (
          <Block title="Looking for">
            <Rows
              rows={[
                ["Budget", `up to €${c.maxRent}`],
                ["Cities", c.areas.join(", ") || "Anywhere"],
                ["Move in", fmtDate(c.moveInFrom)],
                ["Staying", c.stayMonths ? `${c.stayMonths} months` : "Open"],
                ["Housemates", `${c.roommatesMin}–${c.roommatesMax}`],
              ]}
            />
          </Block>
        )}

        <Block title="Lifestyle">
          <Rows
            rows={[
              ["Tidiness", CLEANLINESS[c.cleanliness - 1]],
              ["Sleep", labelOf(SLEEP, c.sleep)],
              ["Guests", labelOf(GUESTS, c.guests)],
              ["Smoking", c.smokes ? "Smokes" : "Doesn't smoke"],
              ...(c.pets.length ? ([["Pets", c.pets.map((p) => labelOf(PETS, p)).join(", ")]] as [string, string][]) : []),
            ]}
          />
        </Block>

        <Block title="About">
          <Rows
            rows={[
              ["Gender", labelOf(GENDERS, c.gender)],
              ["Speaks", c.languages.join(", ")],
            ]}
          />
        </Block>

        <div className="flex flex-col gap-2 px-1 text-[13px] text-label-2">
          {c.ageVerified && <p className="flex items-center gap-2"><IdCard className="size-4" /> 18+ check done (simulated in this prototype)</p>}
          {c.studentInstitution && <p className="flex items-center gap-2"><GraduationCap className="size-4" /> Student at {c.studentInstitution}</p>}
        </div>
      </div>
    </article>
  );
}
