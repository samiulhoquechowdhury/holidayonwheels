import Link from "next/link";
import { cn } from "@/lib/cn";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { ButtonLink } from "@/components/primitives/Button";
import { site } from "@/config/site";
import type { Homestay } from "@/content/types";

/**
 * The panel a house gets when we do not know what it charges.
 *
 * ## Why this exists instead of a disabled booking widget
 *
 * `StayBookingWidget` is arithmetic: a nightly rate times nights, plus an
 * extra bed, equals a total. With no rate and no rooms there is nothing for
 * it to compute, and every honest rendering of it is a form full of blanks.
 * A greyed-out booking form also reads as "sold out" or "broken" rather than
 * "ask us", which is a worse answer than the one we actually have.
 *
 * So the slot keeps its shape — same panel, same position, same sticky
 * behaviour — and changes what it offers: the ways to reach us, which do
 * work. The four Guwahati houses are real and bookable by telephone today;
 * it is only the published rate that is missing.
 *
 * **This is temporary.** When the rates arrive, give the house a
 * `fromPrice` and its `rooms`, and the detail page renders the real widget
 * again with no change here — see the branch in
 * `app/(browse)/homestays/[slug]/page.tsx`.
 */
export function StayEnquiryPanel({
  stay,
  className,
}: {
  stay: Homestay;
  className?: string;
}) {
  const tel = site.contact.phone.replace(/\s+/g, "");

  return (
    <section
      aria-labelledby="stay-enquiry-heading"
      className={cn(
        "rounded-[var(--radius-panel)] bg-plate p-7 shadow-[var(--shadow-soft)] lg:p-8",
        className,
      )}
    >
      <h2 id="stay-enquiry-heading" className="u-sr-only">
        Enquire about {stay.name}
      </h2>

      <Eyebrow>Rate</Eyebrow>
      <p className="mt-3 font-display text-28 leading-none">On request</p>
      <p className="mt-4 text-16 text-ink-soft">
        We have not published a nightly rate for this house because the family
        sets it themselves and it moves with the season. Ask us and we will
        confirm it in writing, usually the same day.
      </p>

      <div className="mt-7 flex flex-col gap-3">
        <ButtonLink
          href={`/contact?subject=${encodeURIComponent(stay.name)}`}
          variant="primary"
          size="lg"
          block
        >
          Ask about this house
        </ButtonLink>
        <p className="u-label text-center text-ink-faint">
          or call{" "}
          <a
            href={`tel:${tel}`}
            className="u-num text-ink underline underline-offset-4"
          >
            {site.contact.phone}
          </a>
        </p>
      </div>

      <p className="mt-7 border-t border-[var(--ink-hairline)] pt-5 text-14 text-ink-faint">
        Nothing is payable here, and nothing is held until the family has
        confirmed your dates.
      </p>

      <p className="mt-4 text-14 text-ink-faint">
        Staying more than a night or two?{" "}
        <Link
          href="/destinations#plan"
          className="text-ink underline underline-offset-4"
        >
          Build the trip around it
        </Link>{" "}
        and we will arrange the house with the rest.
      </p>
    </section>
  );
}
