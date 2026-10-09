# Firebase Auth + Roles — Sandbox Experiment Report

Branch: `hye-checklist-flow`. Goal: real Firebase Auth (email/password),
roles stored in Firestore, route protection, and a draft permission
matrix to test — on top of the existing mock click-flow. No real file
upload, AI, questionnaire, or storage (unchanged, still mocked).

## What worked

- **Firebase Auth (client SDK)**: email/password sign-up and log-in,
  working end to end.
- **Firestore role storage**: `users/{uid}.role`, defaulting to
  `"client"` on sign-up. Firestore security rules enforce that a
  client-side write can only ever create a doc with `role: "client"`,
  and block every update/delete — so `rcic`/`admin` can only be set via
  a direct Firebase Console edit, exactly as required.
- **Real server-side session verification**: after client-side sign-in,
  a Server Action mints an httpOnly session cookie via Admin SDK
  (`createSessionCookie`); every protected page verifies it server-side
  (`verifySessionCookie`) and looks the role up fresh from Firestore
  each time — a console-edited role takes effect immediately, not
  stuck in a stale cookie. This replaced an earlier, explicitly-flagged
  weaker design (trusting a client-asserted uid) once the Admin SDK
  service-account key was available.
- **Route protection**: logged-out users redirected to `/login`;
  `client` role blocked from both `/admin` and `/rcic`; post-login
  redirect goes to the right landing page per role.
- **Per-client data**: each real signup gets its own, independently
  seeded checklist (all items `"required"`, no fake pre-existing
  progress) instead of everyone sharing one mock client. Admin/RCIC
  screens now query across every client, not one shared mock.
- **Permission function**: `can(role, action)` in `lib/permissions.ts`,
  pure and fully unit-tested against the draft matrix below.
- **Full loop confirmed live**: client signs up → uploads a mock
  document → Admin reviews the AI report + form-suggestion preview,
  optionally leaves an internal note, forwards to RCIC → RCIC approves
  or requests changes with a comment → client sees the result and, on
  "changes required," can re-upload.

## What didn't work the first time / friction points

- **Firestore's default rules block everything** until you explicitly
  publish rules — caused an initial round of "Missing or insufficient
  permissions" errors because rule-publishing was sequenced too late
  relative to when sign-up first needed to write to Firestore.
- **`"use server"` files can only export async functions.** A plain
  constant (`SESSION_COOKIE_NAME`) exported alongside the real Server
  Actions silently broke the whole module in the browser bundle
  ("the module has no exports at all"). Fixed by moving the constant
  to its own plain file.
- **Firebase Admin SDK doesn't reliably run in Next.js's Edge
  middleware runtime.** Worked around by verifying sessions in regular
  Server Components/Actions (Node.js runtime) instead of centralized
  middleware — slightly more repetitive (`requireRole()` called per
  page/action) but avoids the Edge/Admin-SDK incompatibility entirely.
- **Stale Turbopack dev cache** served old compiled errors even after
  the source was fixed twice during this experiment; fixed both times
  by clearing `.next` and restarting. Relatedly, an already-open
  browser tab held onto a stale JS bundle via the HMR socket and kept
  reporting old errors until hard-refreshed — not a real bug, just
  needed a refresh.
- **`npm install firebase firebase-admin` surfaced a pre-existing
  critical Next.js vulnerability** (unrelated to Firebase). Patched by
  bumping `next` within the same major version (16.3.5 → 16.4.0).
- **Unresolved, accepted risk**: `@grpc/grpc-js` (transitive via
  `firebase-admin`) has a high-severity advisory with no non-breaking
  fix — the only fix path is downgrading Firebase itself by about six
  years. Left as-is for this sandbox; worth revisiting if/when this
  becomes real code.

## Still open / not addressed by this experiment

- Retainer-paid gating, the intake questionnaire, real file storage,
  and real AI are all still entirely out of scope and mocked, same as
  before.
- Admin's draft permission to `requestChanges` (see matrix below) is
  tested at the function level but **deliberately not wired into any
  UI action** — building that would contradict the standing decision
  that Admin never contacts the client directly. Flagging this
  tension again rather than silently resolving it either way.
- Which technology backs file storage (cloud drive API vs. AWS S3) is
  still untouched — this experiment only covered identity/roles.

## Permission Matrix — for docs/MEETING.md

Based on what was actually implemented and tested (`lib/permissions.ts`
/ `lib/permissions.test.ts`), filling in the draft table from
`docs/MEETING.md`:

| Action | Client | RCIC | Admin |
| --- | --- | --- | --- |
| Fill intake | Not tested — questionnaire is out of scope for this experiment | Not tested | Not tested |
| Upload documents | Yes, own documents only | No | No |
| View documents | Own only | All clients | All clients |
| Request corrections | No | Yes — wired into the `/rcic` UI | Yes at the permission-function level, but **not** wired into any UI action (see "still open" above) |
| Approve | No | Yes — wired into the `/rcic` UI | No — explicitly confirmed `admin` cannot approve |

The "Request corrections" row for Admin is the one cell worth
double-checking with the team: the permission function says `true`,
but no button exists for it, on purpose. Worth confirming whether that
gap should stay, or whether Admin should get a real (internal-only)
"flag this" action distinct from RCIC's client-facing one.
