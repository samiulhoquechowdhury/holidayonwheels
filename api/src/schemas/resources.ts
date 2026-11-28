import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import * as t from "../db/schema/index";

/**
 * Validators, derived from the tables rather than written beside them.
 *
 * ## Why derived
 *
 * A hand-written zod schema per table is a second copy of the schema that has
 * to be kept in step with the first by hand. It never is: a column gains a
 * NOT NULL and the validator keeps accepting the old shape, so the error
 * surfaces as a Postgres 23502 at runtime instead of a 400 with a field name.
 * `createInsertSchema` reads the table, so adding a column cannot be
 * forgotten here.
 *
 * ## What is layered on top
 *
 * Derivation gets types and nullability right and knows nothing about
 * meaning. Three things are added by hand:
 *
 * 1. **Slug format.** The database only requires uniqueness; a slug with a
 *    space or a slash in it produces a URL that 404s or, worse, escapes its
 *    route segment.
 * 2. **The nested JSONB shapes.** `itinerary` is `jsonb`, which derives as
 *    "any JSON". These are the columns Postgres cannot check at all, so the
 *    only validation they will ever get is here.
 * 3. **Server-owned fields are stripped.** `id`, `createdAt` and `updatedAt`
 *    are omitted from every input: accepting them would let a caller set a
 *    row's id or backdate an edit.
 *
 * ## Update schemas
 *
 * Every update schema is the create schema made `.partial()`, so PATCH
 * accepts any subset. `.strict()` is applied throughout: a request with a
 * misspelled field is an error, not something silently ignored. The specific
 * failure that prevents is a form sending `from_price` where the API expects
 * `fromPrice` and the price appearing not to save, with no error anywhere.
 */

/* ---------------------------------------------------------------------- */
/* Shared pieces                                                          */
/* ---------------------------------------------------------------------- */

/**
 * Lower-case, hyphen-separated, no leading or trailing hyphen.
 *
 * Matches what is already in `src/content/*`: `the-tawang-run`,
 * `hatigaon-homestay`.
 */
export const slug = z
  .string()
  .min(1)
  .max(120)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lower-case letters, numbers and hyphens only.",
  );

/** `YYYY-MM-DD`, which is what the `date` columns and the content files use. */
export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the form YYYY-MM-DD.")
  .refine((v) => !Number.isNaN(Date.parse(v)), "That is not a real date.");

/** Whole rupees. Money is never a float in this codebase. */
export const rupees = z.number().int().min(0);

const mealPlan = z.enum(["breakfast", "half-board", "full-board", "none"]);

/**
 * One day of an itinerary.
 *
 * This is the `ItineraryDay` contract from `src/content/types.ts`, restated
 * because the column is `jsonb` and nothing else will check it. `stay` is
 * nullable by design — the final day has nowhere to sleep.
 */
export const itineraryDay = z
  .object({
    day: z.number().int().positive(),
    title: z.string().min(1),
    summary: z.string().min(1),
    stay: z.string().min(1).nullable(),
    meals: mealPlan,
    altitude: z.number().int().optional(),
    distanceKm: z.number().int().min(0).optional(),
    highlights: z.array(z.string().min(1)).default([]),
  })
  .strict();

export const priceBand = z
  .object({
    fromPax: z.number().int().positive(),
    perPerson: rupees,
  })
  .strict();

export const motorcycleOption = z
  .object({
    name: z.string().min(1),
    engineCc: z.number().int().positive(),
    surcharge: z.number().int(),
  })
  .strict();

export const policySection = z
  .object({ heading: z.string().min(1), body: z.array(z.string()) })
  .strict();

/** Fields the server owns. Never accepted from a caller. */
const SERVER_OWNED = {
  id: true,
  createdAt: true,
  updatedAt: true,
} as const;

/* ---------------------------------------------------------------------- */
/* Destinations                                                           */
/* ---------------------------------------------------------------------- */

export const destinationCreate = createInsertSchema(t.destinations, {
  body: z.array(z.string()).default([]),
  bestMonths: z.array(z.string()).default([]),
  knownFor: z.array(z.string()).default([]),
})
  .omit(SERVER_OWNED)
  .strict();
export const destinationUpdate = destinationCreate.partial();

/* ---------------------------------------------------------------------- */
/* Tours                                                                  */
/* ---------------------------------------------------------------------- */

export const tourCreate = createInsertSchema(t.tours, {
  slug,
  fromPrice: rupees,
  singleSupplement: rupees.nullable().optional(),
  priceBands: z.array(priceBand).default([]),
  itinerary: z.array(itineraryDay).default([]),
  highlights: z.array(z.string()).default([]),
  includes: z.array(z.string()).default([]),
  excludes: z.array(z.string()).default([]),
  nights: z.number().int().positive(),
  days: z.number().int().positive(),
  groupSizeMax: z.number().int().positive(),
  /* The narrower per-catalogue range the shared `difficulty` enum cannot
   * express. See the note on the enum. */
  difficulty: z.enum(["easy", "moderate", "challenging"]),
})
  .omit(SERVER_OWNED)
  .strict()
  .superRefine((v, ctx) => {
    /*
     * `days` is `nights + 1` for every tour in the catalogue, and a mismatch
     * is always a typo rather than an unusual trip. Caught here because the
     * two columns are independent and Postgres has no cross-column CHECK for
     * it that would survive a legitimate exception later.
     */
    if (v.nights != null && v.days != null && v.days !== v.nights + 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["days"],
        message: `A ${v.nights}-night trip runs ${v.nights + 1} days.`,
      });
    }
    /*
     * The headline price is the rate for the smallest party — the band with
     * the lowest `fromPax`.
     *
     * `src/content/types.ts` calls `fromPrice` "the lowest per-person figure
     * across all bands", and that comment is wrong: per-person price *falls*
     * as the group grows, so the headline a couple sees is the **highest**
     * band, not the lowest. All 47 tours in the catalogue agree with the rule
     * below and none agree with the comment, so the data is the authority
     * here. Validating the comment instead made every real tour un-editable.
     */
    const bands = v.priceBands as
      { fromPax: number; perPerson: number }[] | undefined;
    if (bands?.length && v.fromPrice != null) {
      const smallestParty = bands.reduce((a, b) =>
        b.fromPax < a.fromPax ? b : a,
      );
      if (v.fromPrice !== smallestParty.perPerson) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fromPrice"],
          message:
            `The rate for ${smallestParty.fromPax} travellers is ` +
            `₹${smallestParty.perPerson.toLocaleString("en-IN")}; the headline ` +
            `price has to match it, because that is the figure the cards show.`,
        });
      }

      /*
       * Per-person price must not go up as the party grows. A band where it
       * does is a transposed pair of numbers, not an unusual deal — and it
       * would quote a group of eight more each than a couple. Every tour in
       * the catalogue satisfies this.
       */
      const ordered = [...bands].sort((a, b) => a.fromPax - b.fromPax);
      for (let i = 1; i < ordered.length; i += 1) {
        const prev = ordered[i - 1]!;
        const curr = ordered[i]!;
        if (curr.perPerson > prev.perPerson) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["priceBands", bands.indexOf(curr), "perPerson"],
            message:
              `A party of ${curr.fromPax} cannot pay more each ` +
              `(₹${curr.perPerson.toLocaleString("en-IN")}) than a party of ` +
              `${prev.fromPax} (₹${prev.perPerson.toLocaleString("en-IN")}).`,
          });
        }
      }

      /* Two bands starting at the same size is ambiguous: which one applies? */
      const sizes = new Set(bands.map((b) => b.fromPax));
      if (sizes.size !== bands.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["priceBands"],
          message: "Two bands cannot start at the same number of travellers.",
        });
      }
    }
  });
export const tourUpdate = tourCreate.innerType().partial();

/* ---------------------------------------------------------------------- */
/* Motorcycle expeditions                                                 */
/* ---------------------------------------------------------------------- */

export const motoCreate = createInsertSchema(t.motorcycleTours, {
  slug,
  fromPrice: rupees,
  pillionPrice: rupees,
  bikes: z.array(motorcycleOption).default([]),
  itinerary: z.array(itineraryDay).default([]),
  terrain: z.array(z.string()).default([]),
  supportVehicle: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
  includes: z.array(z.string()).default([]),
  excludes: z.array(z.string()).default([]),
  nights: z.number().int().positive(),
  days: z.number().int().positive(),
  distanceKm: z.number().int().positive(),
  maxAltitude: z.number().int(),
  groupSizeMax: z.number().int().positive(),
  difficulty: z.enum(["moderate", "challenging", "expert"]),
})
  .omit(SERVER_OWNED)
  .strict();
export const motoUpdate = motoCreate.partial();

/* ---------------------------------------------------------------------- */
/* Departures                                                             */
/* ---------------------------------------------------------------------- */

export const departureCreate = createInsertSchema(t.departures, {
  date: isoDate,
  endDate: isoDate,
  seatsLeft: z.number().int().min(0),
  perPerson: rupees,
  wasPerPerson: rupees.nullable().optional(),
})
  .omit(SERVER_OWNED)
  .strict()
  .superRefine((v, ctx) => {
    /* Mirrors `departures_exactly_one_parent`, so the caller gets a field
     * error instead of a constraint violation. */
    const parents = [v.tourId, v.motorcycleTourId].filter(Boolean).length;
    if (parents !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tourId"],
        message: "A departure belongs to exactly one tour or one expedition.",
      });
    }
    if (v.date && v.endDate && v.endDate < v.date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "A departure cannot end before it starts.",
      });
    }
  });
export const departureUpdate = departureCreate.innerType().partial();

/* ---------------------------------------------------------------------- */
/* Homestays                                                              */
/* ---------------------------------------------------------------------- */

export const homestayCreate = createInsertSchema(t.homestays, {
  slug,
  /*
   * `.nullable()` and NOT `.default(0)`. An absent rate means "ask us"; a
   * zero publishes a price a real business never quoted. The same applies to
   * rating and review count, which are factual claims about a named house.
   */
  fromPrice: rupees.nullable().optional(),
  maxGuests: z.number().int().positive().nullable().optional(),
  bedrooms: z.number().int().positive().nullable().optional(),
  rating: z.number().min(0).max(5).nullable().optional(),
  reviewCount: z.number().int().min(0).nullable().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  body: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  houseRules: z.array(z.string()).default([]),
  gallery: z.array(z.string()).default([]),
  suitability: z.array(z.enum(["couples", "families", "groups"])).default([]),
})
  .omit(SERVER_OWNED)
  .strict()
  .superRefine((v, ctx) => {
    /*
     * A review count without a rating, or a rating without a count, is half a
     * claim. Both or neither.
     */
    const hasRating = v.rating != null;
    const hasCount = v.reviewCount != null;
    if (hasRating !== hasCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [hasRating ? "reviewCount" : "rating"],
        message:
          "A rating and a review count go together — set both, or neither.",
      });
    }
  });
export const homestayUpdate = homestayCreate.innerType().partial();

export const homestayRoomCreate = createInsertSchema(t.homestayRooms, {
  perNight: rupees,
  sleeps: z.number().int().positive(),
  amenities: z.array(z.string()).default([]),
  gallery: z.array(z.string()).default([]),
})
  .omit(SERVER_OWNED)
  .strict();
export const homestayRoomUpdate = homestayRoomCreate.partial();

/* ---------------------------------------------------------------------- */
/* Events                                                                 */
/* ---------------------------------------------------------------------- */

export const eventCreate = createInsertSchema(t.events, {
  slug,
  startDate: isoDate,
  endDate: isoDate,
  fromPrice: rupees,
  body: z.array(z.string()).default([]),
  lineup: z.array(z.string()).default([]),
})
  .omit(SERVER_OWNED)
  .strict();
export const eventUpdate = eventCreate.partial();

export const ticketTierCreate = createInsertSchema(t.eventTicketTiers, {
  price: rupees,
  /* Null means unlimited — the content contract's own convention. Not 0,
   * which is a sold-out tier, and not -1, which is a bug. */
  remaining: z.number().int().min(0).nullable().optional(),
  perks: z.array(z.string()).default([]),
})
  .omit(SERVER_OWNED)
  .strict();
export const ticketTierUpdate = ticketTierCreate.partial();

/* ---------------------------------------------------------------------- */
/* Activities, cafés, journal, FAQs, policies                             */
/* ---------------------------------------------------------------------- */

export const activityCreate = createInsertSchema(t.activities, {
  slug,
  fromPrice: rupees,
  distanceKm: z.number().int().min(0),
  durationHours: z.number().positive(),
  groupSizeMax: z.number().int().positive(),
  body: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
  includes: z.array(z.string()).default([]),
  excludes: z.array(z.string()).default([]),
})
  .omit(SERVER_OWNED)
  .strict();
export const activityUpdate = activityCreate.partial();

export const cafeCreate = createInsertSchema(t.cafes, { slug })
  .omit(SERVER_OWNED)
  .strict();
export const cafeUpdate = cafeCreate.partial();

export const journalCreate = createInsertSchema(t.journalPosts, {
  slug,
  publishedAt: isoDate,
  readingMinutes: z.number().int().positive(),
  body: z.array(z.string()).default([]),
})
  .omit(SERVER_OWNED)
  .strict();
export const journalUpdate = journalCreate.partial();

export const faqCreate = createInsertSchema(t.faqs).omit(SERVER_OWNED).strict();
export const faqUpdate = faqCreate.partial();

export const policyCreate = createInsertSchema(t.policies, {
  slug,
  effectiveFrom: isoDate,
  sections: z.array(policySection).default([]),
})
  .omit(SERVER_OWNED)
  .strict();
export const policyUpdate = policyCreate.partial();

/* ---------------------------------------------------------------------- */
/* Site copy and the planner                                              */
/* ---------------------------------------------------------------------- */

export const siteContentCreate = createInsertSchema(t.siteContent)
  .omit({ createdAt: true, updatedAt: true })
  .strict();
export const siteContentUpdate = siteContentCreate
  .partial()
  .omit({ key: true });

export const placeOptionsCreate = createInsertSchema(t.placeOptions)
  .omit({ createdAt: true, updatedAt: true })
  .strict();
export const placeOptionsUpdate = placeOptionsCreate
  .partial()
  .omit({ place: true });

export const dayTemplateCreate = createInsertSchema(t.dayTemplates)
  .omit({ createdAt: true, updatedAt: true })
  .strict();
export const dayTemplateUpdate = dayTemplateCreate
  .partial()
  .omit({ key: true });

export const gatewayCreate = createInsertSchema(t.gatewayPoints)
  .omit({ createdAt: true, updatedAt: true })
  .strict();
export const gatewayUpdate = gatewayCreate.partial().omit({ key: true });

export const routeCreate = createInsertSchema(t.routes, {
  maxDays: z.number().int().positive(),
})
  .omit({ createdAt: true, updatedAt: true })
  .strict();
export const routeUpdate = routeCreate.partial().omit({ state: true });

export const localGuideCreate = createInsertSchema(t.localGuides)
  .omit({ createdAt: true, updatedAt: true })
  .strict();
export const localGuideUpdate = localGuideCreate
  .partial()
  .omit({ state: true });

export const quoteTermsCreate = createInsertSchema(t.quoteTerms, {
  items: z.array(z.string()).default([]),
})
  .omit({ createdAt: true, updatedAt: true })
  .strict();
export const quoteTermsUpdate = quoteTermsCreate.partial().omit({ key: true });

export const amenityCreate = createInsertSchema(t.amenities)
  .omit({ createdAt: true, updatedAt: true })
  .strict();
export const amenityUpdate = amenityCreate.partial().omit({ key: true });
