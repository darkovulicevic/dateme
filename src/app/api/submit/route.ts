import { corsHeaders } from "@/lib/cors";
import { deliverSubmission, DeliveryError } from "@/lib/deliver";
import { validatePlan, validationMessage, type StoredSubmission } from "@/lib/plan";

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: Request) {
  const cors = corsHeaders(request);

  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return error(400, "That answer didn't come through properly.", cors);
    }

    const raw = await request.text();
    if (raw.length > 20_000) {
      return error(413, "That note is a little too long.", cors);
    }

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return error(400, "That answer didn't come through properly.", cors);
    }

    const result = validatePlan(body);
    if (!result.ok) {
      return Response.json(
        {
          ok: false,
          error: validationMessage(result.fieldErrors),
          fieldErrors: result.fieldErrors,
        },
        { status: 400, headers: cors },
      );
    }

    const submission: StoredSubmission = {
      ...result.plan,
      submittedAt: new Date().toISOString(),
    };

    const via = await deliverSubmission(submission);
    console.info(`Saved a date plan via ${via}.`);
    return Response.json({ ok: true }, { headers: cors });
  } catch (caught) {
    if (caught instanceof DeliveryError) {
      return error(caught.status, caught.message, cors);
    }

    console.error("Submit failed", caught instanceof Error ? caught.message : caught);
    return error(500, "I couldn't save your answer. Please try again.", cors);
  }
}

function error(status: number, message: string, headers: Record<string, string>) {
  return Response.json({ ok: false, error: message }, { status, headers });
}
