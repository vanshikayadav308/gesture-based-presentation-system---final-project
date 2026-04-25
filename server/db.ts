import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

/**
 * This project is a browser-based HCI prototype and does NOT
 * require a database in local/dev environments.
 *
 * If DATABASE_URL is provided (e.g. on Replit with a DB),
 * the database will be enabled automatically.
 */

export const hasDb = Boolean(process.env.DATABASE_URL);

let pool: pg.Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

if (hasDb) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
} else {
  console.warn(
    "[INFO] DATABASE_URL not set — running in no-database prototype mode.",
  );
}

export { pool, db };
