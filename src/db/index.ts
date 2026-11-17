import "server-only";
import { drizzle as drizzleNeon, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

export type DB = NeonHttpDatabase<typeof schema>;

/**
 * Production: Neon over HTTP (DATABASE_URL).
 * Local without credentials: embedded Postgres via PGlite in ./.pglite.
 */
function create(): DB {
  const url = process.env.DATABASE_URL;
  if (url) return drizzleNeon(neon(url), { schema });
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PGlite } = require("@electric-sql/pglite");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle } = require("drizzle-orm/pglite");
  const g = globalThis as unknown as { __pglite?: unknown };
  g.__pglite ??= new PGlite(process.env.PGLITE_DIR ?? "./.pglite");
  return drizzle(g.__pglite, { schema }) as DB;
}

const g = globalThis as unknown as { __db?: DB };
export const db: DB = (g.__db ??= create());
export { schema };
