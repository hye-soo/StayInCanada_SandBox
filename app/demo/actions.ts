"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { resetInviteStore } from "@/lib/invite-store.ts";
import { resetMockAuthStore } from "@/lib/mock-auth-store.ts";
import { resetNotificationStore } from "@/lib/notification-store.ts";
import {
  getQuestionnaireStore,
  resetQuestionnaireStore,
} from "@/lib/questionnaire-store.ts";
import { MOCK_USERS } from "@/lib/data/mock-users.ts";
import { SAMPLE_INTAKE } from "@/lib/data/sample-intake.ts";
import { sampleChecklistUpdates } from "@/lib/data/sample-checklist.ts";
import {
  getChecklistStore,
  resetChecklistStore,
} from "@/lib/checklist-store.ts";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getUploadedFileStore, resetUploadedFileStore } from "@/lib/uploaded-file-store.ts";
import { getAiReviewStore, resetAiReviewStore, type AiOrbMode } from "@/lib/ai-review.ts";
import { startMockSession } from "@/lib/mock-session.ts";
import { getMemoStore, resetMemoStore } from "@/lib/memo-store.ts";
import { getNotificationStore } from "@/lib/notification-store.ts";
import { openChangeRequestMemo } from "@/lib/apply-checklist-action.ts";
import { getClientProfileStore, resetClientProfileStore } from "@/lib/client-profile-store.ts";
import { resetQuestionnaireFlagStore } from "@/lib/questionnaire-flag-store.ts";
import { resetIntakeReviewStore } from "@/lib/intake-review-store.ts";
import { clearSession } from "@/lib/firebase/session-actions.ts";
import { LAST_USER_COOKIE_NAME } from "@/lib/firebase/session-constants.ts";

// Puts the demo back to its starting point so the flow can be recorded
// again: Alice invited but not signed up, intake and documents empty,
// nobody signed in.
export async function resetDemo() {
  resetInviteStore();
  resetMockAuthStore();
  resetNotificationStore();
  resetQuestionnaireStore();
  resetQuestionnaireFlagStore();
  resetIntakeReviewStore();
  resetChecklistStore();
  resetUploadedFileStore();
  resetAiReviewStore();
  resetMemoStore();
  resetClientProfileStore();
  await clearSession();
  (await cookies()).delete(LAST_USER_COOKIE_NAME);
  redirect("/demo");
}

// Saves a finished (not submitted) intake for the mock client, so the
// review and submit screens can be recorded without typing 25 steps.
export async function fillDemoIntake() {
  const alice = MOCK_USERS.find((user) => user.role === "client")!;
  const store = getQuestionnaireStore();
  for (const [stepId, answer] of Object.entries(SAMPLE_INTAKE)) {
    if (answer) store.saveStep(alice.id, stepId, answer);
  }
  redirect("/demo?filled=1");
}

// Puts the mock client's documents mid-way (one of each status), like
// Figma C04, so the checklist can be recorded without uploading files.
export async function fillDemoChecklist() {
  const alice = MOCK_USERS.find((user) => user.role === "client")!;
  const store = getChecklistStore();
  for (const [itemId, update] of Object.entries(sampleChecklistUpdates())) {
    const item = store.getItem(alice.id, itemId);
    if (item) store.updateItem(alice.id, { ...item, ...update });
  }
  // The matching Memo & Updates feed: the passport change request, the
  // approval update, and a question Alice asked earlier.
  // Re-running replaces the seed instead of piling up duplicates.
  resetMemoStore();
  const advisor = getClientProfileStore().getProfile(
    alice.id,
  ).assignedAdvisorName;
  getMemoStore().create(alice.id, {
    from: "client",
    authorName: alice.name,
    subject: "Question about my address history",
    body: "Should I include the hotel where I stayed for two weeks before moving into my apartment?",
    related: {
      label: "My Intake · Address",
      href: "/questionnaire/previous-addresses",
    },
  });
  const approved = "Your letter of acceptance was approved";
  const notifications = getNotificationStore();
  if (
    !notifications
      .getForRecipient(alice.id)
      .some((item) => item.message === approved)
  )
    notifications.create(
      alice.id,
      approved,
      "/checklist/letter-of-acceptance",
      "Your case team approved this document. No action is needed from you.",
    );
  const passport = store.getItem(alice.id, "passport");
  if (passport?.staffComment)
    openChangeRequestMemo(
      alice.id,
      "passport",
      passport.label,
      passport.staffComment,
      advisor,
    );
  redirect("/demo?filled=documents");
}

// Figma "AI Review Assistant" demo, step 01: Alice has just uploaded
// passport v1 (expiry date cut off) and the AI check has flagged it.
export async function startAiPassportDemo() {
  const alice = MOCK_USERS.find((user) => user.role === "client")!;
  const store = getChecklistStore();
  const passport = store.getItem(alice.id, "passport")!;
  const fileName = "passport-alice-v1.pdf";
  const bytes = new Uint8Array(await readFile(path.join(process.cwd(), "public/demo", fileName)));
  store.updateItem(alice.id, {
    ...passport,
    status: "submitted",
    fileName,
    fileSize: bytes.length,
    submittedAt: Date.now(),
    staffComment: undefined,
    previousUpload: undefined,
  });
  getUploadedFileStore().save(alice.id, "passport", { name: fileName, bytes });
  const { orbMode } = getAiReviewStore();
  resetAiReviewStore();
  getAiReviewStore().orbMode = orbMode;
  redirect("/demo?filled=ai");
}

// Figma "Demo · Switch to staff / Open client request": signs in as
// Alice or Maya without a password. Local dev demo only.
export async function switchDemoUser(role: "client" | "admin", next: string) {
  if (process.env.NODE_ENV === "production") redirect("/login");
  const user = MOCK_USERS.find((candidate) => candidate.role === role);
  if (!user) redirect("/login");
  await startMockSession(user);
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

// Demo: how the AI assistant orb in the staff Review queue looks.
export async function setAiOrbMode(formData: FormData) {
  const mode = formData.get("mode");
  if (mode === "auto" || mode === "working" || mode === "idle") getAiReviewStore().orbMode = mode satisfies AiOrbMode;
  redirect("/demo?filled=orb");
}
