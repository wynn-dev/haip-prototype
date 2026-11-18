import "server-only";
import { and, eq, inArray, isNotNull, ne, or } from "drizzle-orm";
import { db, schema } from "@/db";
import type { Listing, Profile, User } from "@/db/schema";
import { ageFromDob, exclusionReason, interactionKind, scoreMatch, type Exclusion, type Person } from "@/lib/matching";

type Row = { user: User; profile: Profile; listing: Listing | null };

/** Public card data. Deliberately excludes email, phone, DOB and exact address. */
export type CardData = {
  userId: string;
  username: string;
  age: number;
  photoUrl: string | null;
  gender: string;
  bio: string;
  languages: string[];
  role: "renter" | "tenant";
  lookingStatus: string;
  ageVerified: boolean;
  studentInstitution: string | null;
  roommatesMin: number;
  roommatesMax: number;
  cleanliness: number;
  sleep: string;
  guests: string;
  smokes: boolean;
  pets: string[];
  allergies: string[];
  maxRent: number | null;
  areas: string[];
  moveInFrom: string | null;
  stayMonths: number | null;
  listing: Omit<Listing, "userId" | "address"> & { address?: string } | null;
  score: number;
  reasons: string[];
  warnings: string[];
};

const baseSelect = () =>
  db
    .select({ user: schema.users, profile: schema.profiles, listing: schema.listings })
    .from(schema.users)
    .innerJoin(schema.profiles, eq(schema.profiles.userId, schema.users.id))
    .leftJoin(schema.listings, eq(schema.listings.userId, schema.users.id));

export function toPerson({ user, profile, listing }: Row): Person {
  return {
    userId: user.id,
    role: user.role!,
    age: ageFromDob(user.dateOfBirth),
    gender: profile.gender,
    languages: profile.languages,
    roommatesMin: profile.roommatesMin,
    roommatesMax: profile.roommatesMax,
    cleanliness: profile.cleanliness,
    sleep: profile.sleep,
    guests: profile.guests,
    smokes: profile.smokes,
    pets: profile.pets,
    allergies: profile.allergies,
    dealbreakers: profile.dealbreakers,
    prefGenders: profile.prefGenders,
    prefAgeMin: profile.prefAgeMin,
    prefAgeMax: profile.prefAgeMax,
    maxRent: profile.maxRent,
    areas: profile.areas,
    moveInFrom: profile.moveInFrom,
    stayMonths: profile.stayMonths,
    listing: listing
      ? {
          city: listing.city,
          rent: listing.rent,
          durationMonths: listing.durationMonths,
          availableFrom: listing.availableFrom,
          householdSize: listing.householdSize,
          features: listing.features,
        }
      : null,
  };
}

export function toCard(row: Row, me: Person | null, revealAddress = false): CardData {
  const { user, profile, listing } = row;
  const m = me ? scoreMatch(me, toPerson(row)) : { score: 0, reasons: [], warnings: [] };
  let publicListing: CardData["listing"] = null;
  if (listing) {
    const { userId: _u, address, ...rest } = listing;
    publicListing = revealAddress ? { ...rest, address } : rest;
  }
  return {
    userId: user.id,
    username: profile.username,
    age: ageFromDob(user.dateOfBirth),
    photoUrl: profile.photoUrl,
    gender: profile.gender,
    bio: profile.bio,
    languages: profile.languages,
    role: user.role!,
    lookingStatus: profile.lookingStatus,
    ageVerified: !!user.ageVerifiedAt,
    studentInstitution: user.studentVerifiedAt ? user.studentInstitution : null,
    roommatesMin: profile.roommatesMin,
    roommatesMax: profile.roommatesMax,
    cleanliness: profile.cleanliness,
    sleep: profile.sleep,
    guests: profile.guests,
    smokes: profile.smokes,
    pets: profile.pets,
    allergies: profile.allergies,
    maxRent: profile.maxRent,
    areas: profile.areas,
    moveInFrom: profile.moveInFrom,
    stayMonths: profile.stayMonths,
    listing: publicListing,
    ...m,
  };
}

export async function loadRow(userId: string): Promise<Row | null> {
  const [r] = await baseSelect().where(eq(schema.users.id, userId)).limit(1);
  return r ?? null;
}

/** Everyone I've blocked or who blocked me. */
export async function blockedIds(userId: string) {
  const rows = await db
    .select()
    .from(schema.blocks)
    .where(or(eq(schema.blocks.blockerId, userId), eq(schema.blocks.blockedId, userId)));
  return new Set(rows.map((b) => (b.blockerId === userId ? b.blockedId : b.blockerId)));
}

export type DeckStats = {
  /** people who pass every filter and haven't been swiped yet */
  total: number;
  /** people already swiped on */
  seen: number;
  /** why the remaining people are hidden, most common first */
  excluded: { reason: Exclusion; count: number }[];
};

/**
 * Build the deck: hard-filter every eligible candidate against me, then rank
 * by compatibility score. Swipes are persisted, so already-seen people never
 * come back (and survive logout/device changes). `exclude` skips cards the
 * client already holds, so the deck can page.
 */
export async function getDeck(
  user: User,
  { limit = 30, exclude = [] }: { limit?: number; exclude?: string[] } = {},
): Promise<{ cards: CardData[]; stats: DeckStats }> {
  const empty = { cards: [], stats: { total: 0, seen: 0, excluded: [] } };
  const meRow = await loadRow(user.id);
  if (!meRow) return empty;
  const me = toPerson(meRow);
  if (me.role === "renter" && !meRow.listing) return empty;

  const [swipedRows, blocked, candidates] = await Promise.all([
    db.select({ id: schema.swipes.targetId }).from(schema.swipes).where(eq(schema.swipes.swiperId, user.id)),
    blockedIds(user.id),
    baseSelect().where(
      and(
        ne(schema.users.id, user.id),
        eq(schema.users.status, "active"),
        isNotNull(schema.users.onboardedAt),
        isNotNull(schema.users.ageVerifiedAt),
        ne(schema.profiles.lookingStatus, "paused"),
        me.role === "renter" ? eq(schema.users.role, "tenant") : undefined,
      ),
    ),
  ]);
  const swiped = new Set(swipedRows.map((r) => r.id));
  const skip = new Set(exclude);

  const counts = new Map<Exclusion, number>();
  const passing: Row[] = [];
  let seen = 0;
  for (const r of candidates) {
    if (blocked.has(r.user.id)) continue;
    const why = exclusionReason(me, toPerson(r));
    if (why === "n/a") continue;
    if (why) {
      counts.set(why, (counts.get(why) ?? 0) + 1);
      continue;
    }
    if (swiped.has(r.user.id)) seen++;
    else passing.push(r);
  }

  const cards = passing
    .filter((r) => !skip.has(r.user.id))
    .map((r) => toCard(r, me))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  const excluded = [...counts].map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count);
  return { cards, stats: { total: passing.length, seen, excluded } };
}

export async function matchesFor(userId: string) {
  const rows = await db
    .select()
    .from(schema.matches)
    .where(or(eq(schema.matches.userA, userId), eq(schema.matches.userB, userId)));
  return rows;
}

export async function rowsFor(ids: string[]) {
  if (!ids.length) return [];
  return baseSelect().where(inArray(schema.users.id, ids));
}

export { interactionKind };
