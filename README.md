# Holidays on Wheels

Frontend for a Northeast India travel platform — guided tours, motorcycle
expeditions, homestays, events and Inner Line Permit assistance across Assam,
Meghalaya, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura and Sikkim.

Frontend only. Backend, database and admin panel are a later phase; all content
is typed mock data behind accessor functions.

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

| Command             | Does                           |
| ------------------- | ------------------------------ |
| `pnpm dev`          | Dev server                     |
| `pnpm build`        | Production build               |
| `pnpm typecheck`    | `tsc --noEmit`                 |
| `pnpm lint`         | ESLint                         |
| `pnpm format`       | Prettier, write                |
| `pnpm format:check` | Prettier, check (what CI runs) |

Node 20+. pnpm 9.

---

## The three things to understand first

### 1. Content is behind accessors, always

All content lives in `src/content/*.ts` as typed data with accessor functions —
`getTours()`, `getTourBySlug()`, `getHomestaysNear()`. **No component reads a
data file directly.** When the backend lands, only the accessor bodies change.

Itineraries compose from a shared library of place-days in
`src/content/day-library.ts`, the way an operator actually builds routes: the
Kaziranga day is the Kaziranga day whether it sits in a honeymoon or a group
departure. One place to correct a fact.

Money is integer rupees. Dates are ISO `YYYY-MM-DD` strings. Anything derived
(departure seats, references) is seeded from a stable hash, never
`Math.random()`, so server and client always agree.

### 2. `SectionShell` and `Reveal` own the system

`SectionShell` owns section surface, background texture and vertical rhythm.
There are four surfaces — `paper`, `shell`, `sand` and `night` — and most of
the site is `paper`. Sections are separated by space and hairlines, not by
alternating colour.
`Reveal` owns the one scroll animation. Every section and every reveal goes
through them — that is what stops thirty files each growing their own slightly
different fade.

Nothing declares its own `whileInView`. Nothing hard-codes a tint.

### 3. The weave band is structural

`WeaveBand` is the divider between sections and the thing the site is
remembered by. The motif changes by region — a Naga shawl geometry for Nagaland
content, a Mishing weave for Assam — so the band tells you where you are. It is
SVG, not an image, in `src/components/layout/weave-motifs.ts`. Adding a region
means adding a tile there and nothing else.

`WeavePattern` renders the same motifs as a 3–6% background wash inside
sections. Never let a wash take text contrast below AA.

---

## Structure

```
src/
├─ app/
│  ├─ (marketing)/     home, about, contact, journal, faq, policies
│  ├─ (browse)/        destinations, tours, motorcycle-tours,
│  │                   homestays, events, rentals
│  ├─ (transact)/      checkout, ilp
│  ├─ (account)/       bookings, permits
│  └─ dev/             component sandbox — every primitive, every variant
├─ components/
│  ├─ primitives/      Button, Chip, Eyebrow, PriceTag, Media, Field
│  ├─ layout/          SectionShell, Reveal, WeaveBand, DetailLayout, Header, MenuDrawer, Footer
│  ├─ cards/           ResultCard + typed adapters
│  ├─ booking/         BookingWidget, AvailabilityCalendar, ItineraryTimeline, AddOnStep
│  └─ search/          SearchBar, FilterRail, ResultsGrid
├─ content/            typed mock data + accessors
├─ config/             external.ts (beepdrive URL), site.ts, nav.ts, media.ts
├─ lib/                cn, currency (INR, lakh grouping), date, motion
└─ styles/             tokens.css
```

Start at **`/dev`** — every component in isolation, at every variant, on light
and dark. Check there before composing a page.

---

## Conventions

- Server components by default. `"use client"` only where interaction requires it.
  A grid of forty `ResultCard`s ships no client JavaScript.
- **No `any`.** Enforced as an ESLint error.
- **No inline hex.** Every colour is a token in `src/styles/tokens.css`, exposed
  to Tailwind through the `@theme` block in `globals.css`. If you need a new
  shade, add a token.
- Every image needs real `alt` text describing the place, never "image".
- Sentence case everywhere except `.u-label` utility text, which is the only
  uppercase in the system.
- **No monospace.** Utility labels are the body face tracked wide (`.u-label`);
  figures are tabular lining numerals from that same family (`.u-num`).
- Conventional commits, enforced by a `commit-msg` hook.

### Motion

Framer Motion + Lenis. One easing curve (`cubic-bezier(0.16, 1, 0.3, 1)`),
four durations, and **at most two animated elements per viewport**. Durations
are long by default — 700ms for a transition, 220ms for a micro-interaction —
because unhurried movement is most of what the design is doing.

`prefers-reduced-motion: reduce` disables every transform and parallax, leaving
opacity-only transitions. Components read it in JS via `useReducedMotion()` so
Framer and Lenis stand down too — Lenis is never instantiated at all. This is
not optional and it is checked in the accessibility pass.

---

## What is deliberately not here

**Standalone car and bike rental.** These are operated by Beep Drive and link
out. The URL lives in `src/config/external.ts` and nowhere else. `/rentals` is a
proper outbound landing page, not a redirect, and it exists partly to stop
riders who actually want a guided expedition from clicking away by mistake.

Motorcycle **tours** stay in this repo. Only _rentals_ leave. Do not conflate them.

Still absent by design: real payments. The payment step in checkout is mocked
and says so on screen.

No longer absent: **the admin, and the database behind it.** See § The office
below.

---

## The office (`/admin`)

An internal screen for the two things travellers send: contact messages and
completed itineraries. Password-protected, `noindex`, and visually unlike the
public site on purpose.

### What it fixed on the way in

The contact form and the planner's "Confirm booking" both used to call
`setSent(true)` and nothing else. A traveller filled in their name, email,
mobile and dates, was told _"We have it — someone will reply within one working
day"_, and the message went nowhere: not emailed, not queued, not stored. That
was the most serious defect in the project, because unlike every other
placeholder it did not look like one. Both now acknowledge **only after the row
exists**, and say so plainly when it does not.

### Setting it up

1. Create a Supabase project.
2. Run `supabase/migrations/0001_enquiries_and_trip_requests.sql` in the SQL
   editor. It is the record of what the live schema is — change the schema by
   editing it, not in the dashboard.
3. Copy `.env.example` to `.env.local` and fill in the four variables. The
   session secret is its own random string, not the password:
   `openssl rand -hex 32`.
4. On Vercel, the same four go in Settings → Environment Variables.

With the database unset the site still builds and runs; the admin says it is
not configured rather than showing empty screens that look like no enquiries.

### The security model

RLS is on for both tables and **neither has a policy**, so `anon` can do
nothing. The browser never talks to Supabase: every read and write goes
through a server action holding the service-role key, which bypasses RLS.
`src/lib/supabase.ts` opens with `import "server-only"` so importing it from a
client component is a build error rather than a leaked key.

Two consequences worth knowing:

- **Every mutation re-checks the session.** `"use server"` publishes each
  action as an HTTP endpoint anybody can post to; the layout's guard protects
  rendering, not the actions behind the buttons.
- **If a later phase queries from the browser, policies must be written
  first.** Adding the anon key to a page without them would expose every
  traveller's phone number.

### The shared password

One password, chosen knowingly over named accounts. It cannot tell you who did
something and cannot be revoked for one person. Everything depending on that
choice is behind `checkPassword` and `startSession` in
`src/lib/admin-session.ts`; moving to named accounts replaces those two
functions and adds a `staff` table, and no page, guard or cookie format
changes.

The guard lives in `src/app/admin/(guarded)/layout.tsx`, not in middleware —
middleware runs on the edge runtime where `node:crypto` does not exist, and a
guard that cannot verify a signature is not a guard. **Anything new that must
be protected goes inside `(guarded)/`.** A page added at `app/admin/whatever/`
would be as public as the login screen and would look identical in a browser.

### Not built yet

The second and third parts of the brief — editing homestay and tour content,
and changing rates and availability without a deploy — are not here. They need
their own tables and a migration path off `src/content/*.ts`, which the site
currently builds against at compile time. Enquiries and itineraries went first
because they are the part the business cannot operate without, and because
they were actively losing customer data every day they were not built.

---

## Prices in another currency

A switcher in the header shows every headline price in one of twelve foreign
currencies beside the rupee figure: `₹3,400 (≈ $36) a night`.

**The rupee figure never moves and never disappears.** That is the whole
design rule, and it is a commercial one rather than a stylistic one: prices
here are quoted, invoiced and charged in rupees, and a tour operator whose
site appears to quote in dollars has to honour dollars. So the conversion is
additive, marked `≈`, in quieter type, and every converted amount carries
"charged in rupees" for assistive technology. The footer states it in words
whenever a foreign currency is selected.

### What is converted, and what is not

Converted: the absolute prices a visitor evaluates or commits to — card
"from" prices, per-person and per-night figures, booking totals, the deposit,
the planner's grand total.

Not converted: relative supplements such as `+₹1,800 / night` inside the day
accordions. They modify a figure that is already shown converted, and
doubling the text in the densest part of the planner would cost more than it
gives. `/admin` and `/account` stay in rupees throughout — one is internal,
the other shows bookings already made.

### How it works

Rates come from `open.er-api.com` once per six hours, fetched **on the
server** in the root layout and handed down as a prop, so switching currency
costs no request at all. `getRates` returns `null` on any failure and every
consumer treats null as "rupees only" — the switcher does not even render.
It has a six-second timeout for the same reason the weather call does.

The _choice_ lives in `localStorage`, not a cookie, and the context is a
client component. Reading a cookie on the server would opt every route that
shows a price out of static rendering, which is nearly all of them — 191
prerendered pages to change the symbol in front of a number. The honest
consequence: first paint is always rupees and the chosen currency appears a
moment later. Rupees is the right thing to show before we know, because
rupees is what the price is.

---

## Media

No photography or video exists yet — see **[MEDIA.md](MEDIA.md)** for the full
manifest of what the client owes, the encode targets, and where each file goes.

Until files arrive, `Media` draws a deterministic placeholder from the region's
weave motif at the exact aspect ratio the real image will occupy, so dropping
the real files in causes no layout shift.

---

## Quality floor

Enforced in CI by `.github/workflows/lighthouse.yml` against `lighthouserc.json`:

- Performance ≥ 90, accessibility ≥ 95, best practices ≥ 95, SEO ≥ 95
- LCP < 2.5s — the home hero's LCP element is the **headline**, which is text
  on a flat ground; on detail pages it is the lead image. Never a video: no
  `<video>` enters the DOM until after first paint
- CLS < 0.05
- Visible focus rings on every interactive element; full keyboard traversal of
  the booking flow
- All text contrast AA against its surface, including over the weave texture
- Works at 320px

Budgets assert the thresholds above rather than `lighthouse:recommended`, which
errors on a long tail of audits nobody is being asked to fix.

---

## CI/CD

| Workflow         | Runs on          | Does                                    |
| ---------------- | ---------------- | --------------------------------------- |
| `ci.yml`         | PR, push to main | typecheck, lint, format check, build    |
| `lighthouse.yml` | PR               | Lighthouse CI against the budgets above |
| `deploy.yml`     | push to main     | Vercel production deploy                |

Deploy needs `VERCEL_TOKEN`, `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` in repo
secrets. Branch protection on `main` should require `verify` to pass and
disallow direct pushes.

---

## Open questions still outstanding

0. **No Supabase project exists yet, so the write path has never run against a
   real database.** The schema, the server actions and the admin are written
   and the _unconfigured_ path is tested end to end — signed-out access,
   forged cookies, wrong passwords, empty states, sign-out. What is untested
   is an actual `insert`: nobody has created the project or run
   `0001_enquiries_and_trip_requests.sql`. Do that first and send one enquiry
   and one itinerary through before this is treated as working. Until then the
   forms refuse to acknowledge anything, which is correct but is not the same
   as being finished.
1. Final domain — `site.url` is a placeholder.
2. **Which wordmark is correct.** The supplied logo reads "Holiday on Hill —
   Northeast India"; `site.name` is "Holidays on Wheels". The logo is wired in
   and rendering, but the two disagree. See MEDIA.md § Brand.
3. Real photography and video (see MEDIA.md). Highest risk.
4. Whether `beepdrive.com` accepts deep links. Until confirmed, `rentalUrl()`
   in `config/external.ts` drops all context and returns the homepage rather
   than guessing a query format.
5. **The four Guwahati homestays are invented.** Names, families, rates,
   ratings and review counts are all placeholder — see the block above
   `GUWAHATI_PLACEHOLDERS` in `content/homestays.ts`. The homestays page
   shows only these and lists every other state as "coming soon", so this is
   the whole of that page. The fabricated `reviewCount` values are the part
   that cannot ship: they are specific factual claims about a real business.
6. **The Lighthouse budgets are temporarily below the brief's floor.** The
   brief asks for performance 0.9, best-practices 0.95 and LCP 2.5s;
   `lighthouserc.json` currently asserts 0.65, a warning, and a warning.
   Accessibility (1.00 everywhere) and CLS (0 everywhere) are still hard
   errors. The gap is entirely third-party placeholder media — Pexels sets
   two Cloudflare cookies that cap best-practices at 0.78, and every
   remaining LCP is an Unsplash image on someone else's origin. Restore the
   original numbers in the same change that moves the media to
   `public/media/`; the reasoning and the measured figures are in
   `.github/workflows/lighthouse.yml`.
7. **Two third-party services are on free tiers that do not cover commercial
   use.** Both are one environment variable away from being correct, and
   neither is set:
   - `OPEN_METEO_API_KEY` — the destinations page's live weather. The free
     endpoint is explicitly non-commercial. Setting the key switches the host
     to `customer-api.open-meteo.com`; see `lib/weather.ts`.
   - **exchangerate-api.com** — the currency switcher's rates. The keyless
     `open.er-api.com` tier requires attribution, which is rendered in the
     footer, but its terms should be checked for commercial use before
     launch. A paid key changes one URL in `src/lib/fx.ts`; without any
     rates the switcher simply does not render and prices stay in rupees.
   - `NEXT_PUBLIC_MAP_TILE_URL` — the map under each homestay. It currently
     falls back to `tile.openstreetmap.org`, whose usage policy covers
     development, not a commercial site. Point it at MapTiler, Thunderforest
     or Geoapify; they all serve the same `{z}/{x}/{y}` shape, so nothing
     else moves. OpenStreetMap attribution is rendered under the map and is
     required by the ODbL whatever the provider — do not remove it.
