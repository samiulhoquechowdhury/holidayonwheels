import { cn } from "@/lib/cn";
import type { Homestay, MealPlan } from "@/content/types";

/**
 * The four things somebody checks before reading anything.
 *
 * On a listing the specs are not prose — they are the filter a visitor
 * applies in about two seconds: does it sleep us, how many rooms, are we fed,
 * is the bathroom ours. These were previously one grey `u-label` line buried
 * inside the first paragraph block, roughly 1,100px down the page, which is
 * both too late and too quiet for the question they answer.
 *
 * ## Why these four and not six
 *
 * Guests, rooms and meals come from fields every house has. The fourth is
 * the bathroom, which is the single most asked question about a homestay in
 * India and the one a traveller is least willing to guess at — so it is
 * derived from the rooms' own amenities rather than invented, and the strip
 * drops to three facts when nothing in the data says either way. A fact that
 * might be wrong is worse than a fact that is missing.
 *
 * ## The glyphs
 *
 * Drawn here rather than imported, at 1.5 units with round caps, which is
 * the weight `Amenities` and `StayDetailsDialog` already use. That makes
 * this the third local copy of the same drawing conventions in this
 * codebase — the obvious next refactor is one shared icon module, which is
 * deliberately not being done inside a layout change.
 */

type FactIcon = "guests" | "rooms" | "meals" | "bath";

const MEAL_SHORT: Record<MealPlan, string> = {
  "full-board": "All meals",
  "half-board": "Breakfast and dinner",
  breakfast: "Breakfast",
  none: "No meals",
};

function Glyph({ name }: { name: FactIcon }) {
  const paths: Record<FactIcon, React.ReactNode> = {
    guests: (
      <>
        <circle cx="9" cy="8" r="2.6" />
        <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
        <path d="M16 6.2a2.6 2.6 0 0 1 0 5" />
        <path d="M17.5 13.6a5.5 5.5 0 0 1 3 4.9" />
      </>
    ),
    rooms: (
      <>
        <path d="M3 17v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
        <path d="M3 17h18M3 14h18" />
        <circle cx="7.5" cy="11.5" r="1.4" />
      </>
    ),
    meals: (
      <>
        <path d="M4 10h16a8 8 0 0 1-8 8 8 8 0 0 1-8-8Z" />
        <path d="M12 10V6M9 21h6" />
      </>
    ),
    bath: (
      <>
        <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z" />
        <path d="M7 12V6.5A2.5 2.5 0 0 1 9.5 4c1.2 0 2 .7 2.3 1.7" />
        <path d="M7 21.5 6 20M17 21.5l1-1.5" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5 shrink-0 text-sage"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

/**
 * Is the bathroom private, shared, or unstated?
 *
 * Read off the rooms' own amenity strings, which are written per house. The
 * three-way answer matters: "shared" is a perfectly good homestay and saying
 * so is part of the honesty this page is built on, while silence is the right
 * output when the house has not said.
 */
function bathroom(stay: Homestay): string | null {
  const text = stay.rooms
    .flatMap((room) => room.amenities)
    .concat(stay.amenities)
    .join(" | ")
    .toLowerCase();

  if (/private bathroom|attached bath|en-?suite/.test(text)) {
    return "Private bathroom";
  }
  if (/shared bathroom|shared washroom/.test(text)) return "Shared bathroom";
  return null;
}

export function HouseFacts({
  stay,
  className,
}: {
  stay: Homestay;
  className?: string;
}) {
  const bath = bathroom(stay);

  const facts: { icon: FactIcon; label: string }[] = [
    { icon: "guests", label: `Sleeps ${stay.maxGuests}` },
    {
      icon: "rooms",
      label: `${stay.bedrooms} ${stay.bedrooms === 1 ? "room" : "rooms"}`,
    },
    { icon: "meals", label: MEAL_SHORT[stay.mealsIncluded] },
    ...(bath ? [{ icon: "bath" as const, label: bath }] : []),
  ];

  return (
    <ul
      className={cn(
        /*
         * Wraps rather than scrolls. Four short facts fit one line from about
         * 560px up and take two lines below that; a horizontal scroller
         * would hide the fourth behind a gesture nobody knows is available.
         */
        "flex flex-wrap items-center gap-x-7 gap-y-3",
        className,
      )}
    >
      {facts.map((fact) => (
        <li
          key={fact.label}
          className="flex items-center gap-2.5 text-16 text-ink-soft"
        >
          <Glyph name={fact.icon} />
          {fact.label}
        </li>
      ))}
    </ul>
  );
}
