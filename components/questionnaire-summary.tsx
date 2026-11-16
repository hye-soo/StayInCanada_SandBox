import { Fragment } from "react";
import { INTAKE_CATEGORIES, type IntakeCategoryId, type IntakeStep } from "@/lib/data/intake-steps.ts";
import { getCategorySteps, NOTES_FIELD, type IntakeAnswers } from "@/lib/intake.ts";

function Rows({ rows }: { rows: [string, string | undefined][] }) {
  return (
    <dl className="grid grid-cols-[minmax(0,auto)_1fr] gap-x-4 gap-y-1 text-sm">
      {rows.map(([label, value]) => (
        <Fragment key={label}>
          <dt className="text-muted-foreground">{label}</dt>
          <dd>{value === "yes" ? "Yes" : value === "no" ? "No" : value?.trim() || "—"}</dd>
        </Fragment>
      ))}
    </dl>
  );
}

function StepAnswers({ step, answers }: { step: IntakeStep; answers: IntakeAnswers }) {
  const answer = answers[step.id];
  const values = answer?.values ?? {};
  const fieldRows = (source: Record<string, string>) =>
    step.fields.map((field): [string, string | undefined] => [field.label, source[field.name]]);

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-semibold text-foreground">{step.title}</h4>
      {step.gate || step.repeatable ? (
        <>
          {step.gate ? <Rows rows={[[step.gate.question, values[step.gate.name]]]} /> : null}
          {(answer?.entries ?? []).map((entry, index) => (
            <div key={index} className="rounded-md border border-border p-3">
              <Rows rows={fieldRows(entry)} />
            </div>
          ))}
        </>
      ) : (
        <Rows rows={fieldRows(values)} />
      )}
      {values[NOTES_FIELD] ? <Rows rows={[["Additional notes", values[NOTES_FIELD]]]} /> : null}
    </div>
  );
}

// One intake category's answers, read-only — used by Admin's
// per-category review.
export function IntakeCategoryAnswers({
  answers,
  categoryId,
}: {
  answers: IntakeAnswers;
  categoryId: IntakeCategoryId;
}) {
  return (
    <div className="flex flex-col gap-5">
      {getCategorySteps(categoryId).map((step) => (
        <StepAnswers key={step.id} step={step} answers={answers} />
      ))}
    </div>
  );
}

// The whole Client Information Form, read-only — the client's printable
// summary and Admin/RCIC's per-client CIF view.
export function QuestionnaireSummary({ answers }: { answers: IntakeAnswers }) {
  return (
    <div className="flex flex-col gap-6">
      {INTAKE_CATEGORIES.map((category) => (
        <section key={category.id} className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">{category.label}</h2>
          <IntakeCategoryAnswers answers={answers} categoryId={category.id} />
        </section>
      ))}
    </div>
  );
}
