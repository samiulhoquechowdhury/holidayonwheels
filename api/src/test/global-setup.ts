import { execSync } from "node:child_process";

/**
 * Bring the test database up to date once, before any test file runs.
 *
 * Migrations are applied by the same script a deploy uses, rather than by
 * `drizzle-kit push` or a hand-written DDL dump. If the tests ran against a
 * schema built a different way, they would be testing a schema that does not
 * exist anywhere else — and the CHECK constraints are a large part of what is
 * being tested.
 */
export default function setup() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL must be set for the test run.");
  if (!/_test(\?|$)/.test(url)) {
    throw new Error(
      `Refusing to run tests against ${url} — the database name must end in ` +
        `"_test". These tests truncate tables.`,
    );
  }

  execSync("tsx src/db/migrate.ts", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url },
  });
}
