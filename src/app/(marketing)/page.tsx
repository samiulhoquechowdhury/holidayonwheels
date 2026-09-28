import type { Metadata } from "next";
import { LuxeHero } from "@/components/home/LuxeHero";
import { OfferMarquee } from "@/components/home/OfferMarquee";
import { Manifesto } from "@/components/home/Manifesto";
import { JourneyModes } from "@/components/home/JourneyModes";
import { SignatureJourneys } from "@/components/home/SignatureJourneys";
import { StateIndex } from "@/components/home/StateIndex";
import { ExpeditionBand } from "@/components/home/ExpeditionBand";
import { StayStack } from "@/components/home/StayStack";
import { FestivalRail } from "@/components/home/FestivalRail";
import { ProofBand } from "@/components/home/ProofBand";
import { PermitPanel } from "@/components/home/PermitPanel";
import { JournalGrid } from "@/components/home/JournalGrid";
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
 *  3. **Manifesto** — the one argument, before anything is sold.
 *  4. **Signature journeys** — the recommendation, as a bento so that one
 *     trip is visibly the recommendation. It answers the manifesto directly
 *     above it: having just argued that this is not a package, the next
 *     thing to show is what it is instead.
 *  5. **Journey modes** — the self-selection moment. Everything below is
 *     downstream of the choice made here, so it sits after the reader has
 *     seen one real trip rather than before.
 *  6. **State index** — the map, quiet, as type.
 *  7. **Expeditions** — the one dark band, for the one thing with risk in it.
 *  8. **Homestays** — the warm counterweight to it.
 *  9. **Festivals** — the only section with a deadline.
 * 10. **Proof** — the quantified claim, placed where a reader is deciding
 *     whether any of the above was true.
 * 11. **Permits** — the last objection removed.
 * 12. **Journal** — for the reader who is not ready, and wants to know we
 *     know something.
 * 13. **Closing card** — the smallest possible ask.
 *
 * Surfaces alternate rather than cycling every tint the system has: most of
 * the page is paper, `mint` marks the signature journeys, `butter` the state
 * index, and `night` happens once, on the expeditions. Space and hairlines do
 * the rest of the dividing. Swapping the two sections above also fixed a
 * seam: the manifesto and the journey modes are both paper, so they ran
 * together as one undivided block.
 */
export default function HomePage() {
  return (
    <>
      <LuxeHero fromPrice={getLowestTourPrice()} />
      <OfferMarquee />
      <Manifesto />
      <SignatureJourneys />
      <JourneyModes />
      <StateIndex />
      <ExpeditionBand />
      <StayStack />
      <FestivalRail />
      <ProofBand />
      <PermitPanel />
      <JournalGrid />
      <ClosingCard />
    </>
  );
}
