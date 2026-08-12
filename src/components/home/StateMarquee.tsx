import Image from "next/image";
import Link from "next/link";
import { Marquee } from "@/components/motion/Marquee";
import { getDestinations } from "@/content/destinations";
import { stateShots } from "@/config/showcase";
import { stateColours } from "@/config/palette";

/**
 * The eight states, running.
 *
 * A band like this is usually a logo wall — the row of client marks that says
 * "other people trusted us". There are no client logos to run here, so it
 * runs the *inventory* instead, which is the more persuasive thing anyway:
 * the reader is not being told the company is credible, they are being shown
 * that the map is bigger than they thought. Eight names is the entire pitch.
 *
 * Each name is a link. A marquee of live links has to be pausable or it is a
 * cruel joke — hovering the strip stops it (`.u-marquee` in globals.css).
 */
export function StateMarquee() {
  const states = getDestinations();

  return (
    <section
      aria-label="The eight states"
      className="relative border-y border-[var(--ink-hairline)] bg-shell py-6 lg:py-7"
    >
      <Marquee duration={58}>
        {states.map((state) => {
          const colour = stateColours[state.slug];
          return (
            <Link
              key={state.slug}
              href={`/destinations/${state.slug}`}
              className="group/state flex shrink-0 items-center gap-5 px-6 lg:gap-7 lg:px-8"
            >
              {/* A circular crop of the place, in front of its name. Sixty
                  pixels of the actual state does more for a strip like this
                  than any amount of type styling. */}
              <span
                className="relative size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-offset-2 ring-offset-shell transition-transform duration-[var(--dur-micro)] ease-brand motion-safe:group-hover/state:scale-110 lg:size-14"
                style={{ ["--tw-ring-color" as string]: colour.surface }}
              >
                <Image
                  src={stateShots[state.slug] ?? ""}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </span>

              <span
                className="font-display text-28 whitespace-nowrap text-ink transition-colors duration-[var(--dur-micro)] ease-brand lg:text-36"
                style={{ ["--hover-colour" as string]: colour.ink }}
              >
                <span className="group-hover/state:[color:var(--hover-colour)]">
                  {state.name}
                </span>
              </span>

              {/* The separator carries the permit status, so the strip is
                  information rather than decoration. */}
              <span
                className="u-label shrink-0 rounded-full px-3 py-1 whitespace-nowrap"
                style={{
                  color: colour.ink,
                  backgroundColor: `color-mix(in srgb, ${colour.surface} 15%, transparent)`,
                }}
              >
                {state.requiresILP ? "ILP" : "No permit"}
              </span>

              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rotate-45"
                style={{ backgroundColor: colour.surface }}
              />
            </Link>
          );
        })}
      </Marquee>
    </section>
  );
}
