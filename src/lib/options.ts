export const CITIES = [
  "Amsterdam",
  "Rotterdam",
  "Utrecht",
  "Den Haag",
  "Leiden",
  "Delft",
  "Groningen",
  "Eindhoven",
  "Nijmegen",
  "Maastricht",
  "Enschede",
  "Tilburg",
  "Wageningen",
] as const;

export const LANGUAGES = [
  "Dutch",
  "English",
  "German",
  "French",
  "Spanish",
  "Italian",
  "Portuguese",
  "Polish",
  "Turkish",
  "Arabic",
  "Mandarin",
  "Hindi",
  "Greek",
  "Romanian",
] as const;

export const GENDERS = [
  { value: "woman", label: "Woman" },
  { value: "man", label: "Man" },
  { value: "nonbinary", label: "Non-binary" },
  { value: "other", label: "Other" },
] as const;

export const SLEEP = [
  { value: "early", label: "Early bird", emoji: "🌅" },
  { value: "flexible", label: "Flexible", emoji: "🌗" },
  { value: "night", label: "Night owl", emoji: "🦉" },
] as const;

export const GUESTS = [
  { value: "rarely", label: "Rarely", emoji: "🤫" },
  { value: "sometimes", label: "Sometimes", emoji: "🍕" },
  { value: "often", label: "Often", emoji: "🎉" },
] as const;

export const CLEANLINESS = ["Creative chaos", "Relaxed", "Tidy-ish", "Tidy", "Spotless"];

export const PETS = [
  { value: "cat", label: "Cat", emoji: "🐈" },
  { value: "dog", label: "Dog", emoji: "🐕" },
  { value: "small", label: "Small pet", emoji: "🐹" },
] as const;

export const ALLERGIES = [
  { value: "cats", label: "Cats" },
  { value: "dogs", label: "Dogs" },
  { value: "smoke", label: "Smoke" },
  { value: "dust", label: "Dust" },
  { value: "nuts", label: "Nuts" },
  { value: "gluten", label: "Gluten" },
] as const;

export const DEALBREAKERS = [
  { value: "smoker", label: "Smokers" },
  { value: "pets", label: "Pets" },
  { value: "parties", label: "Frequent guests" },
  { value: "messy", label: "Messy people" },
  { value: "night", label: "Night owls" },
] as const;

export const FEATURES = [
  { value: "private_bathroom", label: "Private bathroom" },
  { value: "shared_bathroom", label: "Shared bathroom" },
  { value: "shared_kitchen", label: "Shared kitchen" },
  { value: "furnished", label: "Furnished" },
  { value: "balcony", label: "Balcony" },
  { value: "garden", label: "Garden" },
  { value: "washing_machine", label: "Washing machine" },
  { value: "bike_storage", label: "Bike storage" },
  { value: "registration", label: "Registration possible" },
  { value: "bills_included", label: "Bills included" },
  { value: "pets_allowed", label: "Pets allowed" },
  { value: "smoking_allowed", label: "Smoking allowed" },
] as const;

export const LOOKING_STATUS = [
  { value: "looking", label: "Looking" },
  { value: "found_house", label: "Found a house" },
  { value: "paused", label: "Paused" },
] as const;

export const REPORT_REASONS = [
  { value: "fake", label: "Fake profile" },
  { value: "scam", label: "Scam / asks for money" },
  { value: "harassment", label: "Harassment" },
  { value: "discrimination", label: "Discrimination" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "underage", label: "Might be under 18" },
  { value: "other", label: "Something else" },
] as const;

/** Domains we accept for student-enrolment verification (subdomains allowed). */
export const STUDENT_DOMAINS: Record<string, string> = {
  "uva.nl": "Universiteit van Amsterdam",
  "vu.nl": "Vrije Universiteit Amsterdam",
  "tudelft.nl": "TU Delft",
  "uu.nl": "Universiteit Utrecht",
  "rug.nl": "Rijksuniversiteit Groningen",
  "leidenuniv.nl": "Universiteit Leiden",
  "eur.nl": "Erasmus Universiteit Rotterdam",
  "tue.nl": "TU Eindhoven",
  "ru.nl": "Radboud Universiteit",
  "maastrichtuniversity.nl": "Maastricht University",
  "utwente.nl": "Universiteit Twente",
  "tilburguniversity.edu": "Tilburg University",
  "wur.nl": "Wageningen University",
  "hva.nl": "Hogeschool van Amsterdam",
  "hu.nl": "Hogeschool Utrecht",
  "hr.nl": "Hogeschool Rotterdam",
  "hhs.nl": "De Haagse Hogeschool",
  "hanze.nl": "Hanzehogeschool Groningen",
  "fontys.nl": "Fontys",
  "saxion.nl": "Saxion",
  "han.nl": "HAN University of Applied Sciences",
  "inholland.nl": "Inholland",
};

export function institutionForEmail(email: string): string | null {
  const domain = email.trim().toLowerCase().split("@")[1];
  if (!domain) return null;
  for (const [d, name] of Object.entries(STUDENT_DOMAINS)) {
    if (domain === d || domain.endsWith("." + d)) return name;
  }
  return null;
}

export const labelOf = <T extends { value: string; label: string }>(list: readonly T[], v: string) =>
  list.find((x) => x.value === v)?.label ?? v;

/** Likes per rolling 24h. Friction so attention spreads across more people. */
export const DAILY_LIKES = 20;
