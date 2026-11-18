/**
 * Seeds demo data. Only touches accounts ending in @demo.test, so it's safe
 * to re-run. Usage: pnpm db:seed
 */
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { like, inArray } from "drizzle-orm";
import { connect } from "../src/db/connect";
import * as schema from "../src/db/schema";

const { db, migrate, close } = await connect();
await migrate();

// deterministic RNG so the demo looks the same every time
let seed = 42;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);
const pick = <T,>(a: readonly T[]) => a[Math.floor(rnd() * a.length)];
const some = <T,>(a: readonly T[], n: number) => [...a].sort(() => rnd() - 0.5).slice(0, n);
const int = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1));

// CC0 photos hosted in our R2 bucket (see scripts/SEED_PHOTOS.md)
const BASE = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");
const photo = (name: string) => (BASE ? `${BASE}/seed/${name}.jpg` : null);
const pools = {
  woman: ["women-00", "women-01", "women-06", "women-08", "women-12", "women-13", "women-16", "women-21", "women-28", "women-29",
    "pw-02", "pw-03", "pw-04", "pw-06", "pw-10", "pw-12", "pw-15", "pw-18", "pw-20", "pw-33", "pw-35", "pw-36", "pw-37"],
  man: ["men-00", "men-14", "men-21", "men-28", "men2-05", "men2-08", "men2-10", "men2-13", "men2-23", "men2-29",
    "pm-01", "pm-07", "pm-13", "pm-14", "pm-15", "pm-16", "pm-20", "pm-27", "pm-34", "pm-42", "pm-46"],
  rooms: ["rooms-00", "rooms-01", "rooms-03", "rooms-04", "rooms-10", "rooms-22", "rooms-24", "rooms-27", "rooms3-00", "rooms3-09", "rooms3-12", "rooms3-13", "rooms3-15",
    "pr-00", "pr-01", "pr-02", "pr-03", "pr-04", "pr-09", "pr-10", "pr-12", "pr-16", "pr-17", "pr-18", "pr-19", "pr-20", "pr-28", "pr-31", "pr-37", "pr-39", "pr-41", "pr-43", "pr-44", "pr-45", "pr-46"],
};
const cursor = { woman: 0, man: 0, rooms: 0 };
/** Faces are never reused: once a pool runs out, people simply have no photo (it's optional). */
const portraitFor = (g: string) => {
  const k = g === "man" ? "man" : g === "woman" ? "woman" : rnd() < 0.5 ? "woman" : "man";
  if (rnd() < 0.35 || cursor[k] >= pools[k].length) return null;
  return photo(pools[k][cursor[k]++]);
};
/** Room photos may repeat across listings, but never within one. */
const roomPhotos = (n: number) =>
  Array.from({ length: n }, () => photo(pools.rooms[cursor.rooms++ % pools.rooms.length])).filter((x): x is string => !!x);

const dob = (age: number) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - age, int(0, 11), int(1, 28));
  return d.toISOString().slice(0, 10);
};
const inMonths = (m: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() + m, 1);
  return d.toISOString().slice(0, 10);
};

const old = await db.select({ id: schema.users.id }).from(schema.users).where(like(schema.users.email, "%@demo.test"));
if (old.length) await db.delete(schema.users).where(inArray(schema.users.id, old.map((o) => o.id)));
await db.delete(schema.contactRequests).where(like(schema.contactRequests.email, "%@demo.test"));

const passwordHash = await bcrypt.hash("roommates", 10);
const now = new Date();

type Spec = {
  email: string;
  role: "tenant" | "renter";
  age: number;
  student?: string;
  isAdmin?: boolean;
  status?: "active" | "removed";
  removalReason?: string;
  profile: Partial<typeof schema.profiles.$inferInsert> & { username: string; gender: "woman" | "man" | "nonbinary" | "other" };
  listing?: Omit<typeof schema.listings.$inferInsert, "userId">;
};

const CITY_WEIGHTS = [
  ...Array(4).fill("Amsterdam"), ...Array(4).fill("Utrecht"), ...Array(3).fill("Rotterdam"), ...Array(2).fill("Den Haag"),
  ...Array(2).fill("Leiden"), ...Array(2).fill("Delft"), ...Array(2).fill("Groningen"), ...Array(2).fill("Eindhoven"),
  "Nijmegen", "Maastricht", "Enschede", "Tilburg", "Wageningen",
] as string[];
const HOODS: Record<string, string[]> = {
  Amsterdam: ["De Pijp", "Oost", "Jordaan", "West", "Noord", "Bos en Lommer"],
  Utrecht: ["Lombok", "Wittevrouwen", "Oudwijk", "Zuilen", "Binnenstad"],
  Rotterdam: ["Kralingen", "Noord", "Delfshaven", "Kop van Zuid"],
  "Den Haag": ["Zeeheldenkwartier", "Scheveningen", "Regentesse"],
  Leiden: ["Binnenstad", "Merenwijk", "Professorenwijk"],
  Delft: ["Binnenstad", "Wippolder", "Hof van Delft"],
  Groningen: ["Schildersbuurt", "Oosterpoort", "Zeeheldenbuurt"],
  Eindhoven: ["Strijp-S", "Woensel", "Stratum"],
  Nijmegen: ["Oost", "Bottendaal", "Hengstdal"],
  Maastricht: ["Wyck", "Jekerkwartier", "Céramique"],
  Enschede: ["Roombeek", "Centrum", "Hogeland"],
  Tilburg: ["Spoorzone", "Oud-Zuid", "Reeshof"],
  Wageningen: ["Centrum", "Noordwest", "De Nude"],
};
const STREETS = ["Kanaalstraat", "Prinsengracht", "Oudegracht", "Nieuwe Binnenweg", "Haarlemmerstraat", "Herestraat", "Molenstraat", "Lange Nieuwstraat"];
const NAMES_W = ["lotte", "emma.v", "priya", "chiara", "zeynep", "ana.s", "julia_k", "fenna", "mei", "sofia.r", "noor", "ines",
  "anouk", "isa", "maria.l", "giulia", "hanna", "laura.m", "elif", "yara", "sara.b", "lea", "olivia", "amira", "chloe", "nadia",
  "femke", "roos", "eva.d", "lina", "aisha", "camille", "zofia", "marta", "ingrid", "keiko", "valentina", "tess", "jade", "freya"];
const NAMES_M = ["bram", "luca", "mateo", "jonas.h", "arjun", "tomasz", "youssef", "finn", "kenji", "pieter", "nikos", "oscar",
  "thijs", "sem", "daniel.r", "marco", "leon", "ahmed", "rohan", "felix", "jakub", "sven", "diego", "omar", "jesse", "milan",
  "ruben", "noah.k", "lars", "elias", "kofi", "matteo", "hugo", "ali", "stefan", "wei", "tobias", "joris", "andrei", "mehmet"];
const NAMES_X = ["robin", "sam.q", "alex", "kai", "charlie", "noa", "jamie", "river", "quinn", "ash"];
const LANG_EXTRA = ["Dutch", "German", "Spanish", "Italian", "Polish", "Turkish", "Hindi", "Mandarin", "Greek", "Portuguese", "French", "Arabic"];
const BIOS = [
  "Second-year law student. Morning runner, evening cook, weekend museum person.",
  "Starting a master's in AI. Quiet during the week, happy to host a games night.",
  "Nurse in training, so my hours are odd, but I'm very tidy and very quiet.",
  "Erasmus student for one year. Looking for friendly people, not a party house.",
  "Architecture student. Expect cardboard models on the kitchen table, but only briefly.",
  "Working my first job after graduating. Into cycling, board games and good bread.",
  "MSc student, mostly found at the library or the climbing gym. I cook big batches and share.",
  "Exchange semester! Looking for a calm place and people to explore the city with.",
  "Design student. I own too many plants and one very good coffee machine.",
  "PhD candidate, early to bed, early to the lab. Quiet but up for borrel on Fridays.",
  "Bachelor's in econ, part-time barista. Will fix your bike.",
  "Moving for an internship. Tidy, friendly, terrible at Dutch but learning.",
  "Musician (headphones, I promise). Love a shared Sunday dinner.",
  "Medicine student with weird shifts. Respectful of quiet hours.",
];
const TITLES = ["Furnished room with big windows", "Room in a shared canal-side flat", "Corner room with balcony", "Room in a quiet family-run house", "Spacious room, shared garden", "Sunny room by the canal", "Big room in a chill student house", "Attic room with skylight", "Room in a cosy 3-person flat", "Bright room, 5 min to campus", "Quiet room near the park"];
const FEATS = ["shared_kitchen", "shared_bathroom", "private_bathroom", "furnished", "balcony", "garden", "washing_machine", "bike_storage", "registration", "bills_included", "pets_allowed"];

const usedNames = new Set<string>(["sanne", "daan", "mod.team", "quick.deal"]);
function randomPerson(i: number): Spec {
  const g = pick(["woman", "woman", "man", "man", "nonbinary"] as const);
  let name = pick(g === "woman" ? NAMES_W : g === "man" ? NAMES_M : NAMES_X);
  while (usedNames.has(name)) name = `${name.replace(/\d+$/, "")}${int(2, 99)}`;
  usedNames.add(name);
  const role = rnd() < 0.45 ? "renter" : "tenant";
  // weighted towards the big student cities, but every city has people
  const city = pick(CITY_WEIGHTS);
  // mostly students, plus young professionals and some older renters/tenants
  const band = rnd();
  const age = band < 0.62 ? int(19, 29) : band < 0.86 ? int(30, 44) : int(45, 66);
  const prefAgeMin = age >= 45 ? int(18, 35) : 18;
  const prefAgeMax = age >= 30 || rnd() < 0.4 ? 99 : int(30, 45);
  const smokes = rnd() < 0.12;
  const pets = rnd() < 0.15 ? [pick(["cat", "dog"])] : [];
  const spec: Spec = {
    email: `${name.replace(/[^a-z0-9]/g, "")}${i}@demo.test`,
    role,
    age,
    student: rnd() < 0.7 ? pick(["Universiteit van Amsterdam", "Vrije Universiteit Amsterdam", "Universiteit Utrecht", "TU Delft", "Universiteit Leiden", "Erasmus Universiteit Rotterdam", "Hogeschool van Amsterdam", "Rijksuniversiteit Groningen", "TU Eindhoven", "Hogeschool Utrecht"]) : undefined,
    profile: {
      username: name,
      gender: g,
      photoUrl: portraitFor(g),
      bio: pick(BIOS),
      languages: ["English", ...some(LANG_EXTRA, int(0, 2))],
      cleanliness: int(2, 5),
      sleep: pick(["early", "flexible", "night"] as const),
      guests: pick(["rarely", "sometimes", "sometimes", "often"] as const),
      smokes,
      pets,
      allergies: rnd() < 0.15 ? [pick(["cats", "dust", "nuts"])] : [],
      dealbreakers: rnd() < 0.3 ? [pick(["smoker", "parties", "messy"])] : [],
      prefGenders: rnd() < 0.15 ? [g] : [],
      prefAgeMin,
      prefAgeMax,
      roommatesMin: 1,
      roommatesMax: int(2, 5),
    },
  };
  if (role === "tenant") {
    Object.assign(spec.profile, {
      maxRent: int(10, 48) * 25,
      areas: [city, ...(rnd() < 0.55 ? [pick(CITY_WEIGHTS)] : []), ...(rnd() < 0.2 ? [pick(CITY_WEIGHTS)] : [])].filter((v, k, a) => a.indexOf(v) === k),
      moveInFrom: inMonths(int(0, 3)),
      stayMonths: pick([5, 6, 6, 10, 12, 12, 24]),
    });
  } else {
    spec.listing = {
      title: pick(TITLES),
      city,
      neighbourhood: pick(HOODS[city]),
      address: `${pick(STREETS)} ${int(2, 180)}`,
      rent: int(12, 44) * 25,
      durationMonths: pick([6, 6, 12, 12, 24]),
      availableFrom: inMonths(int(0, 2)),
      roomsAvailable: 1,
      householdSize: int(2, 5),
      features: some(FEATS, int(3, 6)).concat(smokes ? ["smoking_allowed"] : []),
      photos: roomPhotos(int(1, 3)),
    };
  }
  return spec;
}

const hero: Spec[] = [
  {
    email: "sanne@demo.test",
    role: "tenant",
    age: 22,
    student: "Universiteit van Amsterdam",
    profile: {
      username: "sanne",
      gender: "woman",
      photoUrl: photo("women-07"),
      bio: "International MSc student (psych) moving from Lisbon. Tidy, night owl, will bake for the house.",
      languages: ["English", "Portuguese", "Dutch"],
      cleanliness: 4,
      sleep: "night",
      guests: "sometimes",
      allergies: ["cats"],
      prefAgeMin: 19,
      prefAgeMax: 32,
      roommatesMin: 1,
      roommatesMax: 4,
      maxRent: 800,
      areas: ["Amsterdam", "Utrecht", "Leiden"],
      moveInFrom: inMonths(1),
      stayMonths: 12,
    },
  },
  {
    email: "daan@demo.test",
    role: "renter",
    age: 25,
    student: "Universiteit Utrecht",
    profile: {
      username: "daan",
      gender: "man",
      photoUrl: photo("men2-16"),
      bio: "Our housemate is moving to Berlin, so we have a room free! We're 2 chill master's students who do a weekly house dinner.",
      languages: ["Dutch", "English", "German"],
      cleanliness: 4,
      sleep: "flexible",
      guests: "sometimes",
      roommatesMin: 1,
      roommatesMax: 3,
    },
    listing: {
      title: "Attic room in a canal house",
      city: "Utrecht",
      neighbourhood: "Lombok",
      address: "Kanaalstraat 88",
      rent: 725,
      durationMonths: 12,
      availableFrom: inMonths(1),
      roomsAvailable: 1,
      householdSize: 3,
      features: ["shared_kitchen", "shared_bathroom", "furnished", "washing_machine", "bike_storage", "registration"],
      photos: [photo("rooms-02"), photo("rooms3-01"), photo("rooms3-14")].filter((x): x is string => !!x),
    },
  },
  {
    email: "admin@demo.test",
    role: "tenant",
    age: 30,
    isAdmin: true,
    profile: { username: "mod.team", gender: "other", lookingStatus: "paused", maxRent: 800, areas: ["Amsterdam"], languages: ["English", "Dutch"] },
  },
  {
    email: "removed@demo.test",
    role: "tenant",
    age: 27,
    status: "removed",
    removalReason: "Asked several people to pay a €500 'reservation deposit' before any viewing. This breaks our rules on scams.",
    profile: { username: "quick.deal", gender: "man", maxRent: 900, areas: ["Amsterdam"], languages: ["English"] },
  },
];

const COUNT = Number(process.env.SEED_COUNT ?? 534); // generated test profiles (plus the 4 named demo accounts)
const specs = [...hero, ...Array.from({ length: COUNT }, (_, i) => randomPerson(i))];
const ids: Record<string, string> = {};
for (const s of specs) ids[s.email] = randomUUID();

const chunks = <T,>(arr: T[], n = 100) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));
for (const part of chunks(specs)) {
  await db.insert(schema.users).values(
    part.map((s) => ({
      id: ids[s.email],
      email: s.email,
      phone: `+3161${String(int(1000000, 9999999))}`,
      passwordHash,
      dateOfBirth: dob(s.age),
      phoneVerifiedAt: now,
      ageVerifiedAt: now,
      ageVerificationMethod: "idin (seed)",
      studentInstitution: s.student ?? null,
      studentEmail: s.student ? s.email.replace("@demo.test", "@student.demo.nl") : null,
      studentVerifiedAt: s.student ? now : null,
      role: s.role,
      isAdmin: !!s.isAdmin,
      status: s.status ?? "active",
      removalReason: s.removalReason ?? null,
      removedAt: s.status === "removed" ? new Date(Date.now() - 2 * 864e5) : null,
      onboardedAt: now,
    })),
  );
  await db.insert(schema.profiles).values(part.map((s) => ({ userId: ids[s.email], ...s.profile })));
  const listings = part.filter((s) => s.listing).map((s) => ({ userId: ids[s.email], ...s.listing! }));
  if (listings.length) await db.insert(schema.listings).values(listings);
}

const sanne = ids["sanne@demo.test"];
const daan = ids["daan@demo.test"];
const others = specs.slice(4).map((s) => ids[s.email]);

// a bunch of people have already liked Sanne and Daan → swiping right on them = instant match
const preLikes = [
  ...others.filter(() => rnd() < 0.5).map((id) => ({ swiperId: id, targetId: sanne, direction: "like" as const })),
  ...others.filter(() => rnd() < 0.5).map((id) => ({ swiperId: id, targetId: daan, direction: "like" as const })),
];
for (const part of chunks(preLikes, 200)) await db.insert(schema.swipes).values(part).onConflictDoNothing();

// Sanne ↔ Daan already matched and chatting
await db.insert(schema.swipes).values([
  { swiperId: sanne, targetId: daan, direction: "like" },
  { swiperId: daan, targetId: sanne, direction: "like" },
]).onConflictDoNothing();
const [a, b] = [sanne, daan].sort();
const [m] = await db.insert(schema.matches).values({ userA: a, userB: b, kind: "renter_tenant", score: 84 }).returning();
const t = (min: number) => new Date(Date.now() - min * 60_000);
await db.insert(schema.messages).values([
  { matchId: m.id, senderId: sanne, body: "Hoi Daan! Is the attic room still available? 🙂", createdAt: t(180) },
  { matchId: m.id, senderId: daan, body: "Hey Sanne! Yes it is. You'd be living with me and Fleur, we do a house dinner on Wednesdays.", createdAt: t(170) },
  { matchId: m.id, senderId: sanne, body: "That sounds perfect. I'm a night owl but very quiet, promise. Any cats in the house? I'm allergic 😅", createdAt: t(160) },
  { matchId: m.id, senderId: daan, body: "No pets at all! Want to do a video viewing this week? Thursday evening?", createdAt: t(25) },
]);

// moderation demo: a trusted reporter with a good track record + an open queue
const reporter = others[0];
const sketchy = others[5];
const pastTargets = others.slice(10, 14);
for (const [k, target] of pastTargets.entries()) {
  await db.insert(schema.reports).values({ reporterId: reporter, reportedId: target, reason: "fake", status: k < 3 ? "upheld" : "dismissed", resolvedAt: now });
}
await db.insert(schema.reports).values([
  { reporterId: reporter, reportedId: sketchy, reason: "scam", details: "Asked me to transfer the deposit to a German bank account before showing the room." },
  { reporterId: sanne, reportedId: sketchy, reason: "scam", details: "Same thing, wanted €400 'to hold the room'." },
  { reporterId: others[2], reportedId: others[8], reason: "inappropriate", details: "Bio has a weird joke in it." },
]);
await db.insert(schema.appeals).values({
  userId: ids["removed@demo.test"],
  message: "I was only asking whether people could pay the deposit on the day of signing, it was a misunderstanding.",
});
await db.insert(schema.contactRequests).values([
  { channel: "user", name: "Lotte", email: "lotte@demo.test", subject: "Can't upload photos", body: "When I try to upload a photo of my room it says upload failed. I'm on an iPhone." },
  { channel: "authority", name: "J. de Vries", email: "jdevries@demo.test", organisation: "Gemeente Utrecht, Team Wonen", subject: "Information request re: housing fraud", body: "Ref. 2026-0412. We'd like to discuss a pattern of fraudulent room listings in Utrecht." },
]);

await close();
console.log(`✓ seeded ${specs.length} demo users. Log in as sanne@demo.test / daan@demo.test / admin@demo.test (password: roommates)`);
