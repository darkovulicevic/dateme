"use client";

import { useEffect, useRef } from "react";
import { Confetti } from "@/components/Confetti";
import { saveCalendarFile } from "@/lib/calendar";
import { formatPlanDate, formatPlanTime, type DatePlan } from "@/lib/plan";

export function ConfirmScreen({ plan }: { plan: DatePlan }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section className="screen-in invitation relative rounded-[1.75rem] border border-white/80 px-5 py-10 text-center sm:px-10 sm:py-12">
      <Confetti />
      <div className="relative mx-auto mb-6 grid h-20 w-20 place-items-center" aria-hidden="true">
        <span className="ring-pulse absolute inset-0 rounded-full border border-rose/40" />
        <span className="absolute inset-2 rounded-full bg-gradient-to-b from-white to-[#f7e6e1] shadow-[0_16px_36px_-16px_rgba(194,87,107,0.9)]" />
        <svg viewBox="0 0 24 24" className="draw-check relative h-8 w-8 text-rose" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.2 4.2L19 7" pathLength={1} />
        </svg>
      </div>

      <div className="mb-7 flex items-center justify-center gap-3 sm:gap-4">
        <Avatar name="Darko" src="darko.jpg" glow="rose" />
        <span className="h-px w-10 bg-gradient-to-r from-transparent via-rose/55 to-transparent sm:w-14" aria-hidden="true" />
        <Avatar name="Magdalena" src="magdalena.jpg" glow="gold" />
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
    </section>
  );
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function Avatar({ name, src, glow }: { name: string; src: string; glow: "rose" | "gold" }) {
  const glowClass = glow === "rose" ? "bg-rose/25" : "bg-[#f0c27a]/30";

  return (
    <div className="relative shrink-0">
      <span className={`absolute top-1/2 left-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl sm:h-24 sm:w-24 ${glowClass}`} aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${BASE_PATH}/avatars/${src}`}
        alt={name}
        width={160}
        height={160}
        className="relative h-20 w-20 rounded-full border-[3px] border-white object-cover shadow-[0_14px_30px_-14px_rgba(194,87,107,0.7)] ring-2 ring-rose/30 sm:h-[5.5rem] sm:w-[5.5rem]"
      />
    </div>
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
