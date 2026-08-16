"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { heroFilm } from "@/config/showcase";

/**
 * The hero's framed film.
 *
 * The loading contract, which is the reason this is a component and not four
 * lines of JSX:
 *
 *  - The poster is a real `next/image` and paints immediately. The `<video>`
 *    element does not exist in the DOM at all until after first paint, so no
 *    media fetch competes with the headline for bandwidth on the critical
 *    path. The headline — text on flat paper, above this frame — is the LCP
 *    element, and it stays that way.
 *  - The video fades in over the poster once it can actually play through, so
 *    there is never a black frame or a stall between the two.
 *  - `preload="none"`, muted, `playsInline`. Autoplay with sound is refused by
 *    every browser and deserves to be.
 *  - Under reduced motion the video is never mounted. The poster is the hero.
 *
 * On top of that, the whole frame scales down a few percent and lifts as the
 * page scrolls past it — a scrubbed transform, so it tracks the wheel exactly.
 * It is the one piece of scroll choreography in the first screen and it does
 * the psychological work of the fold: the frame receding is what tells you
 * there is a page underneath it.
 */
export function HeroFilm({
  film = heroFilm,
  className,
  children,
}: {
  /**
   * Which reel to run. Defaults to the home page's. The motorcycle index
   * passes its own, and any page can — the loading contract below is the
   * valuable part of this component and it should not be reimplemented per
   * page just to change the source.
   */
  film?: { src: string; poster: string; alt: string };
  className?: string;
  /** Glass cards resting on the film. Inside the frame so they scale with it. */
  children?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    // requestIdleCallback where it exists, a timeout where it does not. Either
    // way the video is requested after the first screen has settled.
    const idle =
      window.requestIdleCallback ?? ((fn: () => void) => setTimeout(fn, 900));
    const handle = idle(() => setMounted(true));
    return () => {
      if (window.cancelIdleCallback && typeof handle === "number") {
        window.cancelIdleCallback(handle);
      }
    };
  }, []);

  useGSAP(
    () => {
      const el = frameRef.current;
      if (!el || prefersReducedMotion()) return;

      gsap.to(el, {
        scale: 0.94,
        yPercent: -3,
        borderRadius: 64,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: frameRef },
  );

  return (
    <div
      ref={frameRef}
      className={cn(
        "relative isolate overflow-hidden rounded-[var(--radius-frame)] bg-[#E6E0D4]",
        "origin-top will-change-transform",
        className,
      )}
    >
      <Image
        src={film.poster}
        alt={film.alt}
        fill
        priority
        sizes="100vw"
        className={cn(
          "object-cover transition-opacity duration-[1200ms] ease-brand",
          playing && "opacity-0",
        )}
      />

      {mounted ? (
        <video
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-[1200ms] ease-brand",
            playing ? "opacity-100" : "opacity-0",
          )}
          src={film.src}
          poster={film.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          // `canplaythrough` rather than `playing`: the latter fires on the
          // first decoded frame, which on a slow line means crossfading into
          // footage that then immediately stalls.
          onCanPlayThrough={() => setPlaying(true)}
          aria-hidden="true"
          tabIndex={-1}
        />
      ) : null}

      {/* Corners pulled down so the glass cards resting on the film always
          have a ground, whatever the footage is doing behind them. */}
      <div aria-hidden="true" className="u-vignette absolute inset-0" />

      {children}
    </div>
  );
}
