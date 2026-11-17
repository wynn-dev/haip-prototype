"use client";

import { Home, Search } from "lucide-react";
import { CheckList, Chips, FieldRow, Section, Segmented, Stepper, Switch, inputCls } from "@/components/ios";
import { AvatarPicker, ListingPhotos } from "@/components/profile/photo-picker";
import { Slider } from "@/components/ui/slider";
import { ALLERGIES, CITIES, CLEANLINESS, DEALBREAKERS, FEATURES, GENDERS, GUESTS, LANGUAGES, PETS, SLEEP } from "@/lib/options";
import { emptyListing, type ListingDraft, type ProfileInput } from "@/lib/profile-schema";

export type SectionProps = { p: ProfileInput; set: (patch: Partial<ProfileInput>) => void };

const n = (v: unknown, d = 0) => (typeof v === "number" ? v : Number(v ?? d));
const euro = (v: number) => `€${v}`;
const months = (v: number) => `${v} mo`;

export function RoleSection({ p, set }: SectionProps) {
  return (
    <div className="px-4">
      <CheckList
        value={p.role}
        onChange={(role) => set({ role, listing: role === "renter" ? (p.listing ?? emptyListing) : null })}
        options={[
          { value: "tenant", label: "I'm looking for a room", detail: "Browse rooms, or team up with someone to find a place together.", icon: Search },
          { value: "renter", label: "I have a room to fill", detail: "You have a place (or a lease) and want a housemate for the spare room.", icon: Home },
        ]}
      />
    </div>
  );
}

export function AboutSection({ p, set }: SectionProps) {
  return (
    <div className="flex flex-col gap-6">
      <AvatarPicker name={p.username} value={p.photoUrl ?? null} onChange={(photoUrl) => set({ photoUrl })} />
      <Section footer="Shown on your profile. It doesn't have to be your real name.">
        <input aria-label="Username" value={p.username} maxLength={20} onChange={(e) => set({ username: e.target.value })} placeholder="Username" className={inputCls} />
      </Section>
      <Section header="Gender">
        <FieldRow stacked>
          <Segmented options={GENDERS} value={p.gender} onChange={(gender) => set({ gender })} />
        </FieldRow>
      </Section>
      <Section header="Languages">
        <FieldRow stacked>
          <Chips options={LANGUAGES} value={p.languages} onChange={(languages) => set({ languages })} />
        </FieldRow>
      </Section>
      <Section header="About you" footer={`${(p.bio ?? "").length}/300`}>
        <textarea
          aria-label="Bio"
          value={p.bio ?? ""}
          maxLength={300}
          rows={4}
          onChange={(e) => set({ bio: e.target.value })}
          placeholder="What you study, what you're like at home, what you're looking for."
          className="block w-full resize-none bg-transparent px-4 py-3 text-[17px] outline-none placeholder:text-label-3"
        />
      </Section>
    </div>
  );
}

export function LifestyleSection({ p, set }: SectionProps) {
  const c = n(p.cleanliness, 3);
  return (
    <div className="flex flex-col gap-6">
      <Section header="Tidiness" footer="Be honest. Cleaning is the number-one source of housemate conflict.">
        <FieldRow stacked>
          <div className="flex items-baseline justify-between">
            <span className="font-medium">{CLEANLINESS[c - 1]}</span>
            <span className="text-[15px] text-label-2 tabular-nums">{c}/5</span>
          </div>
          <Slider min={1} max={5} step={1} value={[c]} onValueChange={(v) => set({ cleanliness: (v as number[])[0] })} />
        </FieldRow>
      </Section>
      <Section header="Daily rhythm">
        <FieldRow stacked label="Sleep schedule">
          <Segmented options={SLEEP} value={p.sleep} onChange={(sleep) => set({ sleep })} />
        </FieldRow>
        <FieldRow stacked label="Having people over">
          <Segmented options={GUESTS} value={p.guests} onChange={(guests) => set({ guests })} />
        </FieldRow>
        <FieldRow label="I smoke">
          <Switch label="I smoke" checked={p.smokes} onChange={(smokes) => set({ smokes })} />
        </FieldRow>
      </Section>
      <Section header="Pets you have">
        <FieldRow stacked>
          <Chips options={PETS} value={p.pets ?? []} onChange={(pets) => set({ pets })} />
        </FieldRow>
      </Section>
      <Section header="Allergies" footer="We won't show you homes with pets or smoke you're allergic to.">
        <FieldRow stacked>
          <Chips options={ALLERGIES} value={p.allergies ?? []} onChange={(allergies) => set({ allergies })} />
        </FieldRow>
      </Section>
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
      <Section header="Number of housemates">
        <FieldRow label="At least">
          <Stepper value={min} min={1} max={max} onChange={(v) => set({ roommatesMin: v })} />
        </FieldRow>
        <FieldRow label="At most">
          <Stepper value={max} min={min} max={8} onChange={(v) => set({ roommatesMax: v })} />
        </FieldRow>
      </Section>
      <Section header="Live with" footer="Leave empty if anyone is fine.">
        <FieldRow stacked>
          <Chips options={GENDERS} value={p.prefGenders ?? []} onChange={(prefGenders) => set({ prefGenders })} />
        </FieldRow>
      </Section>
      <Section header="Age range">
        <FieldRow stacked>
          <div className="flex justify-between text-[15px]">
            <span>{amin}</span>
            <span className="text-label-2">to</span>
            <span>{amax >= 60 ? "60+" : amax}</span>
          </div>
          <Slider min={18} max={60} value={[amin, Math.min(amax, 60)]} onValueChange={(v) => { const [a, b] = v as number[]; set({ prefAgeMin: a, prefAgeMax: b >= 60 ? 99 : b }); }} />
        </FieldRow>
      </Section>
      <Section header="Dealbreakers" footer="People who match these are never shown to you, and you're not shown to them.">
        <FieldRow stacked>
          <Chips options={DEALBREAKERS} value={p.dealbreakers ?? []} onChange={(dealbreakers) => set({ dealbreakers })} />
        </FieldRow>
      </Section>
    </div>
  );
}

export function TenantHousingSection({ p, set }: SectionProps) {
  const rent = n(p.maxRent, 700);
  return (
    <div className="flex flex-col gap-6">
      <Section header="Budget" footer="Per month, including bills. We also show rooms up to 10% over.">
        <FieldRow stacked>
          <div className="text-[28px] font-semibold tracking-[-0.02em] tabular-nums">{euro(rent)}</div>
          <Slider min={250} max={1800} step={25} value={[rent]} onValueChange={(v) => set({ maxRent: (v as number[])[0] })} />
        </FieldRow>
      </Section>
      <Section header="Cities">
        <FieldRow stacked>
          <Chips options={CITIES} value={p.areas ?? []} onChange={(areas) => set({ areas })} />
        </FieldRow>
      </Section>
      <Section header="Timing">
        <FieldRow label="Move in from">
          <input type="date" value={p.moveInFrom ?? ""} onChange={(e) => set({ moveInFrom: e.target.value || null })} className="bg-transparent text-right text-tint outline-none" />
        </FieldRow>
        <FieldRow label="Staying for">
          <Stepper value={n(p.stayMonths, 12)} min={1} max={60} onChange={(v) => set({ stayMonths: v })} format={months} />
        </FieldRow>
      </Section>
    </div>
  );
}

export function ListingSection({ p, set }: SectionProps) {
  const l = (p.listing ?? emptyListing) as ListingDraft;
  const up = (patch: Partial<ListingDraft>) => set({ listing: { ...l, ...patch } });
  const rent = n(l.rent, 650);
  return (
    <div className="flex flex-col gap-6">
      <section className="px-4">
        <h2 className="section-header">Photos</h2>
        <ListingPhotos value={l.photos ?? []} onChange={(photos) => up({ photos })} />
        <p className="section-footer">The first photo is the cover. Up to 6.</p>
      </section>
      <Section header="The room">
        <input aria-label="Title" value={l.title} maxLength={60} onChange={(e) => up({ title: e.target.value })} placeholder="Title, e.g. Bright room near the park" className={inputCls} />
        <input aria-label="Neighbourhood" value={l.neighbourhood ?? ""} onChange={(e) => up({ neighbourhood: e.target.value })} placeholder="Neighbourhood" className={inputCls} />
        <input aria-label="Street address" value={l.address} onChange={(e) => up({ address: e.target.value })} placeholder="Street and number" className={inputCls} />
      </Section>
      <p className="-mt-4 section-footer px-8">The street address is only shown to people you match with.</p>
      <Section header="City">
        <FieldRow stacked>
          <Chips single options={CITIES} value={l.city ? [l.city] : []} onChange={(v) => up({ city: v[0] ?? "" })} />
        </FieldRow>
      </Section>
      <Section header="Rent" footer="Per month for the room, including bills.">
        <FieldRow stacked>
          <div className="text-[28px] font-semibold tracking-[-0.02em] tabular-nums">{euro(rent)}</div>
          <Slider min={250} max={1800} step={25} value={[rent]} onValueChange={(v) => up({ rent: (v as number[])[0] })} />
        </FieldRow>
      </Section>
      <Section header="Details">
        <FieldRow label="Contract">
          <Stepper value={n(l.durationMonths, 12)} min={1} max={60} onChange={(v) => up({ durationMonths: v })} format={months} />
        </FieldRow>
        <FieldRow label="Available from">
          <input type="date" value={l.availableFrom ?? ""} onChange={(e) => up({ availableFrom: e.target.value || null })} className="bg-transparent text-right text-tint outline-none" />
        </FieldRow>
        <FieldRow label="People in the house">
          <Stepper value={n(l.householdSize, 3)} min={2} max={10} onChange={(v) => up({ householdSize: v })} />
        </FieldRow>
        <FieldRow label="Free rooms">
          <Stepper value={n(l.roomsAvailable, 1)} min={1} max={6} onChange={(v) => up({ roomsAvailable: v })} />
        </FieldRow>
      </Section>
      <Section header="Features">
        <FieldRow stacked>
          <Chips options={FEATURES} value={l.features ?? []} onChange={(features) => up({ features })} />
        </FieldRow>
      </Section>
    </div>
  );
}
