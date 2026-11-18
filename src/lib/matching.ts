/**
 * Matching algorithm.
 *
 * Two stages:
 *  1. Hard filters — symmetric dealbreakers that would make living together a
 *     non-starter (gender/age preferences, allergies vs pets/smoking, budget vs
 *     rent, area). A candidate failing any of these is never shown.
 *  2. Soft score 0–100 — weighted lifestyle compatibility, used to rank the
 *     deck and explained to the user as human-readable reasons.
 *
 * Interaction types:
 *  - tenant ↔ renter: tenant is looking for a room in renter's place
 *  - tenant ↔ tenant: two people teaming up to find a place together
 *  - renter ↔ renter: never shown
 */

export type Person = {
  userId: string;
  role: "renter" | "tenant";
  age: number;
  gender: string;
  languages: string[];
  roommatesMin: number;
  roommatesMax: number;
  cleanliness: number;
  sleep: "early" | "flexible" | "night";
  guests: "rarely" | "sometimes" | "often";
  smokes: boolean;
  pets: string[];
  allergies: string[];
  dealbreakers: string[];
  prefGenders: string[];
  prefAgeMin: number;
  prefAgeMax: number;
  maxRent: number | null;
  areas: string[];
  moveInFrom: string | null;
  stayMonths: number | null;
  listing: {
    city: string;
    rent: number;
    durationMonths: number;
    availableFrom: string | null;
    householdSize: number;
    features: string[];
  } | null;
};

export type MatchResult = { score: number; reasons: string[]; warnings: string[] };

/** Budget tolerance: show places up to 10% over max contribution. */
const RENT_TOLERANCE = 1.1;

function smokesInHome(p: Person) {
  return p.smokes || (p.listing?.features.includes("smoking_allowed") ?? false);
}
function petsInHome(p: Person) {
  return p.pets.length > 0;
}

export type Exclusion = "age" | "gender" | "dealbreakers" | "allergies" | "budget" | "city" | "their-preferences";

/** Why would `a` refuse to live with `b`? (one direction; null = no veto) */
function veto(a: Person, b: Person): Exclusion | null {
  if (a.prefGenders.length > 0 && !a.prefGenders.includes(b.gender)) return "gender";
  if (b.age < a.prefAgeMin || b.age > a.prefAgeMax) return "age";

  if (a.dealbreakers.includes("smoker") && smokesInHome(b)) return "dealbreakers";
  if (a.dealbreakers.includes("pets") && petsInHome(b)) return "dealbreakers";
  if (a.dealbreakers.includes("parties") && b.guests === "often") return "dealbreakers";
  if (a.dealbreakers.includes("messy") && b.cleanliness <= 1) return "dealbreakers";
  if (a.dealbreakers.includes("night") && b.sleep === "night") return "dealbreakers";

  if (a.allergies.includes("cats") && b.pets.includes("cat")) return "allergies";
  if (a.allergies.includes("dogs") && b.pets.includes("dog")) return "allergies";
  if (a.allergies.includes("smoke") && smokesInHome(b)) return "allergies";
  return null;
}

export function interactionKind(a: Person, b: Person) {
  if (a.role === "renter" && b.role === "renter") return null;
  if (a.role === "tenant" && b.role === "tenant") return "tenant_tenant" as const;
  return "renter_tenant" as const;
}

/**
 * The first hard filter that rules `other` out for `me`, or null if they're a
 * candidate. Checked in the order users can act on: location and budget first,
 * then my preferences, then theirs.
 */
export function exclusionReason(me: Person, other: Person): Exclusion | "n/a" | null {
  if (me.userId === other.userId) return "n/a";
  const kind = interactionKind(me, other);
  if (!kind) return "n/a";

  if (kind === "renter_tenant") {
    const renter = me.role === "renter" ? me : other;
    const tenant = me.role === "renter" ? other : me;
    if (!renter.listing) return "n/a";
    if (tenant.areas.length > 0 && !tenant.areas.includes(renter.listing.city)) return "city";
    if (tenant.maxRent != null && renter.listing.rent > tenant.maxRent * RENT_TOLERANCE) return "budget";
  } else if (me.areas.length && other.areas.length && !me.areas.some((a) => other.areas.includes(a))) {
    // two tenants should be hunting in at least one shared city
    return "city";
  }
  const mine = veto(me, other);
  if (mine) return mine;
  if (veto(other, me)) return "their-preferences";
  return null;
}

export function passesHardFilters(me: Person, other: Person): boolean {
  return exclusionReason(me, other) === null;
}

const rangeOverlap = (a1: number, a2: number, b1: number, b2: number) =>
  Math.max(0, Math.min(a2, b2) - Math.max(a1, b1) + 1);

const monthsBetween = (a: string, b: string) =>
  Math.abs(new Date(a).getTime() - new Date(b).getTime()) / (1000 * 60 * 60 * 24 * 30);

const euro = (n: number) => `€${Math.round(n)}`;

export function scoreMatch(me: Person, other: Person): MatchResult {
  const reasons: string[] = [];
  const warnings: string[] = [];
  let total = 0;
  let weight = 0;
  const add = (w: number, s: number) => {
    total += w * Math.max(0, Math.min(1, s));
    weight += w;
  };

  // cleanliness: biggest predictor of housemate conflict
  const cleanDiff = Math.abs(me.cleanliness - other.cleanliness);
  add(25, 1 - cleanDiff / 4);
  if (cleanDiff === 0) reasons.push("Same standards of tidy");
  else if (cleanDiff >= 3) warnings.push("Very different on cleaning");

  // sleep schedule
  const sleepScore =
    me.sleep === other.sleep ? 1 : me.sleep === "flexible" || other.sleep === "flexible" ? 0.6 : 0;
  add(20, sleepScore);
  if (me.sleep === other.sleep && me.sleep === "night") reasons.push("Both night owls");
  else if (me.sleep === other.sleep && me.sleep === "early") reasons.push("Both early birds");
  else if (sleepScore === 0) warnings.push("Opposite sleep schedules");

  // guests / social
  const g = { rarely: 0, sometimes: 1, often: 2 };
  const guestDiff = Math.abs(g[me.guests] - g[other.guests]);
  add(10, 1 - guestDiff / 2);
  if (guestDiff === 0 && me.guests === "often") reasons.push("Both love having people over");

  // shared language
  const shared = me.languages.filter((l) => other.languages.includes(l));
  add(15, shared.length ? 1 : 0);
  if (shared.length) reasons.push(`You both speak ${shared.slice(0, 2).join(" & ")}`);
  else warnings.push("No shared language listed");

  // household size
  const kind = interactionKind(me, other);
  if (kind === "renter_tenant") {
    const renter = me.role === "renter" ? me : other;
    const tenant = me.role === "renter" ? other : me;
    const l = renter.listing!;
    const others = l.householdSize - 1; // housemates the tenant would have
    const fits = others >= tenant.roommatesMin && others <= tenant.roommatesMax;
    add(10, fits ? 1 : 0.3);
    if (!fits) warnings.push(`Household of ${l.householdSize}`);

    if (tenant.maxRent != null) {
      const headroom = tenant.maxRent - l.rent;
      add(10, headroom >= 0 ? 1 : 1 + headroom / (tenant.maxRent * 0.1));
      if (headroom >= 50) reasons.push(`${euro(headroom)} under budget`);
      else if (headroom < 0) warnings.push(`${euro(-headroom)} over budget`);
    }
    if (tenant.stayMonths != null) {
      const diff = Math.abs(tenant.stayMonths - l.durationMonths);
      add(10, 1 - Math.min(diff, 12) / 12);
      if (diff <= 1) reasons.push(`Contract fits your ${tenant.stayMonths}-month stay`);
    }
    if (tenant.moveInFrom && l.availableFrom) {
      const m = monthsBetween(tenant.moveInFrom, l.availableFrom);
      add(5, 1 - Math.min(m, 4) / 4);
    }
  } else {
    const overlap = rangeOverlap(me.roommatesMin, me.roommatesMax, other.roommatesMin, other.roommatesMax);
    add(10, overlap ? 1 : 0.2);
    if (me.maxRent != null && other.maxRent != null) {
      const diff = Math.abs(me.maxRent - other.maxRent);
      add(10, 1 - Math.min(diff, 400) / 400);
      if (diff <= 75) reasons.push("Similar budgets");
    }
    const areas = me.areas.filter((a) => other.areas.includes(a));
    if (areas.length) reasons.push(`Both hunting in ${areas[0]}`);
    if (me.stayMonths != null && other.stayMonths != null) {
      const diff = Math.abs(me.stayMonths - other.stayMonths);
      add(10, 1 - Math.min(diff, 12) / 12);
      if (diff <= 1) reasons.push("Staying the same length of time");
    }
    if (me.moveInFrom && other.moveInFrom) {
      add(5, 1 - Math.min(monthsBetween(me.moveInFrom, other.moveInFrom), 4) / 4);
    }
  }

  const score = weight ? Math.round((total / weight) * 100) : 50;
  return { score, reasons: reasons.slice(0, 4), warnings: warnings.slice(0, 2) };
}

export function ageFromDob(dob: string | Date, now = new Date()): number {
  const d = new Date(dob);
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}
