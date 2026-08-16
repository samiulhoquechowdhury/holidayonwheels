import Link from "next/link";
import { SectionShell } from "@/components/layout/SectionShell";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { ButtonLink } from "@/components/primitives/Button";

const ROUTES = [
  { href: "/tours", label: "Guided tours" },
  { href: "/motorcycle-tours", label: "Motorcycle expeditions" },
  { href: "/homestays", label: "Homestays" },
  { href: "/events", label: "Festivals and events" },
  { href: "/destinations", label: "The eight states" },
  { href: "/ilp", label: "Inner Line Permits" },
];

export default function NotFound() {
  return (
    <>
      <SectionShell
        tint="shell"
        spacing="flush"
        className="pt-[calc(var(--header-h)+5rem)] pb-20 lg:pt-[calc(var(--header-h)+8rem)] lg:pb-28"
      >
        <Eyebrow>404</Eyebrow>
        <h1 className="mt-5 max-w-3xl text-48 lg:text-64">
          This road does not go anywhere.
        </h1>
        <p className="mt-6 max-w-xl text-18 text-ink-soft">
          Which happens more often than you would think in this part of the
          world. The page you asked for is not here — it may have moved, or the
          trip it described may no longer be running.
        </p>
        <ButtonLink href="/" variant="primary" size="lg" className="mt-10">
          Back to the start
        </ButtonLink>
      </SectionShell>

      <SectionShell tint="paper" spacing="tight">
        <Eyebrow className="mb-6">Or go straight to</Eyebrow>
        <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {ROUTES.map((route) => (
            <li key={route.href}>
              <Link
                href={route.href}
                className="inline-flex min-h-12 items-center border-b border-[var(--ink-hairline)] text-18 transition-colors hover:text-sage-ink"
              >
                {route.label}
              </Link>
            </li>
          ))}
        </ul>
      </SectionShell>
    </>
  );
}
