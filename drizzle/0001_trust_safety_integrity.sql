CREATE TABLE "banned_identities" (
	"id" serial PRIMARY KEY NOT NULL,
	"email_hash" text NOT NULL,
	"phone_hash" text NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "banned_identities_email_hash_unique" UNIQUE("email_hash")
);
--> statement-breakpoint
ALTER TABLE "matches" DROP CONSTRAINT "matches_user_a_users_id_fk";
--> statement-breakpoint
ALTER TABLE "matches" DROP CONSTRAINT "matches_user_b_users_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_sender_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "reports" DROP CONSTRAINT "reports_reported_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "user_a" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "user_b" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "sender_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "reported_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "ended_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "ended_reason" text;--> statement-breakpoint
ALTER TABLE "otp_codes" ADD COLUMN "attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "reported_username" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "session_version" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_user_a_users_id_fk" FOREIGN KEY ("user_a") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_user_b_users_id_fk" FOREIGN KEY ("user_b") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_id_users_id_fk" FOREIGN KEY ("reported_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- normalise any invalid values written before input validation existed
UPDATE "profiles" SET "looking_status" = 'looking' WHERE "looking_status" NOT IN ('looking', 'found_house', 'paused');--> statement-breakpoint
DELETE FROM "swipes" WHERE "direction" NOT IN ('like', 'pass');--> statement-breakpoint
-- keep one open report per reporter/target pair
DELETE FROM "reports" r USING "reports" d WHERE r."status" = 'open' AND d."status" = 'open' AND r."reporter_id" = d."reporter_id" AND r."reported_id" = d."reported_id" AND r."id" > d."id";--> statement-breakpoint
UPDATE "reports" r SET "reported_username" = p."username" FROM "profiles" p WHERE p."user_id" = r."reported_id" AND r."reported_username" IS NULL;--> statement-breakpoint
-- enum-like columns are enforced in the database too, not only in TypeScript
ALTER TABLE "users" ADD CONSTRAINT "users_status_check" CHECK ("status" IN ('active', 'removed'));--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_check" CHECK ("role" IS NULL OR "role" IN ('renter', 'tenant'));--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_looking_status_check" CHECK ("looking_status" IN ('looking', 'found_house', 'paused'));--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_gender_check" CHECK ("gender" IN ('woman', 'man', 'nonbinary', 'other'));--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_cleanliness_check" CHECK ("cleanliness" BETWEEN 1 AND 5);--> statement-breakpoint
ALTER TABLE "swipes" ADD CONSTRAINT "swipes_direction_check" CHECK ("direction" IN ('like', 'pass'));--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_status_check" CHECK ("status" IN ('open', 'upheld', 'dismissed', 'overturned'));--> statement-breakpoint
CREATE UNIQUE INDEX "reports_one_open_per_pair" ON "reports" ("reporter_id", "reported_id") WHERE "status" = 'open';
