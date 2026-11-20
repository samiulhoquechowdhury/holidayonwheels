import Image from "next/image";
import { Accent } from "@/components/primitives/Accent";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { cn } from "@/lib/cn";

/**
 * The banner at the top of the expeditions page.
 *
 * ## Why a banner and not the hero that used to be here
 *
 * This page opened with a full `PageHero` and then a second full-width film
 * under it — two screens of furniture before the first expedition, and the
 * film was the heaviest asset on the site after the home page. Both are
 * gone. What replaces them is one band: image, headline, and the three
 * numbers that actually distinguish a guided expedition from a group of
 * people on bikes.
 *
 * It is deliberately shallow — `21/9` on a desktop, `4/3` on a phone — so
 * the first card is on the opening screen rather than below it. A banner
 * that has to be scrolled past is a hero wearing a different name.
 *
 * ## The three figures
 *
 * Altitude, support and group size, because those are the questions a rider
 * asks before price. They are passed in from the real tour data rather than
 * written here, so the banner cannot drift from the expeditions beneath it —
 * if the highest pass changes, this changes with it.
 *
 * ## The photograph
 *
 * Green, misty, forested. The obvious stock for "motorcycle expedition" is
 * an arid Ladakh switchback under a hard blue sky, and it is the wrong
 * region: the Northeast is wet, green and hazy for most of the riding
 * season. Six candidates were looked at before this one; the two most
 * dramatic were rejected for reading unmistakably as Ladakh or Spiti.
 */
export function MotoBanner({
  expeditions,
  maxAltitude,
  maxGroupSize,
  className,
}: {
  expeditions: number;
  maxAltitude: number;
  maxGroupSize: number;
  className?: string;
}) {
  const figures = [
    {
      value: `${maxAltitude.toLocaleString("en-IN")} m`,
      label: "highest pass crossed",
    },
    { value: "Lead, sweep", label: "and a support pickup" },
    { value: `Max ${maxGroupSize}`, label: "riders on a departure" },
  ];

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden",
        /* Below the fixed header, not under it. */
        "mt-[var(--header-h)]",
        className,
      )}
      aria-label="Guided motorcycle expeditions"
    >
      {/*
        Sized by the window, not by an aspect ratio.

        At `21/9` this was 617px on a 1440 laptop — a third of the way to a
        hero again, and it pushed the first expedition card to the edge of
        the fold. A banner's job is to set the tone in the space it takes;
        the cards are what the page is for. A third of the viewport is the
        budget, clamped so it stays a band on a short laptop and does not
        become a strip on a tall monitor.
      */}
      <div className="relative h-[clamp(11rem,33vh,19rem)] w-full">
        <Image
          src="https://images.unsplash.com/photo-1783501380681-edeae64b7d52?auto=format&fit=crop&q=75"
          alt="A motorcycle parked on a track above misty, forested hills"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/*
          Two scrims, not one. A single flat overlay dulls the whole
          photograph to make the corner with type in it legible; a gradient
          from the bottom plus a soft left wash keeps the sky and the ridge
          at full strength and darkens only where words actually sit.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[rgb(20_18_15/0.88)] via-[rgb(20_18_15/0.35)] to-transparent"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[rgb(20_18_15/0.55)] to-transparent lg:to-40%"
        />

        <div className="absolute inset-0 flex items-end">
          <div className="u-container-wide w-full pb-7 lg:pb-12">
            <Eyebrow tone="onDark" rule>
              {expeditions} expeditions
            </Eyebrow>

            <h1 className="lg:text-44 mt-3 max-w-3xl text-28 text-night-text lg:mt-4">
              Guided rides, with a <Accent>truck</Accent> behind you
            </h1>

            {/*
              The paragraph that sat here is gone. It said the same thing as
              the intro under "Choose an expedition" a few hundred pixels
              below — and in a band a third of the screen tall there is no
              room to say it twice. The figures below carry the one fact the
              sentence was really for: that a truck comes with you.
            */}

            {/*
              One line, not three cards. The stacked glass tiles were 86px
              tall on their own, which is a quarter of the whole band now —
              at this height the figures have to sit beside the headline
              rather than under it as objects of their own.
            */}
            <ul className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-1 lg:mt-4">
              {figures.map((figure) => (
                <li
                  key={figure.label}
                  className="u-label flex items-baseline gap-2 text-night-text-soft"
                >
                  <span className="u-num text-night-text">{figure.value}</span>
                  {figure.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
