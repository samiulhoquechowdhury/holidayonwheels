import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./client";

/**
 * Apply every migration in `drizzle/` that has not run yet.
 *
 * Drizzle records what it has applied in `drizzle.__drizzle_migrations`, so
 * this is idempotent and safe to run on every deploy. It is a script rather
 * than something the server does at startup: two instances booting at once
 * would both try to migrate, and a failed migration should stop a deploy
 * rather than leave a half-migrated database serving traffic.
 */
async function main() {
  console.log("[migrate] applying migrations from ./drizzle");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("[migrate] done");
}

main()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("[migrate] failed:", err);
    /*
     * Close the pool before exiting non-zero: an open pool keeps the event
     * loop alive and the process would hang instead of failing the deploy.
     */
    await pool.end().catch(() => {});
    process.exit(1);
  });
