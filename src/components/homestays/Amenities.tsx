import { cn } from "@/lib/cn";

/**
 * A house's amenities, sorted into the things people actually decide on.
 *
 * The content is free text — "Hot water by bucket", "Solar backup during
 * power cuts", "Time at the loom, with somebody who can actually weave" —
 * written per house by whoever knows the house. That is the right way round:
 * a fixed tick-list of facilities would flatten exactly the differences this
 * page exists to show, and "Hot water by bucket" is a sentence no checkbox
 * can say.
 *
 * The cost of free text is that a flat column of nineteen strings is a wall.
 * So the strings keep their wording and get *grouped* by what they answer —
 * will I be fed, will I be warm, can I charge my phone, how do I get there —
 * which is the order somebody reads a listing in.
 *
 * Classification is by keyword, in `GROUPS` below, and deliberately so: the
 * alternative is a second field on every amenity in `content/homestays.ts`,
 * hand-maintained, that says the same thing the words already say. Anything
 * unmatched falls into "Also here" rather than being dropped — see the note
 * on `ORDER`.
 */

type GroupId =
  "meals" | "warmth" | "power" | "travel" | "hosts" | "practical" | "other";

/**
 * Keyword tables, tested in `ORDER`. First match wins, so the more specific
 * groups are listed before the looser ones — "Guided walk to Rainbow Falls"
 * is something you do *with your hosts*, not a travel arrangement, and it
 * would match both.
 */
const GROUPS: Record<Exclude<GroupId, "other">, RegExp> = {
  hosts:
    /guided|demonstration|with the host|with a |interpreter|at the loom|cooking session|tasting|tour with|walk|introduction to|estate and factory|weaving/i,
  meals:
    /meal|breakfast|dinner|lunch|kitchen|cooked|rice beer|drinking water|packed/i,
  warmth: /hot water|heater|stove|quilt|blanket|bath|washroom/i,
  power: /wifi|solar|power cut|lighting|charg/i,
  travel:
    /airport|transfer|pickup|boat|ferry|bicycle|transport|parking|porter|permit|njp|ghat/i,
  practical:
    /laundry|storage|drying|locker|mosquito|trade rate|refill|veranda|porch|lawn|desk|view off it/i,
};

/**
 * Reading order, and the labels.
 *
 * "Also here" is last and has no icon of its own on purpose. It is the
 * catch-all for anything the tables miss, and it has to exist: a classifier
 * that silently drops an amenity would quietly delete something a family
 * told us about their own house. If this group is ever large on a real
 * listing, that is the signal to add a keyword — not to stop showing it.
 */
const ORDER: { id: GroupId; label: string }[] = [
  { id: "meals", label: "Food and the kitchen" },
  { id: "warmth", label: "Warmth and washing" },
  { id: "power", label: "Power and signal" },
  { id: "travel", label: "Getting there and around" },
  { id: "hosts", label: "Things to do with your hosts" },
  { id: "practical", label: "Practical" },
  { id: "other", label: "Also here" },
];

function classify(amenity: string): GroupId {
  for (const { id } of ORDER) {
    if (id === "other") continue;
    if (GROUPS[id as Exclude<GroupId, "other">].test(amenity)) return id;
  }
  return "other";
}

/**
 * One line-drawn glyph per group, 20px on a 24 grid.
 *
 * Stroked rather than filled, 1.5 units, round caps — the same weight as the
 * arrows and ticks elsewhere, so a column of these reads as part of the site
 * rather than as an icon font bolted onto it. They are decorative: every one
 * sits beside its own heading in words, and all of them are `aria-hidden`.
 */
function GroupIcon({ id, className }: { id: GroupId; className?: string }) {
  const paths: Record<GroupId, React.ReactNode> = {
    meals: (
      <>
        <path d="M4 10h16a8 8 0 0 1-8 8 8 8 0 0 1-8-8Z" />
        <path d="M12 10V6" />
        <path d="M9 21h6" />
      </>
    ),
    warmth: (
      <>
        <path d="M12 3c3 3.6 4.5 6.3 4.5 8.4A4.5 4.5 0 0 1 12 16a4.5 4.5 0 0 1-4.5-4.6C7.5 9.3 9 6.6 12 3Z" />
        <path d="M5 20h14" />
      </>
    ),
    power: (
      <>
        <path d="M3 9a16 16 0 0 1 18 0" />
        <path d="M6.5 13a11 11 0 0 1 11 0" />
        <path d="M10 16.6a5 5 0 0 1 4 0" />
        <path d="M12 20h.01" />
      </>
    ),
    travel: (
      <>
        <circle cx="6.5" cy="16.5" r="3" />
        <circle cx="17.5" cy="16.5" r="3" />
        <path d="M9.5 16.5h5M6.5 16.5 10 8h4l3.5 8.5" />
      </>
    ),
    hosts: (
      <>
        <circle cx="12" cy="6" r="2.6" />
        <path d="M12 8.6v6" />
        <path d="m8 11 4 1.6 4-1.6" />
        <path d="m9.5 21 2.5-6.4L14.5 21" />
      </>
    ),
    practical: (
      <>
        <path d="M4 8h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </>
    ),
    other: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8.5v4" />
        <path d="M12 15.5h.01" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("size-5 shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[id]}
    </svg>
  );
}

export function Amenities({
  amenities,
  className,
}: {
  amenities: string[];
  className?: string;
}) {
  const grouped = ORDER.map((group) => ({
    ...group,
    items: amenities.filter((amenity) => classify(amenity) === group.id),
  })).filter((group) => group.items.length > 0);

  return (
    <div className={cn("min-w-0", className)}>
      <ul className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
        {grouped.map((group) => (
          <li key={group.id} className="min-w-0">
            <h3 className="flex items-center gap-3 text-16 font-medium">
              <GroupIcon id={group.id} className="text-sage" />
              {group.label}
            </h3>
            <ul className="mt-4 grid gap-2.5 border-t border-[var(--ink-hairline)] pt-4">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-16 text-ink-soft"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-clay"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
