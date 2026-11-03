import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * The one way into the database.
 *
 * `server-only` is the first line on purpose. This module reads the
 * service-role key, which bypasses row-level security entirely — importing it
 * from a client component would put that key in a browser bundle and hand
 * every traveller's phone number to anybody who opened devtools. The import
 * makes that a build error rather than a code review someone has to catch.
 *
 * ## Why the service key and not the anon key
 *
 * `0001_enquiries_and_trip_requests.sql` enables RLS on both tables and
 * writes no policies, so `anon` can do nothing. The site has no user accounts
 * and no per-row ownership to express — an enquiry belongs to the business,
 * not to a logged-in traveller — so there is no policy that would be more
 * honest than "only the server, and only through these actions". The service
 * key is the key that says that.
 *
 * If a later phase gives travellers real accounts, this inverts: the browser
 * gets the anon key, the tables get policies keyed on `auth.uid()`, and this
 * module shrinks to the few admin-only reads. That is a deliberate rewrite,
 * not a drift.
 *
 * ## Absent configuration is not an error here
 *
 * `db()` returns `null` when the environment is unset rather than throwing.
 * The site has to keep working without a database: `next build` prerenders
 * 191 pages and most of them have nothing to do with enquiries, so a missing
 * key must not fail a build. Each caller decides what "no database" means for
 * it — the forms refuse to pretend they sent something, the admin says it is
 * not configured, and neither takes the whole site down.
 */

let client: SupabaseClient | null = null;
let warned = false;

export function db(): SupabaseClient | null {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    if (!warned) {
      warned = true;
      console.warn(
        "[supabase] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is unset — enquiries cannot be stored. See .env.example.",
      );
    }
    return null;
  }

  client = createClient(url, key, {
    auth: {
      /*
       * No session to persist and none to refresh: this client is one
       * process-wide service identity, not a signed-in person. Leaving the
       * defaults on makes it try to write a session to storage that does not
       * exist on a server.
       */
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return client;
}

/** Whether the database is configured at all, for screens that need to say so. */
export function dbConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
