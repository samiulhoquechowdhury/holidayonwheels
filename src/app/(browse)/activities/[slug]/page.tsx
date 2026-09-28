import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailLayout, DetailSections } from "@/components/layout/DetailLayout";
import { SectionShell } from "@/components/layout/SectionShell";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Reveal } from "@/components/layout/Reveal";
import { ActivityCard } from "@/components/cards/ResultCard";
import { LuxeButtonLink } from "@/components/primitives/LuxeButton";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import {
  ACTIVITY_CATEGORIES,
  getActivities,
  getActivityBySlug,
  getRelatedActivities,
} from "@/content/activities";
import { activityShots } from "@/config/showcase";
import { formatINR } from "@/lib/currency";
import type { Activity } from "@/content/types";

export function generateStaticParams() {
  return getActivities().map((activity) => ({ slug: activity.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const activity = getActivityBySlug(slug);
  if (!activity) return {};
  return { title: activity.name, description: activity.intro.slice(0, 155) };
}

/**
 * One activity.
 *
 * Renders through the same `DetailLayout` as trips, homestays and events, so
 * a half-day on the river reads as the same kind of object as a nine-day
 * expedition — gallery, title block, sticky panel, tabbed body.
 *
 * The panel is not a booking widget. These are not sold on their own: they go
 * into a trip, and the honest thing for the panel to do is state the price,
 * say when it runs and hand you to the planner rather than take a card for a
 * two-hour boat ride.
 */
export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const activity = getActivityBySlug(slug);
  if (!activity) notFound();

  const related = getRelatedActivities(slug, 3);
  const categoryLabel =
    ACTIVITY_CATEGORIES.find((c) => c.id === activity.category)?.label ??
    activity.category;

  return (
    <>
      <DetailLayout
        seed={activity.slug}
        region="assam"
        eyebrow={`${categoryLabel} · ${activity.locality}`}
        title={activity.name}
        strapline={activity.strapline}
        chips={[
          activity.durationLabel,
          `Up to ${activity.groupSizeMax}`,
          `From ${formatINR(activity.fromPrice)} per person`,
        ]}
        gallery={[
          { alt: activity.heroAlt, src: activity.image ?? activityShots[slug] },
          { alt: `${activity.name} — ${activity.locality}` },
          { alt: `On the way to ${activity.name}, near Guwahati` },
        ]}
        panel={<ActivityPanel activity={activity} />}
      >
        <DetailSections
          sections={[
            {
              id: "about",
              label: "About",
              content: (
                <div className="max-w-prose">
                  <p className="text-22 text-ink-soft">{activity.intro}</p>
                  {activity.body.map((paragraph) => (
                    <p key={paragraph} className="mt-6 text-16 text-ink-soft">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ),
            },
            {
              id: "highlights",
              label: "Highlights",
              content: (
                <ul className="flex max-w-prose flex-col gap-4">
                  {activity.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex gap-4 border-b border-[var(--ink-hairline)] pb-4 text-18"
                    >
                      <span aria-hidden="true" className="text-clay">
                        —
                      </span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              ),
            },
            {
              id: "practical",
              label: "Practical",
              content: (
                <dl className="grid gap-10 sm:grid-cols-2">
                  <Fact
                    label="Where you meet us"
                    value={activity.meetingPoint}
                  />
                  <Fact label="When it runs" value={activity.bestTime} />
                  <Fact label="How long" value={activity.durationLabel} />
                  <Fact
                    label="Group size"
                    value={`Up to ${activity.groupSizeMax} people`}
                  />
                </dl>
              ),
            },
            {
              id: "included",
              label: "What's included",
              content: (
                <div className="grid gap-12 sm:grid-cols-2">
                  <div>
                    <Eyebrow>Included</Eyebrow>
                    <ul className="mt-5 flex flex-col gap-3">
                      {activity.includes.map((item) => (
                        <li key={item} className="text-16 text-ink-soft">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Eyebrow>Not included</Eyebrow>
                    <ul className="mt-5 flex flex-col gap-3">
                      {activity.excludes.map((item) => (
                        <li key={item} className="text-16 text-ink-soft">
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

      {related.length > 0 ? (
        <SectionShell tint="shell">
          <SectionHeader
            eyebrow="Also within a day of the city"
            title="Other things to do"
            link={{ href: "/activities", label: "All activities" }}
            align="split"
          />
          <ul className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {related.map((other, index) => (
              <li key={other.slug}>
                <Reveal delay={index * 0.06}>
                  <ActivityCard
                    activity={other}
                    sizes="(max-width: 640px) 100vw, 400px"
                  />
                </Reveal>
              </li>
            ))}
          </ul>
        </SectionShell>
      ) : null}
    </>
  );
}

/**
 * The sticky panel.
 *
 * A price, the two facts that decide whether it fits your day, and the way
 * into the planner. No date picker and no card: an activity is added to a
 * trip, and pretending otherwise would take a booking we cannot honour on its
 * own.
 */
function ActivityPanel({ activity }: { activity: Activity }) {
  return (
    <div className="rounded-[var(--radius-panel)] border border-[var(--ink-hairline)] bg-paper p-7">
      <p className="u-label text-ink-faint">From</p>
      <p className="u-num mt-2 font-display text-48 leading-none">
        {formatINR(activity.fromPrice)}
      </p>
      <p className="mt-2 text-14 text-ink-soft">per person</p>

      <dl className="mt-7 flex flex-col gap-4 border-t border-[var(--ink-hairline)] pt-6">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="u-label text-ink-faint">How long</dt>
          <dd className="text-right text-14">{activity.durationLabel}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="u-label text-ink-faint">When</dt>
          <dd className="text-right text-14">{activity.bestTime}</dd>
        </div>
        <div>
          <dt className="u-label text-ink-faint">Meet</dt>
          <dd className="mt-1.5 text-14 text-ink-soft">
            {activity.meetingPoint}
          </dd>
        </div>
      </dl>

      <LuxeButtonLink
        href="/destinations#plan"
        variant="clay"
        block
        className="mt-7"
      >
        Add it to a trip
      </LuxeButtonLink>
      <p className="mt-3 text-14 text-ink-faint">
        Activities are added to a trip rather than booked on their own. Plan the
        days and tell us which mornings are free.
      </p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="u-label text-ink-faint">{label}</dt>
      <dd className="mt-2 text-18">{value}</dd>
    </div>
  );
}
