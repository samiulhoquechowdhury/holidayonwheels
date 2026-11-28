# Deploying the admin and accounts work

**Status: not deployable yet.** The code is finished and tested; the
infrastructure it needs does not exist. This file says exactly what is
missing, in the order it has to be done.

Everything already live — the marketing pages, destinations, tours, homestays,
the planner, the motorcycle expeditions — is unaffected by any of this. Those
pages read `src/content/*.ts` at build time and do not touch the database or
the API.

## What is blocking it

### 1. There is no production database

Both `.env.local` and `api/.env` point at `127.0.0.1:5440`, the Postgres in
`docker-compose.yml`. That container is on one laptop. Nothing deployed can
reach it.

A hosted Postgres is needed. Any of these works; the schema is plain Postgres
with no extensions beyond `pgcrypto`:

- **Neon** — serverless, has a free tier, gives a plain connection string
- **Supabase** — the project already has a client for it, though the API talks
  plain SQL and would not use the PostgREST layer
- **Railway / Render / Fly** — managed Postgres alongside the API service

Once it exists:

```bash
cd api
DATABASE_URL='<the hosted url>' pnpm db:migrate
# from the repository root, to load the catalogue:
pnpm db:dump-content
cd api && DATABASE_URL='<the hosted url>' pnpm db:seed
DATABASE_URL='<the hosted url>' SEED_ADMIN_EMAIL=you@example.com \
  SEED_ADMIN_PASSWORD='<12+ chars>' pnpm db:seed
```

### 2. The Express API has nowhere to run

Vercel runs serverless functions, not a long-lived server. `api/` is a
persistent Express process with a connection pool, so it needs a host that
runs containers or Node processes:

- **Render** or **Railway** — connect the repo, root directory `api`, build
  `pnpm install`, start `pnpm start`
- **Fly.io** — needs a Dockerfile, which this repo does not have yet
- a VPS with a process manager

Whatever hosts it, it needs `DATABASE_URL`, `AUTH_SECRET`, and
`CORS_ORIGINS` set to the site's real origin (not `*` — the browser sends the
session cookie on these requests).

This is the consequence of choosing a separate API over keeping it inside
Next.js. It is not a problem with the code; it is a second thing to host.

### 3. Vercel needs three new environment variables

The Next.js app now **fails its build** without the first two, deliberately —
a site that builds and then cannot authenticate anybody is worse than a build
that stops with a clear message.

| Variable              | Value                       | Notes                                                                                      |
| --------------------- | --------------------------- | ------------------------------------------------------------------------------------------ |
| `AUTH_SECRET`         | `openssl rand -base64 48`   | **Must be byte-identical** to the API's, or the API cannot read this app's session cookies |
| `DATABASE_URL`        | the hosted Postgres URL     | Auth.js's adapter runs inside the Next app, so it needs its own connection                 |
| `NEXT_PUBLIC_API_URL` | `https://<api host>/api/v1` | Defaults to `http://localhost:4000/api/v1`, which is wrong in production                   |

### 4. One pre-existing placeholder

`src/config/site.ts` still reads `url: "https://holidaysonwheels.example"`.
`metadataBase` builds canonical URLs and Open Graph tags from it, so social
previews and search canonicals currently point at a domain that does not
exist. Unrelated to this work, but it should be set before anything is
promoted.

## Order of operations

1. Create the hosted Postgres. Run `db:migrate`, then `db:dump-content` +
   `db:seed`, then seed the first admin.
2. Deploy `api/` somewhere that runs a Node process. Confirm
   `GET /api/v1/health` returns `{"status":"ok","database":"up"}` — it queries
   the database rather than returning a constant, so a 503 means the
   connection string is wrong.
3. Set the three variables on Vercel.
4. Merge to `main`. Vercel deploys on its own.
5. Sign in at `/sign-in` with the seeded admin and check `/admin` loads.

Steps 1–3 cannot be skipped or reordered. With the database absent the build
fails; with the API unreachable, `/admin` and `/account` render their "could
not load" states rather than erroring, which is deliberate but not useful.

## What is not finished

Worth knowing before this is shown to the client:

- **No create/edit forms for whole records.** Publish state, booking status,
  payments, notes and user roles are all editable. Authoring a new tour from
  scratch is not — per-resource forms are needed, and a generic
  twenty-nine-column form would be worse than none.
- **`site_content` is empty.** The "Site copy" screen lists nothing because no
  keys have been defined. The table and the screen work; the content does not
  exist.
- **No password reset.** It needs a transactional email provider (Resend,
  Postmark). Until then an administrator cannot reset a password from the UI
  either — only the seed script sets passwords.
- **No media upload.** `media` exists as a table; nothing writes to it.
- **The public pages still read TypeScript, not Postgres.** The catalogue is
  in the database and the admin edits it, but the marketing pages are still
  built from `src/content/*.ts`. Until they are switched over, an edit in the
  admin changes the database and not the live page. This is the largest
  remaining piece and should be done before the client is told the admin is
  live.

That last point matters most: the admin is real and its edits are real, but
they do not yet reach the public site.
