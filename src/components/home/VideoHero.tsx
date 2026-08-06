"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Media } from "@/components/primitives/Media";
import { ButtonLink } from "@/components/primitives/Button";
import { homeHero } from "@/config/media";

/**
 * The hero. One uninterrupted frame of Northeast India, one line of display
 * type, one CTA, nothing else.
 *
 * Performance contract, from the quality floor:
 *  - the poster image is the LCP element, never the video;
 *  - the video is `preload="none"` and only attaches its source after first
 *    paint, so it cannot compete for bandwidth with the poster;
 *  - reduced motion gets a still frame with no scale and no parallax.
 *
 * With no footage supplied yet the poster stands alone, which is a valid
 * shipping state rather than a placeholder.
 */
export function VideoHero({
  lines,
  eyebrow,
  ctaLabel,
  ctaHref,
}: {
  /** Headline, pre-split into the lines it should reveal on. */
  lines: string[];
  eyebrow: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [videoReady, setVideoReady] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Scales 1.06 → 1.00 across the first viewport of scroll.
  const scale = useTransform(scrollYProgress, [0, 1], [1.06, 1]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.45, 0.7]);

  // Attach the video source only after first paint, so it never competes with
  // the poster for the LCP.
  useEffect(() => {
    if (reduced || !homeHero.src) return;
    const id = window.requestIdleCallback
      ? window.requestIdleCallback(() => setVideoReady(true))
      : window.setTimeout(() => setVideoReady(true), 400);
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id as number);
      else window.clearTimeout(id as number);
    };
  }, [reduced]);

  return (
    <section
      ref={ref}
      className="is-dark relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-night text-night-text"
    >
      {/* Media layer */}
      <motion.div
        data-motion="hero-media"
        className="absolute inset-0"
        style={reduced ? undefined : { scale }}
      >
        <Media
          alt={homeHero.posterAlt}
          src={homeHero.poster ?? undefined}
          seed="home-hero"
          region="neutral"
          aspect="16/9"
          priority
          sizes="100vw"
          className="h-full w-full [&>*]:h-full [&>*]:object-cover"
        />
        {videoReady && homeHero.src ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster={homeHero.poster ?? undefined}
            aria-hidden="true"
          >
            <source
              src={homeHero.srcMobile ?? homeHero.src}
              media="(max-width: 768px)"
              type="video/mp4"
            />
            <source src={homeHero.src} type="video/mp4" />
          </video>
        ) : null}
      </motion.div>

      {/* Scrim. Fixed opacity under reduced motion so nothing animates. */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-night via-[rgb(13_21_18/0.35)] to-[rgb(13_21_18/0.25)]"
        style={reduced ? { opacity: 0.55 } : { opacity: overlayOpacity }}
      />

      {/* Type. The reveal is CSS (see .u-hero-line in globals.css) so it does
          not wait for hydration — the headline is the LCP element here. */}
      <div className="u-container relative pb-20 lg:pb-28">
        <div className="max-w-4xl">
          <LineMask index={0}>
            <p className="u-mono text-night-text-soft">{eyebrow}</p>
          </LineMask>

          <h1 className="mt-6 text-64 lg:text-88">
            {lines.map((line, index) => (
              <LineMask key={line} index={index + 1}>
                <span className="block">{line}</span>
              </LineMask>
            ))}
          </h1>

          <LineMask index={lines.length + 1}>
            <div className="mt-10">
              <ButtonLink href={ctaHref} variant="onDark" size="lg">
                {ctaLabel}
              </ButtonLink>
            </div>
          </LineMask>
        </div>
      </div>

      <ScrollHint />
    </section>
  );
}

/**
 * One revealed line. The mask is a clip-path inside an overflow-hidden
 * wrapper, so the type rises out of nothing rather than sliding in from
 * off-screen.
 *
 * 80ms stagger, applied as an animation-delay rather than a Framer stagger.
 * Under reduced motion the global rule collapses the duration to nothing and
 * the line simply appears at its final position.
 */
function LineMask({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  return (
    <span className="block overflow-hidden">
      <span
        data-motion="headline-line"
        className="u-hero-line"
        style={{ animationDelay: `${index * 80}ms` }}
      >
        {children}
      </span>
    </span>
  );
}

function ScrollHint() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center"
    >
      <span className="u-mono text-night-text-soft opacity-70">Scroll</span>
    </div>
  );
}
