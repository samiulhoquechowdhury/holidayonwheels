import Image from "next/image";
import Link from "next/link";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Rise } from "@/components/motion/Rise";
import { Accent } from "@/components/primitives/Accent";
import { LuxeButtonLink } from "@/components/primitives/LuxeButton";
import { getJournalPosts } from "@/content/journal";
import { journalShots } from "@/config/showcase";
import { formatMedium } from "@/lib/date";

/**
 * The journal.
 *
 * Two columns rather than three. Three thumbnails is a blog widget; two large
 * frames is a magazine, and the difference in how seriously the writing is
 * taken is entirely a function of how much room it is given. The third post
 * runs as a text row underneath — present, findable, and not pretending to be
 * as important as the two above it.
 *
 * This sits second-to-last on purpose. A reader still on the page here is not
 * ready to book; they are still deciding whether we know anything. Writing is
 * the only thing that answers that.
 */
export function JournalGrid() {
  const posts = getJournalPosts().slice(0, 5);
  const [lead, second, ...rest] = posts;

  return (
    <section className="relative bg-paper py-[var(--section-pad)]">
      <div className="u-container-wide">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <Rise className="u-label mb-6 flex items-center gap-4 text-ink-faint">
              <span className="h-px w-12 bg-[var(--ink-hairline-strong)]" />
              Journal
            </Rise>
            <SplitReveal className="max-w-2xl text-48 lg:text-88">
              Worth <Accent>reading</Accent> before you book
            </SplitReveal>
          </div>
          <Rise delay={0.15}>
            <LuxeButtonLink href="/journal" variant="ghost">
              All writing
            </LuxeButtonLink>
          </Rise>
        </div>

        <Rise
          as="ul"
          stagger={0.1}
          className="mt-14 grid gap-10 md:grid-cols-2 lg:mt-20 lg:gap-6"
        >
          {[lead, second].filter(Boolean).map((post, index) => (
            <li key={post.slug}>
              <Link href={`/journal/${post.slug}`} className="group block">
                <span className="relative block aspect-[4/3] overflow-hidden rounded-[var(--radius-media)]">
                  <Image
                    src={journalShots[index] ?? ""}
                    alt={post.heroAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 46vw"
                    className="u-media-push object-cover"
                  />
                </span>
                <span className="u-label mt-6 block text-ink-faint">
                  {post.tag} · {formatMedium(post.publishedAt)} ·{" "}
                  {post.readingMinutes} min
                </span>
                <span className="mt-4 block font-display text-28 leading-[var(--leading-display)] tracking-[var(--tracking-display)] lg:text-36">
                  {post.title}
                </span>
                <span className="mt-3 block max-w-lg text-16 text-ink-soft">
                  {post.excerpt}
                </span>
              </Link>
            </li>
          ))}
        </Rise>

        {rest.length > 0 ? (
          <Rise
            as="ul"
            stagger={0.06}
            className="mt-16 border-t border-[var(--ink-hairline)]"
          >
            {rest.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/journal/${post.slug}`}
                  className="group flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b border-[var(--ink-hairline)] py-6"
                >
                  <span className="font-display text-22 transition-colors duration-[var(--dur-micro)] ease-brand group-hover:text-clay-ink lg:text-28">
                    {post.title}
                  </span>
                  <span className="u-label text-ink-faint">
                    {post.tag} · {post.readingMinutes} min
                  </span>
                </Link>
              </li>
            ))}
          </Rise>
        ) : null}
      </div>
    </section>
  );
}
