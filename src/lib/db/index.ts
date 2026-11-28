import "server-only";

import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

/**
 * The Next.js app's handle on the same Postgres the API uses.
 *
 * ## Why the Next.js app talks to Postgres at all
 *
 * Auth.js's database adapter runs inside this app — sign-in has to set a
 * cookie on this app's response, so it cannot be proxied through the Express
 * service. The adapter needs a Drizzle instance, so this app needs one.
 *
 * Everything else still goes through the API. This client exists for
 * authentication and for the server components that read content directly;
 * it is not a licence to scatter queries through the app.
 *
 * ## Why the schema here is only the auth tables
 *
 * `./schema` defines `users`, `accounts`, `sessions` and
 * `verification_tokens` and nothing else. Those four are what Auth.js's
 * adapter and this app's own sign-in need; the catalogue is reached through
 * the Express API.
 *
 * It is a second definition of tables the API also describes, which is a
 * drift risk taken knowingly — importing the API's own copy does not
 * typecheck across the two packages' separate `drizzle-orm` installs, and
 * `pnpm db:check-schema` verifies these four against the live database. The
 * long version of that reasoning is in `./schema`.
 *
 * ## Why `server-only` is the first line
 *
 * Same reason as `src/lib/supabase.ts`: this module reads a connection string
 * with a password in it. Importing it from a client component would put that
 * in a browser bundle. The import makes that a build error rather than
 * something code review has to catch.
 */

const { Pool } = pg;

/**
 * One pool per process, kept on `globalThis` in development.
 *
 * Next's dev server reloads modules on every edit. Without this, each reload
 * creates another pool, none of the old ones are closed, and after twenty
 * edits Postgres refuses connections with "too many clients already" — which
 * looks like a database fault and is actually hot reload.
 */
const globalForDb = globalThis as unknown as { howPool?: pg.Pool };

/**
 * Absent configuration is a warning here, not an error.
 *
 * This threw, and that was wrong. `next build` evaluates this module for
 * every route that imports it, so a build with no `DATABASE_URL` — which is
 * every CI run, since CI has no `.env.local` — failed at module scope before
 * compiling anything. The principle sounded right ("a site nobody can sign
 * into is worse than a build that stops") and the consequence was that no
 * pull request could pass CI and the work could not be merged at all.
 *
 * So it matches `src/lib/supabase.ts`: the build succeeds, and the first
 * query fails with a connection error naming the host it could not reach.
 * The warning below is what makes that diagnosable from a deploy log.
 *
 * An empty string is handed to `pg` deliberately rather than `undefined`: it
 * keeps `Pool` from silently falling back to `PGHOST`/`PGUSER` and connecting
 * somewhere nobody intended.
 */
function connectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn(
      "[db] DATABASE_URL is unset — sign-in and the account pages will fail " +
        "at request time. See .env.example and DEPLOYMENT.md.",
    );
    return "";
  }
  return url;
}

/** Whether a database is configured at all, for screens that need to say so. */
export function dbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function createPool(): pg.Pool {
  const created = new Pool({
    connectionString: connectionString(),
    /*
     * Lower than the API's 10. This app runs more processes than the API does
     * (every serverless instance is its own process) and only needs the
     * connection for auth, so it should take a smaller share of Postgres's
     * 100-backend budget.
     */
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  /*
   * Attached here, inside the factory, and not at module scope.
   *
   * An idle client the server closes — a restart, a timeout, a failover —
   * emits 'error' on the pool, not on any request's promise, and `pg`
   * documents that an unhandled one takes the process down. So the listener
   * is required.
   *
   * At module scope it was also *re-added on every hot reload*, because the
   * pool is cached across reloads and the module body is not. Node warned
   * after ten edits: "MaxListenersExceededWarning: 11 error listeners added
   * to [BoundPool]". Harmless in itself, but it is a leak, and it is exactly
   * the shape of bug that hides a real one behind a warning nobody reads.
   */
  created.on("error", (err) => {
    console.error("[db] idle client error:", err.message);
  });

  return created;
}

export const pool = globalForDb.howPool ?? createPool();

if (process.env.NODE_ENV !== "production") globalForDb.howPool = pool;

export const db = drizzle(pool, { schema, casing: "snake_case" });
export { schema };
