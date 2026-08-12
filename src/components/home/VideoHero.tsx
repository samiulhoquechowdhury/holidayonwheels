"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Media } from "@/components/primitives/Media";
import { ButtonLink } from "@/components/primitives/Button";
import { heroReel, HERO_CLIP_MS } from "@/config/media";
import { cn } from "@/lib/cn";

/**
 * The hero.
 *
 * The previous version put the headline in white over a full-bleed dark
 * video, which is the house style of every adventure-travel site on the
 * internet and reads as a stock photo no matter how good the footage is.
 *
 * This one separates the two. The type sits on paper, at the largest size in
 * the system, with nothing behind it — so it is read rather than looked at.
 * The film sits below it as a framed object with a 24px radius, held in the
 * wide column: something the page is showing you, not something the page is
 * wearing. Three chapters crossfade inside the frame, and the chapter control
 * sits under it in the open rather than floating on a scrim.
 *
 * Loading contract, from the quality floor:
 *  - the headline is the LCP element, and it is text on a flat ground, so it
 *    paints at first paint rather than after a decode;
 *  - no `<video>` exists in the DOM until after first paint;
 *  - only the current chapter and the next one are ever mounted, so the reel
 *    costs one extra fetch rather than three;
 *  - off-screen, backgrounded or reduced-motion, the reel stops entirely.
 *
 * With no footage supplied yet every chapter falls back to its poster art,
 * which is a valid shipping state rather than a placeholder.
 */
export function VideoHero({
  lines,
  eyebrow,
  intro,
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref,
}: {
  /** Headline, pre-split into the lines it should reveal on. */
  lines: string[];
  eyebrow: string;
  intro?: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const [index, setIndex] = useState(0);
  /** User-facing pause. WCAG 2.2.2 — anything auto-advancing past 5s needs it. */
  const [userPaused, setUserPaused] = useState(false);
  /** Backgrounded tab. Held apart from the user's pause so that returning to
   *  the tab resumes the reel rather than leaving it stopped for good. */
  const [hidden, setHidden] = useState(false);
  /** Flips once after first paint. Until then no <video> is rendered at all. */
  const [armed, setArmed] = useState(false);
  /** Which chapters have a <video> mounted. Grows, never shrinks. */
  const [mounted, setMounted] = useState<boolean[]>(() =>
    heroReel.map(() => false),
  );

  // Tracked on the frame rather than the section: the reel should stop when
  // the film leaves the screen, not when the headline does.
  const inView = useInView(frameRef, { amount: 0.25 });

  const single = heroReel.length < 2;
  /** Nothing decodes and nothing advances unless all four of these hold. */
  const live = !reduced && !userPaused && !hidden && inView;
  const running = live && !single;

  // Attach video sources only after first paint, so they never compete with
  // the headline or the poster for the critical path.
  useEffect(() => {
    if (reduced) return;
    const id = window.requestIdleCallback
      ? window.requestIdleCallback(() => setArmed(true))
      : window.setTimeout(() => setArmed(true), 500);
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id as number);
      else window.clearTimeout(id as number);
    };
  }, [reduced]);

  // Mount the current chapter and pre-arm the next one. By the time the reel
  // reaches a chapter its video has already buffered, so the crossfade lands
  // on moving footage rather than on a poster.
  useEffect(() => {
    if (!armed) return;
    const next = (index + 1) % heroReel.length;
    setMounted((prev) => {
      if (prev[index] && prev[next]) return prev;
      const out = [...prev];
      out[index] = true;
      out[next] = true;
      return out;
    });
  }, [armed, index]);

  // Advance. Re-armed on every index change, so a manual jump restarts the
  // full dwell rather than inheriting whatever was left of the last one.
  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(
      () => setIndex((i) => (i + 1) % heroReel.length),
      HERO_CLIP_MS,
    );
    return () => window.clearTimeout(id);
  }, [running, index]);

  // A backgrounded tab keeps no timers worth trusting and decodes video for
  // nobody. Stop on the way out, resume on the way back.
  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <section
      aria-label="Northeast India"
      className="relative overflow-hidden bg-paper pt-[calc(var(--header-h)+4.5rem)] pb-20 lg:pt-[calc(var(--header-h)+8rem)] lg:pb-28"
    >
      {/* ---- Type. Nothing behind it. --------------------------------- */}
      <div className="u-container">
        <LineMask index={0}>
          <p className="u-label flex items-center gap-3 text-ink-faint">
            <span
              aria-hidden="true"
              className="block h-px w-6 bg-current opacity-45"
            />
            {eyebrow}
          </p>
        </LineMask>

        {/* The one very large size on the page. */}
        <h1 className="mt-10 max-w-5xl text-88 lg:text-120">
          {lines.map((line, i) => (
            <LineMask key={line} index={i + 1}>
              <span className="block">{line}</span>
            </LineMask>
          ))}
        </h1>

        <div className="mt-12 flex flex-col gap-10 lg:mt-16 lg:flex-row lg:items-end lg:justify-between lg:gap-20">
          {intro ? (
            <LineMask index={lines.length + 1}>
              <p className="u-lede max-w-xl text-18 text-ink-soft lg:text-22">
                {intro}
              </p>
            </LineMask>
          ) : (
            <span />
          )}

          <LineMask index={lines.length + 2}>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={ctaHref} variant="clay" size="lg">
                {ctaLabel}
              </ButtonLink>
              {secondaryLabel && secondaryHref ? (
                <ButtonLink href={secondaryHref} variant="secondary" size="lg">
                  {secondaryLabel}
                </ButtonLink>
              ) : null}
            </div>
          </LineMask>
        </div>
      </div>

      {/* ---- The film, as an object. ----------------------------------- */}
      <div className="u-container-wide mt-16 lg:mt-24">
        <motion.div
          ref={frameRef}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
          data-motion="hero-frame"
          className={cn(
            "relative isolate overflow-hidden bg-shell",
            "rounded-[var(--radius-media)]",
            // Portrait on a phone, cinematic on a desk. The subject has to
            // survive both crops — see the framing note in MEDIA.md.
            "aspect-[4/5] sm:aspect-[16/10] lg:aspect-[21/9]",
          )}
        >
          {heroReel.map((clip, i) => (
            <Chapter
              key={clip.id}
              clip={clip}
              order={i}
              active={i === index}
              playing={live && i === index}
              withVideo={mounted[i]}
              reduced={Boolean(reduced)}
            />
          ))}
        </motion.div>

        {/* One clip is not a reel. With a single chapter configured the hero
            is just a film, and a control for choosing between one thing is
            worse than no control. */}
        {single ? null : (
          <ChapterControl
            index={index}
            // The clock stops whenever the reel does, for whatever reason —
            // but the button only ever reflects the user's own choice.
            stopped={!live}
            paused={userPaused}
            locked={Boolean(reduced)}
            onSelect={setIndex}
            onTogglePause={() => setUserPaused((v) => !v)}
          />
        )}
      </div>
    </section>
  );
}

/**
 * One chapter of the reel: its poster, and — once armed — its footage on top.
 *
 * The poster stays mounted underneath the video for the whole life of the
 * page. It costs nothing after decode and it means a stalled or failed video
 * degrades to a still frame instead of to an empty frame.
 */
function Chapter({
  clip,
  order,
  active,
  playing,
  withVideo,
  reduced,
}: {
  clip: (typeof heroReel)[number];
  /** Position in the reel. Chapter 0 is the LCP candidate of the frame. */
  order: number;
  active: boolean;
  playing: boolean;
  withVideo: boolean;
  reduced: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Only the visible chapter decodes frames. The others hold their last one.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (playing) {
      // Autoplay can still be refused (low power mode, for one). The poster
      // is already behind it, so a rejection needs no handling beyond not
      // throwing.
      void el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [playing]);

  return (
    <div
      className={cn(
        "absolute inset-0 transition-opacity ease-brand",
        "duration-[1200ms] motion-reduce:duration-0",
        active ? "opacity-100" : "opacity-0",
      )}
    >
      <div
        data-motion="hero-drift"
        // Negative delay puts each layer at a different point in the same
        // cycle — see the note on .u-hero-drift for why this runs on all
        // three rather than only on the active one.
        style={{ "--drift-delay": `${order * -9}s` } as React.CSSProperties}
        className={cn("h-full w-full", !reduced && "u-hero-drift")}
      >
        <Media
          alt={clip.posterAlt}
          src={clip.poster ?? undefined}
          seed={clip.id}
          region={clip.region}
          aspect="16/9"
          // Chapter one is the frame's LCP candidate. The other two stay
          // lazy, or they contend with it on the critical path.
          priority={order === 0}
          sizes="100vw"
          className="h-full w-full [&>*]:h-full [&>*]:object-cover"
        />

        {withVideo && clip.src ? (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            muted
            loop
            playsInline
            preload="none"
            poster={clip.poster ?? undefined}
            aria-hidden="true"
          >
            <source
              src={clip.srcMobile ?? clip.src}
              media="(max-width: 768px)"
              type="video/mp4"
            />
            <source src={clip.src} type="video/mp4" />
          </video>
        ) : null}
      </div>
    </div>
  );
}

/**
 * The chapter control: three columns under the frame, the active one carrying
 * a rule that fills across its dwell.
 *
 * Under the film rather than on it. Overlaying the control would mean laying
 * a scrim over the bottom third of every frame to keep it legible, and this
 * design has just gone to some trouble to stop putting scrims on things.
 *
 * The fill is a CSS animation keyed on the active index rather than a rAF
 * loop or a motion value — it is the one thing on the page updating every
 * frame for seven seconds at a stretch, and it should not cost React a single
 * render to do it. Pausing is `animation-play-state`, nothing more.
 */
function ChapterControl({
  index,
  stopped,
  paused,
  locked,
  onSelect,
  onTogglePause,
}: {
  index: number;
  /** The reel is not advancing, for any reason. Holds the progress rule. */
  stopped: boolean;
  /** The user asked for it to stop. Only this drives the button's label. */
  paused: boolean;
  /** Reduced motion: no progress, no pause control. */
  locked: boolean;
  onSelect: (i: number) => void;
  onTogglePause: () => void;
}) {
  return (
    <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
      <ol className="grid flex-1 grid-cols-3 gap-4 sm:gap-8">
        {heroReel.map((clip, i) => {
          const active = i === index;
          return (
            <li key={clip.id}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={active ? "true" : undefined}
                className="group flex w-full flex-col gap-3 text-left"
              >
                {/* The rule comes first: it is the state, and the label is
                    the explanation. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "block h-px w-full overflow-hidden",
                    "transition-colors duration-[var(--dur-micro)]",
                    active
                      ? "bg-[var(--ink-hairline)]"
                      : "bg-[var(--ink-hairline)] group-hover:bg-[var(--ink-hairline-strong)]",
                  )}
                >
                  {active ? (
                    <span
                      // Keyed on the index so the fill restarts from zero on
                      // every activation, including a jump back to itself.
                      key={index}
                      data-paused={stopped ? "" : undefined}
                      className={cn(
                        "block h-full w-full origin-left bg-ink",
                        locked ? "scale-x-100" : "u-hero-progress",
                      )}
                    />
                  ) : null}
                </span>

                <span
                  className={cn(
                    "flex min-h-11 flex-col gap-1 transition-opacity duration-[var(--dur-micro)] ease-brand",
                    active
                      ? "opacity-100"
                      : "opacity-55 group-hover:opacity-90 group-focus-visible:opacity-100",
                  )}
                >
                  <span className="u-label text-ink-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate text-14 text-ink sm:text-16">
                    {clip.label}
                  </span>
                  <span className="u-label truncate text-ink-faint">
                    {clip.place}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {!locked ? (
        <button
          type="button"
          onClick={onTogglePause}
          // The word next to the glyph is hidden below `sm`, so the label is
          // spelled out here rather than left to the visible text.
          aria-label={paused ? "Play the reel" : "Pause the reel"}
          className={cn(
            "u-label inline-flex min-h-11 shrink-0 items-center gap-2.5 self-start text-ink-faint",
            "transition-colors duration-[var(--dur-micro)] ease-brand hover:text-ink sm:pt-6",
          )}
        >
          <PauseGlyph paused={paused} />
          <span className="hidden sm:inline">{paused ? "Play" : "Pause"}</span>
        </button>
      ) : null}
    </div>
  );
}

function PauseGlyph({ paused }: { paused: boolean }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 10 10"
      className="h-2.5 w-2.5 shrink-0"
      fill="currentColor"
    >
      {paused ? (
        <path d="M1 0.5 9 5 1 9.5Z" />
      ) : (
        <>
          <rect x="1" y="0.5" width="2.6" height="9" />
          <rect x="6.4" y="0.5" width="2.6" height="9" />
        </>
      )}
    </svg>
  );
}

/**
 * One revealed line. The mask is a clip-path inside an overflow-hidden
 * wrapper, so the type rises out of nothing rather than sliding in from
 * off-screen.
 *
 * 90ms stagger, applied as an animation-delay rather than a Framer stagger.
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
        style={{ animationDelay: `${index * 90}ms` }}
      >
        {children}
      </span>
    </span>
  );
}
