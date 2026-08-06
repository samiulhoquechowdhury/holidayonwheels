import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { SectionShell } from "@/components/layout/SectionShell";
import { ILPForm } from "./ILPForm";
import { toISO } from "@/lib/date";

export const metadata: Metadata = {
  title: "Apply for an Inner Line Permit",
  description:
    "Apply for an Inner Line Permit for Arunachal Pradesh, Nagaland, Mizoram or Manipur. We process it at no charge.",
  robots: { index: false, follow: true },
};

export default function ILPApplyPage() {
  // Resolved on the server so the form's default dates are identical in the
  // HTML and after hydration.
  const today = toISO(new Date());

  return (
    <>
      <PageHero
        eyebrow="Permits"
        title="Apply for a permit"
        intro="One application per state, up to seven travellers. We do not charge for processing — where a state levies a government fee it is passed through at cost."
        tint="loktak"
        region="manipur"
      />

      <SectionShell tint="paper">
        <ILPForm today={today} />
      </SectionShell>
    </>
  );
}
