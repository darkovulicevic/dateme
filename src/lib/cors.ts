const DEFAULT_ORIGINS = ["https://darkovulicevic.github.io"];

function allowedOrigins() {
  const configured = process.env.ALLOWED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return configured && configured.length > 0 ? configured : DEFAULT_ORIGINS;
}

/**
 * The static page on GitHub Pages lives on another origin, so the browser
 * needs explicit permission to send answers to this API. Only listed origins
 * get the header. Same-site requests do not need it.
 */
export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  if (!origin || !allowedOrigins().includes(origin)) return {};

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  };
}
