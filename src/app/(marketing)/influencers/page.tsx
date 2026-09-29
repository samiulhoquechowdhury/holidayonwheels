import type { Metadata } from "next";
import Image from "next/image";
import type { Route } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { SectionShell } from "@/components/layout/SectionShell";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Rise } from "@/components/motion/Rise";
import { Reveal } from "@/components/layout/Reveal";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Accent } from "@/components/primitives/Accent";
import { LuxeButtonLink } from "@/components/primitives/LuxeButton";
import { creatorReels, creatorStills, creatorTerms } from "@/config/creators";
import { cn } from "@/lib/cn";
import type { CreatorReel, CreatorStill } from "@/config/creators";

export const metadata: Metadata = {
  title: "Creator programme",
  description:
    "Ride with us and shoot it. A seat on a scheduled departure across the eight states of Northeast India, in exchange for the work you were going to make anyway.",
};

/**
 * The creator programme.
 *
 * Two audiences arrive here and they want opposite things. Somebody deciding
 * whether to apply wants the terms — what is covered, what is asked, how to
 * get on it. Somebody who followed a creator here wants to see the work.
 * The page gives the work first and the terms second, because the work is the
 * argument: a list of benefits from a company nobody has seen the output of
 * is a brochure, and the reel rail answers "is this any good" before the
 * offer has to.
 *
 * **The feed is placeholder.** There is no footage behind the reel tiles and
 * no real creator behind any handle — see the warning at the top of
 * `config/creators.ts`. The tiles are posters with a play affordance, which
 * is the honest way to lay out a feed whose video does not exist yet; adding
 * a `src` per reel turns each one into a player without touching this file's
 * layout.
 */
export default function InfluencersPage() {
  return (
    <>
      <PageHero
        eyebrow="Creator programme"
        title="Come and shoot the road"
        accent="shoot"
        intro="A seat on a scheduled departure across the eight states, in exchange for the work you were going to make anyway. Permits, rooms, vehicle and guide are ours; the footage stays yours."
        tint="shell"
        region="assam"
      >
        <div className="mt-10 flex flex-wrap gap-3">
          <LuxeButtonLink href="#apply" variant="primary" size="lg">
            Apply to the programme
          </LuxeButtonLink>
          <LuxeButtonLink href="#feed" variant="ghost" size="lg">
            See what they made
          </LuxeButtonLink>
        </div>
      </PageHero>

      {/* --- The reel rail ------------------------------------------- */}
      <SectionShell
        id="feed"
        tint="night"
        width="wide"
        className="scroll-mt-[calc(var(--header-h)+2rem)]"
      >
        <SectionHeader
          eyebrow="From the road"
          title="Shot on our departures"
          accent="departures"
          intro="Vertical, unpolished and made on the day. Every one of these was filmed by somebody travelling on a trip we run."
          tone="onDark"
          align="split"
        />

        {/*
         * A snapping horizontal rail rather than a grid.
         *
         * A reel is a vertical object you flick through, and laying six of
         * them out as a static grid makes them read as posters. The rail is
         * the same gesture on a phone as the app they came from, and on a
         * desktop it keeps a 9:16 tile at a sane height — six of these in a
         * grid would be three screens tall for no gain.
         *
         * The gutter bleed and matching padding let the first tile line up
         * with the text above it while the row still runs to the edge of the
         * glass, so it reads as continuing rather than as a boxed carousel.
         *
         * `scroll-pl` is not optional here. Under `snap-mandatory` the browser
         * aligns the first snap target to the start of the *scrollport*, which
         * is the padding box — so on load it quietly scrolled the rail by one
         * gutter and parked the first tile hard against the left edge of the
         * screen, 80px out of line with the heading above it. Scroll padding
         * moves the snap line to where the text column starts.
         */}
        <ul className="-mx-[var(--gutter)] mt-12 flex snap-x snap-mandatory scroll-pl-[var(--gutter)] scrollbar-none gap-4 overflow-x-auto px-[var(--gutter)] pb-4 lg:mt-16 lg:gap-5">
          {creatorReels.map((reel, index) => (
            <li
              key={reel.id}
              className="w-[68vw] shrink-0 snap-start sm:w-[42vw] lg:w-[21rem]"
            >
              <Rise delay={Math.min(index, 3) * 0.06} distance={18}>
                <ReelTile reel={reel} priority={index < 2} />
              </Rise>
            </li>
          ))}
        </ul>

        <p className="u-label mt-6 text-night-text-soft">
          Swipe for more · {creatorReels.length} recent posts
        </p>
      </SectionShell>

      {/* --- The stills --------------------------------------------- */}
      <SectionShell tint="paper" width="wide">
        <SectionHeader
          eyebrow="Stills"
          title="And what they brought back"
          accent="brought"
          align="split"
        />

        <ul className="mt-12 grid auto-rows-[13rem] grid-cols-2 gap-3 sm:auto-rows-[15rem] lg:mt-16 lg:grid-cols-3 lg:gap-5">
          {creatorStills.map((still, index) => (
            <li
              key={still.id}
              className={cn(still.tall && "row-span-2", "h-full min-w-0")}
            >
              {/* `h-full` on the wrapper, not just the tile. `Reveal` renders
                  a div of its own between the grid item and the figure;
                  without a height on it the chain breaks, and a figure whose
                  only content is an absolutely-positioned `fill` image
                  collapses to nothing. The grid drew its rows and every tile
                  in it was 0px tall. */}
              <Reveal delay={Math.min(index, 4) * 0.05} className="h-full">
                <StillTile still={still} />
              </Reveal>
            </li>
          ))}
        </ul>
      </SectionShell>

      {/* --- The offer ----------------------------------------------- */}
      <SectionShell tint="shell" width="wide">
        <SectionHeader
          eyebrow="What you get"
          title="The whole trip, not a discount"
          accent="whole"
          intro="We are not asking you to pay your way onto a tour and post about it. You travel on us."
          align="split"
        />

        <dl className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-panel)] border border-[var(--ink-hairline)] bg-[var(--ink-hairline)] sm:grid-cols-2 lg:mt-16">
          {creatorTerms.map((term) => (
            <div key={term.title} className="bg-paper p-7 lg:p-9">
              <dt className="font-display text-28">{term.title}</dt>
              <dd className="mt-3 max-w-md text-16 text-ink-soft">
                {term.copy}
              </dd>
            </div>
          ))}
        </dl>
      </SectionShell>

      {/* --- The application ----------------------------------------- */}
      <SectionShell
        id="apply"
        tint="paper"
        width="wide"
        className="scroll-mt-[calc(var(--header-h)+2rem)]"
      >
        <div className="grid gap-12 lg:grid-cols-[1.1fr_auto] lg:items-end lg:gap-20">
          <div className="max-w-2xl">
            <Eyebrow>Applying</Eyebrow>
            <h2 className="mt-6 text-36 lg:text-48">
              Send us three things you have <Accent>made</Accent>
            </h2>
            <p className="mt-6 text-18 text-ink-soft">
              Not a media kit and not a follower count. Three pieces of work,
              the months you are free, and which of the eight states you have
              been wanting to get to. We read every one and answer either way,
              usually within a week.
            </p>
            <p className="mt-4 text-16 text-ink-faint">
              Audience size matters less to us than whether the work is any
              good. We have taken creators with four thousand followers and
              turned down creators with four hundred thousand.
            </p>
          </div>

          <div className="shrink-0">
            {/*
             * The contact page, with the subject pre-set. There is no
             * dedicated application form yet and a button that opens nothing
             * would be worse than one more field to fill in; when the form
             * exists, only this href changes.
             */}
            <LuxeButtonLink
              href={"/contact?subject=creator-programme" as Route}
              variant="primary"
              size="lg"
            >
              Apply to the programme
            </LuxeButtonLink>
          </div>
        </div>
      </SectionShell>
    </>
  );
}

/**
 * One reel.
 *
 * 9:16, because that is the shape of the thing. The play glyph and the
 * duration are what tell you it is footage rather than a photograph — without
 * them a vertical crop of a landscape is just a tall picture.
 */
function ReelTile({
  reel,
  priority,
}: {
  reel: CreatorReel;
  priority: boolean;
}) {
  return (
    <figure className="group relative isolate flex aspect-[9/16] flex-col justify-end overflow-hidden rounded-[var(--radius-card)] bg-night p-5 text-night-text">
      <Image
        src={reel.image}
        alt={reel.alt}
        fill
        priority={priority}
        sizes="(max-width: 640px) 68vw, (max-width: 1024px) 42vw, 336px"
        className="-z-10 object-cover transition-transform duration-[var(--dur-image)] ease-brand motion-safe:group-hover:scale-[1.04]"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-[rgb(20_18_15/0.92)] from-5% via-[rgb(20_18_15/0.45)] via-50% to-[rgb(20_18_15/0.15)]"
      />

      {/* Duration rides the top edge, away from the caption block. */}
      <span className="u-glass-dark u-label absolute top-4 right-4 rounded-full px-3 py-1.5">
        {reel.duration}
      </span>

      <span
        aria-hidden="true"
        className="absolute top-4 left-4 grid size-9 place-items-center rounded-full border border-[rgb(250_247_242/0.5)] transition-colors duration-[var(--dur-micro)] ease-brand group-hover:bg-[rgb(250_247_242/0.16)]"
      >
        <svg
          viewBox="0 0 12 12"
          className="size-3 fill-current"
          focusable="false"
        >
          <path d="M3 1.5v9l7-4.5z" />
        </svg>
      </span>

      <figcaption>
        <p className="u-label text-night-text">{reel.handle}</p>
        <p className="mt-2 text-16 leading-snug">{reel.caption}</p>
        <p className="u-label mt-3 text-night-text-soft">
          {reel.place} · {reel.views} views
        </p>
      </figcaption>
    </figure>
  );
}

/** One still. Credit only — the picture is doing the talking. */
function StillTile({ still }: { still: CreatorStill }) {
  return (
    <figure className="group relative isolate h-full overflow-hidden rounded-[var(--radius-card)] bg-night">
      <Image
        src={still.image}
        alt={still.alt}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-[var(--dur-image)] ease-brand motion-safe:group-hover:scale-[1.04]"
      />
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgb(20_18_15/0.82)] to-transparent p-4 pt-10 text-night-text">
        <p className="u-label">{still.handle}</p>
        <p className="u-label mt-1 text-night-text-soft">{still.place}</p>
      </figcaption>
    </figure>
  );
}
