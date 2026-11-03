import type { Metadata, Viewport } from "next";
import { fontVariables } from "./fonts";
import { site } from "@/config/site";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChromeGate } from "@/components/layout/ChromeGate";
import { CurrencyProvider } from "@/components/currency/CurrencyProvider";
import { getRates } from "@/lib/fx";
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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  /*
   * Exchange rates, fetched once and handed to the whole tree.
   *
   * On the server, and cached for six hours, so switching currency costs no
   * request at all — the rates are already in the page. `getRates` returns
   * null on any failure and every consumer treats null as "rupees only", so
   * this cannot break a page or a build: it has a six-second timeout for the
   * same reason the weather call does.
   */
  const rates = await getRates();
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
        <CurrencyProvider rates={rates}>
          <SmoothScroll />
          <a className="u-skip-link" href="#main">
            Skip to content
          </a>
          {/* Both gated: `/admin` is an internal tool and gets none of the
            public site's furniture. See `ChromeGate`. */}
          <ChromeGate>
            <Header />
          </ChromeGate>
          <main id="main">{children}</main>
          {/* Off while the planner is mid-flow — see `.u-flow-hide`. */}
          <ChromeGate>
            <div className="u-flow-hide">
              <Footer />
            </div>
          </ChromeGate>
        </CurrencyProvider>
      </body>
    </html>
  );
}
