import { buildCalendarInvite } from "@/lib/calendar";
import type { StoredSubmission } from "@/lib/plan";

export class DeliveryError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "DeliveryError";
    this.status = status;
  }
}

type GithubConfig = {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  folder: string;
};

type EmailConfig = {
  apiKey: string;
  to: string;
  from: string;
};

const NOT_CONFIGURED =
  "This invitation isn't ready to save answers yet.";
const TRY_AGAIN = "I couldn't save your answer. Please try again in a moment.";

/**
 * GitHub is the record of truth. Email is used when GitHub is not configured,
 * and also when a configured GitHub save fails so an answer is not lost.
 */
export async function deliverSubmission(submission: StoredSubmission) {
  const github = readGithubConfig();
  const email = readEmailConfig();

  if (!github && !email) {
    console.error(
      "No submission storage is configured. Set GITHUB_TOKEN and GITHUB_REPO, or RESEND_API_KEY and NOTIFY_EMAIL.",
    );
    throw new DeliveryError(503, NOT_CONFIGURED);
  }

  if (github) {
    try {
      await saveToGithub(github, submission);
      return "github" as const;
    } catch (error) {
      console.error("GitHub save failed", error instanceof Error ? error.message : error);
      if (!email) throw new DeliveryError(502, TRY_AGAIN);
    }
  }

  try {
    await sendEmail(email as EmailConfig, submission);
    return "email" as const;
  } catch (error) {
    console.error("Email send failed", error instanceof Error ? error.message : error);
    throw new DeliveryError(502, TRY_AGAIN);
  }
}

function readGithubConfig(): GithubConfig | null {
  const token = process.env.GITHUB_TOKEN?.trim();
  const repoName = process.env.GITHUB_REPO?.trim();
  if (!token || !repoName) return null;

  const match = /^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/.exec(repoName);
  if (!match) {
    console.error("GITHUB_REPO must look like owner/repository.");
    return null;
  }

  const branch = process.env.GITHUB_BRANCH?.trim() || "main";
  const folder = (process.env.GITHUB_PATH?.trim() || "submissions").replace(/^\/+|\/+$/g, "");

  if (!isSafePath(branch) || !isSafePath(folder)) {
    console.error("GITHUB_BRANCH or GITHUB_PATH contains unsupported characters.");
    return null;
  }

  return { token, owner: match[1], repo: match[2], branch, folder };
}

function readEmailConfig(): EmailConfig | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.NOTIFY_EMAIL?.trim();
  const from = process.env.FROM_EMAIL?.trim() || "Date Me <onboarding@resend.dev>";
  if (!apiKey || !to) return null;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    console.error("NOTIFY_EMAIL is not a valid email address.");
    return null;
  }

  return { apiKey, to, from };
}

function isSafePath(value: string) {
  return /^[A-Za-z0-9._/-]+$/.test(value) && !value.includes("..") && !value.startsWith("/") && !value.endsWith("/");
}

async function saveToGithub(config: GithubConfig, submission: StoredSubmission) {
  const stamp = submission.submittedAt.replace(/[:.]/g, "-");
  const filename = `${stamp}-${crypto.randomUUID()}.json`;
  const path = `${config.folder}/${filename}`;
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const url = `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/contents/${encodedPath}`;
  const content = Buffer.from(`${JSON.stringify(submission, null, 2)}\n`, "utf8").toString("base64");

  const response = await fetch(url, {
    method: "PUT",
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      "User-Agent": "date-me",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      message: `Save date plan ${submission.date} ${submission.time}`,
      content,
      branch: config.branch,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub ${response.status}: ${body.slice(0, 300)}`);
  }
}

async function sendEmail(config: EmailConfig, submission: StoredSubmission) {
  const note = submission.message || "—";
  const text = [
    "She said yes.",
    "",
    `Activity: ${submission.activity}`,
    `Date: ${submission.date}`,
    `Time: ${submission.time}`,
    `Note: ${note}`,
    `Sent: ${submission.submittedAt}`,
    "",
    "A calendar file is attached. Open it to save the reminder.",
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.from,
      to: [config.to],
      subject: `She said yes! ${submission.activity} · ${submission.date} ${submission.time}`,
      text,
      html: emailHtml(submission, note),
      attachments: [
        {
          filename: "date.ics",
          content: Buffer.from(buildCalendarInvite(submission), "utf8").toString("base64"),
          content_type: "text/calendar",
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend ${response.status}: ${body.slice(0, 300)}`);
  }
}

function emailHtml(submission: StoredSubmission, note: string) {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:8px 16px 8px 0;color:#8d6b72;">${label}</td><td style="padding:8px 0;color:#3f2a30;">${escapeHtml(value)}</td></tr>`;

  return `<!doctype html>
<html>
  <body style="margin:0;background:#fbf3ee;font-family:Georgia,serif;color:#3f2a30;">
    <div style="max-width:480px;margin:32px auto;background:#fffaf7;border-radius:20px;padding:28px;">
      <p style="margin:0 0 8px;letter-spacing:0.16em;text-transform:uppercase;font-size:12px;color:#c2576b;">Date Me</p>
      <h1 style="margin:0 0 16px;font-weight:500;font-size:28px;">She said yes!</h1>
      <table style="border-collapse:collapse;font-family:sans-serif;font-size:15px;">
        ${row("Activity", submission.activity)}
        ${row("Date", submission.date)}
        ${row("Time", submission.time)}
        ${row("Note", note)}
        ${row("Sent", submission.submittedAt)}
      </table>
    </div>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
