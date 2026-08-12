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
 * **Remove this when the real assets arrive.** Local files served through a
 * custom loader are not optimised at all, which is the wrong trade the moment
 * the images are ours; delete `images.loader` and `images.loaderFile` from
 * next.config.ts at the same time and the built-in optimiser takes over again.
 */
export default function imageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  if (!src.startsWith("https://images.unsplash.com/")) return src;

  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 72));
  // `auto=format` lets imgix negotiate AVIF/WebP from the Accept header.
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "crop");
  return url.toString();
}
