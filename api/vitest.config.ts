import { defineConfig } from "vitest/config";

/**
 * Test configuration.
 *
 * ## Why `singleThread` and not the default pool
 *
 * Every test talks to one Postgres database and several of them truncate
 * tables between cases. Run in parallel workers, one file's cleanup deletes
 * another file's fixtures mid-assertion and the failures are
 * order-dependent — the worst kind to debug, because re-running often passes.
 *
 * The concurrency that actually matters here is tested *inside* a test (the
 * seat-allocation race fires parallel requests against one departure), which
 * does not need parallel test files.
 *
 * ## Why no global setup that wipes the database
 *
 * The tests run against `holidaysonwheels_test`, created and migrated by
 * `pnpm test`. They must never be pointed at the development database, so
 * `src/test/setup.ts` refuses to run unless the database name ends in
 * `_test` — a guard, not a convention.
 */
export default defineConfig({
  /*
   * An inline, empty PostCSS config.
   *
   * Vite searches upward for `postcss.config.*` and finds the Next.js app's
   * at the repository root, which loads `@tailwindcss/postcss` — a package
   * this one does not have. The whole run died on "Invalid PostCSS Plugin
   * found at: plugins[0]" before a single test executed.
   *
   * Declaring it inline stops the search. This service serves JSON and has no
   * stylesheet anywhere, so there is nothing to lose by turning CSS handling
   * off entirely.
   */
  css: { postcss: { plugins: [] } },

  test: {
    environment: "node",
    globalSetup: ["./src/test/global-setup.ts"],
    setupFiles: ["./src/test/setup.ts"],
    pool: "threads",
    poolOptions: { threads: { singleThread: true } },
    /* Migrations and a content import run before the first test. */
    hookTimeout: 120_000,
    testTimeout: 60_000,
    include: ["src/**/*.test.ts"],
  },
});
