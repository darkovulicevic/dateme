import { deliverSubmission, DeliveryError } from "@/lib/deliver";
import { validatePlan, validationMessage, type StoredSubmission } from "@/lib/plan";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return error(400, "That answer didn't come through properly.");
    }

    const raw = await request.text();
    if (raw.length > 20_000) {
      return error(413, "That note is a little too long.");
    }

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return error(400, "That answer didn't come through properly.");
    }

    const result = validatePlan(body);
    if (!result.ok) {
      return Response.json(
        {
          ok: false,
          error: validationMessage(result.fieldErrors),
          fieldErrors: result.fieldErrors,
        },
        { status: 400 },
      );
    }

    const submission: StoredSubmission = {
      ...result.plan,
      submittedAt: new Date().toISOString(),
    };

    const via = await deliverSubmission(submission);
    console.info(`Saved a date plan via ${via}.`);
    return Response.json({ ok: true });
  } catch (caught) {
    if (caught instanceof DeliveryError) {
      return error(caught.status, caught.message);
    }

    console.error("Submit failed", caught instanceof Error ? caught.message : caught);
    return error(500, "I couldn't save your answer. Please try again.");
  }
}

function error(status: number, message: string) {
  return Response.json({ ok: false, error: message }, { status });
}
