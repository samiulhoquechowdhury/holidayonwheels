import type { Metadata } from "next";
import { LuxeHero } from "@/components/home/LuxeHero";
import { StateMarquee } from "@/components/home/StateMarquee";
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
 *  1. **Hero** — what and where, with the proof of credibility (rating, faces,
 *     count) in the first screen rather than three-quarters down the page.
 *  2. **Marquee** — the eight names, moving. Establishes scale in one glance.
 *  3. **Manifesto** — the one argument, before anything is sold.
 *  4. **Journey modes** — the self-selection moment. Everything below is
 *     downstream of the choice made here.
 *  5. **Signature journeys** — the recommendation, as a bento so that one
 *     trip is visibly the recommendation.
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
 * Surfaces alternate paper / shell / sand / night rather than cycling five
 * tints: most of the page is paper, `shell` marks the two commercial bands,
 * `sand` happens once on the index, and `night` happens once on the
 * expeditions. Space and hairlines do the rest of the dividing.
 */
export default function HomePage() {
  return (
    <>
      <LuxeHero fromPrice={getLowestTourPrice()} />
      <StateMarquee />
      <Manifesto />
      <JourneyModes />
      <SignatureJourneys />
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
