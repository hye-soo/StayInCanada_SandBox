import { DEMO_CLIENTS } from "./data/demo-clients.ts";
import { MOCK_USERS } from "./data/mock-users.ts";
import { SAMPLE_INTAKE } from "./data/sample-intake.ts";
import { INTAKE_CATEGORIES, INTAKE_STEPS } from "./data/intake-steps.ts";
import { getChecklistStore } from "./checklist-store.ts";
import { getClientProfileStore } from "./client-profile-store.ts";
import { getQuestionnaireStore } from "./questionnaire-store.ts";
import { getIntakeReviewStore } from "./intake-review-store.ts";
import type { IntakeAnswers } from "./intake.ts";
import { getMemoStore } from "./memo-store.ts";
import { getNotificationStore } from "./notification-store.ts";

const DAY = 24 * 60 * 60 * 1000;
// The checklist store a seed was written into; a reset makes a new one,
// and the demo caseload is seeded again on the next staff page.
// Kept on globalThis: in dev the client and staff screens can load
// this module separately, and each copy would otherwise seed again.
const holder = globalThis as typeof globalThis & { __flowouiDemoSeeded?: WeakSet<object> };
const seeded = (holder.__flowouiDemoSeeded ??= new WeakSet<object>());

function intakeFor(name: string, email: string, state: "submitted" | "in_progress"): IntakeAnswers {
  const [firstName, ...rest] = name.split(" ");
  const answers: IntakeAnswers = {
    ...SAMPLE_INTAKE,
    "legal-identity": {
      values: { ...SAMPLE_INTAKE["legal-identity"]!.values, firstName: firstName!, lastName: rest.join(" "), otherNames: "" },
    },
    contact: { values: { ...SAMPLE_INTAKE.contact!.values, email } },
  };
  // A client part-way through has only the first steps answered.
  return state === "submitted"
    ? answers
    : Object.fromEntries(INTAKE_STEPS.slice(0, 6).map((step) => [step.id, answers[step.id]]));
}

// Demo only: fills the staff screens with a believable caseload (plus
// Olivia, the client you can sign in as). Safe to call on every request.
export function ensureDemoClients(now: number = Date.now()): void {
  // Each store is seeded on its own: in dev a code change can recreate
  // one store (empty) while the others keep their data.
  seedCaseload(now);
  seedMemos();
  seedUpdates();
}

function seedCaseload(now: number): void {
  const checklists = getChecklistStore();
  if (seeded.has(checklists)) return;
  seeded.add(checklists);

  const olivia = MOCK_USERS.find((user) => user.role === "client");
  if (olivia) checklists.getChecklist(olivia.id);

  for (const client of DEMO_CLIENTS) {
    const items = checklists.getChecklist(client.id);
    items.forEach((item, index) => {
      const status = client.documents[index] ?? "required";
      const uploaded = status !== "required";
      checklists.updateItem(client.id, {
        ...item,
        status,
        ...(uploaded
          ? { fileName: `${item.id}.pdf`, fileSize: 850_000, submittedAt: now - client.daysAgo * DAY }
          : {}),
        ...(status === "changes_required"
          ? { staffComment: "The scan is hard to read. Please upload a clearer copy." }
          : {}),
      });
    });

    getClientProfileStore().updateProfile(client.id, {
      applicationId: client.applicationId,
      applicationType: client.applicationType,
      assignedAdvisorName: client.advisor,
    });

    if (client.intake !== "not_started") {
      const questionnaire = getQuestionnaireStore();
      for (const [stepId, answer] of Object.entries(intakeFor(client.name, client.email, client.intake))) {
        if (answer) questionnaire.saveStep(client.id, stepId, answer);
      }
      if (client.intake === "submitted") questionnaire.markSubmitted(client.id);
    }
    for (const category of INTAKE_CATEGORIES.slice(0, client.reviewedSections)) {
      getIntakeReviewStore().markReviewed(client.id, category.id);
    }
  }

}

// A few conversations so both Memo & Updates feeds have something to
// read: a new question, a reply waiting on staff, a request with a
// client, and a welcome note for Olivia.
function seedMemos(): void {
  const memos = getMemoStore();
  if (seeded.has(memos)) return;
  seeded.add(memos);
  const olivia = MOCK_USERS.find((user) => user.role === "client");
  if (olivia) {
    memos.create(olivia.id, {
      from: "staff",
      authorName: "Noah Patel",
      subject: "Welcome to FlowOui",
      body: "Hi Olivia, I'm your case coordinator. Start with your intake, and message me here if anything is unclear.",
      related: { label: "My Intake", href: "/questionnaire" },
      actionLabel: "Open my intake",
    });
  }
  memos.create("client-jordan-lee", {
    from: "staff",
    authorName: "Noah Patel",
    subject: "Updated job offer letter",
    body: "Your employer's new letter has a different start date. Could you upload the signed version?",
    related: { label: "Document checklist", href: "/checklist" },
    actionLabel: "Open",
  });
  const riley = memos.create("client-riley-singh", {
    from: "staff",
    authorName: "Noah Patel",
    subject: "Language test results",
    body: "We still need your IELTS results. Do you have a test date booked?",
    related: { label: "Document checklist", href: "/checklist" },
    actionLabel: "Open",
  });
  memos.reply("client-riley-singh", riley.id, {
    from: "client",
    authorName: "Riley Singh",
    body: "My test is next Saturday. Results should come about two weeks later.",
  });
  memos.create("client-sam-rivera", {
    from: "client",
    authorName: "Sam Rivera",
    subject: "Is a bank letter enough?",
    body: "My bank can give me a letter instead of six months of statements. Would that work for proof of funds?",
    related: { label: "Document checklist · Proof of Financial Support", href: "/checklist/proof-of-funds" },
  });
}

// Staff "Updates": recent client activity, so the staff feed isn't empty.
function seedUpdates(): void {
  const notifications = getNotificationStore();
  if (seeded.has(notifications)) return;
  seeded.add(notifications);
  notifications.create(
    "admin",
    "Riley Singh uploaded Letter of Acceptance",
    "/admin/client-riley-singh/checklist",
    "Ready for your quality check."
  );
  notifications.create(
    "admin",
    "Jordan Lee submitted their intake",
    "/admin/client-jordan-lee/intake",
    "All 8 sections are waiting for your review."
  );
  notifications.create(
    "admin",
    "Quinn Baker uploaded Language Test Results",
    "/admin/client-quinn-baker/checklist",
    "Ready for your quality check."
  );
}
