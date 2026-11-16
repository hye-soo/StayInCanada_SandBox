import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getCategoryReview,
  getMissingFields,
  isFieldDisabled,
  getCategoryProgress,
  getIntakeProgress,
  getNextIncompleteStep,
  getStep,
  getStepStatus,
  parseStepForm,
  pickStepForm,
  type IntakeAnswers,
} from "./intake.ts";

const legal = getStep("legal-identity")!;
const children = getStep("children")!;

test("a plain step is complete once every required field is filled", () => {
  assert.equal(getStepStatus(legal, undefined), "not_started");
  assert.equal(getStepStatus(legal, { values: { lastName: "Chang" } }), "in_progress");
  assert.equal(
    getStepStatus(legal, { values: { lastName: "Chang", firstName: "Alice", citizenship: "Canada" } }),
    "complete"
  );
});

test("a gate step is complete on No, or on Yes with every entry filled", () => {
  assert.equal(getStepStatus(children, { values: { hasChildren: "no" } }), "complete");
  assert.equal(getStepStatus(children, { values: { hasChildren: "yes" }, entries: [] }), "in_progress");
  assert.equal(
    getStepStatus(children, { values: { hasChildren: "yes" }, entries: [{ lastName: "Kim", firstName: "Ana" }] }),
    "in_progress"
  );
  assert.equal(
    getStepStatus(children, {
      values: { hasChildren: "yes" },
      entries: [{ lastName: "Kim", firstName: "Ana", dateOfBirth: "2020-01-01", placeOfBirth: "Seoul" }],
    }),
    "complete"
  );
});

test("category and overall progress count complete steps", () => {
  const answers: IntakeAnswers = {
    "legal-identity": { values: { lastName: "Chang", firstName: "Alice", citizenship: "Canada" } },
  };
  assert.deepEqual(getCategoryProgress("personal", answers), { done: 1, total: 5 });

  const progress = getIntakeProgress(answers);
  assert.equal(progress.doneSteps, 1);
  assert.ok(progress.totalSteps > 20);
  assert.equal(progress.percent, Math.round((1 / progress.totalSteps) * 100));
  assert.equal(progress.completeCategories, 0);
  assert.equal(getNextIncompleteStep(answers)?.id, "birth-physical");
});

test("parsing a form keeps step fields and notes, and numbered entries on a Yes gate", () => {
  const form = new FormData();
  form.set("hasChildren", "yes");
  form.set("notes", "Two kids");
  form.set("entry-0-lastName", "Kim");
  form.set("entry-0-dateOfBirth", "2020-01-01");
  form.set("entry-1-lastName", "");
  form.set("entry-1-dateOfBirth", "");
  form.set("unrelated", "x");

  assert.deepEqual(parseStepForm(children, form), {
    values: { hasChildren: "yes", notes: "Two kids" },
    entries: [
      {
        ...Object.fromEntries(children.fields.map((field) => [field.name, ""])),
        lastName: "Kim",
        dateOfBirth: "2020-01-01",
      },
    ],
  });

  form.set("hasChildren", "no");
  assert.deepEqual(parseStepForm(children, form).entries, []);
});

test("every intake status has a label and a visually distinct badge class", async () => {
  const { INTAKE_STATUS_LABEL, INTAKE_STATUS_BADGE_CLASS } = await import("./intake.ts");
  const classes = Object.values(INTAKE_STATUS_BADGE_CLASS);
  assert.equal(new Set(classes).size, classes.length);
  assert.deepEqual(Object.keys(INTAKE_STATUS_LABEL).sort(), Object.keys(INTAKE_STATUS_BADGE_CLASS).sort());
});

test("missing fields: required plain fields, an unanswered gate, and gaps in Yes entries", () => {
  const form = (entries: Record<string, string>) => {
    const data = new FormData();
    for (const [key, value] of Object.entries(entries)) data.append(key, value);
    return data;
  };
  const identity = getStep("legal-identity")!;
  assert.deepEqual(getMissingFields(identity, form({ lastName: "Chang", firstName: " " })), ["firstName", "citizenship"]);

  const children = getStep("children")!;
  assert.deepEqual(getMissingFields(children, form({})), ["hasChildren"]);
  assert.deepEqual(getMissingFields(children, form({ hasChildren: "no" })), []);
  // Yes with nothing filled flags the first entry; blank extra entries are ignored.
  assert.deepEqual(
    getMissingFields(children, form({ hasChildren: "yes", "entry-0-lastName": "", "entry-0-firstName": "" })),
    ["entry-0-lastName", "entry-0-firstName", "entry-0-dateOfBirth", "entry-0-placeOfBirth"]
  );
  assert.deepEqual(
    getMissingFields(
      children,
      form({
        hasChildren: "yes",
        "entry-0-lastName": "Lee",
        "entry-0-firstName": "Ana",
        "entry-0-dateOfBirth": "",
        "entry-0-placeOfBirth": "Seoul",
        "entry-1-lastName": "",
      })
    ),
    ["entry-0-dateOfBirth"]
  );
});

test("dependent fields stay greyed out until the controlling answer allows them", () => {
  const marital = getStep("marital-status")!;
  const spouseName = marital.fields.find((field) => field.name === "spouseName")!;
  assert.equal(isFieldDisabled(spouseName, {}), true);
  assert.equal(isFieldDisabled(spouseName, { maritalStatus: "Single" }), true);
  assert.equal(isFieldDisabled(spouseName, { maritalStatus: "Married" }), false);
  assert.equal(isFieldDisabled(spouseName, { maritalStatus: "Common-law" }), false);

  const previous = getStep("previous-relationships")!;
  const formerName = previous.fields.find((field) => field.name === "formerSpouseName")!;
  assert.equal(isFieldDisabled(formerName, { previouslyMarried: "no" }), true);
  assert.equal(isFieldDisabled(formerName, { previouslyMarried: "yes" }), false);
});

test("No greys out follow-ups, and a greyed-out required field isn't required", () => {
  const status = getStep("status-citizenship")!;
  const country = status.fields.find((field) => field.name === "countryOfResidence")!;
  assert.equal(isFieldDisabled(country, { livingOutsideNationality: "no" }), true);
  assert.equal(getStepStatus(status, { values: { livingOutsideNationality: "no" } }), "complete");
  const form = new FormData();
  form.append("livingOutsideNationality", "no");
  assert.deepEqual(getMissingFields(status, form), []);

  // War crimes: the explanation opens if any of the four is Yes.
  const war = getStep("war-crimes-violence")!;
  const explanation = war.fields.find((field) => field.name === "explanation")!;
  const allNo = { warCrimes: "no", advocatedViolence: "no", violentGroup: "no", criminalOrganization: "no" };
  assert.equal(isFieldDisabled(explanation, allNo), true);
  assert.equal(isFieldDisabled(explanation, { ...allNo, violentGroup: "yes" }), false);
  assert.equal(isFieldDisabled(explanation, {}), true);
  assert.equal(isFieldDisabled(explanation, { warCrimes: "yes" }), false);
});

test("a repeatable step (schooling) takes several entries with no Yes/No question", () => {
  const schooling = getStep("schooling")!;
  const school = { institution: "NTU", from: "2014-09", to: "2018-06", credential: "", fieldOfStudy: "" };
  assert.equal(getStepStatus(schooling, { values: {}, entries: [school] }), "complete");
  assert.equal(getStepStatus(schooling, { values: {}, entries: [school, { ...school, to: "" }] }), "in_progress");
  assert.equal(getStepStatus(schooling, { values: {}, entries: [] }), "not_started");

  const form = new FormData();
  form.append("entry-0-institution", "NTU");
  form.append("entry-0-from", "2014-09");
  form.append("entry-0-to", "2018-06");
  form.append("entry-1-institution", "High school");
  assert.deepEqual(parseStepForm(schooling, form).entries?.length, 2);
  assert.deepEqual(getMissingFields(schooling, form), ["entry-1-from", "entry-1-to"]);
  assert.deepEqual(getMissingFields(schooling, new FormData()), ["entry-0-institution", "entry-0-from", "entry-0-to"]);
});

test("review rows: answers per step, Yes/No spelled out, skipped follow-ups hidden, entries one row each", () => {
  const review = getCategoryReview("family", {
    "marital-status": { values: { maritalStatus: "Single", spouseName: "", marriageDate: "", spouseOccupation: "" } },
    "previous-relationships": { values: { previouslyMarried: "no" } },
    siblings: {
      values: { hasSiblings: "yes" },
      entries: [{ lastName: "Chang", firstName: "Daniel", placeOfBirth: "Taipei" }],
    },
  });
  const marital = review.find((group) => group.stepId === "marital-status")!;
  // Spouse fields are greyed out for "Single", so they aren't listed.
  assert.deepEqual(marital.rows, [{ label: "Current marital status", value: "Single" }]);
  const previous = review.find((group) => group.stepId === "previous-relationships")!;
  assert.deepEqual(previous.rows, [{ label: "Previously married or widowed?", value: "No" }]);
  const siblings = review.find((group) => group.stepId === "siblings")!;
  assert.deepEqual(siblings.rows, [
    { label: "Do you have siblings?", value: "Yes" },
    { label: "Siblings 1", value: "Chang · Daniel · Taipei" },
  ]);
  const mother = review.find((group) => group.stepId === "mother-details")!;
  assert.equal(mother.rows[0]!.value, "Not provided");
  assert.equal(mother.rows[2]!.value, "Not provided · Optional");
});

test("pickStepForm keeps one step's prefixed inputs, without the prefix", () => {
  const form = new FormData();
  form.append("mother-details__lastName", "Lin");
  form.append("father-details__lastName", "Chang");
  form.append("children__entry-0-firstName", "Ana");
  form.append("section", "family");
  const mother = pickStepForm(form, "mother-details__");
  assert.deepEqual([...mother.entries()], [["lastName", "Lin"]]);
  assert.deepEqual([...pickStepForm(form, "children__").entries()], [["entry-0-firstName", "Ana"]]);
});
