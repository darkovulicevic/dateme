import type { DatePlan } from "@/lib/plan";

const DURATION_HOURS = 2;

export function buildCalendarInvite(plan: DatePlan) {
  const start = stamp(plan.date, plan.time);
  const endAt = addHours(plan.date, plan.time, DURATION_HOURS);
  const end = stamp(endAt.date, endAt.time);
  const now = new Date();
  const dtStamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const summary = `Date with Darko · ${plan.activity}`;
  const description = plan.message
    ? `${plan.message}\n\nA small contest. May the better one win.`
    : "A small contest. May the better one win.";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Date Me//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${plan.date}-${plan.time}-${plan.activityId}@date-me`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcs(summary)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Tomorrow",
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    "DESCRIPTION:In two hours",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.map(foldLine).join("\r\n") + "\r\n";
}

export function saveCalendarFile(plan: DatePlan) {
  const file = new Blob([buildCalendarInvite(plan)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = "date.ics";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function calendarHref(plan: DatePlan) {
  const params = new URLSearchParams({
    activityId: plan.activityId,
    date: plan.date,
    time: plan.time,
  });
  if (plan.message) params.set("message", plan.message);
  return `/api/calendar?${params.toString()}`;
}

function addHours(date: string, time: string, hours: number) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const value = new Date(year, month - 1, day, hour, minute);
  value.setHours(value.getHours() + hours);
  const pad = (part: number) => String(part).padStart(2, "0");
  return {
    date: `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`,
    time: `${pad(value.getHours())}:${pad(value.getMinutes())}`,
  };
}

function stamp(date: string, time: string) {
  return `${date.replaceAll("-", "")}T${time.replaceAll(":", "")}00`;
}

function escapeIcs(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("\r\n", "\n")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

function foldLine(line: string) {
  if (line.length <= 73) return line;
  let folded = line.slice(0, 73);
  let rest = line.slice(73);
  while (rest.length > 0) {
    folded += `\r\n ${rest.slice(0, 72)}`;
    rest = rest.slice(72);
  }
  return folded;
}
