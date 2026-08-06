import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { SectionShell } from "@/components/layout/SectionShell";
import { CheckoutFlow } from "./CheckoutFlow";
import { resolveOrder, type CheckoutParams } from "./order";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const order = resolveOrder(
    Object.fromEntries(
      Object.entries(params).map(([key, value]) => [
        key,
        Array.isArray(value) ? value[0] : value,
      ]),
    ) as CheckoutParams,
  );

  if (!order) return <NothingToBook />;

  return (
    <>
      <PageHero
        eyebrow="Checkout"
        title={order.title}
        intro={order.strapline}
        tint="paper"
        region={order.region}
      />
      <SectionShell tint="paper">
        <CheckoutFlow order={order} />
      </SectionShell>
    </>
  );
}

/**
 * Reached by landing on /checkout directly, or by a stale link whose slug no
 * longer exists. Says what happened and offers the way back rather than
 * rendering an empty form.
 */
function NothingToBook() {
  return (
    <>
      <PageHero
        eyebrow="Checkout"
        title="There is nothing in this booking"
        intro="Checkout starts from a trip, a homestay or an event — this link did not carry one, or the trip it pointed at is no longer running."
        tint="cloud"
        region="neutral"
      />
      <SectionShell tint="paper">
        <ul className="flex flex-wrap gap-4">
          {[
            { href: "/tours", label: "Browse guided tours" },
            { href: "/motorcycle-tours", label: "Browse expeditions" },
            { href: "/homestays", label: "Browse homestays" },
            { href: "/events", label: "Browse events" },
          ].map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex min-h-12 items-center rounded-[var(--radius-control)] border border-[var(--ink-hairline-strong)] px-6 text-16 transition-colors hover:border-ink"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </SectionShell>
    </>
  );
}
