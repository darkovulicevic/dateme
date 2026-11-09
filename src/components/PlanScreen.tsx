"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import {
  ACTIVITIES,
  localLatestDate,
  localToday,
  validatePlan,
  validationMessage,
  type DatePlan,
  type FieldErrors,
  type FieldName,
} from "@/lib/plan";

const FIELD_CLASS =
  "w-full rounded-2xl border border-line bg-white px-4 py-3.5 text-base text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none transition placeholder:text-muted/80 focus:border-rose focus:ring-4 focus:ring-rose/15";

const FIELD_ORDER: FieldName[] = ["activity", "date", "time", "message"];

export function PlanScreen({
  onBack,
  onConfirmed,
}: {
  onBack: () => void;
  onConfirmed: (plan: DatePlan) => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const savingRef = useRef(false);
  const messageId = useId();
  const [activityId, setActivityId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const minDate = useSyncExternalStore(emptySubscribe, localToday, emptyServerSnapshot);
  const maxDate = useSyncExternalStore(emptySubscribe, localLatestDate, emptyServerSnapshot);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingRef.current) return;

    const result = validatePlan({ activityId, date, time, message });
    if (!result.ok) {
      setErrors(result.fieldErrors);
      setFormError(validationMessage(result.fieldErrors));
      const first = FIELD_ORDER.find((field) => result.fieldErrors[field]);
      if (first) document.getElementById(first)?.focus();
      return;
    }

    setErrors({});
    setFormError(null);
    savingRef.current = true;
    setSaving(true);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          activityId: result.plan.activityId,
          date: result.plan.date,
          time: result.plan.time,
          message: result.plan.message,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        fieldErrors?: FieldErrors;
      } | null;

      if (!response.ok || !payload?.ok) {
        setFormError(payload?.error || "I couldn't save your answer. Please try again.");
        if (payload?.fieldErrors) setErrors(payload.fieldErrors);
        return;
      }

      onConfirmed(result.plan);
    } catch {
      setFormError("I couldn't reach the server. Please try again.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <section className="screen-in invitation relative rounded-[1.75rem] border border-white/80 px-5 py-9 sm:px-10 sm:py-12">
      <div className="mb-5 h-px w-14 bg-gradient-to-r from-rose/60 to-transparent" />
      <p className="text-[0.72rem] font-semibold tracking-[0.22em] text-rose uppercase">You said yes</p>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-3 font-serif text-[2.05rem] leading-[1.15] font-medium tracking-tight text-balance text-ink outline-none sm:text-4xl"
      >
        {"I knew you'd say YES!"}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-pretty text-muted sm:text-lg">
        {"Now, let's plan our little adventure."}
      </p>

      <form className="mt-8 space-y-5" noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Field label="Location / Activity" htmlFor="activity" error={errors.activity}>
          <div className="relative">
            <select
              id="activity"
              name="activity"
              className={`${FIELD_CLASS} appearance-none pr-11`}
              value={activityId}
              aria-invalid={errors.activity ? true : undefined}
              aria-describedby={errors.activity ? "activity-error" : undefined}
              onChange={(event) => setActivityId(event.target.value)}
            >
              <option value="" disabled>
                Choose something
              </option>
              {ACTIVITIES.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.label}
                </option>
              ))}
            </select>
            <Chevron />
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date" htmlFor="date" error={errors.date}>
            <input
              id="date"
              name="date"
              type="date"
              className={FIELD_CLASS}
              value={date}
              min={minDate || undefined}
              max={maxDate || undefined}
              aria-invalid={errors.date ? true : undefined}
              aria-describedby={errors.date ? "date-error" : undefined}
              onChange={(event) => setDate(event.target.value)}
            />
          </Field>
          <Field label="Time" htmlFor="time" error={errors.time}>
            <input
              id="time"
              name="time"
              type="time"
              step={60}
              className={FIELD_CLASS}
              value={time}
              aria-invalid={errors.time ? true : undefined}
              aria-describedby={errors.time ? "time-error" : undefined}
              onChange={(event) => setTime(event.target.value)}
            />
          </Field>
        </div>

        <Field label="A note, if you like" htmlFor="message" error={errors.message}>
          <textarea
            id="message"
            name="message"
            rows={4}
            maxLength={1000}
            className={`${FIELD_CLASS} resize-y`}
            placeholder="Anything else you'd like me to know? 😊"
            value={message}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? `message-error ${messageId}` : messageId}
            onChange={(event) => setMessage(event.target.value)}
          />
          {message.length >= 800 ? (
            <p id={messageId} className="mt-1.5 text-right text-xs text-muted">
              {message.length}/1000
            </p>
          ) : (
            <span id={messageId} className="sr-only">
              Optional note, up to 1000 characters.
            </span>
          )}
        </Field>

        {formError ? (
          <p role="alert" className="rounded-2xl bg-[#fff1f2] px-4 py-3 text-sm text-rose-deep">
            {formError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          aria-busy={saving}
          className="inline-flex h-14 w-full items-center justify-center rounded-full bg-gradient-to-b from-[#d56b7d] to-[#c2576b] px-6 text-base font-semibold tracking-wide text-white shadow-[0_14px_30px_-12px_rgba(194,87,107,0.95)] transition duration-200 hover:-translate-y-0.5 hover:from-[#c95f72] hover:to-[#b3475d] disabled:translate-y-0 disabled:cursor-wait disabled:opacity-70"
        >
          {saving ? "Saving your answer…" : "Let's make it happen"}
        </button>
        <button
          type="button"
          onClick={onBack}
          disabled={saving}
          className="w-full py-1 text-sm text-muted transition hover:text-ink disabled:opacity-50"
        >
          Take me back
        </button>
        <span className="sr-only" aria-live="polite">
          {saving ? "Saving your answer" : ""}
        </span>
      </form>
    </section>
  );
}

function emptySubscribe() {
  return () => {};
}

function emptyServerSnapshot() {
  return "";
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="text-left">
      <label htmlFor={htmlFor} className="mb-2 block text-[0.72rem] font-semibold tracking-[0.16em] text-muted uppercase">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-sm text-rose-deep">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Chevron() {
  return (
    <svg
      className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-muted"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}
