import Link from "next/link";
import { cn } from "@/lib/cn";

const LINKS = [
  { id: "bookings", href: "/account/bookings", label: "My bookings" },
  { id: "permits", href: "/account/permits", label: "My permits" },
] as const;

/** Sub-navigation shared by the account screens. */
export function AccountNav({
  current,
}: {
  current: (typeof LINKS)[number]["id"];
}) {
  return (
    <nav aria-label="Account">
      <ul className="flex gap-2 border-b border-[var(--ink-hairline)]">
        {LINKS.map((link) => {
          const active = link.id === current;
          return (
            <li key={link.id}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-12 items-center border-b-2 px-4 text-16 transition-colors",
                  active
                    ? "border-ink text-ink"
                    : "border-transparent text-ink-soft hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
