"use client";

import { useEffect, useRef } from "react";
import { saveCalendarFile } from "@/lib/calendar";
import { formatPlanDate, formatPlanTime, type DatePlan } from "@/lib/plan";

export function ConfirmScreen({ plan, onRestart }: { plan: DatePlan; onRestart: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section className="screen-in invitation relative rounded-[1.75rem] border border-white/80 px-5 py-10 text-center sm:px-10 sm:py-12">
      <div className="relative mx-auto mb-6 grid h-20 w-20 place-items-center" aria-hidden="true">
        <span className="ring-pulse absolute inset-0 rounded-full border border-rose/40" />
        <span className="absolute inset-2 rounded-full bg-gradient-to-b from-white to-[#f7e6e1] shadow-[0_16px_36px_-16px_rgba(194,87,107,0.9)]" />
        <svg viewBox="0 0 24 24" className="draw-check relative h-8 w-8 text-rose" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.2 4.2L19 7" pathLength={1} />
        </svg>
      </div>

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-serif text-[2.15rem] leading-[1.15] font-medium tracking-tight text-balance text-ink outline-none sm:text-4xl"
      >
        {"It's a date then!"}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-pretty text-muted sm:text-lg">
        {"Can't wait to spend some time with you!"}
      </p>

      <dl className="mt-8 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white/70 text-left">
        <Row label="Activity" value={plan.activity} />
        <Row label="Date" value={formatPlanDate(plan.date)} />
        <Row label="Time" value={formatPlanTime(plan.time)} />
      </dl>

      {plan.message ? (
        <p className="mt-4 rounded-2xl bg-white/70 px-4 py-3 text-left font-serif text-lg leading-snug text-ink whitespace-pre-wrap">
          {`“${plan.message}”`}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => saveCalendarFile(plan)}
        className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-b from-[#d56b7d] to-[#c2576b] px-6 text-sm font-semibold tracking-wide text-white shadow-[0_14px_30px_-12px_rgba(194,87,107,0.95)] transition hover:-translate-y-0.5"
      >
        Add to my calendar
      </button>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Your phone will ask before it saves it. The reminder is set for the day before, and again two hours before.
      </p>

      <button
        type="button"
        onClick={onRestart}
        className="mt-5 inline-flex h-12 items-center justify-center rounded-full border border-line bg-white/80 px-6 text-sm font-semibold tracking-wide text-ink transition hover:-translate-y-0.5 hover:border-rose/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
      >
        Back to the beginning
      </button>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
