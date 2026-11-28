import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config();

/**
 * drizzle-kit's view of the project.
 *
 * `generate` writes SQL into `drizzle/` by diffing the schema against the
 * previous snapshot; those files are committed and are the record of what the
 * live database is. `push` is deliberately not used anywhere in the scripts:
 * it mutates a database to match the code with no reviewable artefact, which
 * is how a schema stops being reviewable — the same mistake the first
 * Supabase migration warned about in its header comment.
 */
export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  verbose: true,
  strict: true,
});
