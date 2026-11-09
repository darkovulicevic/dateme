import { buildCalendarInvite } from "@/lib/calendar";
import { validatePlan } from "@/lib/plan";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const result = validatePlan({
    activityId: url.searchParams.get("activityId"),
    date: url.searchParams.get("date"),
    time: url.searchParams.get("time"),
    message: url.searchParams.get("message") ?? "",
  });

  if (!result.ok) {
    return new Response("That date plan is not valid.", { status: 400 });
  }

  return new Response(buildCalendarInvite(result.plan), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="date.ics"',
      "Cache-Control": "no-store",
    },
  });
}
