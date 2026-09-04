"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import { nightsBetween } from "@/lib/date";
import { Accent } from "@/components/primitives/Accent";
import { LuxeButton } from "@/components/primitives/LuxeButton";
import { ChoiceCard } from "./ChoiceCard";
import { PlannerDates } from "./PlannerDates";
import {
  PlannerTravellers,
  emptyTravellerDraft,
  type TravellerDraft,
} from "./PlannerTravellers";
import { PlannerResult } from "./PlannerResult";
import { PARTY_TYPES, isPartyType, type PartyType } from "@/lib/party";
import { planTripAction } from "@/app/(browse)/tours/plan-actions";
import type { PlannerState } from "./types";
import type { TripPlan } from "@/lib/plan";
import type { StateSlug } from "@/content/types";

/**
 * Where → who → when → you → your itinerary.
 *
 * The tours index used to open with forty-seven cards and a filter rail,
 * which serves the visitor who already knows what they want and abandons the
 * one who does not — and on a trip to a region most people cannot name eight
 * states of, that second visitor is nearly all of them. This asks the four
 * questions a reservations agent would ask on the phone, in the order they
 * would ask them, and answers with an itinerary rather than a result count.
 *
 * Three decisions hold the whole thing up:
 *
 *  - **One question per screen.** Every step is a single decision with the
 *    others out of sight. A form that shows eight states, five party types,
 *    two date fields and a traveller table at once is a form that gets
 *    scrolled past, however good each part of it is.
 *  - **The steps are one component, not four routes.** A refresh mid-flow
 *    cannot lose the draft, and the rail can walk backwards into any answered
 *    step without a navigation.
 *  - **The itinerary is composed on the server.** See `plan-actions.ts` — the
 *    day library is twenty-five kilobytes of prose about sixty places, and
 *    the browser only ever receives the handful of days the traveller asked
 *    for.
 *
 * Nothing here is a modal, nothing traps focus, and every step is reachable
 * by keyboard in the order it reads.
 */

type Step = "state" | "party" | "dates" | "travellers" | "plan";

const STEPS: { id: Step; label: string; question: string }[] = [
  { id: "state", label: "Where", question: "Where are you going?" },
  { id: "party", label: "Who", question: "Who is travelling?" },
  { id: "dates", label: "When", question: "When can you go?" },
  { id: "travellers", label: "You", question: "Tell us about the party" },
  { id: "plan", label: "Itinerary", question: "Your itinerary" },
];

export function TripPlanner({
  states,
  today,
  eyebrow,
  initialState,
  initialParty,
}: {
  states: PlannerState[];
  /** Rendered on the server, so "earliest date" cannot differ on hydration. */
  today: string;
  /** The line above the rail. The planner opens the page, so it needs one. */
  eyebrow?: string;
  /** From `?state=` — the home page's state index links straight in here. */
  initialState?: string;
  /** From `?type=` — so do the four journey tiles. */
  initialParty?: string;
}) {
  const startingState = states.find((s) => s.slug === initialState)?.slug;
  const startingParty = isPartyType(initialParty) ? initialParty : undefined;

  const [step, setStep] = useState<Step>(
    startingState ? (startingParty ? "dates" : "party") : "state",
  );
  const [stateSlug, setStateSlug] = useState<StateSlug | undefined>(
    startingState,
  );
  const [party, setParty] = useState<PartyType | undefined>(startingParty);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [draft, setDraft] = useState<TravellerDraft>(() =>
    emptyTravellerDraft(startingParty ?? "couple"),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startPlanning] = useTransition();

  const headingRef = useRef<HTMLHeadingElement>(null);
  const chosenState = states.find((s) => s.slug === stateSlug);
  const reached = STEPS.findIndex((s) => s.id === step);

  /*
   * Move focus to the step's question when the step changes.
   *
   * This has to be an effect rather than a call inside the click handler:
   * the button that was clicked usually unmounts as the step changes, which
   * drops focus to <body> *after* any synchronous focus call would have run.
   * The same bug was found and fixed in the checkout flow; the guard against
   * stealing focus on first paint is for the same reason it is there.
   */
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  // Focus the first invalid field, after React has committed `aria-invalid`.
  useEffect(() => {
    if (Object.keys(errors).length === 0) return;
    document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [errors]);

  function chooseState(slug: StateSlug) {
    setStateSlug(slug);
    setPlan(null);
    // A length that suited Meghalaya is wrong for Sikkim, so the dates are
    // cleared rather than silently carried onto a different road.
    if (slug !== stateSlug) {
      setStart("");
      setEnd("");
    }
    setStep("party");
  }

  function chooseParty(id: PartyType) {
    setParty(id);
    setPlan(null);
    // The party sets the head count it implies — a honeymoon is two people,
    // a group is six — and the next step is where that gets corrected.
    setDraft((current) => ({
      ...emptyTravellerDraft(id),
      lead: current.lead,
      notes: current.notes,
    }));
    setStep("dates");
  }

  function validateTravellers(): boolean {
    const found: Record<string, string> = {};
    if (draft.lead.name.trim().length < 2) {
      found["plan-name"] = "Tell us what to call you.";
    }
    if (!draft.lead.email.includes("@")) {
      found["plan-email"] = "We need an email to send the itinerary to.";
    }
    if (draft.lead.phone.replace(/\D/g, "").length < 10) {
      found["plan-phone"] =
        "A ten-digit mobile number, with the country code if you are outside India.";
    }
    setErrors(found);
    return Object.keys(found).length === 0;
  }

  function buildPlan() {
    if (!stateSlug || !party) return;
    if (!validateTravellers()) return;

    setPlanError(null);
    startPlanning(async () => {
      const response = await planTripAction({
        state: stateSlug,
        party,
        startDate: start,
        endDate: end,
        adults: draft.adults,
        children: draft.children,
      });

      if (!response.ok) {
        setPlanError(response.error);
        return;
      }
      setPlan(response.plan);
      setSent(false);
      setStep("plan");
    });
  }

  function restart() {
    setStep("state");
    setStateSlug(undefined);
    setParty(undefined);
    setStart("");
    setEnd("");
    setDraft(emptyTravellerDraft("couple"));
    setPlan(null);
    setSent(false);
    setErrors({});
  }

  const nights = start && end ? nightsBetween(start, end) : 0;
  const canContinue =
    step === "state"
      ? Boolean(stateSlug)
      : step === "party"
        ? Boolean(party)
        : step === "dates"
          ? nights >= 2
          : true;

  return (
    <div>
      {eyebrow ? (
        <p className="u-label mb-8 flex items-center gap-4 text-ink-faint">
          <span
            aria-hidden="true"
            className="h-0.5 w-12 shrink-0 rounded-full bg-clay"
          />
          {eyebrow}
        </p>
      ) : null}

      <StepRail
        current={step}
        reached={reached}
        summary={{
          state: chosenState?.name,
          party: party
            ? PARTY_TYPES.find((p) => p.id === party)?.label
            : undefined,
          nights: nights > 0 ? `${nights} nights` : undefined,
          travellers:
            step === "travellers" || step === "plan"
              ? `${draft.adults + draft.children} travelling`
              : undefined,
        }}
        onJump={(id) => {
          setPlanError(null);
          setStep(id);
        }}
      />

      {/*
       * The page's `h1`, and it changes with the step.
       *
       * The tours index used to open with a hero whose headline was the h1
       * and whose job was to introduce a list. There is no list at the top of
       * this page any more — there is a question — so the question is the
       * heading, and the document outline follows what is actually on screen
       * rather than describing something that was removed.
       */}
      <h1
        ref={headingRef}
        tabIndex={-1}
        // Focusing the heading makes the browser scroll it into view, and
        // without this it lands under the fixed header plate.
        className="mt-8 max-w-3xl scroll-mt-[calc(var(--header-h)+2.5rem)] text-36 outline-none lg:text-64"
      >
        {step === "state" ? (
          <>
            Where are you <Accent>going</Accent>?
          </>
        ) : step === "party" ? (
          <>
            Who is <Accent>travelling</Accent>?
          </>
        ) : step === "dates" ? (
          <>
            When can you <Accent>go</Accent>?
          </>
        ) : step === "travellers" ? (
          <>
            Tell us about the <Accent>party</Accent>
          </>
        ) : (
          <>
            Here is what we would <Accent>do</Accent>
          </>
        )}
      </h1>

      <div className="mt-10 lg:mt-14">
        {step === "state" ? (
          <>
            <p className="max-w-2xl text-18 text-ink-soft">
              Eight states, and they are less alike than the map makes them look
              — different languages, different food, different altitudes and
              very different roads. Pick one to build around; we can add a
              second once we are talking.
            </p>
            <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {states.map((state, index) => (
                <li key={state.slug}>
                  <ChoiceCard
                    index={index + 1}
                    label={state.name}
                    copy={state.tagline}
                    meta={[
                      `${state.minDays}–${state.maxDays} days`,
                      `${state.tripCount} ${state.tripCount === 1 ? "trip" : "trips"}`,
                      ...(state.requiresILP ? ["Permit"] : []),
                    ]}
                    image={state.image}
                    alt={`${state.name} — ${state.knownFor.slice(0, 2).join(", ")}`}
                    colour={state.colour}
                    ink={state.ink}
                    selected={stateSlug === state.slug}
                    onSelect={() => chooseState(state.slug)}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {step === "party" && chosenState ? (
          <>
            <p className="max-w-2xl text-18 text-ink-soft">
              This changes {chosenState.name} more than you would expect. It
              sets the vehicle, the rooms, the pace, and — where there are
              children in the party — which days we are willing to put on the
              itinerary at all.
            </p>
            <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6">
              {PARTY_TYPES.map((option) => (
                <li key={option.id}>
                  <ChoiceCard
                    label={option.label}
                    copy={option.copy}
                    meta={option.changes}
                    image={option.image}
                    alt={option.alt}
                    colour={option.colour}
                    ink={option.ink}
                    aspect="3/4"
                    selected={party === option.id}
                    onSelect={() => chooseParty(option.id)}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {step === "dates" && chosenState ? (
          <>
            <p className="max-w-2xl text-18 text-ink-soft">
              {chosenState.routeNote} We build the itinerary from the length, so
              this is the decision that shapes it.
            </p>
            <div className="mt-10">
              <PlannerDates
                state={chosenState}
                today={today}
                start={start}
                end={end}
                onStartChange={setStart}
                onEndChange={setEnd}
              />
            </div>
          </>
        ) : null}

        {step === "travellers" && chosenState && party ? (
          <>
            <p className="max-w-2xl text-18 text-ink-soft">
              Last screen before the itinerary. The head count changes the
              per-person rate, and children change the route.
            </p>
            <div className="mt-10">
              <PlannerTravellers
                value={draft}
                onChange={setDraft}
                errors={errors}
              />
            </div>
          </>
        ) : null}

        {step === "plan" && plan ? (
          <PlannerResult
            // Re-keyed per plan so the day-by-day form starts fresh. Without
            // it, a Sikkim lodge chosen on day 3 survives into a re-planned
            // Meghalaya trip, where that option does not exist.
            key={plan.reference}
            plan={plan}
            sent={sent}
            onSend={() => setSent(true)}
            onChangeDates={() => setStep("dates")}
            onRestart={restart}
          />
        ) : null}
      </div>

      {planError ? (
        <p
          role="alert"
          className="mt-8 border-l-2 border-ember py-1 pl-5 text-16 text-ember-ink"
        >
          {planError}
        </p>
      ) : null}

      {/* --- Moving between steps ------------------------------------- */}
      {step !== "plan" ? (
        <div className="mt-14 flex flex-wrap items-center gap-4 border-t border-[var(--ink-hairline)] pt-8">
          {step !== "state" ? (
            <button
              type="button"
              onClick={() => setStep(STEPS[reached - 1].id)}
              className="u-label min-h-13 px-3 text-ink-faint underline underline-offset-4 transition-colors hover:text-ink"
            >
              Back
            </button>
          ) : null}

          {step === "dates" || step === "travellers" ? (
            <LuxeButton
              variant={step === "travellers" ? "clay" : "primary"}
              size="lg"
              disabled={!canContinue || pending}
              onClick={() =>
                step === "dates" ? setStep("travellers") : buildPlan()
              }
              className={cn(!canContinue && "opacity-50")}
            >
              {step === "travellers"
                ? pending
                  ? "Drafting your itinerary…"
                  : "Build my itinerary"
                : "Continue"}
            </LuxeButton>
          ) : (
            <p className="u-label text-ink-faint">
              {step === "state"
                ? "Choose a state to carry on"
                : "Choose how you are travelling"}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

/**
 * The rail.
 *
 * It is a progress indicator and a way back in one object: a step that has
 * been answered shows its answer and is a button, a step that has not is
 * inert. Showing the answer rather than only the label is what lets somebody
 * four screens in check what they chose without leaving the screen they are
 * on — which is the single most common reason a multi-step form gets
 * abandoned halfway.
 */
function StepRail({
  current,
  reached,
  summary,
  onJump,
}: {
  current: Step;
  reached: number;
  summary: {
    state?: string;
    party?: string;
    nights?: string;
    travellers?: string;
  };
  onJump: (step: Step) => void;
}) {
  const answers: Record<Step, string | undefined> = {
    state: summary.state,
    party: summary.party,
    dates: summary.nights,
    travellers: summary.travellers,
    plan: undefined,
  };

  return (
    <ol className="-mx-[var(--gutter)] flex scrollbar-none gap-2 overflow-x-auto px-[var(--gutter)] pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
      {STEPS.map((item, index) => {
        const done = index < reached;
        const active = item.id === current;
        const answer = answers[item.id];

        return (
          <li key={item.id} className="shrink-0">
            <button
              type="button"
              disabled={!done}
              onClick={() => onJump(item.id)}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-full border px-4",
                "transition-colors duration-[var(--dur-micro)] ease-brand",
                active
                  ? "border-transparent bg-ink text-paper"
                  : done
                    ? "border-[var(--ink-hairline-strong)] hover:bg-[rgb(46_42_36/0.05)]"
                    : "border-[var(--ink-hairline)] text-ink-faint",
              )}
            >
              <span className="u-num u-label opacity-60">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="u-label whitespace-nowrap">{item.label}</span>
              {answer && !active ? (
                <span className="u-label whitespace-nowrap text-ink-faint">
                  {answer}
                </span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
