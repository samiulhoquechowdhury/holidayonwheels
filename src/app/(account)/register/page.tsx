import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { registerAccount } from "../auth-actions";
import { AuthForm } from "@/components/account/AuthForm";
import { SectionShell } from "@/components/layout/SectionShell";
import { Eyebrow } from "@/components/primitives/Eyebrow";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false, follow: false },
};

/**
 * Register.
 *
 * ## What an account is for, and what it is not required for
 *
 * Nothing on this site is gated behind an account. Enquiries, the planner and
 * the expedition booking flow all work for somebody who is not signed in,
 * and they must keep working — requiring registration before a phone number
 * is how a travel business loses leads. An account exists so a traveller can
 * come back and find their own trips, not as a toll gate.
 *
 * The copy below says that, because a register page that does not explain why
 * it exists reads as an obstacle.
 */
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;
  const session = await auth();

  if (session?.user) {
    redirect(safePath(redirectTo));
  }

  return (
    <SectionShell>
      <div className="u-container-wide py-16 lg:py-24">
        <div className="max-w-xl">
          <Eyebrow rule>Your account</Eyebrow>
          <h1 className="lg:text-44 text-32 mt-3 text-ink">
            Create an account
          </h1>

          <p className="mt-4 text-16 text-ink-soft">
            So your trips, permits and payments are waiting for you when you
            come back. You do not need one to enquire or to plan a trip.
          </p>

          <AuthForm
            mode="register"
            action={registerAccount}
            redirectTo={redirectTo}
          />

          <p className="mt-8 text-14 text-ink-soft">
            Already have one?{" "}
            <Link
              href={
                redirectTo
                  ? `/sign-in?redirectTo=${encodeURIComponent(safePath(redirectTo))}`
                  : "/sign-in"
              }
              className="underline decoration-[var(--ink-hairline-strong)] underline-offset-4 hover:decoration-ink"
            >
              Sign in
            </Link>
            .
          </p>
        </div>
      </div>
    </SectionShell>
  );
}

function safePath(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/account";
  }
  return value;
}
