import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { signInWithPassword } from "../auth-actions";
import { AuthForm } from "@/components/account/AuthForm";
import { SectionShell } from "@/components/layout/SectionShell";
import { Eyebrow } from "@/components/primitives/Eyebrow";

export const metadata: Metadata = {
  title: "Sign in",
  /*
   * Not indexed. A sign-in page in search results is a phishing target and
   * has nothing for a crawler to read.
   */
  robots: { index: false, follow: false },
};

/**
 * Sign in.
 *
 * ## Why this is a server component that may redirect
 *
 * Reading the session here opts the page out of static rendering, which is
 * correct: its content depends on who is asking. Somebody already signed in
 * does not want a sign-in form, and sending them to their account is less
 * surprising than showing a form that would sign them in as themselves
 * again.
 */
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; registered?: string }>;
}) {
  const { redirectTo, registered } = await searchParams;
  const session = await auth();

  if (session?.user) {
    redirect(safePath(redirectTo));
  }

  return (
    <SectionShell>
      <div className="u-container-wide py-16 lg:py-24">
        <div className="max-w-xl">
          <Eyebrow rule>Your account</Eyebrow>
          <h1 className="lg:text-44 text-32 mt-3 text-ink">Sign in</h1>

          <p className="mt-4 text-16 text-ink-soft">
            Your trips, your paperwork and what is still to pay, in one place.
          </p>

          {registered ? (
            <p
              role="status"
              className="mt-6 rounded-[var(--radius-input)] border border-[var(--ink-hairline-strong)] bg-shell px-4 py-3 text-14 text-ink-soft"
            >
              Your account is ready. Sign in to continue.
            </p>
          ) : null}

          <AuthForm
            mode="sign-in"
            action={signInWithPassword}
            redirectTo={redirectTo}
          />

          <p className="mt-8 text-14 text-ink-soft">
            No account yet?{" "}
            <Link
              href={
                redirectTo
                  ? `/register?redirectTo=${encodeURIComponent(safePath(redirectTo))}`
                  : "/register"
              }
              className="underline decoration-[var(--ink-hairline-strong)] underline-offset-4 hover:decoration-ink"
            >
              Create one
            </Link>
            .
          </p>

          {/*
            No "forgot your password" link, because there is no reset flow
            yet — it needs a transactional email provider, which this project
            does not have. A link to a page that cannot help is worse than
            its absence; the office can set a password from the admin in the
            meantime.
          */}
          <p className="text-13 text-ink-softer mt-3">
            Locked out? Email the office and we will reset it for you.
          </p>
        </div>
      </div>
    </SectionShell>
  );
}

/** Same-site paths only. See `safeRedirect` in `auth-actions.ts`. */
function safePath(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/account";
  }
  return value;
}
