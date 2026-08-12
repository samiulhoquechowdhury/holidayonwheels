import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Mock photography only. Every remote host listed here is a placeholder
     * source used while the client's own shoot is outstanding — see
     * `src/config/showcase.ts` and MEDIA.md. When the real assets land under
     * `public/media/`, this whole block goes away with them.
     */
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
    /**
     * Resizing is delegated to the image host rather than done here. The
     * reasoning, and the conditions for reverting it, are in
     * src/lib/image-loader.ts — read that before changing this.
     */
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
};

export default nextConfig;
