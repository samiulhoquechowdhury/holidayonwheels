import type { Metadata, Viewport } from "next";
import { fontVariables } from "./fonts";
import { site } from "@/config/site";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_IN",
    title: site.name,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#FAF7F2",
  width: "device-width",
  initialScale: 1,
  // Never block zoom — pinch-zoom is an accessibility requirement.
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVariables}>
      <head>
        {/*
         * Open the connection to the image host before anything asks for an
         * image.
         *
         * Every photograph on the site is served from this origin, and the
         * one above the fold is the LCP element on most routes. Without a
         * hint the browser only starts DNS, TCP and TLS when it parses that
         * `<img>`, which on a throttled connection is three round trips of
         * nothing happening — `/tours/[slug]` was painting its first content
         * in 0.4s and its largest in 3.1s, with no main-thread work in
         * between to explain the gap.
         *
         * `crossOrigin` is required: images are fetched anonymously, and a
         * preconnect without it opens a *different* connection from the one
         * the fetch then uses, so the warm socket goes unused.
         *
         * This goes when the photography moves to `public/media/` and the
         * origin becomes our own — see MEDIA.md.
         */}
        <link
          rel="preconnect"
          href="https://images.unsplash.com"
          crossOrigin=""
        />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body>
        <SmoothScroll />
        <a className="u-skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        {/* Off while the planner is mid-flow — see `.u-flow-hide`. */}
        <div className="u-flow-hide">
          <Footer />
        </div>
      </body>
    </html>
  );
}
