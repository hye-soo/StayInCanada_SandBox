import { test } from "node:test";
import assert from "node:assert/strict";
import { getSectionStatus } from "./questionnaire-progress.ts";
import type { QuestionnaireResponse } from "./types.ts";

function emptyResponse(): QuestionnaireResponse {
  return {
    applicantInfo: {},
    languageTest: {},
    educationAssessment: {},
    passport: {},
    employment: [],
    educationHistory: [],
    addressHistory: [],
    parents: { mother: {}, father: {} },
    children: [],
    siblings: [],
    travelHistory: { entries: [] },
    declaration: {},
  };
}

test("an untouched object section is not_started", () => {
  const response = emptyResponse();
  assert.equal(getSectionStatus(response, "applicantInfo"), "not_started");
});

test("a partially filled object section is in_progress", () => {
  // Realistic usage: the form submits every field, empty or not — a
  // section with only SOME of its fields missing from the object
  // entirely (not just empty) isn't how the real UI saves data.
  const response = emptyResponse();
  response.passport = {
    passportNumber: "A1",
    placeOfIssue: "",
    dateOfIssue: "",
    dateOfExpiry: "",
  };
  assert.equal(getSectionStatus(response, "passport"), "in_progress");
});

test("a fully filled object section is complete", () => {
  const response = emptyResponse();
  response.passport = {
    passportNumber: "A1",
    placeOfIssue: "Toronto",
    dateOfIssue: "2020-01-01",
    dateOfExpiry: "2030-01-01",
  };
  assert.equal(getSectionStatus(response, "passport"), "complete");
});

test("an empty array section is not_started, a non-empty one is complete", () => {
  const response = emptyResponse();
  assert.equal(getSectionStatus(response, "employment"), "not_started");

  response.employment = [{ position: "Engineer" }];
  assert.equal(getSectionStatus(response, "employment"), "complete");
});

test("a nested section (travelHistory) reflects both its flag and its entries", () => {
  const response = emptyResponse();
  assert.equal(getSectionStatus(response, "travelHistory"), "not_started");

  response.travelHistory = { hasTravelled: "yes", entries: [] };
  assert.equal(getSectionStatus(response, "travelHistory"), "in_progress");

  response.travelHistory = { hasTravelled: "yes", entries: [{ countryOrTerritory: "US" }] };
  assert.equal(getSectionStatus(response, "travelHistory"), "complete");
});
