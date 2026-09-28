import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Where the build output goes.
   *
   * `next dev` and `next build` both write to `.next` by default, so running a
   * build while a dev server is up moves the dev server's own manifests and
   * chunks out from under it. The dev server does not notice: it keeps serving,
   * and every request returns a 500 with nothing in the browser to say why.
   *
   * Point a verification build somewhere else and the two never collide:
   *
   *     NEXT_DIST_DIR=.next-verify pnpm build
   *     NEXT_DIST_DIR=.next-verify pnpm start -p 3270
   *
   * `next start` reads this config too, so the variable has to be set for both
   * commands or start will look in the wrong place.
   */
  distDir: process.env.NEXT_DIST_DIR ?? ".next",

  /**
   * `/tours` was the trip planner and is now the destinations page — one tab
   * asking one question instead of two asking the same one. The redirect
   * keeps every bookmark, every share and anything the crawler has already
   * seen pointing somewhere real, and Next carries the query string across,
   * so `/tours?state=sikkim` still opens the planner on Sikkim.
   *
   * Temporary rather than permanent: a 308 is cached by the browser
   * indefinitely and this structure is a week old. Make it permanent once it
   * has settled.
   *
   * Only the index moves. The forty-seven trips at `/tours/[slug]` stay where
   * they are, and this rule does not touch them.
   */
  async redirects() {
    return [
      { source: "/tours", destination: "/destinations", permanent: false },
    ];
  },

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
