/*
 * `pg` 8 ships CommonJS, so under Node's ESM loader it has no named exports
 * and `import { Pool } from "pg"` is a SyntaxError at instantiation — before
 * any of this file runs. The default import is the CJS namespace, which is
 * what `esModuleInterop` is for.
 */
import pg from "pg";

const { Pool } = pg;
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema/index";
import { env } from "../env";

/**
 * The connection pool, and the Drizzle handle over it.
 *
 * ## Why `max` is low
 *
 * Postgres allocates a backend process per connection and its default
 * `max_connections` is 100. A pool of 10 per process leaves room for the
 * Next.js app, psql, and drizzle-studio to connect at the same time without
 * anybody being refused. It is raised by load testing, not by guessing.
 *
 * ## Why the pool emits on 'error'
 *
 * An idle client that the server closes — a restart, a timeout, a failover —
 * emits 'error' on the pool itself, not on any request's promise. `pg`
 * documents that an unhandled one takes the process down. This logs it and
 * lets the pool replace the client, which is the behaviour that keeps the API
 * up through a database restart.
 */
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on("error", (err) => {
  console.error("[db] idle client error:", err.message);
});

export const db = drizzle(pool, { schema, casing: "snake_case" });

export type Db = typeof db;
export { schema };

/** For the health endpoint: proves the database answers, not just that the URL parses. */
export async function pingDb(): Promise<boolean> {
  try {
    const res = await pool.query("select 1 as ok");
    return res.rows[0]?.ok === 1;
  } catch {
    return false;
  }
}
