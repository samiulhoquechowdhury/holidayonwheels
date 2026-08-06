import Link from "next/link";
import { cn } from "@/lib/cn";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Reveal } from "./Reveal";

/**
 * Eyebrow, headline, optional intro and a link out to the index. Every
 * section on the site opens this way, so it lives here rather than being
 * retyped with slightly different spacing thirty times.
 */
export function SectionHeader({
  eyebrow,
  title,
  intro,
  link,
  tone = "light",
  align = "left",
  className,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  link?: { href: string; label: string };
  tone?: "light" | "onDark";
  align?: "left" | "split";
  className?: string;
}) {
  const dark = tone === "onDark";

  return (
    <Reveal
      className={cn(
        "mb-14 lg:mb-20",
        align === "split" &&
          "lg:flex lg:items-end lg:justify-between lg:gap-16",
        className,
      )}
    >
      <div className="max-w-2xl">
        <Eyebrow tone={dark ? "onDark" : "soft"}>{eyebrow}</Eyebrow>
        <h2 className="mt-5 text-36 lg:text-48">{title}</h2>
        {intro ? (
          <p
            className={cn(
              "mt-5 max-w-xl text-18",
              dark ? "text-night-text-soft" : "text-ink-soft",
            )}
          >
            {intro}
          </p>
        ) : null}
      </div>

      {link ? (
        <div className={cn(align === "split" ? "mt-8 lg:mt-0" : "mt-8")}>
          <Link
            href={link.href}
            className={cn(
              "inline-flex min-h-11 items-center gap-2 text-16 underline underline-offset-8",
              dark
                ? "text-night-text decoration-[rgb(255_255_255/0.35)] hover:decoration-current"
                : "text-ink decoration-[var(--ink-hairline-strong)] hover:decoration-current",
            )}
          >
            {link.label}
            <ArrowGlyph />
          </Link>
        </div>
      ) : null}
    </Reveal>
  );
}

export function ArrowGlyph({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={cn("h-3.5 w-3.5 shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M1 8h13M9 3l5 5-5 5" strokeLinecap="square" />
    </svg>
  );
}
