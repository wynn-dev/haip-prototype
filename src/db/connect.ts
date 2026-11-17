// Script-side DB connection (no "server-only"), same driver selection as src/db/index.ts
import { config } from "dotenv";

config({ path: [".env.local", ".env"], quiet: true });
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type DB = NeonHttpDatabase<typeof schema>;

export async function connect() {
  // migrations & seeding: direct (unpooled) connection, app traffic uses the pooled one
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (url) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    const { migrate } = await import("drizzle-orm/neon-http/migrator");
    const db = drizzle(neon(url), { schema });
    return { db, migrate: () => migrate(db, { migrationsFolder: "drizzle" }), close: async () => {} };
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const client = new PGlite(process.env.PGLITE_DIR ?? "./.pglite");
  // same query API; typed as one driver so callers see a single type
  const db = drizzle(client, { schema }) as unknown as DB;
  return { db, migrate: () => migrate(db as never, { migrationsFolder: "drizzle" }), close: () => client.close() };
}
