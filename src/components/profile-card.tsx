import { BadgeCheck, CalendarDays, GraduationCap, Home, MapPin, Sparkles, TriangleAlert, Users } from "lucide-react";
import type { CardData } from "@/lib/deck";
import { CLEANLINESS, FEATURES, GENDERS, GUESTS, LOOKING_STATUS, PETS, SLEEP, labelOf } from "@/lib/options";
import { HouseArt } from "@/components/house-art";
import { PersonAvatar } from "@/components/person-avatar";
import { cn } from "@/lib/utils";

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-NL", { day: "numeric", month: "short", year: "numeric" }) : "Flexible";

export function ScoreStamp({ score, className }: { score: number; className?: string }) {
  const tone = score >= 80 ? "bg-polder text-paper" : score >= 60 ? "bg-butter" : "bg-card";
  return (
    <div className={cn("grid size-[4.5rem] rotate-[-10deg] place-items-center rounded-full border-2 border-ink text-center shadow-[2px_2px_0_0_var(--ink)]", tone, className)}>
      <div className="leading-none">
        <div className="font-display text-2xl font-extrabold">{score}%</div>
        <div className="text-[9px] font-bold tracking-widest uppercase">match</div>
      </div>
    </div>
  );
}

function Hero({ c }: { c: CardData }) {
  if (c.role === "renter") {
    const photo = c.listing?.photos[0];
    return (
      <div className="relative h-64 overflow-hidden border-b-2 border-ink">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="size-full object-cover" draggable={false} />
        ) : (
          <HouseArt seed={c.userId} className="size-full" />
        )}
        {(c.listing?.photos.length ?? 0) > 1 && (
          <span className="absolute top-3 left-3 chip bg-ink/80 text-paper">+{c.listing!.photos.length - 1} photos</span>
        )}
        <PersonAvatar name={c.username} src={c.photoUrl} className="absolute bottom-3 left-3 size-14 text-xl shadow-[2px_2px_0_0_var(--ink)]" />
      </div>
    );
  }
  return (
    <div className="relative h-64 overflow-hidden border-b-2 border-ink bg-lilac">
      {c.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={c.photoUrl} alt="" className="size-full object-cover" draggable={false} />
      ) : (
        <div className="grid size-full place-items-center font-display text-[9rem] font-extrabold text-ink/80 uppercase">
          {c.username[0]}
        </div>
      )}
    </div>
  );
}

function Fact({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border-[1.5px] border-ink/20 bg-paper px-3 py-2">
      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Icon className="size-3" /> {label}
      </div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

/** Everything a potential housemate needs, on one scrollable card. */
export function ProfileCard({ c, showScore = true, className }: { c: CardData; showScore?: boolean; className?: string }) {
  const l = c.listing;
  return (
    <article className={cn("relative overflow-hidden rounded-[1.6rem] border-2 border-ink bg-card", className)}>
      <Hero c={c} />
      {showScore && <ScoreStamp score={c.score} className="absolute top-3 right-3" />}

      <div className="flex flex-col gap-4 p-4">
        <header>
          <div className="flex items-baseline gap-2">
            <h2 className="font-display text-[1.75rem] leading-none font-extrabold">{c.username}</h2>
            <span className="font-display text-2xl font-medium text-ink/60">{c.age}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="chip">{c.role === "renter" ? "🏠 Has a room" : "🎒 Looking for a room"}</span>
            {c.ageVerified && <span className="chip bg-polder/15 text-polder"><BadgeCheck className="size-3.5" /> 18+ verified</span>}
            {c.studentInstitution && <span className="chip bg-canal/10 text-canal"><GraduationCap className="size-3.5" /> {c.studentInstitution}</span>}
            {c.lookingStatus !== "looking" && <span className="chip bg-butter">{labelOf(LOOKING_STATUS, c.lookingStatus)}</span>}
            <span className="chip">{labelOf(GENDERS, c.gender)}</span>
          </div>
        </header>

        {l ? (
          <section className="rounded-2xl border-2 border-ink bg-butter/60 p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display text-lg leading-tight font-bold">{l.title}</p>
                <p className="mt-0.5 flex items-center gap-1 text-sm text-ink/70">
                  <MapPin className="size-3.5" />
                  {l.address ? `${l.address}, ` : ""}{l.neighbourhood ? `${l.neighbourhood}, ` : ""}{l.city}
                </p>
              </div>
              <div className="text-right">
                <div className="font-mono text-2xl leading-none">€{l.rent}</div>
                <div className="text-[11px] text-ink/60">/month</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Fact icon={CalendarDays} label="Contract" value={`${l.durationMonths} mo`} />
              <Fact icon={Home} label="From" value={fmtDate(l.availableFrom)} />
              <Fact icon={Users} label="House" value={`${l.householdSize} ppl`} />
            </div>
            {l.features.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {l.features.map((f) => <span key={f} className="chip">{labelOf(FEATURES, f)}</span>)}
              </div>
            )}
          </section>
        ) : (
          <section className="rounded-2xl border-2 border-ink bg-oranje/15 p-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-ink/60">Can pay up to</p>
                <p className="font-mono text-2xl">€{c.maxRent}<span className="text-sm text-ink/60">/mo</span></p>
              </div>
              <div className="flex max-w-[60%] flex-wrap justify-end gap-1">
                {c.areas.map((a) => <span key={a} className="chip bg-card">📍 {a}</span>)}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Fact icon={CalendarDays} label="Move in" value={fmtDate(c.moveInFrom)} />
              <Fact icon={Home} label="Staying" value={c.stayMonths ? `${c.stayMonths} mo` : "Open"} />
              <Fact icon={Users} label="Housemates" value={`${c.roommatesMin}–${c.roommatesMax}`} />
            </div>
          </section>
        )}

        {(c.reasons.length > 0 || c.warnings.length > 0) && (
          <section className="flex flex-col gap-1.5">
            {c.reasons.map((r) => (
              <p key={r} className="flex items-center gap-2 text-sm"><Sparkles className="size-4 shrink-0 text-polder" />{r}</p>
            ))}
            {c.warnings.map((w) => (
              <p key={w} className="flex items-center gap-2 text-sm text-ink/70"><TriangleAlert className="size-4 shrink-0 text-oranje" />{w}</p>
            ))}
          </section>
        )}

        {c.bio && <p className="text-[15px] leading-relaxed">&ldquo;{c.bio}&rdquo;</p>}

        <section>
          <h3 className="mb-2 text-xs font-bold tracking-widest text-muted-foreground uppercase">How they live</h3>
          <div className="grid grid-cols-2 gap-2">
            <Fact icon={Sparkles} label="Tidiness" value={`${"●".repeat(c.cleanliness)}${"○".repeat(5 - c.cleanliness)} ${CLEANLINESS[c.cleanliness - 1]}`} />
            <Fact icon={CalendarDays} label="Sleep" value={`${SLEEP.find((s) => s.value === c.sleep)?.emoji} ${labelOf(SLEEP, c.sleep)}`} />
            <Fact icon={Users} label="Guests" value={`${GUESTS.find((s) => s.value === c.guests)?.emoji} ${labelOf(GUESTS, c.guests)}`} />
            <Fact icon={Home} label="Smoking" value={c.smokes ? "🚬 Smokes" : "🚭 Non-smoker"} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {c.pets.map((p) => <span key={p} className="chip">{PETS.find((x) => x.value === p)?.emoji} {labelOf(PETS, p)}</span>)}
            {c.allergies.map((a) => <span key={a} className="chip border-brick text-brick">Allergic: {a}</span>)}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-bold tracking-widest text-muted-foreground uppercase">Speaks</h3>
          <div className="flex flex-wrap gap-1.5">
            {c.languages.map((l) => <span key={l} className="chip bg-lilac/50">{l}</span>)}
          </div>
        </section>
      </div>
    </article>
  );
}
