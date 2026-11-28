/**
 * Verify this app's auth table definitions against the live database.
 *
 * ## Why this exists
 *
 * `src/lib/db/schema.ts` duplicates four tables that `api/src/db/schema/auth.ts`
 * also defines, because the two packages' separate `drizzle-orm` installs make
 * a shared import fail to typecheck. Duplication without a check is how a
 * column added by a migration goes missing on this side until somebody tries
 * to sign in.
 *
 * So this compares, per table, the column names and nullability that Drizzle
 * thinks exist against what `information_schema` actually reports, and exits
 * non-zero on any disagreement. It checks the direction that matters most —
 * a column this app declares but the database does not have, which fails at
 * query time — and also reports database columns this app does not know
 * about, which is usually a migration this file has not caught up with.
 *
 * Run it with the API's tsx, from the repository root:
 *   ./api/node_modules/.bin/tsx scripts/check-auth-schema.ts
 */
import pg from "pg";
import { getTableColumns, getTableName } from "drizzle-orm";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "../src/lib/db/schema";

const { Pool } = pg;

const TABLES = [users, accounts, sessions, verificationTokens];

type DbColumn = { name: string; nullable: boolean; type: string };

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error(
      "DATABASE_URL is not set. Source .env.local, or pass it inline:\n" +
        "  DATABASE_URL=... ./api/node_modules/.bin/tsx scripts/check-auth-schema.ts",
    );
    process.exit(2);
  }

  const pool = new Pool({ connectionString: url, max: 2 });
  let problems = 0;

  try {
    for (const table of TABLES) {
      const tableName = getTableName(table);
      const declared = getTableColumns(table) as Record<
        string,
        { name: string; notNull: boolean }
      >;

      const { rows } = await pool.query<{
        column_name: string;
        is_nullable: string;
        data_type: string;
      }>(
        `select column_name, is_nullable, data_type
           from information_schema.columns
          where table_schema = 'public' and table_name = $1`,
        [tableName],
      );

      if (rows.length === 0) {
        console.error(`✗ ${tableName}: table does not exist in the database`);
        problems += 1;
        continue;
      }

      const actual = new Map<string, DbColumn>(
        rows.map((r) => [
          r.column_name,
          {
            name: r.column_name,
            nullable: r.is_nullable === "YES",
            type: r.data_type,
          },
        ]),
      );

      const issues: string[] = [];

      for (const column of Object.values(declared)) {
        const found = actual.get(column.name);
        if (!found) {
          issues.push(
            `declares "${column.name}", which the database does not have`,
          );
          continue;
        }
        /*
         * Only flag "we think it is NOT NULL but it is nullable" and the
         * reverse, not the exact SQL type. Drizzle's `text()` maps to `text`,
         * `uuid()` to `uuid`, and matching those strings adds a table of
         * mappings that breaks on the first `varchar`. Nullability is the
         * property that actually changes whether application code is correct.
         */
        if (column.notNull === found.nullable) {
          issues.push(
            `"${column.name}": this app says ${
              column.notNull ? "NOT NULL" : "nullable"
            }, the database says ${found.nullable ? "nullable" : "NOT NULL"}`,
          );
        }
        actual.delete(column.name);
      }

      /*
       * Whatever is left is in the database and not declared here. Reported
       * but not an error: the API owns columns this app has no business
       * reading, and failing on them would make every migration break this
       * check.
       */
      const extra = [...actual.keys()];

      if (issues.length) {
        console.error(`✗ ${tableName}`);
        for (const issue of issues) console.error(`    ${issue}`);
        problems += issues.length;
      } else {
        console.log(
          `✓ ${tableName} — ${Object.keys(declared).length} column(s) match` +
            (extra.length
              ? `, ${extra.length} not declared here (${extra.join(", ")})`
              : ""),
        );
      }
    }
  } finally {
    await pool.end();
  }

  if (problems > 0) {
    console.error(
      `\n${problems} mismatch(es). src/lib/db/schema.ts and the database ` +
        `disagree — reconcile it with api/src/db/schema/auth.ts.`,
    );
    process.exit(1);
  }
  console.log("\nAuth schema matches the database.");
}

main().catch((err) => {
  console.error("check failed:", err);
  process.exit(1);
});
