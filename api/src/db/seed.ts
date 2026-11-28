import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sql, eq } from "drizzle-orm";
import { hash } from "@node-rs/argon2";
import { db, pool } from "./client";
import * as s from "./schema/index";

/**
 * Import `api/seed/content.json` into Postgres.
 *
 * ## Idempotent, and why that matters more than it sounds
 *
 * Every parent row is an upsert keyed on its slug, so running this twice does
 * not duplicate 47 tours. Child rows — departures, rooms, ticket tiers — have
 * no natural key, so they are deleted and reinserted per parent.
 *
 * **That delete is guarded.** `departures` is referenced by `bookings`, and
 * replacing a departure row after somebody has booked it would null out the
 * link between a traveller and the date they are travelling on. So the
 * importer refuses to touch children once any booking exists, and says so.
 * A content re-import is a development operation; it is not a migration path
 * for a live database with sales in it.
 *
 * ## Why existing content arrives `published`
 *
 * All of this is already on the live site. Importing it as `draft` would take
 * the whole catalogue down the moment the frontend starts reading from
 * Postgres. New rows created in the admin default to `draft`, which is the
 * right default for something nobody has written yet — but not for this.
 */

type Json = Record<string, unknown>;

const SEED_PATH = resolve(process.cwd(), "seed/content.json");

/** Arrays in the dump may be absent; a missing list is empty, not null. */
const arr = <T>(v: T[] | undefined | null): T[] => (Array.isArray(v) ? v : []);

async function main() {
  const raw = readFileSync(SEED_PATH, "utf8");
  const data = JSON.parse(raw) as Json & { dumpedAt: string };
  console.log(`[seed] reading ${SEED_PATH}`);
  console.log(`[seed] dump taken ${data.dumpedAt}`);

  const bookingCount = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(s.bookings);
  const hasBookings = (bookingCount[0]?.n ?? 0) > 0;
  if (hasBookings) {
    console.warn(
      `[seed] ${bookingCount[0]?.n} booking(s) exist — child rows ` +
        `(departures, rooms, ticket tiers) will be left alone. See the note ` +
        `at the top of this file.`,
    );
  }

  /* ===================================================================== */
  /* Destinations                                                          */
  /* ===================================================================== */

  const destinations = arr<Json>(data.destinations as Json[]);
  for (const d of destinations) {
    await db
      .insert(s.destinations)
      .values({
        slug: d.slug as never,
        name: d.name as string,
        tagline: d.tagline as string,
        intro: d.intro as string,
        body: arr<string>(d.body as string[]),
        region: d.region as string,
        tint: d.tint as string,
        requiresIlp: Boolean(d.requiresILP),
        requiresPap: Boolean(d.requiresPAP),
        bestMonths: arr<string>(d.bestMonths as string[]),
        gateway: d.gateway as string,
        knownFor: arr<string>(d.knownFor as string[]),
        heroAlt: d.heroAlt as string,
        image: (d.image as string) ?? null,
        status: "published",
      })
      .onConflictDoUpdate({
        target: s.destinations.slug,
        set: {
          name: d.name as string,
          tagline: d.tagline as string,
          intro: d.intro as string,
          body: arr<string>(d.body as string[]),
          region: d.region as string,
          tint: d.tint as string,
          requiresIlp: Boolean(d.requiresILP),
          requiresPap: Boolean(d.requiresPAP),
          bestMonths: arr<string>(d.bestMonths as string[]),
          gateway: d.gateway as string,
          knownFor: arr<string>(d.knownFor as string[]),
          heroAlt: d.heroAlt as string,
          image: (d.image as string) ?? null,
        },
      });
  }
  console.log(`[seed] destinations: ${destinations.length}`);

  /* ===================================================================== */
  /* Tours                                                                 */
  /* ===================================================================== */

  const tours = arr<Json>(data.tours as Json[]);
  for (const t of tours) {
    const values = {
      slug: t.slug as string,
      title: t.title as string,
      strapline: t.strapline as string,
      states: arr<string>(t.states as string[]) as never,
      region: t.region as string,
      types: arr<string>(t.types as string[]) as never,
      nights: t.nights as number,
      days: t.days as number,
      fromPrice: t.fromPrice as number,
      priceBands: arr<Json>(t.priceBands as Json[]),
      singleSupplement: (t.singleSupplement as number) ?? null,
      intro: t.intro as string,
      highlights: arr<string>(t.highlights as string[]),
      includes: arr<string>(t.includes as string[]),
      excludes: arr<string>(t.excludes as string[]),
      itinerary: arr<Json>(t.itinerary as Json[]),
      difficulty: t.difficulty as never,
      groupSizeMax: t.groupSizeMax as number,
      startsAt: t.startsAt as string,
      endsAt: t.endsAt as string,
      requiresIlp: Boolean(t.requiresILP),
      heroAlt: t.heroAlt as string,
      image: (t.image as string) ?? null,
      featured: Boolean(t.featured),
      status: "published" as const,
    };
    const [row] = await db
      .insert(s.tours)
      .values(values)
      .onConflictDoUpdate({ target: s.tours.slug, set: values })
      .returning({ id: s.tours.id });

    if (row && !hasBookings) {
      await db.delete(s.departures).where(eq(s.departures.tourId, row.id));
      const deps = arr<Json>(t.departures as Json[]);
      if (deps.length) {
        await db.insert(s.departures).values(
          deps.map((dep) => ({
            tourId: row.id,
            date: dep.date as string,
            endDate: dep.endDate as string,
            seatsLeft: dep.seatsLeft as number,
            perPerson: dep.perPerson as number,
            wasPerPerson: (dep.wasPerPerson as number) ?? null,
            status: dep.status as never,
          })),
        );
      }
    }
  }
  console.log(`[seed] tours: ${tours.length}`);

  /* ===================================================================== */
  /* Motorcycle expeditions                                                */
  /* ===================================================================== */

  const motos = arr<Json>(data.motorcycleTours as Json[]);
  for (const m of motos) {
    const values = {
      slug: m.slug as string,
      title: m.title as string,
      strapline: m.strapline as string,
      states: arr<string>(m.states as string[]) as never,
      region: m.region as string,
      nights: m.nights as number,
      days: m.days as number,
      distanceKm: m.distanceKm as number,
      maxAltitude: m.maxAltitude as number,
      fromPrice: m.fromPrice as number,
      pillionPrice: m.pillionPrice as number,
      intro: m.intro as string,
      terrain: arr<string>(m.terrain as string[]),
      bikes: arr<Json>(m.bikes as Json[]),
      supportVehicle: arr<string>(m.supportVehicle as string[]),
      highlights: arr<string>(m.highlights as string[]),
      includes: arr<string>(m.includes as string[]),
      excludes: arr<string>(m.excludes as string[]),
      itinerary: arr<Json>(m.itinerary as Json[]),
      difficulty: m.difficulty as never,
      groupSizeMax: m.groupSizeMax as number,
      startsAt: m.startsAt as string,
      endsAt: m.endsAt as string,
      requiresIlp: Boolean(m.requiresILP),
      ridingExperience: m.ridingExperience as string,
      heroAlt: m.heroAlt as string,
      image: (m.image as string) ?? null,
      featured: Boolean(m.featured),
      status: "published" as const,
    };
    const [row] = await db
      .insert(s.motorcycleTours)
      .values(values)
      .onConflictDoUpdate({ target: s.motorcycleTours.slug, set: values })
      .returning({ id: s.motorcycleTours.id });

    if (row && !hasBookings) {
      await db
        .delete(s.departures)
        .where(eq(s.departures.motorcycleTourId, row.id));
      const deps = arr<Json>(m.departures as Json[]);
      if (deps.length) {
        await db.insert(s.departures).values(
          deps.map((dep) => ({
            motorcycleTourId: row.id,
            date: dep.date as string,
            endDate: dep.endDate as string,
            seatsLeft: dep.seatsLeft as number,
            perPerson: dep.perPerson as number,
            wasPerPerson: (dep.wasPerPerson as number) ?? null,
            status: dep.status as never,
          })),
        );
      }
    }
  }
  console.log(`[seed] motorcycle expeditions: ${motos.length}`);

  /* ===================================================================== */
  /* Homestays                                                             */
  /* ===================================================================== */

  const homestays = arr<Json>(data.homestays as Json[]);
  for (const h of homestays) {
    const values = {
      slug: h.slug as string,
      name: h.name as string,
      strapline: h.strapline as string,
      state: h.state as never,
      region: h.region as string,
      locality: h.locality as string,
      lat: h.lat as number,
      lng: h.lng as number,
      /*
       * `?? null` and not `?? 0`. An absent rate means "ask us"; a zero would
       * publish a price the house never quoted. See the column comment.
       */
      fromPrice: (h.fromPrice as number) ?? null,
      maxGuests: (h.maxGuests as number) ?? null,
      bedrooms: (h.bedrooms as number) ?? null,
      intro: h.intro as string,
      body: arr<string>(h.body as string[]),
      hostName: (h.hostName as string) ?? null,
      hostStory: (h.hostStory as string) ?? null,
      amenities: arr<string>(h.amenities as string[]),
      houseRules: arr<string>(h.houseRules as string[]),
      mealsIncluded: ((h.mealsIncluded as string) ?? null) as never,
      rating: (h.rating as number) ?? null,
      reviewCount: (h.reviewCount as number) ?? null,
      heroAlt: h.heroAlt as string,
      image: (h.image as string) ?? null,
      gallery: arr<string>(h.gallery as string[]),
      suitability: arr<string>(h.suitability as string[]) as never,
      featured: Boolean(h.featured),
      status: "published" as const,
    };
    const [row] = await db
      .insert(s.homestays)
      .values(values)
      .onConflictDoUpdate({ target: s.homestays.slug, set: values })
      .returning({ id: s.homestays.id });

    if (row && !hasBookings) {
      await db
        .delete(s.homestayRooms)
        .where(eq(s.homestayRooms.homestayId, row.id));
      const rooms = arr<Json>(h.rooms as Json[]);
      if (rooms.length) {
        await db.insert(s.homestayRooms).values(
          rooms.map((r, i) => ({
            homestayId: row.id,
            name: r.name as string,
            sleeps: r.sleeps as number,
            perNight: r.perNight as number,
            description: r.description as string,
            amenities: arr<string>(r.amenities as string[]),
            sortOrder: i,
          })),
        );
      }
    }
  }
  console.log(`[seed] homestays: ${homestays.length}`);

  /* ===================================================================== */
  /* Events                                                                */
  /* ===================================================================== */

  const events = arr<Json>(data.events as Json[]);
  for (const e of events) {
    const values = {
      slug: e.slug as string,
      name: e.name as string,
      strapline: e.strapline as string,
      state: e.state as never,
      region: e.region as string,
      venue: e.venue as string,
      locality: e.locality as string,
      startDate: e.startDate as string,
      endDate: e.endDate as string,
      category: e.category as never,
      fromPrice: e.fromPrice as number,
      intro: e.intro as string,
      body: arr<string>(e.body as string[]),
      lineup: arr<string>(e.lineup as string[]),
      heroAlt: e.heroAlt as string,
      image: (e.image as string) ?? null,
      featured: Boolean(e.featured),
      status: "published" as const,
    };
    const [row] = await db
      .insert(s.events)
      .values(values)
      .onConflictDoUpdate({ target: s.events.slug, set: values })
      .returning({ id: s.events.id });

    if (row && !hasBookings) {
      await db
        .delete(s.eventTicketTiers)
        .where(eq(s.eventTicketTiers.eventId, row.id));
      const tiers = arr<Json>(e.tickets as Json[]);
      if (tiers.length) {
        await db.insert(s.eventTicketTiers).values(
          tiers.map((tier, i) => ({
            eventId: row.id,
            name: tier.name as string,
            price: tier.price as number,
            description: tier.description as string,
            /* null means unlimited — the content contract's convention. */
            remaining:
              tier.remaining === null || tier.remaining === undefined
                ? null
                : (tier.remaining as number),
            perks: arr<string>(tier.perks as string[]),
            sortOrder: i,
          })),
        );
      }
    }
  }
  console.log(`[seed] events: ${events.length}`);

  /* ===================================================================== */
  /* Activities, cafés, journal, FAQs, policies                            */
  /* ===================================================================== */

  const activities = arr<Json>(data.activities as Json[]);
  for (const a of activities) {
    const values = {
      slug: a.slug as string,
      name: a.name as string,
      strapline: a.strapline as string,
      category: a.category as never,
      locality: a.locality as string,
      durationLabel: a.durationLabel as string,
      durationHours: a.durationHours as number,
      distanceKm: a.distanceKm as number,
      bestTime: a.bestTime as string,
      fromPrice: a.fromPrice as number,
      groupSizeMax: a.groupSizeMax as number,
      meetingPoint: a.meetingPoint as string,
      intro: a.intro as string,
      body: arr<string>(a.body as string[]),
      highlights: arr<string>(a.highlights as string[]),
      includes: arr<string>(a.includes as string[]),
      excludes: arr<string>(a.excludes as string[]),
      heroAlt: a.heroAlt as string,
      image: (a.image as string) ?? null,
      featured: Boolean(a.featured),
      status: "published" as const,
    };
    await db
      .insert(s.activities)
      .values(values)
      .onConflictDoUpdate({ target: s.activities.slug, set: values });
  }
  console.log(`[seed] activities: ${activities.length}`);

  const cafes = arr<Json>(data.cafes as Json[]);
  for (const [i, c] of cafes.entries()) {
    const values = {
      slug: c.slug as string,
      name: c.name as string,
      locality: c.locality as string,
      blurb: (c.blurb as string) ?? (c.note as string) ?? "",
      heroAlt: (c.heroAlt as string) ?? (c.alt as string) ?? "",
      image: (c.image as string) ?? null,
      sortOrder: i,
      status: "published" as const,
    };
    await db
      .insert(s.cafes)
      .values(values)
      .onConflictDoUpdate({ target: s.cafes.slug, set: values });
  }
  console.log(`[seed] cafés: ${cafes.length}`);

  const posts = arr<Json>(data.journalPosts as Json[]);
  for (const p of posts) {
    const values = {
      slug: p.slug as string,
      title: p.title as string,
      excerpt: p.excerpt as string,
      body: arr<string>(p.body as string[]),
      publishedAt: p.publishedAt as string,
      readingMinutes: p.readingMinutes as number,
      author: p.author as string,
      region: p.region as string,
      tag: p.tag as string,
      heroAlt: p.heroAlt as string,
      image: (p.image as string) ?? null,
      status: "published" as const,
    };
    await db
      .insert(s.journalPosts)
      .values(values)
      .onConflictDoUpdate({ target: s.journalPosts.slug, set: values });
  }
  console.log(`[seed] journal posts: ${posts.length}`);

  /*
   * FAQs have no slug and no stable id in the content file, so there is
   * nothing to upsert against. They are replaced wholesale, which is safe:
   * nothing references a FAQ row.
   */
  const faqs = arr<Json>(data.faqs as Json[]);
  await db.delete(s.faqs);
  if (faqs.length) {
    await db.insert(s.faqs).values(
      faqs.map((f, i) => ({
        question: f.question as string,
        answer: f.answer as string,
        topic: f.topic as never,
        sortOrder: i,
        status: "published" as const,
      })),
    );
  }
  console.log(`[seed] faqs: ${faqs.length}`);

  const policies = arr<Json>(data.policies as Json[]);
  for (const p of policies) {
    const values = {
      slug: p.slug as string,
      title: p.title as string,
      /* The date the terms changed, as the content file states it. */
      effectiveFrom: p.updatedAt as string,
      sections: arr<Json>(p.sections as Json[]),
      status: "published" as const,
    };
    await db
      .insert(s.policies)
      .values(values)
      .onConflictDoUpdate({ target: s.policies.slug, set: values });
  }
  console.log(`[seed] policies: ${policies.length}`);

  /* ===================================================================== */
  /* The planner                                                           */
  /* ===================================================================== */

  const placeOptions = (data.placeOptions ?? {}) as Record<string, Json>;
  for (const [place, opts] of Object.entries(placeOptions)) {
    const values = {
      place,
      stays: arr<Json>(opts.stays as Json[]),
      activities: arr<Json>(opts.activities as Json[]),
      transfers: arr<Json>(opts.transfers as Json[]),
      status: "published" as const,
    };
    await db
      .insert(s.placeOptions)
      .values(values)
      .onConflictDoUpdate({ target: s.placeOptions.place, set: values });
  }
  console.log(`[seed] place options: ${Object.keys(placeOptions).length}`);

  const gateways = (data.gatewayPoints ?? {}) as Record<string, Json>;
  for (const [key, g] of Object.entries(gateways)) {
    const values = {
      key,
      label: (g.label as string) ?? (g.name as string) ?? key,
      data: g,
      status: "published" as const,
    };
    await db
      .insert(s.gatewayPoints)
      .values(values)
      .onConflictDoUpdate({ target: s.gatewayPoints.key, set: values });
  }
  console.log(`[seed] gateway points: ${Object.keys(gateways).length}`);

  const templates = (data.dayTemplates ?? {}) as Record<string, Json>;
  for (const [key, t] of Object.entries(templates)) {
    const values = {
      key,
      title: (t.title as string) ?? key,
      summary: (t.summary as string) ?? "",
      data: t,
      status: "published" as const,
    };
    await db
      .insert(s.dayTemplates)
      .values(values)
      .onConflictDoUpdate({ target: s.dayTemplates.key, set: values });
  }
  console.log(`[seed] day templates: ${Object.keys(templates).length}`);

  const routes = (data.routes ?? {}) as Record<string, Json>;
  for (const [state, r] of Object.entries(routes)) {
    const values = {
      state: state as never,
      legs: arr<Json>(r.legs as Json[]),
      maxDays: (r.maxDays as number) ?? 0,
      status: "published" as const,
    };
    await db
      .insert(s.routes)
      .values(values)
      .onConflictDoUpdate({ target: s.routes.state, set: values });
  }
  console.log(`[seed] routes: ${Object.keys(routes).length}`);

  const guides = (data.localGuides ?? {}) as Record<string, Json | null>;
  let guidesWritten = 0;
  for (const [state, g] of Object.entries(guides)) {
    /*
     * `localGuideFor` returns null where nothing is written. Skipped rather
     * than inserted empty: the panel renders nothing for those states, and an
     * empty row would claim a guide exists with no places in it.
     */
    if (!g) continue;
    const values = {
      state: state as never,
      intro: (g.intro as string) ?? null,
      places: arr<Json>(g.places as Json[]),
      status: "published" as const,
    };
    await db
      .insert(s.localGuides)
      .values(values)
      .onConflictDoUpdate({ target: s.localGuides.state, set: values });
    guidesWritten += 1;
  }
  console.log(
    `[seed] local guides: ${guidesWritten} written, ` +
      `${Object.keys(guides).length - guidesWritten} state(s) have none`,
  );

  const terms = (data.quoteTerms ?? {}) as Record<string, string[]>;
  for (const [key, items] of Object.entries(terms)) {
    const values = {
      key,
      label: key === "includes" ? "Standard inclusions" : "Standard exclusions",
      items: arr<string>(items),
    };
    await db
      .insert(s.quoteTerms)
      .values(values)
      .onConflictDoUpdate({ target: s.quoteTerms.key, set: values });
  }
  console.log(`[seed] quote terms: ${Object.keys(terms).length}`);

  const stayAmenities = (data.stayAmenities ?? {}) as Record<string, Json>;
  for (const [key, a] of Object.entries(stayAmenities)) {
    const values = {
      key,
      label: (a.label as string) ?? key,
      icon: (a.icon as string) ?? null,
      group: (a.group as string) ?? "general",
    };
    await db
      .insert(s.amenities)
      .values(values)
      .onConflictDoUpdate({ target: s.amenities.key, set: values });
  }
  console.log(`[seed] amenities: ${Object.keys(stayAmenities).length}`);

  /* ===================================================================== */
  /* The first admin                                                       */
  /* ===================================================================== */

  await seedFirstAdmin();

  console.log("\n[seed] done");
}

/**
 * Create the first admin from the environment, if asked.
 *
 * Deliberately not a hardcoded `admin@1234`. The project already carries one
 * shared password in `ADMIN_PASSWORD` and the point of this phase is to
 * replace it with real accounts; seeding a known-credential admin into every
 * database would reintroduce exactly that problem, and a seeded default is
 * the first thing an attacker tries.
 *
 * So: set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` to create one, and
 * nothing happens if they are unset.
 */
async function seedFirstAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.log(
      "[seed] no admin created — set SEED_ADMIN_EMAIL and " +
        "SEED_ADMIN_PASSWORD to create one",
    );
    return;
  }
  if (password.length < 12) {
    console.error("[seed] SEED_ADMIN_PASSWORD must be at least 12 characters");
    process.exitCode = 1;
    return;
  }

  /*
   * Argon2id with the library's defaults, which follow the OWASP guidance.
   * Not bcrypt: bcrypt silently truncates at 72 bytes, and a passphrase
   * longer than that would have its tail ignored.
   */
  const passwordHash = await hash(password, { algorithm: 2 });

  await db
    .insert(s.users)
    .values({
      email,
      name: "Administrator",
      role: "admin",
      passwordHash,
      emailVerified: new Date(),
    })
    .onConflictDoUpdate({
      target: s.users.email,
      set: { role: "admin", passwordHash, disabledAt: null },
    });

  console.log(`[seed] admin ready: ${email}`);
}

main()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("[seed] failed:", err);
    await pool.end().catch(() => {});
    process.exit(1);
  });
