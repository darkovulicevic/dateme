# Date Me?

A small personal invitation site. One page, three steps: a playful YES/NO question, a short date plan, then a confirmation with confetti and a calendar invite.

The answer is saved on the server (GitHub or email). The confirmation screen only appears after that save succeeds.

## Stack

- **Next.js** (App Router) + **React** + **TypeScript**
- **Tailwind CSS**
- Server route: `POST /api/submit`
- Optional: GitHub Contents API and/or [Resend](https://resend.com) for delivery
- Calendar: `.ics` download with reminders

## Flow

1. **Ask** — YES continues; NO dodges the pointer.
2. **Plan** — activity (go-karting or bowling), date (within 3 weeks), time, optional note.
3. **Confirm** — confetti, avatars, plan summary, “Add to my calendar”.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Fill in at least one storage option in `.env.local` before you share the link. With neither set, the form returns an error and never shows confirmation.

## Saving answers

Each submission stores:

- activity
- date
- time
- optional note
- `submittedAt` in UTC

### GitHub (preferred)

1. Create a **private** repo only for answers (e.g. `date-me-answers`), separate from this website repo.
2. Add a fine-grained PAT with **Contents: Read and write** on that repo.
3. Set:

```bash
GITHUB_TOKEN=github_pat_...
GITHUB_REPO=your-username/date-me-answers
GITHUB_BRANCH=main
GITHUB_PATH=submissions
```

Each answer is its own JSON file under `submissions/`.

### Email (fallback)

If GitHub is not configured (or the GitHub save fails), the same payload is emailed via Resend:

```bash
RESEND_API_KEY=re_...
NOTIFY_EMAIL=you@example.com
FROM_EMAIL=Date Me <onboarding@resend.dev>
```

`onboarding@resend.dev` only delivers to your Resend account email. For a real sender, verify a domain.

## Deploy

### Vercel (API + full app)

1. Import this repo at [vercel.com/new](https://vercel.com/new).
2. Add env vars from `.env.example` (Production). Do not expose them as `NEXT_PUBLIC_`.
3. Deploy and send a test answer.

### GitHub Pages (static page only)

Pages serves the UI. Answers still need the Vercel API.

```bash
npm run pages
```

Or push to `main` — the Actions workflow builds and deploys `out/`.

Set the GitHub Actions variable `API_BASE_URL` to your Vercel URL (e.g. `https://your-app.vercel.app`). On Vercel, `ALLOWED_ORIGINS` defaults to `https://darkovulicevic.github.io` (override if needed).

`NEXT_PUBLIC_BASE_PATH` must match the Pages path (default `/dateme`). If the GitHub repo name differs, rename the repo or change the path in `scripts/build-pages.sh` and `.github/workflows/pages.yml`.

## Scripts

```bash
npm run dev      # local development
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint
npm run pages    # static export for GitHub Pages
```

The site is `noindex`. The link still works for anyone who has it.
