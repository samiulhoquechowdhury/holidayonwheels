import type { Metadata } from "next";
import { LuxeHero } from "@/components/home/LuxeHero";
import { OfferMarquee } from "@/components/home/OfferMarquee";
import { Manifesto } from "@/components/home/Manifesto";
// import { JourneyModes } from "@/components/home/JourneyModes";
import { SignatureJourneys } from "@/components/home/SignatureJourneys";
import { StateIndex } from "@/components/home/StateIndex";
import { ExpeditionBand } from "@/components/home/ExpeditionBand";
import { StayStack } from "@/components/home/StayStack";
import { DiningTable } from "@/components/home/DiningTable";
import { FestivalRail } from "@/components/home/FestivalRail";
import { ProofBand } from "@/components/home/ProofBand";
import { PermitPanel } from "@/components/home/PermitPanel";
import { JournalGrid } from "@/components/home/JournalGrid";
import { CreatorBand } from "@/components/home/CreatorBand";
import { ClosingCard } from "@/components/home/ClosingCard";
import { getLowestTourPrice } from "@/content/tours";

export const metadata: Metadata = {
  title: "Northeast India, properly travelled",
  description:
    "Guided tours, motorcycle expeditions, homestays and events across the eight states of Northeast India, with Inner Line Permits handled for you.",
};

/**
 * Home.
 *
 * The page is built as a sequence of decisions rather than a list of product
 * categories, and the order is the design:
 *
 *  1. **Hero** — what and where, and nothing else. One line of type and the
 *     film. The lede, the two buttons and the rating block were cut: they
 *     asked the reader to decide before the page had said anything, and the
 *     offers band and journey modes directly below both do that job better.
 *     Credibility now lands at the proof band, once there is something to be
 *     credible about.
 *  2. **Marquee** — what is on offer, moving. The eight names used to run
 *     here, but the hero says "eight states" in 160px directly above it.
 *  3. **Manifesto and signature journeys** — one block, deliberately. The
 *     manifesto makes the argument; the bento under it is the evidence, on
 *     the same paper, with no heading, eyebrow or button of its own. They
 *     were two sections and the join showed: "Signature routes / The trips
 *     we would book ourselves / Plan your own" restated what the paragraph
 *     above had just finished saying. The manifesto ends on "we sell the
 *     week you spend in them"; the honest next thing is to show three weeks,
 *     not to clear the throat and introduce them.
 *  5. **Journey modes** — commented out, not deleted. It was the
 *     self-selection moment ("How are you travelling?"), and it may come
 *     back; its eyebrow also still read "Start here" from when it sat higher
 *     up the page, which stopped being true once the signature routes moved
 *     above it. Uncomment the import and the tag below to restore it.
 *  6. **State index** — the map, quiet, as type.
 *  7. **Expeditions** — the one dark band, for the one thing with risk in it.
 *  8. **Homestays** — the warm counterweight to it.
 *  9. **Dining** — where you eat, straight after where you sleep. Food was
 *     the one part of a trip this page never mentioned, which in this region
 *     is a strange thing to leave out.
 * 10. **Festivals** — the only section with a deadline.
 * 11. **Proof** — the quantified claim, placed where a reader is deciding
 *     whether any of the above was true.
 * 12. **Permits** — the last objection removed.
 * 13. **Journal** — for the reader who is not ready, and wants to know we
 *     know something.
 * 14. **Creator programme** — the only band on the page addressed to somebody
 *     who is not buying a holiday. It sits here, late, because a second
 *     audience's ask placed in the middle of the first audience's argument
 *     costs more than the position gains; by this point the page has stopped
 *     selling and started talking.
 * 15. **Closing card** — the smallest possible ask.
 *
 * Surfaces alternate rather than cycling every tint the system has: most of
 * the page is paper, `sand` marks the dining block, `butter` the state index,
 * `blush` the festivals, and `night` happens twice — the expeditions and the
 * creator programme. Space and hairlines do the rest of the dividing.
 *
 * The signature journeys used to be mint. They are paper now *because* two
 * adjacent paper sections read as one, which is the point there rather than
 * the bug it would be anywhere else on this page.
 */
export default function HomePage() {
  return (
    <>
      <LuxeHero fromPrice={getLowestTourPrice()} />
      <OfferMarquee />
      <Manifesto />
      <SignatureJourneys />
      {/* <JourneyModes /> */}
      <StateIndex />
      <ExpeditionBand />
      <StayStack />
      <DiningTable />
      <FestivalRail />
      <ProofBand />
      <PermitPanel />
      <JournalGrid />
      <CreatorBand />
      <ClosingCard />
    </>
  );
}
