import { afterAll } from "vitest";
import { pool } from "../db/client";

/**
 * Per-file setup: assert the safety guard, and close the pool at the end.
 *
 * The guard is repeated from `global-setup.ts` on purpose. Global setup runs
 * in a different process from the tests, so a `DATABASE_URL` changed between
 * them — by a stray `.env`, or by someone running one file directly with
 * `vitest run src/...` — would pass the first check and not the second.
 * Truncating somebody's development data is not a mistake worth leaving one
 * check away.
 */
const url = process.env.DATABASE_URL ?? "";
if (!/_test(\?|$)/.test(url)) {
  throw new Error(
    `Refusing to run: DATABASE_URL is ${url || "unset"}, which is not a test database.`,
  );
}

afterAll(async () => {
  /* Otherwise the pool keeps the event loop alive and vitest hangs. */
  await pool.end().catch(() => {});
});
