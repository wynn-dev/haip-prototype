import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  date,
  primaryKey,
  index,
  uniqueIndex,
  serial,
} from "drizzle-orm/pg-core";

/* ───────────── accounts (private: never shown to other users) ───────────── */

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  passwordHash: text("password_hash").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  phoneVerifiedAt: timestamp("phone_verified_at", { withTimezone: true }),
  ageVerifiedAt: timestamp("age_verified_at", { withTimezone: true }),
  ageVerificationMethod: text("age_verification_method"),
  studentEmail: text("student_email"),
  studentInstitution: text("student_institution"),
  studentVerifiedAt: timestamp("student_verified_at", { withTimezone: true }),
  role: text("role", { enum: ["renter", "tenant"] }),
  isAdmin: boolean("is_admin").notNull().default(false),
  status: text("status", { enum: ["active", "removed"] }).notNull().default("active"),
  removalReason: text("removal_reason"),
  removedAt: timestamp("removed_at", { withTimezone: true }),
  onboardedAt: timestamp("onboarded_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** One-time codes for phone 2FA and student-email verification. */
export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  purpose: text("purpose", { enum: ["login", "student"] }).notNull(),
  codeHash: text("code_hash").notNull(),
  target: text("target").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ───────────── public profile (what other users can see) ───────────── */

export const profiles = pgTable("profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  username: text("username").notNull().unique(),
  photoUrl: text("photo_url"),
  bio: text("bio").notNull().default(""),
  gender: text("gender", { enum: ["woman", "man", "nonbinary", "other"] }).notNull(),
  languages: text("languages").array().notNull().default([]),
  lookingStatus: text("looking_status", {
    enum: ["looking", "found_house", "paused"],
  })
    .notNull()
    .default("looking"),
  roommatesMin: integer("roommates_min").notNull().default(1),
  roommatesMax: integer("roommates_max").notNull().default(3),

  // lifestyle
  cleanliness: integer("cleanliness").notNull().default(3), // 1 chaos … 5 spotless
  sleep: text("sleep", { enum: ["early", "flexible", "night"] }).notNull().default("flexible"),
  guests: text("guests", { enum: ["rarely", "sometimes", "often"] }).notNull().default("sometimes"),
  smokes: boolean("smokes").notNull().default(false),
  pets: text("pets").array().notNull().default([]), // e.g. ["cat"]
  allergies: text("allergies").array().notNull().default([]), // e.g. ["cats","smoke"]
  dealbreakers: text("dealbreakers").array().notNull().default([]), // e.g. ["smoker","pets","parties"]

  // who I want to live with
  prefGenders: text("pref_genders").array().notNull().default([]), // empty = anyone
  prefAgeMin: integer("pref_age_min").notNull().default(18),
  prefAgeMax: integer("pref_age_max").notNull().default(40),

  // tenant side
  maxRent: integer("max_rent"),
  areas: text("areas").array().notNull().default([]),
  moveInFrom: date("move_in_from"),
  stayMonths: integer("stay_months"),

  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** A renter's place. Exact address is only revealed to matches. */
export const listings = pgTable("listings", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  neighbourhood: text("neighbourhood").notNull().default(""),
  rent: integer("rent").notNull(),
  durationMonths: integer("duration_months").notNull(),
  availableFrom: date("available_from"),
  roomsAvailable: integer("rooms_available").notNull().default(1),
  householdSize: integer("household_size").notNull().default(2),
  features: text("features").array().notNull().default([]),
  photos: text("photos").array().notNull().default([]),
});

/* ───────────── swiping, matching, chat ───────────── */

export const swipes = pgTable(
  "swipes",
  {
    swiperId: uuid("swiper_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetId: uuid("target_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    direction: text("direction", { enum: ["like", "pass"] }).notNull(),
    score: integer("score"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.swiperId, t.targetId] }),
    index("swipes_target_idx").on(t.targetId),
  ],
);

export const matches = pgTable(
  "matches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // userA < userB lexicographically, so a pair is stored once
    userA: uuid("user_a")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    userB: uuid("user_b")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind", { enum: ["renter_tenant", "tenant_tenant"] }).notNull(),
    score: integer("score"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("matches_pair_idx").on(t.userA, t.userB)],
);

export const messages = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    matchId: uuid("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("messages_match_idx").on(t.matchId, t.id)],
);

/* ───────────── trust & safety ───────────── */

export const blocks = pgTable(
  "blocks",
  {
    blockerId: uuid("blocker_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    blockedId: uuid("blocked_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.blockerId, t.blockedId] })],
);

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  // reporter is kept (set null) after their deletion so moderation history survives
  reporterId: uuid("reporter_id").references(() => users.id, { onDelete: "set null" }),
  reportedId: uuid("reported_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reason: text("reason", {
    enum: ["fake", "scam", "harassment", "discrimination", "inappropriate", "underage", "other"],
  }).notNull(),
  details: text("details").notNull().default(""),
  status: text("status", { enum: ["open", "upheld", "dismissed"] }).notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

export const appeals = pgTable("appeals", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  status: text("status", { enum: ["pending", "accepted", "rejected"] }).notNull().default("pending"),
  response: text("response"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

/** "Talk to a human" — from users, the public, or authorities. */
export const contactRequests = pgTable("contact_requests", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  channel: text("channel", { enum: ["user", "authority"] }).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  organisation: text("organisation"),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status", { enum: ["new", "handled"] }).notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Listing = typeof listings.$inferSelect;
