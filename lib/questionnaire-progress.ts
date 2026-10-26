import type { QuestionnaireResponse, QuestionnaireSectionId, QuestionnaireSectionStatus } from "./types.ts";

function isFilled(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.values(value).some(isFilled);
  return true;
}

// Generic over every section shape (flat object, array, or nested
// object like parents/travelHistory) — no per-section special-casing
// needed. A section is "complete" when every one of its top-level
// slots is filled, "in_progress" when some are, "not_started" when
// none are. Assumes a saved section always includes every one of its
// keys (empty string if blank) — true as long as section forms always
// submit all their fields together, which is how they're built here.
export function getSectionStatus(
  response: QuestionnaireResponse,
  section: QuestionnaireSectionId
): QuestionnaireSectionStatus {
  const value = response[section];

  if (Array.isArray(value)) {
    return value.length > 0 ? "complete" : "not_started";
  }

  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) return "not_started";

  const filledCount = entries.filter(([, v]) => isFilled(v)).length;
  if (filledCount === 0) return "not_started";
  if (filledCount === entries.length) return "complete";
  return "in_progress";
}
