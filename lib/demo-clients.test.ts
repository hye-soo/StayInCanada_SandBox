import { test } from "node:test";
import assert from "node:assert/strict";
import { ensureDemoClients } from "./demo-clients.ts";
import { DEMO_CLIENTS } from "./data/demo-clients.ts";
import { getChecklistStore } from "./checklist-store.ts";
import { getClientProfileStore } from "./client-profile-store.ts";
import { getClientIdentity } from "./client-identity.ts";
import { getQuestionnaireStore } from "./questionnaire-store.ts";
import { getIntakeReviewStore } from "./intake-review-store.ts";

test("demo clients are seeded once, with their documents, intake and profile", () => {
  ensureDemoClients();
  ensureDemoClients();
  const ids = getChecklistStore().getAllClientIds();
  for (const client of DEMO_CLIENTS) assert.equal(ids.filter((id) => id === client.id).length, 1);

  const sam = DEMO_CLIENTS.find((client) => client.id === "client-sam-rivera")!;
  assert.deepEqual(getChecklistStore().getChecklist(sam.id).map((item) => item.status), sam.documents);
  assert.equal(getClientProfileStore().getProfile(sam.id).applicationType, "Visitor extension");
  assert.equal(getClientProfileStore().getProfile(sam.id).applicationId, "FO-2026-032");
  assert.equal(getClientIdentity(sam.id).name, "Sam Rivera");
  assert.ok(getQuestionnaireStore().getSubmittedAt(sam.id));
  assert.equal(getQuestionnaireStore().getAnswers(sam.id)["legal-identity"]?.values.firstName, "Sam");
  assert.equal(getIntakeReviewStore().getReviewed(sam.id).size, 8);

  const casey = DEMO_CLIENTS.find((client) => client.id === "client-casey-nguyen")!;
  assert.deepEqual(getQuestionnaireStore().getAnswers(casey.id), {});
});
