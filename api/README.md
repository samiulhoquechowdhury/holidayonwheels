# Holidays on Wheels — API

Express + Postgres service behind the office admin and the traveller account
area. The public marketing pages do not use it; they still read
`src/content/*.ts` at build time.

## Running it

```bash
docker compose up -d                 # Postgres 18 on :5440 (from the repo root)
cd api
cp .env.example .env                 # then fill in AUTH_SECRET
pnpm install
pnpm db:migrate
pnpm dev                             # :4000
```

`AUTH_SECRET` must be **byte-identical** to the Next.js app's. The API reads
that app's session cookies; a mismatch is a silent 401 on every authenticated
request.

## Seeding content

The catalogue lives in `src/content/*.ts` in the Next.js app. Importing it is
two steps, because only that app can resolve its own `@/` paths:

```bash
# from the repository root
pnpm db:dump-content                 # writes api/seed/content.json
cd api && pnpm db:seed               # imports it
```

`pnpm db:seed` is idempotent — parents are upserted on their slug. It refuses
to replace child rows (departures, rooms, ticket tiers) once any booking
exists, because replacing a departure somebody has booked would break the link
between a traveller and the date they are travelling on.

## The first administrator

There is no default account and no default password. Create one explicitly:

```bash
cd api
SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD='<at least 12 chars>' pnpm db:seed
```

Everyone else is then made in the admin at `/admin/users`.

## Tests

```bash
pnpm test
```

45 tests over sessions, content visibility and writes, bookings, payments and
cancellation. They run against `holidaysonwheels_test`, which the script
creates and migrates; both `global-setup.ts` and `setup.ts` refuse to run
unless the database name ends in `_test`, because the suite truncates tables.

The tests worth knowing about:

- **the seat race** — three simultaneous requests for two seats against a
  departure holding three; exactly one may win
- **update invariants** — `.partial()` on a refined zod schema drops its
  refinements, so cross-field rules were once enforced on create and skipped
  on update. PATCH now re-validates the merged row.
- **revocation** — a disabled account and a demoted role both take effect on
  the next request, which is the property JWT sessions normally give up

## Shape of it

```
src/db/schema/     32 tables, 17 enums, 28 CHECK constraints
src/lib/crud.ts    one router serving all 15 editable resources
src/routes/        content, bookings, users, office (enquiries/trips/dashboard), account
drizzle/           migrations — generated, committed, never `push`ed
```

`drizzle-kit push` is deliberately absent from the scripts: it mutates a
database to match the code with no reviewable artefact, which is how a schema
stops being reviewable.

## Authentication, in one paragraph

Auth.js runs in the Next.js app and issues an encrypted JWT, because its
credentials provider refuses the database session strategy outright. This
service accepts that cookie (decoded with Auth.js's own `decode`, salted with
the cookie name) **or** an opaque token with a row in `sessions`, for OAuth
later. Either way it then loads the user row to check `disabled_at` and read
the current role, so the cookie says _who_ and Postgres still says _whether_.

Reads are public but filtered to `published`; staff additionally see drafts;
writes are admin-only. `staff` answer enquiries and record payments, they do
not change prices.
