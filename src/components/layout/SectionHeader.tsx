import { cn } from "@/lib/cn";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { TextLink } from "@/components/primitives/Button";
import { Reveal } from "./Reveal";

/**
 * Eyebrow, headline, optional intro and a link out to the index. Every
 * section on the site opens this way, so it lives here rather than being
 * retyped with slightly different spacing thirty times.
 *
 * The intro is set in `.u-lede` — the body face at 300. That weight is the
 * whole reason the intro can sit at 22px without shouting, and it is why the
 * headline above it can stay comparatively small.
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
  align?: "left" | "split" | "centre";
  className?: string;
}) {
  const dark = tone === "onDark";

  return (
    <Reveal
      className={cn(
        // Far more air under a section header than the old 56/80px. The
        // headline and the content it introduces are separate thoughts.
        "mb-16 lg:mb-24",
        align === "split" &&
          "lg:flex lg:items-end lg:justify-between lg:gap-20",
        align === "centre" && "mx-auto max-w-2xl text-center",
        className,
      )}
    >
      <div className={cn(align === "centre" ? "" : "max-w-2xl")}>
        <Eyebrow
          tone={dark ? "onDark" : "soft"}
          rule={align !== "centre"}
          className={align === "centre" ? "justify-center" : undefined}
        >
          {eyebrow}
        </Eyebrow>
        <h2 className="mt-6 text-36 lg:text-48">{title}</h2>
        {intro ? (
          <p
            className={cn(
              "u-lede mt-6 max-w-xl text-18 lg:text-22",
              align === "centre" && "mx-auto",
              dark ? "text-night-text-soft" : "text-ink-soft",
            )}
          >
            {intro}
          </p>
        ) : null}
      </div>

      {link ? (
        <div
          className={cn(
            align === "split" ? "mt-10 lg:mt-0 lg:pb-1" : "mt-10",
            align === "centre" && "flex justify-center",
          )}
        >
          <TextLink href={link.href} tone={dark ? "onDark" : "ink"}>
            {link.label}
          </TextLink>
        </div>
      ) : null}
    </Reveal>
  );
}

/**
 * Re-exported so the two callers that reach for a bare arrow keep working.
 * The glyph itself lives with the buttons, which is where it is defined and
 * where its stroke weight is decided.
 */
export { ArrowGlyph } from "@/components/primitives/Button";
