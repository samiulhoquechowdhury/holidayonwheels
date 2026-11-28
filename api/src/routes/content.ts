import { Router } from "express";
import { asc, desc } from "drizzle-orm";
import * as t from "../db/schema/index";
import { resourceRouter } from "../lib/crud";
import * as v from "../schemas/resources";

/**
 * Every editable resource, declared rather than coded.
 *
 * Each entry is the whole definition of a resource's seven endpoints. The
 * behaviour lives in `resourceRouter`; what is here is only what differs —
 * the table, its validators, what `?q=` searches and how it sorts.
 *
 * ## Why the ordering is explicit everywhere
 *
 * Postgres returns rows in no particular order unless asked, and "no
 * particular order" is stable right up until a row is updated and moves. An
 * admin list that silently reorders itself between page loads looks like
 * data loss. Every resource therefore has a deterministic sort, and every
 * sort ends in a unique column so ties cannot reshuffle.
 */
export const contentRouter: Router = Router();

contentRouter.use(
  "/destinations",
  resourceRouter({
    name: "destinations",
    table: t.destinations,
    idColumn: t.destinations.id,
    slugColumn: t.destinations.slug,
    labelColumn: t.destinations.name,
    statusColumn: t.destinations.status,
    searchColumns: [t.destinations.name, t.destinations.tagline],
    defaultOrder: [asc(t.destinations.sortOrder), asc(t.destinations.name)],
    createSchema: v.destinationCreate,
    updateSchema: v.destinationUpdate,
  }),
);

contentRouter.use(
  "/tours",
  resourceRouter({
    name: "tours",
    table: t.tours,
    idColumn: t.tours.id,
    slugColumn: t.tours.slug,
    labelColumn: t.tours.title,
    statusColumn: t.tours.status,
    searchColumns: [t.tours.title, t.tours.slug, t.tours.strapline],
    filterColumns: { difficulty: t.tours.difficulty, region: t.tours.region },
    defaultOrder: [asc(t.tours.sortOrder), asc(t.tours.title)],
    createSchema: v.tourCreate,
    updateSchema: v.tourUpdate,
  }),
);

contentRouter.use(
  "/motorcycle-tours",
  resourceRouter({
    name: "motorcycle_tours",
    table: t.motorcycleTours,
    idColumn: t.motorcycleTours.id,
    slugColumn: t.motorcycleTours.slug,
    labelColumn: t.motorcycleTours.title,
    statusColumn: t.motorcycleTours.status,
    searchColumns: [t.motorcycleTours.title, t.motorcycleTours.slug],
    filterColumns: { difficulty: t.motorcycleTours.difficulty },
    defaultOrder: [
      asc(t.motorcycleTours.sortOrder),
      asc(t.motorcycleTours.title),
    ],
    createSchema: v.motoCreate,
    updateSchema: v.motoUpdate,
  }),
);

contentRouter.use(
  "/departures",
  resourceRouter({
    name: "departures",
    table: t.departures,
    idColumn: t.departures.id,
    /* No status column: a departure is not published, it exists or it does
     * not. `resourceRouter` leaves out the publish endpoints accordingly. */
    defaultOrder: [asc(t.departures.date), asc(t.departures.id)],
    filterColumns: {
      tourId: t.departures.tourId,
      motorcycleTourId: t.departures.motorcycleTourId,
      status: t.departures.status,
    },
    createSchema: v.departureCreate,
    updateSchema: v.departureUpdate,
  }),
);

contentRouter.use(
  "/homestays",
  resourceRouter({
    name: "homestays",
    table: t.homestays,
    idColumn: t.homestays.id,
    slugColumn: t.homestays.slug,
    labelColumn: t.homestays.name,
    statusColumn: t.homestays.status,
    searchColumns: [
      t.homestays.name,
      t.homestays.slug,
      t.homestays.locality,
      t.homestays.strapline,
    ],
    filterColumns: { state: t.homestays.state },
    defaultOrder: [asc(t.homestays.sortOrder), asc(t.homestays.name)],
    createSchema: v.homestayCreate,
    updateSchema: v.homestayUpdate,
  }),
);

contentRouter.use(
  "/homestay-rooms",
  resourceRouter({
    name: "homestay_rooms",
    table: t.homestayRooms,
    idColumn: t.homestayRooms.id,
    labelColumn: t.homestayRooms.name,
    filterColumns: { homestayId: t.homestayRooms.homestayId },
    defaultOrder: [asc(t.homestayRooms.sortOrder), asc(t.homestayRooms.id)],
    createSchema: v.homestayRoomCreate,
    updateSchema: v.homestayRoomUpdate,
  }),
);

contentRouter.use(
  "/events",
  resourceRouter({
    name: "events",
    table: t.events,
    idColumn: t.events.id,
    slugColumn: t.events.slug,
    labelColumn: t.events.name,
    statusColumn: t.events.status,
    searchColumns: [t.events.name, t.events.slug, t.events.venue],
    filterColumns: { state: t.events.state, category: t.events.category },
    defaultOrder: [asc(t.events.startDate), asc(t.events.name)],
    createSchema: v.eventCreate,
    updateSchema: v.eventUpdate,
  }),
);

contentRouter.use(
  "/event-ticket-tiers",
  resourceRouter({
    name: "event_ticket_tiers",
    table: t.eventTicketTiers,
    idColumn: t.eventTicketTiers.id,
    labelColumn: t.eventTicketTiers.name,
    filterColumns: { eventId: t.eventTicketTiers.eventId },
    defaultOrder: [
      asc(t.eventTicketTiers.sortOrder),
      asc(t.eventTicketTiers.id),
    ],
    createSchema: v.ticketTierCreate,
    updateSchema: v.ticketTierUpdate,
  }),
);

contentRouter.use(
  "/activities",
  resourceRouter({
    name: "activities",
    table: t.activities,
    idColumn: t.activities.id,
    slugColumn: t.activities.slug,
    labelColumn: t.activities.name,
    statusColumn: t.activities.status,
    searchColumns: [
      t.activities.name,
      t.activities.slug,
      t.activities.locality,
    ],
    filterColumns: { category: t.activities.category },
    defaultOrder: [asc(t.activities.sortOrder), asc(t.activities.name)],
    createSchema: v.activityCreate,
    updateSchema: v.activityUpdate,
  }),
);

contentRouter.use(
  "/cafes",
  resourceRouter({
    name: "cafes",
    table: t.cafes,
    idColumn: t.cafes.id,
    slugColumn: t.cafes.slug,
    labelColumn: t.cafes.name,
    statusColumn: t.cafes.status,
    searchColumns: [t.cafes.name, t.cafes.locality],
    defaultOrder: [asc(t.cafes.sortOrder), asc(t.cafes.name)],
    createSchema: v.cafeCreate,
    updateSchema: v.cafeUpdate,
  }),
);

contentRouter.use(
  "/journal",
  resourceRouter({
    name: "journal_posts",
    table: t.journalPosts,
    idColumn: t.journalPosts.id,
    slugColumn: t.journalPosts.slug,
    labelColumn: t.journalPosts.title,
    statusColumn: t.journalPosts.status,
    searchColumns: [
      t.journalPosts.title,
      t.journalPosts.slug,
      t.journalPosts.tag,
    ],
    filterColumns: { tag: t.journalPosts.tag },
    /* Newest first: a journal index is chronological. */
    defaultOrder: [desc(t.journalPosts.publishedAt), asc(t.journalPosts.id)],
    createSchema: v.journalCreate,
    updateSchema: v.journalUpdate,
  }),
);

contentRouter.use(
  "/faqs",
  resourceRouter({
    name: "faqs",
    table: t.faqs,
    idColumn: t.faqs.id,
    labelColumn: t.faqs.question,
    statusColumn: t.faqs.status,
    searchColumns: [t.faqs.question, t.faqs.answer],
    filterColumns: { topic: t.faqs.topic },
    defaultOrder: [asc(t.faqs.sortOrder), asc(t.faqs.id)],
    createSchema: v.faqCreate,
    updateSchema: v.faqUpdate,
  }),
);

contentRouter.use(
  "/policies",
  resourceRouter({
    name: "policies",
    table: t.policies,
    idColumn: t.policies.id,
    slugColumn: t.policies.slug,
    labelColumn: t.policies.title,
    statusColumn: t.policies.status,
    searchColumns: [t.policies.title, t.policies.slug],
    defaultOrder: [asc(t.policies.title)],
    createSchema: v.policyCreate,
    updateSchema: v.policyUpdate,
  }),
);

/* --- Site copy and the planner --------------------------------------- */

contentRouter.use(
  "/site-content",
  resourceRouter({
    name: "site_content",
    table: t.siteContent,
    /* Keyed tables have no surrogate id; the key is both. */
    idColumn: t.siteContent.key,
    slugColumn: t.siteContent.key,
    labelColumn: t.siteContent.label,
    searchColumns: [t.siteContent.key, t.siteContent.label],
    filterColumns: { group: t.siteContent.group },
    defaultOrder: [asc(t.siteContent.group), asc(t.siteContent.sortOrder)],
    createSchema: v.siteContentCreate,
    updateSchema: v.siteContentUpdate,
  }),
);

contentRouter.use(
  "/place-options",
  resourceRouter({
    name: "place_options",
    table: t.placeOptions,
    idColumn: t.placeOptions.place,
    slugColumn: t.placeOptions.place,
    labelColumn: t.placeOptions.place,
    statusColumn: t.placeOptions.status,
    searchColumns: [t.placeOptions.place],
    filterColumns: { state: t.placeOptions.state },
    defaultOrder: [asc(t.placeOptions.place)],
    createSchema: v.placeOptionsCreate,
    updateSchema: v.placeOptionsUpdate,
  }),
);

contentRouter.use(
  "/day-templates",
  resourceRouter({
    name: "day_templates",
    table: t.dayTemplates,
    idColumn: t.dayTemplates.key,
    slugColumn: t.dayTemplates.key,
    labelColumn: t.dayTemplates.title,
    statusColumn: t.dayTemplates.status,
    searchColumns: [t.dayTemplates.key, t.dayTemplates.title],
    defaultOrder: [asc(t.dayTemplates.key)],
    createSchema: v.dayTemplateCreate,
    updateSchema: v.dayTemplateUpdate,
  }),
);

contentRouter.use(
  "/gateway-points",
  resourceRouter({
    name: "gateway_points",
    table: t.gatewayPoints,
    idColumn: t.gatewayPoints.key,
    slugColumn: t.gatewayPoints.key,
    labelColumn: t.gatewayPoints.label,
    statusColumn: t.gatewayPoints.status,
    searchColumns: [t.gatewayPoints.key, t.gatewayPoints.label],
    defaultOrder: [asc(t.gatewayPoints.key)],
    createSchema: v.gatewayCreate,
    updateSchema: v.gatewayUpdate,
  }),
);

contentRouter.use(
  "/routes",
  resourceRouter({
    name: "routes",
    table: t.routes,
    idColumn: t.routes.state,
    slugColumn: t.routes.state,
    labelColumn: t.routes.state,
    statusColumn: t.routes.status,
    defaultOrder: [asc(t.routes.state)],
    createSchema: v.routeCreate,
    updateSchema: v.routeUpdate,
  }),
);

contentRouter.use(
  "/local-guides",
  resourceRouter({
    name: "local_guides",
    table: t.localGuides,
    idColumn: t.localGuides.state,
    slugColumn: t.localGuides.state,
    labelColumn: t.localGuides.state,
    statusColumn: t.localGuides.status,
    defaultOrder: [asc(t.localGuides.state)],
    createSchema: v.localGuideCreate,
    updateSchema: v.localGuideUpdate,
  }),
);

contentRouter.use(
  "/quote-terms",
  resourceRouter({
    name: "quote_terms",
    table: t.quoteTerms,
    idColumn: t.quoteTerms.key,
    slugColumn: t.quoteTerms.key,
    labelColumn: t.quoteTerms.label,
    defaultOrder: [asc(t.quoteTerms.key)],
    createSchema: v.quoteTermsCreate,
    updateSchema: v.quoteTermsUpdate,
  }),
);

contentRouter.use(
  "/amenities",
  resourceRouter({
    name: "amenities",
    table: t.amenities,
    idColumn: t.amenities.key,
    slugColumn: t.amenities.key,
    labelColumn: t.amenities.label,
    searchColumns: [t.amenities.key, t.amenities.label],
    filterColumns: { group: t.amenities.group },
    defaultOrder: [asc(t.amenities.group), asc(t.amenities.sortOrder)],
    createSchema: v.amenityCreate,
    updateSchema: v.amenityUpdate,
  }),
);
