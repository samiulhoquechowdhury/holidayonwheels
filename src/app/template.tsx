/**
 * 240ms crossfade between routes.
 *
 * This used to be a Framer `motion.div` with `initial={{ opacity: 0 }}`,
 * which put `style="opacity:0"` into the server-rendered HTML. Every page on
 * the site was therefore invisible from first paint until React hydrated and
 * started the tween — and permanently invisible with JavaScript disabled or
 * broken. That is a whole-site blank page hanging off one prop.
 *
 * As a CSS animation it starts at first paint instead of at hydration, which
 * is both correct and faster, and the end state is reached by the animation
 * rather than by JavaScript. `forwards` is not needed: the final keyframe
 * matches the element's natural state, so if the animation never runs at all
 * the content is simply visible.
 *
 * A server component now — the fade needs no client JavaScript whatsoever.
 * Reduced motion is handled globally in globals.css, which collapses every
 * animation duration to ~0.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="u-route-fade">{children}</div>;
}
