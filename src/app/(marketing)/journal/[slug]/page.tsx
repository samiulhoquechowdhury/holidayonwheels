import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionShell } from "@/components/layout/SectionShell";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { WeaveBand } from "@/components/layout/WeaveBand";
import { Reveal } from "@/components/layout/Reveal";
import { Media } from "@/components/primitives/Media";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { getJournalPostBySlug, getJournalPosts } from "@/content/journal";
import { formatLong } from "@/lib/date";

export function generateStaticParams() {
  return getJournalPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getJournalPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { type: "article", publishedTime: post.publishedAt },
  };
}

export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getJournalPostBySlug(slug);
  if (!post) notFound();

  const more = getJournalPosts()
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  return (
    <article>
      <SectionShell
        tint="paper"
        spacing="flush"
        className="pt-[calc(var(--header-h)+3.5rem)] pb-12 lg:pt-[calc(var(--header-h)+6rem)]"
      >
        <div className="mx-auto max-w-3xl">
          <Eyebrow>
            {post.tag} · {formatLong(post.publishedAt)} · {post.readingMinutes}{" "}
            min read
          </Eyebrow>
          <h1 className="mt-5 text-48 lg:text-64">{post.title}</h1>
          <p className="mt-6 text-22 text-ink-soft">{post.excerpt}</p>
          <p className="u-label mt-8 text-ink-faint">By {post.author}</p>
        </div>
      </SectionShell>

      <div className="u-container-wide">
        <div className="overflow-hidden rounded-[var(--radius-media)]">
          <Media
            alt={post.heroAlt}
            src={post.image}
            seed={`journal-hero-${post.slug}`}
            region={post.region}
            aspect="21/9"
            priority
            sizes="100vw"
          />
        </div>
      </div>

      <WeaveBand
        region={post.region}
        height={28}
        opacity={0.4}
        className="mt-10"
      />

      <SectionShell tint="paper" pattern={post.region} patternOpacity={0.025}>
        {/* A single measured column. Long-form reading is the only job here. */}
        <div className="mx-auto max-w-2xl">
          {post.body.map((paragraph, index) => (
            <p
              key={paragraph}
              className={`text-18 leading-[1.75] text-ink-soft ${
                index === 0 ? "text-22 leading-[1.6] text-ink" : "mt-7"
              }`}
            >
              {paragraph}
            </p>
          ))}

          <div className="mt-16 border-t border-[var(--ink-hairline)] pt-8">
            <Link
              href="/journal"
              className="u-label inline-flex min-h-11 items-center text-jade-ink underline underline-offset-4"
            >
              All writing
            </Link>
          </div>
        </div>
      </SectionShell>

      <WeaveBand region="neutral" height={28} opacity={0.4} />
      <SectionShell tint="shell" pattern="neutral" patternOpacity={0.03}>
        <SectionHeader
          eyebrow="Keep reading"
          title="More from the journal"
          link={{ href: "/journal", label: "All writing" }}
          align="split"
        />
        <ul className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {more.map((other, index) => (
            <li key={other.slug}>
              <Reveal delay={index * 0.06}>
                <Link href={`/journal/${other.slug}`} className="group block">
                  <div className="overflow-hidden rounded-[var(--radius-media)]">
                    <Media
                      alt={other.heroAlt}
                      src={other.image}
                      seed={`journal-${other.slug}`}
                      region={other.region}
                      aspect="3/2"
                      sizes="(max-width: 640px) 100vw, 400px"
                      imageClassName="transition-transform duration-[var(--dur-image)] ease-brand motion-safe:group-hover:scale-105"
                    />
                  </div>
                  <p className="u-label mt-5 text-ink-soft">{other.tag}</p>
                  <h3 className="mt-3 text-22">{other.title}</h3>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </SectionShell>
    </article>
  );
}
