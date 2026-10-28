import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailLayout, DetailSections } from "@/components/layout/DetailLayout";
import { SectionShell } from "@/components/layout/SectionShell";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Reveal } from "@/components/layout/Reveal";
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
const MEALS_NOTE: Record<MealPlan, string> = {
  "full-board":
    "All three meals are cooked in the house and eaten with the family. Tell us about anything you cannot eat and the kitchen will work around it.",
  "half-board":
    "Breakfast and dinner are cooked in the house. Lunch is your own, and your hosts will tell you where to find it.",
  breakfast:
    "Breakfast is included. The family will point you at the places they eat the rest of the time.",
  none: "No meals are included. There is somewhere to eat within walking distance and your hosts will say which.",
};

export default async function HomestayDetailPage({
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

  return (
    <>
      <DetailLayout
        seed={stay.slug}
        region={stay.region}
        eyebrow={`${stay.locality} · ${getDestinationName(stay.state)}`}
        title={stay.name}
        strapline={stay.strapline}
        chips={[
          `Sleeps ${stay.maxGuests}`,
          `${stay.bedrooms} bedrooms`,
          `${stay.rating.toFixed(1)} from ${stay.reviewCount} reviews`,
        ]}
        gallery={[
          { alt: stay.heroAlt, src: stay.image },
          { alt: `A guest room at ${stay.name}, ${stay.locality}` },
          { alt: `The view from ${stay.name} over ${stay.locality}` },
        ]}
        panel={<StayBookingWidget stay={stay} today={today} />}
      >
        <DetailSections
          sections={[
            {
              id: "about",
              label: "About the house",
              content: (
                <div className="max-w-prose">
                  <p className="text-18 text-ink-soft">{stay.intro}</p>
                  {stay.body.map((paragraph) => (
                    <p key={paragraph} className="mt-5 text-16 text-ink-soft">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ),
            },
            {
              id: "host",
              label: "Your hosts",
              content: (
                <div className="max-w-prose rounded-[var(--radius-card)] bg-shell p-6 lg:p-8">
                  <Eyebrow tone="sage">Hosted by</Eyebrow>
                  <p className="mt-4 text-28">{stay.hostName}</p>
                  <p className="mt-4 text-16 text-ink-soft">{stay.hostStory}</p>
                </div>
              ),
            },
            {
              id: "rooms",
              label: "Where you sleep",
              content: (
                <>
                  <p className="mb-8 max-w-prose text-16 text-ink-soft">
                    {stay.bedrooms} rooms, sleeping {stay.maxGuests} between
                    them. Rates are per room per night, set by the house, and
                    you can take one room or all of them.
                  </p>
                  <ul className="grid gap-8 sm:grid-cols-2">
                    {stay.rooms.map((room) => (
                      <li
                        key={room.name}
                        className="flex flex-col rounded-[var(--radius-card)] bg-shell p-6"
                      >
                        <div className="flex items-baseline justify-between gap-3">
                          <h3 className="text-22">{room.name}</h3>
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
                </>
              ),
            },
            {
              id: "amenities",
              label: "What this place offers",
              content: <Amenities amenities={stay.amenities} />,
            },
            {
              id: "where",
              label: "Where you will be",
              content:
                (
                  /*
                   * One column. The section's content measures 700px, so a
                   * `[1fr_320px]` split left the map 324px wide with the text
                   * beside it — a map too small to orient anybody and a
                   * paragraph too narrow to read. Full width, note underneath.
                   */
                  <div className="min-w-0">
                    <HouseLocator stay={stay} tall />
                    <p className="mt-6 max-w-prose text-16 text-ink-soft">
                      {getDestinationName(stay.state)}. The pin is the
                      neighbourhood, not the doorstep — exact directions come
                      with your booking confirmation, which is how the family
                      would rather have it.
                    </p>
                  </div>
                ),
            },
            {
              id: "practical",
              label: "Things to know",
              content: (
                <div className="grid gap-12 sm:grid-cols-2">
                  <div>
                    <Eyebrow tone="sage" className="mb-4">
                      Meals
                    </Eyebrow>
                    <p className="text-16 text-ink-soft">
                      {MEALS_NOTE[stay.mealsIncluded]}
                    </p>
                    <Eyebrow tone="sage" className="mt-8 mb-4">
                      Booking
                    </Eyebrow>
                    <p className="text-16 text-ink-soft">
                      Nothing is payable here. We check the dates with the
                      family and confirm the rate in writing, usually the same
                      day.
                    </p>
                  </div>
                  <div>
                    <Eyebrow className="mb-4">Before you book</Eyebrow>
                    <ul className="flex flex-col gap-3">
                      {stay.houseRules.map((item) => (
                        <li
                          key={item}
                          className="flex gap-3 text-16 text-ink-soft"
                        >
                          <span aria-hidden="true" className="text-ink-faint">
                            —
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </DetailLayout>

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
