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

`SectionShell` owns section tint, background pattern and vertical rhythm.
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
│  ├─ layout/          SectionShell, Reveal, WeaveBand, DetailLayout, Header, Footer
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
- Sentence case everywhere except mono utility text.
- Conventional commits, enforced by a `commit-msg` hook.

### Motion

Framer Motion + Lenis. One easing curve (`cubic-bezier(0.16, 1, 0.3, 1)`),
three durations, and **at most two animated elements per viewport**.

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

Also absent by design: admin panel, real APIs, real payments. The payment step
in checkout is mocked and says so on screen.

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
- LCP < 2.5s — the hero **poster** is the LCP element, never the video
- CLS < 0.05
- Visible focus rings on every interactive element; full keyboard traversal of
  the booking flow
- All text contrast AA against its tint, including over patterns
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

1. Final domain — `site.url` is a placeholder.
2. Logo file — drop at `public/brand/logo.svg` and flip `site.logo.enabled`.
3. Real photography and video (see MEDIA.md). Highest risk.
4. Whether `beepdrive.com` accepts deep links. Until confirmed, `rentalUrl()`
   in `config/external.ts` drops all context and returns the homepage rather
   than guessing a query format.
