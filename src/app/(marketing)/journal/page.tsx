import Link from "next/link";
import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { SectionShell } from "@/components/layout/SectionShell";
import { Reveal } from "@/components/layout/Reveal";
import { Media } from "@/components/primitives/Media";
import { getJournalPosts } from "@/content/journal";
import { formatMedium } from "@/lib/date";
import { journalShots } from "@/config/showcase";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Writing about travelling in Northeast India — when to go, how permits work, and what a support truck actually carries.",
};

export default function JournalPage() {
  const [lead, ...rest] = getJournalPosts();

  return (
    <>
      <PageHero
        eyebrow="Journal"
        title="Worth reading before you book"
        accent="reading"
        image={journalShots[0]}
        intro="Practical writing about the region, from people who run trips in it. No listicles."
        tint="sand"
        region="sikkim"
      />

      <SectionShell tint="paper">
        {/* Lead article, given the space it deserves. */}
        <Reveal>
          <article className="group grid gap-8 lg:grid-cols-2 lg:gap-16">
            {/* The headline links to the same post — this image link stays
                out of the tab order rather than duplicating it. */}
            <Link
              href={`/journal/${lead.slug}`}
              aria-hidden="true"
              tabIndex={-1}
              className="block overflow-hidden rounded-[var(--radius-media)]"
            >
              <Media
                alt={lead.heroAlt}
                src={lead.image}
                seed={`journal-${lead.slug}`}
                region={lead.region}
                aspect="3/2"
                priority
                sizes="(max-width: 1024px) 100vw, 620px"
                imageClassName="transition-transform duration-[var(--dur-image)] ease-brand motion-safe:group-hover:scale-105"
              />
            </Link>
            <div className="lg:self-center">
              <p className="u-label text-ink-soft">
                {lead.tag} · {formatMedium(lead.publishedAt)} ·{" "}
                {lead.readingMinutes} min read
              </p>
              <h2 className="mt-4 text-36 lg:text-48">
                <Link href={`/journal/${lead.slug}`}>{lead.title}</Link>
              </h2>
              <p className="mt-5 max-w-xl text-18 text-ink-soft">
                {lead.excerpt}
              </p>
            </div>
          </article>
        </Reveal>

        <ul className="mt-20 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post, index) => (
            <li key={post.slug}>
              <Reveal delay={Math.min(index, 3) * 0.05}>
                <article className="group">
                  <Link href={`/journal/${post.slug}`} className="block">
                    <div className="overflow-hidden rounded-[var(--radius-media)]">
                      <Media
                        alt={post.heroAlt}
                        src={post.image}
                        seed={`journal-${post.slug}`}
                        region={post.region}
                        aspect="3/2"
                        sizes="(max-width: 640px) 100vw, 400px"
                        imageClassName="transition-transform duration-[var(--dur-image)] ease-brand motion-safe:group-hover:scale-105"
                      />
                    </div>
                    <p className="u-label mt-5 text-ink-soft">
                      {post.tag} · {formatMedium(post.publishedAt)}
                    </p>
                    <h3 className="mt-3 text-22">{post.title}</h3>
                    <p className="mt-2 text-16 text-ink-soft">{post.excerpt}</p>
                    <p className="u-label mt-4 text-ink-faint">
                      {post.readingMinutes} min read
                    </p>
                  </Link>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </SectionShell>
    </>
  );
}
