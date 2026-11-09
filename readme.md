# Date Me?

A small, personal invitation. She opens one page, the **NO** button slips away, and **YES** leads to a short plan for the evening. Her answer is saved on the server — to a private GitHub repository, or by email if GitHub is not set up. The page only says it worked after that save actually succeeds.

## Stack

Next.js (App Router), React, TypeScript, and Tailwind CSS. One page, plus `POST /api/submit`.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Fill in at least one storage option in `.env.local` before you share the link. With neither option set, the form returns an error and does not show the confirmation screen.

## Saving answers

Each submission stores:

- activity
- date
- time
- optional note
- `submittedAt` in UTC

### GitHub (preferred)

1. Create a **private** repository just for answers, for example `date-me-answers`. Add a README so the `main` branch exists. Keep this separate from the website repository — a commit in the website repo would redeploy the site on every answer.
2. Create a fine-grained personal access token with **Contents: Read and write** on that repository only.
3. Set:

```bash
GITHUB_TOKEN=github_pat_...
GITHUB_REPO=your-username/date-me-answers
GITHUB_BRANCH=main
GITHUB_PATH=submissions
```

Each answer becomes its own file, such as `submissions/2026-11-09T00-12-00-000Z-<id>.json`. A separate file avoids two answers overwriting each other.

### Email (fallback)

If GitHub is not configured, the same answer is sent with [Resend](https://resend.com). If GitHub is configured but the save fails, the server tries email before it tells her something went wrong.

```bash
RESEND_API_KEY=re_...
NOTIFY_EMAIL=you@example.com
FROM_EMAIL=Date Me <onboarding@resend.dev>
```

`onboarding@resend.dev` only delivers to the address on your Resend account. For a real sender, verify a domain and put that address in `FROM_EMAIL`.

## Deploy on Vercel

1. Push this project to GitHub (the website repo, not the answers repo).
2. Import it at [vercel.com/new](https://vercel.com/new). Vercel detects Next.js.
3. Add the environment variables from `.env.example` for Production. Do not mark them as exposed to the browser.
4. Deploy, then submit a test answer and confirm the JSON file or the email arrived.

The site is marked `noindex` so search engines are asked not to list it. The link still works for anyone who has it.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
