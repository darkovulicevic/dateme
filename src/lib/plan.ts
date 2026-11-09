export const ACTIVITIES = [
  { id: "billiards", label: "🎱 Billiards" },
  { id: "bowling", label: "🎳 Bowling" },
  { id: "coffee", label: "☕ Coffee" },
  { id: "dinner", label: "🍽️ Dinner" },
  { id: "cinema", label: "🎬 Cinema" },
  { id: "walk", label: "🚶 Evening walk" },
  { id: "sunset", label: "🌅 Sunset watching" },
  { id: "dessert", label: "🍰 Dessert" },
  { id: "spontaneous", label: "🎡 Something spontaneous" },
  { id: "surprise", label: "✨ Surprise me" },
] as const;

export type ActivityId = (typeof ACTIVITIES)[number]["id"];

export type DatePlan = {
  activityId: ActivityId;
  activity: string;
  date: string;
  time: string;
  message: string;
};

export type StoredSubmission = DatePlan & {
  submittedAt: string;
};

export type FieldName = "activity" | "date" | "time" | "message";
export type FieldErrors = Partial<Record<FieldName, string>>;

export type ValidationResult =
  | { ok: true; plan: DatePlan }
  | { ok: false; fieldErrors: FieldErrors };

const DAY_MS = 24 * 60 * 60 * 1000;
export const MAX_DAYS_AHEAD = 21;

type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

export function localDateFromNow(days = 0) {
  const now = new Date();
  const shifted = new Date(now.getTime() + days * DAY_MS - now.getTimezoneOffset() * 60_000);
  return shifted.toISOString().slice(0, 10);
}

export function localToday() {
  return localDateFromNow(0);
}

export function localLatestDate() {
  return localDateFromNow(MAX_DAYS_AHEAD);
}

export function validationMessage(errors: FieldErrors) {
  const messages = Object.values(errors);
  if (messages.length === 1) return messages[0] ?? "A few details still need you.";
  return "A few details still need you.";
}

export function validatePlan(input: unknown): ValidationResult {
  const data =
    input && typeof input === "object" && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};

  const fieldErrors: FieldErrors = {};
  const activity = ACTIVITIES.find((item) => item.id === data.activityId);
  if (!activity) fieldErrors.activity = "Choose a location or activity.";

  const date = readDate(data.date);
  if (!date.ok) fieldErrors.date = date.error;

  const time = readTime(data.time);
  if (!time.ok) fieldErrors.time = time.error;

  const note = readMessage(data.message);
  if (!note.ok) fieldErrors.message = note.error;

  if (!activity || !date.ok || !time.ok || !note.ok) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    plan: {
      activityId: activity.id,
      activity: activity.label,
      date: date.value,
      time: time.value,
      message: note.value,
    },
  };
}

function readDate(value: unknown): Parsed<string> {
  if (typeof value !== "string" || value.trim() === "") {
    return { ok: false, error: "Pick a date." };
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return { ok: false, error: "That date doesn't look right." };

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  const real =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  if (!real) return { ok: false, error: "That date doesn't look right." };

  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  if (date.getTime() < todayUtc - DAY_MS) {
    return { ok: false, error: "Pick today or a later day." };
  }
  if (date.getTime() > todayUtc + MAX_DAYS_AHEAD * DAY_MS) {
    return { ok: false, error: `Let's keep it within the next ${MAX_DAYS_AHEAD / 7} weeks.` };
  }

  return { ok: true, value };
}

function readTime(value: unknown): Parsed<string> {
  if (typeof value !== "string" || value.trim() === "") {
    return { ok: false, error: "Pick a time." };
  }

  const match = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/.exec(value.trim());
  if (!match) return { ok: false, error: "That time doesn't look right." };
  return { ok: true, value: `${match[1]}:${match[2]}` };
}

function readMessage(value: unknown): Parsed<string> {
  if (value == null || value === "") return { ok: true, value: "" };
  if (typeof value !== "string") {
    return { ok: false, error: "The note needs to be plain text." };
  }

  const message = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
  if (message.length > 1000) {
    return { ok: false, error: "Keep the note under 1000 characters." };
  }
  return { ok: true, value: message };
}

export function formatPlanDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(year, (month ?? 1) - 1, day));
}

export function formatPlanTime(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hour ?? 0, minute ?? 0, 0, 0);
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
