# roommates (working name)

Mobile web prototype for finding compatible housemates in the Netherlands. Renters swipe on tenants, tenants swipe on rooms or on each other to team up, and mutual likes unlock chat.

**Stack:** Next.js 16 (App Router, server actions) on Vercel · Postgres on Neon via Drizzle (`neon-http`) · Cloudflare R2 for photos · shadcn/ui + Tailwind 4, Geist, iOS-style components.

## What's in it

- **Accounts:** e-mail + password, phone 2FA on every login, 18+ gate (date of birth + ID-check step), optional student verification via university e-mail. SMS and e-mail delivery are simulated: codes show up as an in-app "DEMO" notification until `SMS_PROVIDER_KEY` is wired up.
- **Profiles:** role (has a room / needs a room), photo, gender, languages, lifestyle (tidiness, sleep, guests, smoking, pets, allergies), housemate preferences and dealbreakers, plus either a listing (photos, rent, contract, features, address) or a search (budget, cities, timing).
- **Matching** (`src/lib/matching.ts`): symmetric hard filters (gender/age preferences, dealbreakers, allergies vs pets/smoke, budget vs rent with 10% tolerance, city), then a weighted 0–100 compatibility score with human-readable reasons. The server re-checks the filters on every swipe.
- **Swiping:** persisted swipes (never see someone twice); a mutual like is an instant match.
- **Chat:** polling-based, only between matches. The exact street address is revealed only after matching.
- **Trust & safety:** report + block from any card or chat, a safety centre, a moderation queue with trusted-reporter prioritisation (`PRIORITISE_TRUSTED_REPORTERS`), removal with a stated reason, appeals, and contact channels for users and authorities.
- **Privacy:** a plain-language data page, JSON export of everything, and instant account deletion.

## Run locally

```bash
pnpm install
cp .env.example .env.local   # leave DATABASE_URL empty to use embedded Postgres (PGlite)
pnpm db:migrate && pnpm db:seed
pnpm dev
```

Demo logins (password `roommates`): `sanne@demo.test` (needs a room), `daan@demo.test` (has a room), `admin@demo.test` (moderator), `removed@demo.test` (removed account with a pending appeal).

## Infra

- **Neon:** `neon.ts` + `neon deploy`; `DATABASE_URL` (pooled) for the app, `DATABASE_URL_UNPOOLED` for migrations and seeding.
- **R2:** bucket `haip-prototype-media` with a public r2.dev URL. Browsers upload straight to R2 through `workers/r2-upload`, a tiny Worker bound to the bucket that accepts HMAC-signed, 5-minute PUT URLs minted by `/api/upload`. S3 API keys are supported as an alternative (see `.env.example`).
- **Vercel:** one project and one deployment, with env vars set for Production and Preview.

Seed photos are CC0 from StockSnap; see `scripts/SEED_PHOTOS.md`.
