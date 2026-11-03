-- Holidays on Wheels — enquiries and planned trips.
--
-- Run this once against the Supabase project, then keep it in the repository
-- as the record of what the live schema is. Editing tables in the dashboard
-- and not here is how a schema stops being reviewable.
--
-- ## The security model, in one paragraph
--
-- RLS is ON for both tables and neither has a policy, which means `anon` and
-- `authenticated` can do nothing at all. That is deliberate and it is not an
-- oversight: the browser never talks to Supabase on this site. Every read and
-- write goes through a Next.js server action holding the service-role key,
-- which bypasses RLS. So the attack surface is the server actions, which
-- validate their input, and not a public PostgREST endpoint. If a later phase
-- ever does query from the browser, policies have to be written *then* —
-- adding the anon key to a page without them would expose every traveller's
-- phone number.
--
-- ## Why there is a `plan` snapshot
--
-- `trip_requests.plan` holds the whole `TripPlan` as it was quoted, including
-- prices. The itinerary is composed from `src/content/*`, which is code: a
-- supplement edited next March would otherwise silently rewrite what a
-- traveller was quoted last November. The business needs to be able to say
-- what it actually offered, so the quote is stored, not recomputed.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enquiries — the contact form
-- ---------------------------------------------------------------------------

create table if not exists public.enquiries (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),

  name        text not null,
  email       text not null,
  phone       text,

  -- The form's optional qualifiers. `state` is a destination slug, but it is
  -- deliberately not a foreign key: the destinations live in TypeScript, not
  -- in this database, and a constraint against a table that does not exist
  -- cannot be enforced. Validation happens in the server action.
  state       text,
  month       text,
  party_size  integer,

  message     text not null,

  -- Where it came from, so a future second form is distinguishable without a
  -- migration. 'contact' is the only value today.
  source      text not null default 'contact',

  status      text not null default 'new'
                check (status in ('new', 'in_progress', 'closed')),
  -- What the office wrote on it. Never shown to the traveller.
  staff_notes text,
  handled_at  timestamptz
);

comment on table public.enquiries is
  'Contact-form messages. Written only by server actions using the service key.';

create index if not exists enquiries_created_at_idx
  on public.enquiries (created_at desc);
create index if not exists enquiries_status_idx
  on public.enquiries (status, created_at desc);

alter table public.enquiries enable row level security;

-- ---------------------------------------------------------------------------
-- Trip requests — a completed run through the planner
-- ---------------------------------------------------------------------------

create table if not exists public.trip_requests (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),

  -- The human-facing reference the planner already generates and shows the
  -- traveller. Unique so the office can search by the string somebody reads
  -- out on the phone.
  reference     text not null unique,

  state         text not null,
  state_name    text not null,
  party         text not null,

  start_date    date not null,
  end_date      date not null,
  nights        integer not null check (nights > 0),
  adults        integer not null check (adults > 0),
  children      integer not null default 0 check (children >= 0),
  child_ages    jsonb not null default '[]'::jsonb,

  lead_name     text not null,
  lead_email    text not null,
  lead_phone    text not null,
  companions    jsonb not null default '[]'::jsonb,
  traveller_notes text,

  -- What they chose, day by day: rooms, transfers, vehicle, activities.
  selections    jsonb not null default '{}'::jsonb,
  -- The quote as quoted. See the note at the top of this file.
  plan          jsonb not null,

  total         integer not null check (total >= 0),
  deposit       integer not null default 0 check (deposit >= 0),

  status        text not null default 'new'
                  check (status in ('new', 'in_progress', 'quoted',
                                    'confirmed', 'lost', 'closed')),
  staff_notes   text,
  handled_at    timestamptz
);

comment on table public.trip_requests is
  'Itineraries somebody completed and sent. `plan` is the quote as quoted.';

comment on column public.trip_requests.total is
  'Rupees, whole, as quoted. Integer because money in paise-free INR has no fractional part here and floats do not belong in a price.';

create index if not exists trip_requests_created_at_idx
  on public.trip_requests (created_at desc);
create index if not exists trip_requests_status_idx
  on public.trip_requests (status, created_at desc);
create index if not exists trip_requests_start_date_idx
  on public.trip_requests (start_date);

alter table public.trip_requests enable row level security;
