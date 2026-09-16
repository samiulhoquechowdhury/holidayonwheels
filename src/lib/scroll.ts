/**
 * Programmatic scrolling that agrees with the smooth-scroll engine.
 *
 * The site scrolls through Lenis. A native `window.scrollTo` issued while
 * Lenis is easing a wheel gesture is overwritten on the next frame, and a
 * native smooth scroll uses the browser's easing rather than the site's — so
 * a "scroll to this day" would either be ignored or feel like a different
 * page. When `SmoothScroll` has published its instance these go through it;
 * otherwise (reduced motion, or before hydration) they fall back to the
 * platform.
 */

type LenisLike = {
  scrollTo: (
    target: number,
    options?: { immediate?: boolean; duration?: number; force?: boolean },
  ) => void;
};

declare global {
  interface Window {
    __lenis?: LenisLike;
  }
}

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Move the page by `dy` pixels with no animation — before paint, invisibly. */
export function shiftScroll(dy: number): void {
  if (Math.abs(dy) < 1) return;
  const top = window.scrollY + dy;
  if (window.__lenis)
    window.__lenis.scrollTo(top, { immediate: true, force: true });
  else window.scrollTo({ top, behavior: "instant" });
}

/** Glide the page to an absolute scroll position. */
export function glideTo(top: number): void {
  const target = Math.max(0, top);
  if (reducedMotion()) {
    window.scrollTo({ top: target, behavior: "instant" });
    return;
  }
  if (window.__lenis)
    window.__lenis.scrollTo(target, { duration: 0.8, force: true });
  else window.scrollTo({ top: target, behavior: "smooth" });
}

/**
 * Bring an element to the top of the screen, clear of the site header.
 *
 * The header hides on scroll-down and returns on scroll-up, so the gap left
 * for it depends on which way the page is about to move: scrolling down, the
 * header will be gone and the element can sit near the very top; scrolling up,
 * it will be back and needs its height cleared.
 */
export function glideToElement(element: HTMLElement, gap = 12): void {
  const rect = element.getBoundingClientRect();
  const headerHeight =
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--header-h"),
    ) || 80;
  const goingDown = rect.top > gap + headerHeight;
  const offset = goingDown ? gap : headerHeight + gap;
  glideTo(window.scrollY + rect.top - offset);
}
