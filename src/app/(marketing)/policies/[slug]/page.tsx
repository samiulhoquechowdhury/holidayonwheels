import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { SectionShell } from "@/components/layout/SectionShell";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { getPolicies, getPolicyBySlug } from "@/content/site-content";
import { formatLong } from "@/lib/date";

export function generateStaticParams() {
  return getPolicies().map((policy) => ({ slug: policy.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const policy = getPolicyBySlug(slug);
  if (!policy) return {};
  return { title: policy.title };
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const policy = getPolicyBySlug(slug);
  if (!policy) notFound();

  const others = getPolicies().filter((p) => p.slug !== slug);

  return (
    <>
      <PageHero
        eyebrow={`Updated ${formatLong(policy.updatedAt)}`}
        title={policy.title}
        tint="paper"
        region="neutral"
      />

      <SectionShell tint="paper">
        <div className="grid gap-12 lg:grid-cols-[1fr_220px] lg:gap-20">
          <div className="max-w-2xl min-w-0">
            {policy.sections.map((section) => (
              <section key={section.heading} className="mb-14 last:mb-0">
                <h2 className="text-28">{section.heading}</h2>
                {section.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-4 text-16 leading-[1.7] text-ink-soft"
                  >
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>

          <aside className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start">
            <Eyebrow className="mb-4">Other policies</Eyebrow>
            <ul className="flex flex-col gap-2">
              {others.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={`/policies/${other.slug}`}
                    className="inline-flex min-h-11 items-center text-16 text-ink-soft transition-colors hover:text-ink"
                  >
                    {other.title}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </SectionShell>
    </>
  );
}
