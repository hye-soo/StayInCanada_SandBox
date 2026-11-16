import {
  INTAKE_CATEGORIES,
  INTAKE_STEPS,
  type IntakeCategoryId,
  type IntakeField,
  type IntakeStep,
} from "./data/intake-steps.ts";

// A step's saved answer. Gate steps keep their repeated details in
// `entries` (one object per child, trip, …); everything else, including
// the gate's own Yes/No and "Additional notes", lives in `values`.
export interface StepAnswer {
  values: Record<string, string>;
  entries?: Record<string, string>[];
}

export type IntakeAnswers = Partial<Record<string, StepAnswer>>;
export type IntakeStatus = "not_started" | "in_progress" | "complete";

export const INTAKE_STATUS_LABEL: Record<IntakeStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  complete: "Complete",
};

// Same verified-contrast tokens as the checklist status badges.
export const INTAKE_STATUS_BADGE_CLASS: Record<IntakeStatus, string> = {
  not_started: "bg-status-required text-status-required-foreground",
  in_progress: "bg-status-submitted text-status-submitted-foreground",
  complete: "bg-status-approved text-status-approved-foreground",
};

export const NOTES_FIELD = "notes";

export function getStep(id: string): IntakeStep | undefined {
  return INTAKE_STEPS.find((step) => step.id === id);
}

export function getCategorySteps(categoryId: IntakeCategoryId): IntakeStep[] {
  return INTAKE_STEPS.filter((step) => step.category === categoryId);
}

const filled = (value: string | undefined) => Boolean(value?.trim());

export function getStepStatus(step: IntakeStep, answer: StepAnswer | undefined): IntakeStatus {
  if (!answer) return "not_started";
  const required = step.fields.filter((field) => field.required);

  if (step.repeatable) {
    const entries = answer.entries ?? [];
    if (entries.length === 0) return "not_started";
    return entries.every((entry) => required.every((field) => filled(entry[field.name]))) ? "complete" : "in_progress";
  }

  if (step.gate) {
    const gate = answer.values[step.gate.name];
    if (gate === "no") return "complete";
    if (gate !== "yes") return Object.values(answer.values).some(filled) ? "in_progress" : "not_started";
    const entries = answer.entries ?? [];
    const allFilled = entries.every((entry) => required.every((field) => filled(entry[field.name])));
    return entries.length > 0 && allFilled ? "complete" : "in_progress";
  }

  if (!Object.values(answer.values).some(filled)) return "not_started";
  return required.every((field) => isFieldDisabled(field, answer.values) || filled(answer.values[field.name]))
    ? "complete"
    : "in_progress";
}

export function getCategoryProgress(categoryId: IntakeCategoryId, answers: IntakeAnswers) {
  const steps = getCategorySteps(categoryId);
  return {
    done: steps.filter((step) => getStepStatus(step, answers[step.id]) === "complete").length,
    total: steps.length,
  };
}

export function getCategoryStatus(categoryId: IntakeCategoryId, answers: IntakeAnswers): IntakeStatus {
  const steps = getCategorySteps(categoryId);
  const statuses = steps.map((step) => getStepStatus(step, answers[step.id]));
  if (statuses.every((status) => status === "complete")) return "complete";
  if (statuses.every((status) => status === "not_started")) return "not_started";
  return "in_progress";
}

export function getIntakeProgress(answers: IntakeAnswers) {
  const doneSteps = INTAKE_STEPS.filter((step) => getStepStatus(step, answers[step.id]) === "complete").length;
  const completeCategories = INTAKE_CATEGORIES.filter(
    (category) => getCategoryStatus(category.id, answers) === "complete"
  ).length;
  return {
    doneSteps,
    totalSteps: INTAKE_STEPS.length,
    percent: Math.round((doneSteps / INTAKE_STEPS.length) * 100),
    completeCategories,
    totalCategories: INTAKE_CATEGORIES.length,
  };
}

export function getNextIncompleteStep(answers: IntakeAnswers): IntakeStep | undefined {
  return INTAKE_STEPS.find((step) => getStepStatus(step, answers[step.id]) !== "complete");
}

// Reads one step's submitted form. Repeated entries arrive as
// "entry-<index>-<field>"; entries left completely blank are dropped,
// and a gate answered No keeps none.
export function parseStepForm(step: IntakeStep, form: FormData): StepAnswer {
  const read = (name: string) => String(form.get(name) ?? "").trim();
  const values: Record<string, string> = {};

  if (!step.gate && !step.repeatable) {
    for (const field of step.fields) values[field.name] = read(field.name);
    values[NOTES_FIELD] = read(NOTES_FIELD);
    return { values };
  }

  if (step.gate) values[step.gate.name] = read(step.gate.name);
  values[NOTES_FIELD] = read(NOTES_FIELD);

  const indexes = new Set<number>();
  for (const key of form.keys()) {
    const match = /^entry-(\d+)-/.exec(key);
    if (match) indexes.add(Number(match[1]));
  }
  const entries = [...indexes]
    .sort((a, b) => a - b)
    .map((index) =>
      Object.fromEntries(step.fields.map((field) => [field.name, read(`entry-${index}-${field.name}`)]))
    )
    .filter((entry) => Object.values(entry).some(filled));

  return { values, entries: step.gate && values[step.gate.name] !== "yes" ? [] : entries };
}

// Required answers missing from a step's form, as input names, so
// "Save & continue" can point at each one. Mirrors getStepStatus: a Yes
// gate needs one entry, and every entry with anything in it complete.
export function getMissingFields(step: IntakeStep, form: FormData): string[] {
  const read = (name: string) => String(form.get(name) ?? "").trim();
  const required = step.fields.filter((field) => field.required);

  if (!step.gate && !step.repeatable) {
    const values = Object.fromEntries(step.fields.map((field) => [field.name, read(field.name)]));
    return required.filter((field) => !isFieldDisabled(field, values) && !values[field.name]).map((field) => field.name);
  }

  if (step.gate) {
    const gate = read(step.gate.name);
    if (!gate) return [step.gate.name];
    if (gate !== "yes") return [];
  }

  const indexes = new Set<number>();
  for (const key of form.keys()) {
    const match = /^entry-(\d+)-/.exec(key);
    if (match) indexes.add(Number(match[1]));
  }
  const started = [...indexes]
    .sort((a, b) => a - b)
    .filter((index) => step.fields.some((field) => read(`entry-${index}-${field.name}`)));
  return (started.length > 0 ? started : [0]).flatMap((index) =>
    required.filter((field) => !read(`entry-${index}-${field.name}`)).map((field) => `entry-${index}-${field.name}`)
  );
}

// A dependent field stays greyed out until a controlling answer allows
// it (Yes, Married, ...): unanswered or No keeps it closed.
export function isFieldDisabled(field: IntakeField, values: Record<string, string | undefined>): boolean {
  if (!field.dependsOn) return false;
  const answers = [field.dependsOn.field].flat().map((name) => values[name]);
  const allowed: readonly string[] = field.dependsOn.values;
  return !answers.some((answer) => answer !== undefined && allowed.includes(answer));
}

export interface ReviewRow {
  label: string;
  value: string;
}

function reviewValue(field: Pick<IntakeField, "required">, value: string | undefined): string {
  if (value === "yes") return "Yes";
  if (value === "no") return "No";
  if (value?.trim()) return value.trim();
  return field.required ? "Not provided" : "Not provided · Optional";
}

// Read-only answer rows for the client's review (Figma "Review answers"),
// one group per step. Greyed-out follow-ups are left out; each repeated
// entry (child, trip, school, ...) is one row of its filled values.
export function getCategoryReview(
  categoryId: IntakeCategoryId,
  answers: IntakeAnswers
): { stepId: string; title: string; rows: ReviewRow[] }[] {
  return getCategorySteps(categoryId).map((step) => {
    const answer = answers[step.id];
    const values = answer?.values ?? {};
    const rows: ReviewRow[] = [];

    if (step.gate || step.repeatable) {
      if (step.gate) rows.push({ label: step.gate.question, value: reviewValue({ required: true }, values[step.gate.name]) });
      (answer?.entries ?? []).forEach((entry, index) => {
        const filledValues = step.fields.map((field) => entry[field.name]?.trim()).filter(Boolean);
        rows.push({ label: `${step.title} ${index + 1}`, value: filledValues.join(" · ") || "Not provided" });
      });
    } else {
      for (const field of step.fields) {
        if (isFieldDisabled(field, values)) continue;
        rows.push({ label: field.label, value: reviewValue(field, values[field.name]) });
      }
    }
    return { stepId: step.id, title: step.title, rows };
  });
}

// One step's inputs out of a form that holds several steps, each input
// named "<prefix><name>" (the review's "Edit <section>" dialog).
export function pickStepForm(form: FormData, prefix: string): FormData {
  const picked = new FormData();
  for (const [key, value] of form.entries()) {
    if (key.startsWith(prefix)) picked.append(key.slice(prefix.length), value);
  }
  return picked;
}
