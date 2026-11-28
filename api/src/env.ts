import { z } from "zod";
import { config } from "dotenv";

config();

/**
 * Configuration, validated once at startup.
 *
 * ## Why this throws instead of falling back
 *
 * The Next.js app deliberately tolerates a missing database: it prerenders
 * ~190 pages that have nothing to do with enquiries, so `db()` returns null
 * and each caller decides what that means. This process has the opposite
 * job. An API whose only purpose is to serve the database has nothing useful
 * to do without one, and starting anyway means every request fails with a
 * confusing 500 instead of the process failing with a clear message.
 *
 * The specific bug this guards against has already happened on this project
 * once: `NEXT_PUBLIC_MAP_TILE_URL ?? "<default>"` silently kept an empty
 * string, because `??` falls back on null and undefined and an unset
 * variable in a `.env` file is `""`. `z.string().min(1)` rejects it.
 */
const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(4000),

  /** Standard libpq URL. The one the Next.js app must also point at. */
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  /**
   * Must be byte-identical to the Next.js app's `AUTH_SECRET`.
   *
   * This process does not verify Auth.js cookies — sessions are looked up in
   * Postgres — but it signs its own short-lived service tokens with the same
   * secret so that a mismatch is caught here rather than appearing as a
   * mysterious 401 from one of the two apps.
   */
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),

  /**
   * Exact origins allowed to send credentialed requests.
   *
   * A comma-separated list, and never `*`: the browser sends the session
   * cookie on these requests, and `Access-Control-Allow-Origin: *` is
   * rejected by browsers when credentials are involved — if it were not, any
   * site could read a signed-in admin's data.
   */
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000")
    .transform((raw) =>
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ),

  /** Where uploaded images are written. Served by the Next.js app. */
  MEDIA_ROOT: z.string().default("../public/media"),

  /*
   * `silent` is included because the test run sets it. Without it the suite
   * logs a full request/response object per assertion — about 50 KB of JSON
   * for 45 tests, which buries the one line that matters when something
   * fails.
   */
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  ${i.path.join(".") || "(root)"}: ${i.message}`)
    .join("\n");
  /*
   * console.error and exit rather than a thrown error: a stack trace from
   * inside a validation library is noise when the actual problem is a
   * missing line in a .env file. See api/.env.example.
   */
  console.error(`\nInvalid API configuration:\n${issues}\n`);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
