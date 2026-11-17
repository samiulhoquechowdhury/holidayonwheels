"use client";

import type { ImageLoaderProps } from "next/image";

/**
 * Custom `next/image` loader.
 *
 * TEMPORARY, and it exists for one reason: the mock photography is remote.
 * Next's built-in optimiser proxies every remote image through the Node
 * server, re-encodes it, and caches it — which on a page carrying thirty
 * placeholder photographs from a third-party CDN means thirty cold upstream
 * fetches on first render. In practice that produced 504s and 500s, and half
 * the page rendered with broken images.
 *
 * Unsplash is served by imgix, which already does exactly what the optimiser
 * would: resize, re-encode to AVIF/WebP by `Accept`, and cache at the edge.
 * So for those URLs this hands the width straight to imgix and lets the
 * browser fetch it directly. No proxy, no re-encode, no timeouts, and the
 * `srcset` Next generates still works because the loader is called once per
 * candidate width.
 *
 * Anything that is not an Unsplash URL — the logo today, the client's real
 * photography once it lands in `public/media/` — is returned untouched and
 * served as a static file.
 *
 * ## Local media under `/media/` is pre-sized, not unoptimised
 *
 * A custom loader replaces Next's optimiser for *every* image, local ones
 * included — so a 1600px photograph would be sent whole to an 80px
 * thumbnail. That is the trade this file's header used to warn about, and
 * the client's photographs have now started arriving, so it is a live
 * problem rather than a future one.
 *
 * The answer is to pre-generate the widths instead of resizing on demand.
 * Each photograph under `public/media/` is written three times —
 * `01.webp` at 1600, `01-800.webp`, `01-400.webp` — and this picks the
 * smallest one that covers the requested width. `next/image` calls the
 * loader once per `srcset` candidate, so the browser still gets a real
 * `srcset` and downloads the right file, with no server-side work at all.
 *
 * **Keep the three files in step.** A missing `-400` is a 404 at a
 * breakpoint nobody tests on a desktop; `scripts/` has no generator yet, so
 * whoever adds a photograph adds all three. See MEDIA.md.
 */

/** Widths written to disk for every file under `public/media/`. */
const BUCKETS = [400, 800] as const;

export default function imageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  if (src.startsWith("/media/")) {
    /*
     * The canonical path is the 1600 file, so anything wider than the
     * largest bucket is already correct and falls through untouched.
     */
    const bucket = BUCKETS.find((b) => width <= b);
    if (!bucket) return src;
    return src.replace(/\.webp$/, `-${bucket}.webp`);
  }

  if (!src.startsWith("https://images.unsplash.com/")) return src;

  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 72));
  // `auto=format` lets imgix negotiate AVIF/WebP from the Accept header.
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "crop");
  return url.toString();
}
