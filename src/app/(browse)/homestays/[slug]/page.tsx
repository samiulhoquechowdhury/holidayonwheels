import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionShell } from "@/components/layout/SectionShell";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Reveal } from "@/components/layout/Reveal";
import { Media } from "@/components/primitives/Media";
import { StayBookingWidget } from "@/components/booking/StayBookingWidget";
import { Amenities } from "@/components/homestays/Amenities";
import { HouseLocator } from "@/components/homestays/LocatorMap";
import { StayCard, TourCard } from "@/components/cards/ResultCard";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Chip } from "@/components/primitives/Chip";
import { formatINR } from "@/lib/currency";
import { toISO } from "@/lib/date";
import {
  getHomestayBySlug,
  getHomestays,
  getHomestaysByState,
} from "@/content/homestays";
import { getDestinationName } from "@/content/destinations";
import type { MealPlan } from "@/content/types";
import { getToursByState, toTourSummary } from "@/content/tours";

export function generateStaticParams() {
  return getHomestays().map((stay) => ({ slug: stay.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const stay = getHomestayBySlug(slug);
  if (!stay) return {};
  return { title: stay.name, description: stay.intro.slice(0, 155) };
}

/**
 * What each meal plan actually means on the night, in a sentence.
 *
 * The index shows these as two-word labels because it is comparing twelve
 * houses; here there is room to say what you will be eating and with whom,
 * which on a homestay is most of the decision.
 */
/** The two-word label, for the specs line. */
const MEALS: Record<MealPlan, string> = {
  "full-board": "All meals",
  "half-board": "Breakfast and dinner",
  breakfast: "Breakfast",
  none: "No meals",
};

const MEALS_NOTE: Record<MealPlan, string> = {
  "full-board":
    "All three meals are cooked in the house and eaten with the family. Tell us about anything you cannot eat and the kitchen will work around it.",
  "half-board":
    "Breakfast and dinner are cooked in the house. Lunch is your own, and your hosts will tell you where to find it.",
  breakfast:
    "Breakfast is included. The family will point you at the places they eat the rest of the time.",
  none: "No meals are included. There is somewhere to eat within walking distance and your hosts will say which.",
};

export default async function HomestayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const stay = getHomestayBySlug(slug);
  if (!stay) notFound();

  // Computed on the server so the default check-in date is identical in the
  // HTML and on hydration.
  const today = toISO(new Date());

  const nearby = getHomestaysByState(stay.state).filter((s) => s.slug !== slug);
  const tours = getToursByState(stay.state).slice(0, 3);
  const stateName = getDestinationName(stay.state);

  return (
    <>
      <article className="pt-[var(--header-h)]">
        <div className="u-container-wide pt-10 lg:pt-14">
          {/*
           * Title above the photograph, which is the one structural thing
           * that makes a listing read as a listing rather than as an article
           * about a house. Everything else on this page follows from it: you
           * know what you are looking at before you look at it, and the
           * rating and the place are the next two things you want.
           *
           * Deliberately not wrapped in `Reveal` — this is the LCP element
           * and a scroll reveal starts at opacity 0.
           */}
          <h1 className="lg:text-56 max-w-3xl text-36">{stay.name}</h1>
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-16 text-ink-soft">
            <span className="u-num">
              <span aria-hidden="true" className="text-clay-ink">
                ★
              </span>{" "}
              {stay.rating.toFixed(1)}
            </span>
            <span aria-hidden="true">·</span>
            <span className="u-num">{stay.reviewCount} reviews</span>
            <span aria-hidden="true">·</span>
            <span>
              {stay.locality}, {stateName}
            </span>
          </p>

          {/*
           * One photograph, wide.
           *
           * Airbnb runs a five-up grid here with "show all photos" over it.
           * There is one photograph per house in the content, and filling
           * four more slots with generated placeholder art would read as
           * four more rooms nobody has seen. One real picture, given the
           * width the grid would have had.
           */}
          <div className="mt-8 overflow-hidden rounded-[var(--radius-media)]">
            <Media
              alt={stay.heroAlt}
              src={stay.image}
              seed={stay.slug}
              region={stay.region}
              aspect="16/9"
              priority
              sizes="(max-width: 1024px) 100vw, 1200px"
            />
          </div>
        </div>

        <div className="u-container pt-14 pb-24 lg:pt-20 lg:pb-36">
          <div className="grid gap-x-20 gap-y-12 lg:grid-cols-[1fr_380px]">
            <div className="min-w-0 divide-y divide-[var(--ink-hairline)]">
              {/* --- Who keeps it, and what you get ------------------- */}
              <Block first>
                <h2 className="text-22 lg:text-28">
                  {stay.bedrooms === 1 ? "A room" : "A house"} kept by{" "}
                  {stay.hostName}
                </h2>
                <p className="u-label mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-faint">
                  <span>Sleeps {stay.maxGuests}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {stay.bedrooms} {stay.bedrooms === 1 ? "room" : "rooms"}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{MEALS[stay.mealsIncluded]}</span>
                </p>
                <p className="mt-6 max-w-prose text-18 text-ink-soft">
                  {stay.intro}
                </p>

                {/* The body continues the intro — same block, because a
                    hairline between them reads as a section break in the
                    middle of one description. */}
                {stay.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-5 max-w-prose text-16 text-ink-soft"
                  >
                    {paragraph}
                  </p>
                ))}
              </Block>

              {/* --- Rooms ------------------------------------------- */}
              <Block>
                <h2 className="text-22 lg:text-28">Where you sleep</h2>
                <p className="mt-4 max-w-prose text-16 text-ink-soft">
                  {stay.bedrooms} rooms, sleeping {stay.maxGuests} between them.
                  Rates are per room per night, set by the house, and you can
                  take one room or all of them.
                </p>
                <ul className="mt-8 grid gap-6 sm:grid-cols-2">
                  {stay.rooms.map((room) => (
                    <li
                      key={room.name}
                      className="flex flex-col rounded-[var(--radius-card)] border border-[var(--ink-hairline)] p-6"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="text-18">{room.name}</h3>
                        <p className="u-num shrink-0 text-16">
                          {formatINR(room.perNight)}
                        </p>
                      </div>
                      <p className="u-label mt-2 text-ink-faint">
                        Sleeps {room.sleeps} · per night
                      </p>
                      <p className="mt-4 flex-1 text-16 text-ink-soft">
                        {room.description}
                      </p>
                      <ul className="mt-5 flex flex-wrap gap-1.5">
                        {room.amenities.map((amenity) => (
                          <li key={amenity}>
                            <Chip>{amenity}</Chip>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </Block>

              {/* --- Amenities --------------------------------------- */}
              <Block>
                <h2 className="text-22 lg:text-28">What this place offers</h2>
                <Amenities amenities={stay.amenities} className="mt-8" />
              </Block>

              {/* --- The map ----------------------------------------- */}
              <Block>
                <h2 className="text-22 lg:text-28">Where you will be</h2>
                <HouseLocator stay={stay} tall className="mt-8" />
                <p className="mt-6 max-w-prose text-16 text-ink-soft">
                  {stateName}. The pin is the neighbourhood, not the doorstep —
                  exact directions come with your booking confirmation, which is
                  how the family would rather have it.
                </p>
              </Block>

              {/* --- The host ---------------------------------------- */}
              <Block>
                <h2 className="text-22 lg:text-28">Meet your hosts</h2>
                <div className="mt-8 max-w-prose rounded-[var(--radius-card)] bg-shell p-6 lg:p-8">
                  <Eyebrow tone="sage">Hosted by</Eyebrow>
                  <p className="mt-4 text-22">{stay.hostName}</p>
                  <p className="mt-4 text-16 text-ink-soft">{stay.hostStory}</p>
                </div>
              </Block>

              {/* --- Things to know ---------------------------------- */}
              <Block>
                <h2 className="text-22 lg:text-28">Things to know</h2>
                <div className="mt-8 grid gap-10 sm:grid-cols-3">
                  <div>
                    <Eyebrow className="mb-4">House rules</Eyebrow>
                    <ul className="flex flex-col gap-3">
                      {stay.houseRules.map((item) => (
                        <li key={item} className="text-16 text-ink-soft">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Eyebrow className="mb-4">Meals</Eyebrow>
                    <p className="text-16 text-ink-soft">
                      {MEALS_NOTE[stay.mealsIncluded]}
                    </p>
                  </div>
                  <div>
                    <Eyebrow className="mb-4">Booking</Eyebrow>
                    <p className="text-16 text-ink-soft">
                      Nothing is payable here. We check the dates with the
                      family and confirm the rate in writing, usually the same
                      day.
                    </p>
                  </div>
                </div>
              </Block>
            </div>

            {/* Sticky panel. Ordered first on mobile so the rate is above
                the fold, as it is on the reference. */}
            <div className="order-first lg:order-none">
              <div className="lg:sticky lg:top-[calc(var(--header-h)+2.5rem)]">
                <StayBookingWidget stay={stay} today={today} />
              </div>
            </div>
          </div>
        </div>
      </article>

      {tours.length > 0 ? (
        <>
          <SectionShell tint="sand">
            <SectionHeader
              eyebrow="Guided trips nearby"
              title={`Tours through ${getDestinationName(stay.state)}`}
              intro="Book the stay and the trip together and we line the transfers up between them."
              link={{ href: "/destinations#plan", label: "Plan a trip" }}
              align="split"
            />
            <ul className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {tours.map((tour, index) => (
                <li key={tour.slug}>
                  <Reveal delay={index * 0.06}>
                    <TourCard
                      tour={toTourSummary(tour)}
                      sizes="(max-width: 640px) 100vw, 400px"
                    />
                  </Reveal>
                </li>
              ))}
            </ul>
          </SectionShell>
        </>
      ) : null}

      {nearby.length > 0 ? (
        <>
          <SectionShell tint="shell">
            <SectionHeader
              eyebrow="Also in this state"
              title="Other houses nearby"
              link={{ href: "/homestays", label: "All homestays" }}
              align="split"
            />
            <ul className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {nearby.map((other, index) => (
                <li key={other.slug}>
                  <Reveal delay={index * 0.06}>
                    <StayCard
                      stay={other}
                      sizes="(max-width: 640px) 100vw, 400px"
                    />
                  </Reveal>
                </li>
              ))}
            </ul>
          </SectionShell>
        </>
      ) : null}
    </>
  );
}

/**
 * One section of the listing body.
 *
 * Airbnb separates these with a hairline and nothing else — no tabs, no
 * sticky rail, no eyebrow. The page is read top to bottom once, and a
 * navigation aid for seven short sections is furniture. The divider comes
 * from `divide-y` on the parent, so this only owns its own spacing.
 */
function Block({
  first = false,
  children,
}: {
  first?: boolean;
  children: React.ReactNode;
}) {
  return <section className={first ? "pb-12" : "py-12"}>{children}</section>;
}
