# FlowOui (StayInCanada) — client portal sandbox

A clickable sandbox of the FlowOui client portal and staff workspace, built
from the Hi-Fi Figma file. It runs entirely on mock data held in memory, so
there is nothing to configure: clone, install, run, and start from the demo
inbox.

## Run it locally

You need **Node.js 20.9 or newer** and npm.

```bash
git clone https://github.com/hye-soo/StayInCanada_SandBox.git
cd StayInCanada_SandBox
git checkout hye-sandbox-v2   # the branch with the full sandbox
npm install
npm run dev
```

Then open **http://localhost:3000/demo**.

No `.env.local` is needed. Without Firebase settings the app runs on the mock
users only (Firebase sign-in is optional and only used if you add the keys).

## Start from the demo inbox (`/demo`)

`/demo` looks like an email inbox with Olivia's invitation. Along the bottom
are the demo controls:

| Button | What it does |
| --- | --- |
| **Reset demo** | Back to the start: Olivia invited but not signed up, empty intake and documents, no memos, everyone signed out. |
| **Fill Olivia's intake** | Fills in all 25 intake questions with sample answers (not submitted), so you can jump straight to review and submit. |
| **Fill Olivia's documents** | Sets Olivia's document checklist to a mix of states (needs changes, required, submitted, in review, completed) and adds matching memos and updates. |
| **Start AI passport review** | Puts Olivia's passport v1 (expiry date cut off) in the staff Review queue, flagged by the AI check. Then **Open as Noah**. |
| **Download passport v2** | The sample replacement file Olivia uploads in the AI review walkthrough. |

All sample data is invented (example.com emails, fake addresses).

### Demo accounts

| Who | Email | Lands on |
| --- | --- | --- |
| Olivia Chang (client) | `olivia@example.com` | `/dashboard` |
| Noah Patel (staff / admin) | `noah@example.com` | `/admin` |

The demo passwords are in [`lib/data/mock-users.ts`](lib/data/mock-users.ts).
Sign in at **http://localhost:3000/login**. Olivia can also create her account
from the invitation: **Accept invitation** in the demo inbox opens
`/invite/welcome-olivia`.

## Suggested walkthroughs

**Full client journey (from scratch)**

1. `/demo` → **Reset demo** → **Accept invitation** → create Olivia's account.
2. Overview → **My Intake** → answer questions (or press **Fill Olivia's intake** on `/demo` to skip ahead).
3. After the last question: **Start review** → check each section, edit with the pop-up, see **Review PDF**.
4. Tick the confirmation → **Send to case team** → success pop-up → **View intake status**.
5. **Request correction** to send the team a note about a submitted answer.

**Documents and memos (quick)**

1. `/demo` → **Fill Olivia's intake** and **Fill Olivia's documents**, then sign in as Olivia.
2. **Document Checklist** → open **Passport** (changes required) to see the team's message and **Upload replacement**, or **Proof of Financial Support** to upload a PDF (max 4 MB) and preview it with **View submitted file**.
3. **Updates & Memo** → reply to the passport memo, send a **New memo**, filter by Action needed / Unread.

**Staff side**

Sign in as Noah → **Overview** and **All clients** → open Olivia → **Intake**
tab to review sections (marking one reviewed switches Olivia's My Intake to
"under review").

**AI review assistant (staff Review queue)**

The AI check is simulated: the same findings every time, no API key. AI only
points out problems and drafts a message; staff decide every outcome.

1. `/demo` → **Start AI passport review** → **Open as Noah**. The queue shows "1 possible issue" on Olivia's passport.
2. **Review** → **Confirm issue** (or **Dismiss finding**) → **Review draft request** → edit the AI draft → **Send request**.
3. **Demo · Open client request** (signs in as Olivia) → **Upload replacement** → choose the downloaded `passport-olivia-v2.pdf` → **Submit replacement**.
4. **Demo · Switch to staff** → v1 and v2 side by side, "No issues detected" → **Approve document**.

The "Demo ·" buttons switch between Olivia and Noah without a password (local dev only).

## Good to know

- **Data lives in memory.** Restarting `npm run dev` (or editing some source files) clears it. Use the `/demo` buttons to get back to a known state.
- **Uploads** must be PDFs up to 4 MB. They're kept in memory only so you can preview them; nothing is stored anywhere.
- **Download PDF** (Review PDF tab) opens the browser's print dialog; choose "Save as PDF".
- Pages are built for desktop (1440 px Figma frames) and stack on smaller screens.

## Scripts

```bash
npm run dev     # dev server on http://localhost:3000
npm test        # unit tests (node --test)
npm run lint    # ESLint
npm run build   # production build
```

## Where things are

| Path | What's there |
| --- | --- |
| `app/(auth)` | A01 accept invitation, A02 sign in |
| `app/(client)` | Client portal: dashboard, questionnaire (My Intake), checklist, updates, profile |
| `app/admin`, `app/rcic` | Staff workspaces |
| `app/demo` | Demo inbox and the reset / fill buttons |
| `components/ui`, `components/patterns`, `components/layouts` | Reusable building blocks, then composed patterns, then page shells |
| `lib/` | In-memory stores, business logic and their tests (`*.test.ts`) |
| `lib/data/` | Intake questions, mock users and the demo sample data |
| `docs/` | Decisions, implementation plan and user flows |

Project conventions are in [`AGENTS.md`](AGENTS.md) and [`CLAUDE.md`](CLAUDE.md).
