"use client";

import { Field } from "@/components/field";
import { Pills, Segmented, Stepper } from "@/components/pills";
import { AvatarPicker, ListingPhotos } from "@/components/profile/photo-picker";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ALLERGIES,
  CITIES,
  CLEANLINESS,
  DEALBREAKERS,
  FEATURES,
  GENDERS,
  GUESTS,
  LANGUAGES,
  PETS,
  SLEEP,
} from "@/lib/options";
import { emptyListing, type ListingDraft, type ProfileInput } from "@/lib/profile-schema";
import { cn } from "@/lib/utils";

export type SectionProps = { p: ProfileInput; set: (patch: Partial<ProfileInput>) => void };

const n = (v: unknown, d = 0) => (typeof v === "number" ? v : Number(v ?? d));

export function RoleSection({ p, set }: SectionProps) {
  const opts = [
    {
      value: "tenant" as const,
      emoji: "🎒",
      title: "I need a room",
      body: "Swipe on places with a free room, or on other people to team up and hunt together.",
    },
    {
      value: "renter" as const,
      emoji: "🏠",
      title: "I have a room",
      body: "You have a place (or a lease) and want a great housemate for the spare room.",
    },
  ];
  return (
    <div className="flex flex-col gap-3">
      {opts.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() =>
            set({ role: o.value, listing: o.value === "renter" ? (p.listing ?? emptyListing) : null })
          }
          className={cn(
            "flex items-start gap-4 rounded-2xl border-2 border-ink p-4 text-left transition-all",
            p.role === o.value ? "bg-butter shadow-[4px_4px_0_0_var(--ink)]" : "bg-card",
          )}
        >
          <span className="text-4xl">{o.emoji}</span>
          <span>
            <span className="block font-display text-xl font-extrabold">{o.title}</span>
            <span className="text-sm text-ink/70">{o.body}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

export function AboutSection({ p, set }: SectionProps) {
  return (
    <div className="flex flex-col gap-5">
      <AvatarPicker name={p.username} value={p.photoUrl ?? null} onChange={(photoUrl) => set({ photoUrl })} />
      <Field label="Username" htmlFor="username" hint="This is what people see. Not your real name if you prefer.">
        <Input id="username" value={p.username} maxLength={20} onChange={(e) => set({ username: e.target.value })} placeholder="e.g. sanne.b" />
      </Field>
      <Field label="Gender">
        <Segmented options={GENDERS} value={p.gender} onChange={(gender) => set({ gender })} />
      </Field>
      <Field label="Languages you speak">
        <Pills options={LANGUAGES} value={p.languages} onChange={(languages) => set({ languages })} />
      </Field>
      <Field label="A bit about you" htmlFor="bio" hint={`${(p.bio ?? "").length}/300`}>
        <Textarea id="bio" value={p.bio ?? ""} maxLength={300} onChange={(e) => set({ bio: e.target.value })} placeholder="Master's student at TU Delft, I cook too much pasta and always share." />
      </Field>
    </div>
  );
}

export function LifestyleSection({ p, set }: SectionProps) {
  const c = n(p.cleanliness, 3);
  return (
    <div className="flex flex-col gap-6">
      <Field label="How tidy are you, honestly?">
        <div className="px-1 pt-2">
          <Slider min={1} max={5} step={1} value={[c]} onValueChange={(v) => set({ cleanliness: (v as number[])[0] })} />
          <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
            <span>🌪️</span>
            <span className="font-display text-sm font-bold text-ink">{CLEANLINESS[c - 1]}</span>
            <span>✨</span>
          </div>
        </div>
      </Field>
      <Field label="Sleep schedule">
        <Segmented options={SLEEP} value={p.sleep} onChange={(sleep) => set({ sleep })} />
      </Field>
      <Field label="Having guests over">
        <Segmented options={GUESTS} value={p.guests} onChange={(guests) => set({ guests })} />
      </Field>
      <label className="flex items-center justify-between rounded-2xl border-[1.5px] border-ink/30 bg-card px-4 py-3">
        <span className="text-sm font-semibold">🚬 I smoke</span>
        <Switch checked={p.smokes} onCheckedChange={(smokes) => set({ smokes })} />
      </label>
      <Field label="Pets you have (or bring)">
        <Pills options={PETS} value={p.pets ?? []} onChange={(pets) => set({ pets })} />
      </Field>
      <Field label="Allergies" hint="We won't show you homes with pets or smoke you're allergic to.">
        <Pills tone="brick" options={ALLERGIES} value={p.allergies ?? []} onChange={(allergies) => set({ allergies })} />
      </Field>
    </div>
  );
}

export function HousematesSection({ p, set }: SectionProps) {
  const min = n(p.roommatesMin, 1);
  const max = n(p.roommatesMax, 3);
  const amin = n(p.prefAgeMin, 18);
  const amax = n(p.prefAgeMax, 35);
  return (
    <div className="flex flex-col gap-6">
      <Field label="How many housemates are you OK with?">
        <div className="flex items-center justify-between rounded-2xl border-[1.5px] border-ink/30 bg-card px-4 py-3">
          <span className="text-sm text-muted-foreground">at least</span>
          <Stepper value={min} min={1} max={max} onChange={(v) => set({ roommatesMin: v })} />
        </div>
        <div className="flex items-center justify-between rounded-2xl border-[1.5px] border-ink/30 bg-card px-4 py-3">
          <span className="text-sm text-muted-foreground">at most</span>
          <Stepper value={max} min={min} max={8} onChange={(v) => set({ roommatesMax: v })} />
        </div>
      </Field>
      <Field label="Live with" hint="Leave empty for anyone.">
        <Pills tone="lilac" options={GENDERS} value={p.prefGenders ?? []} onChange={(prefGenders) => set({ prefGenders })} />
      </Field>
      <Field label={`Age range: ${amin}–${amax}${amax >= 60 ? "+" : ""}`}>
        <div className="px-1 pt-2">
          <Slider min={18} max={60} value={[amin, amax]} onValueChange={(v) => { const [a, b] = v as number[]; set({ prefAgeMin: a, prefAgeMax: b >= 60 ? 99 : b }); }} />
        </div>
      </Field>
      <Field label="Dealbreakers" hint="People matching these are never shown to you, and you're not shown to them.">
        <Pills tone="brick" options={DEALBREAKERS} value={p.dealbreakers ?? []} onChange={(dealbreakers) => set({ dealbreakers })} />
      </Field>
    </div>
  );
}

export function TenantHousingSection({ p, set }: SectionProps) {
  const rent = n(p.maxRent, 700);
  return (
    <div className="flex flex-col gap-6">
      <Field label="Max rent you can pay (per month, incl. bills)">
        <div className="rounded-2xl border-[1.5px] border-ink/30 bg-card px-4 pt-3 pb-4">
          <div className="mb-3 font-mono text-3xl">€{rent}</div>
          <Slider min={250} max={1800} step={25} value={[rent]} onValueChange={(v) => set({ maxRent: (v as number[])[0] })} />
        </div>
      </Field>
      <Field label="Cities you're looking in">
        <Pills tone="oranje" options={CITIES} value={p.areas ?? []} onChange={(areas) => set({ areas })} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Move in from" htmlFor="movein">
          <Input id="movein" type="date" value={p.moveInFrom ?? ""} onChange={(e) => set({ moveInFrom: e.target.value || null })} />
        </Field>
        <Field label="Staying for">
          <div className="flex h-11 items-center justify-between rounded-xl border-[1.5px] border-ink/25 bg-card px-1">
            <Stepper value={n(p.stayMonths, 12)} min={1} max={60} onChange={(v) => set({ stayMonths: v })} format={(v) => `${v}mo`} />
          </div>
        </Field>
      </div>
    </div>
  );
}

export function ListingSection({ p, set }: SectionProps) {
  const l = (p.listing ?? emptyListing) as ListingDraft;
  const up = (patch: Partial<ListingDraft>) => set({ listing: { ...l, ...patch } });
  return (
    <div className="flex flex-col gap-5">
      <Field label="Photos of the place">
        <ListingPhotos value={l.photos ?? []} onChange={(photos) => up({ photos })} />
      </Field>
      <Field label="Title" htmlFor="ltitle">
        <Input id="ltitle" value={l.title} maxLength={60} onChange={(e) => up({ title: e.target.value })} placeholder="Sunny room by the Oudegracht" />
      </Field>
      <Field label="City">
        <Pills tone="oranje" options={CITIES} value={l.city ? [l.city] : []} onChange={(v) => up({ city: v.filter((x) => x !== l.city)[0] ?? "" })} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Neighbourhood" htmlFor="lhood" hint="Shown publicly">
          <Input id="lhood" value={l.neighbourhood ?? ""} onChange={(e) => up({ neighbourhood: e.target.value })} placeholder="Lombok" />
        </Field>
        <Field label="Street address" htmlFor="laddr" hint="🔒 Only shown to matches">
          <Input id="laddr" value={l.address} onChange={(e) => up({ address: e.target.value })} placeholder="Kanaalstraat 12" />
        </Field>
      </div>
      <Field label="Rent for the room (per month, incl. bills)">
        <div className="rounded-2xl border-[1.5px] border-ink/30 bg-card px-4 pt-3 pb-4">
          <div className="mb-3 font-mono text-3xl">€{n(l.rent, 650)}</div>
          <Slider min={250} max={1800} step={25} value={[n(l.rent, 650)]} onValueChange={(v) => up({ rent: (v as number[])[0] })} />
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Contract length">
          <div className="flex h-11 items-center rounded-xl border-[1.5px] border-ink/25 bg-card px-1">
            <Stepper value={n(l.durationMonths, 12)} min={1} max={60} onChange={(v) => up({ durationMonths: v })} format={(v) => `${v}mo`} />
          </div>
        </Field>
        <Field label="Available from" htmlFor="lfrom">
          <Input id="lfrom" type="date" value={l.availableFrom ?? ""} onChange={(e) => up({ availableFrom: e.target.value || null })} />
        </Field>
        <Field label="People in the house (incl. new)">
          <div className="flex h-11 items-center rounded-xl border-[1.5px] border-ink/25 bg-card px-1">
            <Stepper value={n(l.householdSize, 3)} min={2} max={10} onChange={(v) => up({ householdSize: v })} />
          </div>
        </Field>
        <Field label="Free rooms">
          <div className="flex h-11 items-center rounded-xl border-[1.5px] border-ink/25 bg-card px-1">
            <Stepper value={n(l.roomsAvailable, 1)} min={1} max={6} onChange={(v) => up({ roomsAvailable: v })} />
          </div>
        </Field>
      </div>
      <Field label="What's the place like?">
        <Pills options={FEATURES} value={l.features ?? []} onChange={(features) => up({ features })} />
      </Field>
    </div>
  );
}
