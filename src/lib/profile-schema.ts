import { z } from "zod";
import { ALLERGIES, CITIES, DEALBREAKERS, FEATURES, GENDERS, LANGUAGES, PETS } from "@/lib/options";

const values = <T extends readonly ({ value: string } | string)[]>(list: T) =>
  list.map((o) => (typeof o === "string" ? o : o.value)) as [string, ...string[]];
/** A list of known option values: no free text, no duplicates, bounded size. */
const pick = <T extends readonly ({ value: string } | string)[]>(list: T) =>
  z.array(z.enum(values(list))).max(list.length).transform((a) => [...new Set(a)]);
const optDate = z.iso.date("Use a valid date").nullable().default(null);
const url = z.string().max(500);

const int = (min: number, max: number) => z.coerce.number().int().min(min).max(max);

export const listingSchema = z.object({
  title: z.string().trim().min(3, "Give your place a title").max(60),
  city: z.enum(values(CITIES), { error: "Choose a city" }),
  address: z.string().trim().min(5, "Add the street address (only shown to matches)").max(120),
  neighbourhood: z.string().trim().max(40).default(""),
  rent: int(100, 5000),
  durationMonths: int(1, 60),
  availableFrom: optDate,
  roomsAvailable: int(1, 6),
  householdSize: int(2, 10),
  features: pick(FEATURES).default([]),
  photos: z.array(url).max(6, "Up to 6 photos").default([]),
}).refine((l) => !(l.features.includes("private_bathroom") && l.features.includes("shared_bathroom")), {
  message: "Choose either a private or a shared bathroom",
  path: ["features"],
});

export const profileSchema = z
  .object({
    role: z.enum(["renter", "tenant"], { error: "Pick whether you have a room or need one" }),
    username: z
      .string()
      .trim()
      .min(2, "Username needs 2+ characters")
      .max(20)
      .regex(/^[\p{L}\p{N}_. -]+$/u, "Letters, numbers, spaces, . and _ only"),
    photoUrl: url.nullable().default(null),
    bio: z.string().trim().max(300).default(""),
    gender: z.enum(["woman", "man", "nonbinary", "other"], { error: "Pick a gender" }),
    languages: pick(LANGUAGES).pipe(z.array(z.string()).min(1, "Add at least one language")),
    lookingStatus: z.enum(["looking", "found_house", "paused"]).default("looking"),
    roommatesMin: int(1, 8),
    roommatesMax: int(1, 8),
    cleanliness: int(1, 5),
    sleep: z.enum(["early", "flexible", "night"]),
    guests: z.enum(["rarely", "sometimes", "often"]),
    smokes: z.boolean(),
    pets: pick(PETS).default([]),
    allergies: pick(ALLERGIES).default([]),
    dealbreakers: pick(DEALBREAKERS).default([]),
    prefGenders: pick(GENDERS).default([]),
    prefAgeMin: int(18, 99),
    prefAgeMax: int(18, 99),
    maxRent: z.coerce.number().int().min(100).max(5000).nullable().default(null),
    areas: pick(CITIES).default([]),
    moveInFrom: optDate,
    stayMonths: z.coerce.number().int().min(1).max(60).nullable().default(null),
    listing: listingSchema.nullable().default(null),
  })
  .superRefine((p, ctx) => {
    if (p.roommatesMin > p.roommatesMax)
      ctx.addIssue({ code: "custom", message: "Min housemates can't exceed max", path: ["roommatesMin"] });
    if (p.prefAgeMin > p.prefAgeMax)
      ctx.addIssue({ code: "custom", message: "Age range is upside down", path: ["prefAgeMin"] });
    if (p.role === "tenant") {
      if (!p.maxRent) ctx.addIssue({ code: "custom", message: "Set your max rent", path: ["maxRent"] });
      if (!p.areas.length) ctx.addIssue({ code: "custom", message: "Pick at least one city", path: ["areas"] });
    }
    if (p.role === "renter" && !p.listing)
      ctx.addIssue({ code: "custom", message: "Add your place", path: ["listing"] });
  });

export type ProfileInput = z.input<typeof profileSchema>;
export type ProfileData = z.output<typeof profileSchema>;
export type ListingDraft = z.input<typeof listingSchema>;

export const emptyListing: ListingDraft = {
  title: "",
  address: "",
  city: "",
  neighbourhood: "",
  rent: 650,
  durationMonths: 12,
  availableFrom: null,
  roomsAvailable: 1,
  householdSize: 3,
  features: [],
  photos: [],
};

export const emptyProfile: ProfileInput = {
  role: undefined as unknown as "tenant",
  username: "",
  photoUrl: null,
  bio: "",
  gender: undefined as unknown as "woman",
  languages: ["English"],
  lookingStatus: "looking",
  roommatesMin: 1,
  roommatesMax: 3,
  cleanliness: 3,
  sleep: "flexible",
  guests: "sometimes",
  smokes: false,
  pets: [],
  allergies: [],
  dealbreakers: [],
  prefGenders: [],
  prefAgeMin: 18,
  prefAgeMax: 35,
  maxRent: 700,
  areas: [],
  moveInFrom: null,
  stayMonths: 12,
  listing: null,
};
