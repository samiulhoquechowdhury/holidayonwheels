import type { Metadata } from "next";
import { SectionShell } from "@/components/layout/SectionShell";
import { WeaveBand } from "@/components/layout/WeaveBand";
import { WeavePattern } from "@/components/layout/WeavePattern";
import { Reveal } from "@/components/layout/Reveal";
import { Button, ButtonLink } from "@/components/primitives/Button";
import { Chip, FilterChip } from "@/components/primitives/Chip";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { PriceTag } from "@/components/primitives/PriceTag";
import { Media } from "@/components/primitives/Media";
import { OutboundLink } from "@/components/primitives/OutboundLink";
import { ResultCard } from "@/components/cards/ResultCard";
import { weaveMotifs, weaveRegions } from "@/components/layout/weave-motifs";
import { BEEPDRIVE_URL } from "@/config/external";

export const metadata: Metadata = {
  title: "Component sandbox",
  robots: { index: false, follow: false },
};

/**
 * The component sandbox.
 *
 * Every primitive and layout component rendered in isolation, at every
 * variant, on both light and dark surfaces. This is where a component is
 * checked before it goes near a page — and where a regression shows up
 * without having to hunt through twenty-five routes.
 *
 * Not indexed, not linked from the navigation.
 */
export default function DevPage() {
  return (
    <>
      <SectionShell
        tint="paper"
        spacing="flush"
        className="pt-[calc(var(--header-h)+3rem)] pb-12"
      >
        <Eyebrow>Internal</Eyebrow>
        <h1 className="mt-4 text-48">Component sandbox</h1>
        <p className="mt-4 max-w-2xl text-18 text-ink-soft">
          Every primitive at every variant. Check here first, then compose.
        </p>
      </SectionShell>

      {/* ---- Weave motifs ------------------------------------------------ */}
      <Spec title="WeaveBand" note="The signature divider. One per region.">
        <ul className="flex flex-col gap-8">
          {weaveRegions.map((region) => (
            <li key={region}>
              <p className="u-label mb-3 text-ink-soft">
                {weaveMotifs[region].label} — {weaveMotifs[region].tradition}
              </p>
              <div className="border-y border-[var(--ink-hairline)]">
                <WeaveBand region={region} height={36} opacity={0.55} />
              </div>
            </li>
          ))}
        </ul>
      </Spec>

      <Spec
        title="WeavePattern"
        note="The same motifs as a background wash, at 3–6% and 5–8× scale."
      >
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {weaveRegions.slice(0, 8).map((region) => (
            <li
              key={region}
              className="relative isolate h-40 overflow-hidden rounded-[var(--radius-media)] bg-sand"
            >
              <WeavePattern region={region} scale={6} opacity={0.06} />
              <p className="relative p-4 text-14">
                {weaveMotifs[region].label}
              </p>
            </li>
          ))}
        </ul>
      </Spec>

      {/* ---- Type -------------------------------------------------------- */}
      <Spec
        title="Type scale"
        note="12 / 14 / 16 / 18 / 22 / 28 / 36 / 48 / 64 / 88, fluid."
      >
        {/* Written out rather than generated — Tailwind scans source text, so
            a `text-${step}` template would produce no CSS at all. */}
        <div className="flex flex-col gap-4">
          <p className="font-display text-88">88 — Northeast India</p>
          <p className="font-display text-64">64 — Northeast India</p>
          <p className="font-display text-48">48 — Northeast India</p>
          <p className="font-display text-36">36 — Northeast India</p>
          <p className="font-display text-28">28 — Northeast India</p>
          <p className="font-display text-22">22 — Northeast India</p>
          <p className="text-18">
            18 — Body text at this size, in Figtree, sentence case.
          </p>
          <p className="text-16">
            16 — Body text at this size, in Figtree, sentence case.
          </p>
          <p className="text-14">
            14 — Body text at this size, in Figtree, sentence case.
          </p>
          <p className="u-label">12 — Mono utility, uppercase, 0.14em</p>
        </div>
      </Spec>

      {/* ---- Colour ------------------------------------------------------ */}
      <Spec
        title="Surfaces and accents"
        note="Four surfaces, three accents. Every colour is a token — no inline hex anywhere."
      >
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
          {[
            ["paper", "bg-paper"],
            ["shell", "bg-shell"],
            ["sand", "bg-sand"],
            ["plate", "bg-plate"],
            ["night", "bg-night"],
            ["ink", "bg-ink"],
            ["ink soft", "bg-[var(--ink-soft)]"],
            ["clay — muga silk", "bg-clay"],
            ["ember — terracotta", "bg-ember"],
            ["sage", "bg-sage"],
          ].map(([label, klass]) => (
            <li key={label}>
              <div
                className={`h-20 rounded-[var(--radius-card)] border border-[var(--ink-hairline)] ${klass}`}
              />
              <p className="u-label mt-2 text-ink-soft">{label}</p>
            </li>
          ))}
        </ul>
      </Spec>

      {/* ---- Buttons ----------------------------------------------------- */}
      <Spec
        title="Button"
        note="Magnetic pull capped at 4px, desktop pointer only."
      >
        <div className="flex flex-col gap-8">
          <Row label="Variants, medium">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="moto">Motorcycle</Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </Row>
          <Row label="Sizes">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </Row>
          <Row label="As a link">
            <ButtonLink href="/tours">Browse tours</ButtonLink>
            <ButtonLink href="/tours" variant="secondary">
              Secondary link
            </ButtonLink>
          </Row>
        </div>
      </Spec>

      <Spec title="Button on dark" tint="night">
        <Row label="On the night surface" dark>
          <Button variant="onDark">On dark</Button>
          <Button variant="moto">Motorcycle</Button>
          <ButtonLink href="/tours" variant="onDark">
            Link
          </ButtonLink>
        </Row>
      </Spec>

      {/* ---- Chips and price --------------------------------------------- */}
      <Spec title="Chip and PriceTag">
        <div className="flex flex-col gap-8">
          <Row label="Chip tones">
            <Chip>Neutral</Chip>
            <Chip tone="clay">Clay</Chip>
            <Chip tone="ember">Ember</Chip>
            <Chip tone="sage">Sage</Chip>
          </Row>
          <Row label="FilterChip">
            <FilterChip>Unselected</FilterChip>
            <FilterChip active>Selected</FilterChip>
          </Row>
          <Row label="PriceTag">
            <PriceTag amount={124500} />
            <PriceTag amount={74500} wasAmount={84500} prefix="from" />
            <PriceTag amount={3200} unit="per night" size="sm" />
            <PriceTag amount={248000} size="lg" tone="clay" />
          </Row>
        </div>
      </Spec>

      {/* ---- Eyebrow ----------------------------------------------------- */}
      <Spec title="Eyebrow">
        <div className="flex flex-wrap gap-8">
          <Eyebrow>Soft</Eyebrow>
          <Eyebrow tone="clay">Clay</Eyebrow>
          <Eyebrow tone="ember">Ember</Eyebrow>
          <Eyebrow tone="sage">Sage</Eyebrow>
        </div>
      </Spec>

      {/* ---- Media ------------------------------------------------------- */}
      <Spec
        title="Media"
        note="Placeholder art until the client supplies photography. Holds the exact aspect ratio the real image will occupy, so swapping it in causes no layout shift."
      >
        <ul className="grid gap-4 sm:grid-cols-3">
          {(["3/2", "4/5", "16/9"] as const).map((aspect) => (
            <li key={aspect}>
              <div className="overflow-hidden rounded-[var(--radius-media)]">
                <Media
                  alt={`Placeholder at ${aspect}, showing a river valley in Northeast India`}
                  seed={`dev-${aspect}`}
                  region="assam"
                  aspect={aspect}
                  sizes="320px"
                />
              </div>
              <p className="u-label mt-2 text-ink-soft">{aspect}</p>
            </li>
          ))}
        </ul>
      </Spec>

      {/* ---- ResultCard -------------------------------------------------- */}
      <Spec title="ResultCard" note="One component, four variants.">
        <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ["tour", "Root bridges and the rain country", "Meghalaya", 61500],
              ["moto", "The Tawang run", "1,180 km · 4,170 m", 148000],
              ["stay", "The Khasi cottage", "Mawphlang · Meghalaya", 4800],
              ["event", "Hornbill Festival", "1 Dec · Nagaland", 1200],
            ] as const
          ).map(([variant, title, eyebrow, price]) => (
            <li key={variant}>
              <ResultCard
                variant={variant}
                href="/dev"
                title={title}
                strapline="A one-line editorial subtitle sits here."
                eyebrow={eyebrow}
                price={price}
                imageAlt={`Placeholder for the ${variant} card variant`}
                region="meghalaya"
                chips={["5 nights", "Moderate"]}
                note="Next 7 Nov"
                sizes="300px"
              />
            </li>
          ))}
        </ul>
      </Spec>

      <Spec title="ResultCard on dark" tint="night">
        <div className="max-w-sm">
          <ResultCard
            variant="moto"
            tone="onDark"
            href="/dev"
            title="The north Sikkim high road"
            strapline="Gurudongmar at 5,430 metres, on two wheels."
            eyebrow="890 km · 5,430 m"
            price={162000}
            imageAlt="Placeholder for the dark motorcycle card"
            region="sikkim"
            chips={["7 nights", "Expert"]}
            note="2 bikes left"
            noteUrgent
            sizes="360px"
          />
        </div>
      </Spec>

      {/* ---- Outbound ---------------------------------------------------- */}
      <Spec
        title="OutboundLink"
        note="Always target=_blank, rel=noopener noreferrer, always indicated."
      >
        <OutboundLink
          href={BEEPDRIVE_URL}
          className="text-16 text-sage-ink underline underline-offset-4"
        >
          Car and bike hire on Beep Drive
        </OutboundLink>
      </Spec>

      {/* ---- Reveal ------------------------------------------------------ */}
      <Spec
        title="Reveal"
        note="Fade up 24px at 15% visibility, once only. Scroll away and back — it does not re-trigger."
      >
        <div className="flex flex-col gap-4">
          {[0, 0.1, 0.2].map((delay) => (
            <Reveal key={delay} delay={delay}>
              <div className="rounded-[var(--radius-card)] bg-shell p-7">
                <p className="u-label text-ink-soft">delay {delay}s</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Spec>
    </>
  );
}

function Spec({
  title,
  note,
  tint = "paper",
  children,
}: {
  title: string;
  note?: string;
  tint?: "paper" | "night";
  children: React.ReactNode;
}) {
  return (
    <>
      <WeaveBand region="neutral" height={24} opacity={0.3} />
      <SectionShell tint={tint} spacing="tight">
        <h2
          className={tint === "night" ? "text-28 text-night-text" : "text-28"}
        >
          {title}
        </h2>
        {note ? (
          <p
            className={`mt-3 max-w-2xl text-16 ${
              tint === "night" ? "text-night-text-soft" : "text-ink-soft"
            }`}
          >
            {note}
          </p>
        ) : null}
        <div className="mt-10">{children}</div>
      </SectionShell>
    </>
  );
}

function Row({
  label,
  children,
  dark = false,
}: {
  label: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div>
      <p
        className={`u-label mb-4 ${dark ? "text-night-text-soft" : "text-ink-soft"}`}
      >
        {label}
      </p>
      <div className="flex flex-wrap items-center gap-4">{children}</div>
    </div>
  );
}
