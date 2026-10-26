import { Fragment } from "react";
import {
  APPLICANT_INFO_STEPS,
  LANGUAGE_TEST_FIELDS,
  EDUCATION_ASSESSMENT_FIELDS,
  PASSPORT_FIELDS,
  EMPLOYMENT_ENTRY_FIELDS,
  EDUCATION_HISTORY_ENTRY_FIELDS,
  ADDRESS_HISTORY_ENTRY_FIELDS,
  CHILD_ENTRY_FIELDS,
  SIBLING_ENTRY_FIELDS,
  TRAVEL_HISTORY_ENTRY_FIELDS,
  DECLARATION_FIELDS,
  type QuestionnaireField,
} from "@/lib/questionnaire-fields.ts";
import type { QuestionnaireResponse } from "@/lib/types.ts";

function FieldRows<T extends object>({
  data,
  fields,
}: {
  data: T;
  fields: QuestionnaireField<T>[];
}) {
  return (
    <dl className="grid grid-cols-[minmax(0,auto)_1fr] gap-x-4 gap-y-1 text-sm">
      {fields.map((field) => (
        <Fragment key={String(field.name)}>
          <dt className="text-muted-foreground">{field.label}</dt>
          <dd>{String(data[field.name] ?? "").trim() || "—"}</dd>
        </Fragment>
      ))}
    </dl>
  );
}

function EntryList<T extends object>({
  entries,
  fields,
  emptyLabel,
}: {
  entries: T[];
  fields: QuestionnaireField<T>[];
  emptyLabel: string;
}) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry, index) => (
        <div key={index} className="rounded-[var(--radius-md)] border border-border p-3">
          <FieldRows data={entry} fields={fields} />
        </div>
      ))}
    </div>
  );
}

// Read-only rendering of a completed CIF — shared by the client's own
// summary/print view and Admin/RCIC's per-client review
// (docs/DECISIONS.md 2026-10-26). "Parents" is left out: no field
// registry exists for it yet (not built, see questionnaire-fields.ts).
export function QuestionnaireSummary({ response }: { response: QuestionnaireResponse }) {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="text-lg font-semibold">Applicant Information</h2>
        {APPLICANT_INFO_STEPS.map((step) => (
          <div key={step.id} className="mt-2">
            <h3 className="text-sm font-medium text-muted-foreground">{step.label}</h3>
            <FieldRows data={response.applicantInfo} fields={step.fields} />
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Language Test</h2>
        <FieldRows data={response.languageTest} fields={LANGUAGE_TEST_FIELDS} />
      </section>

      <section>
        <h2 className="text-lg font-semibold">Education Credential Assessment</h2>
        <FieldRows data={response.educationAssessment} fields={EDUCATION_ASSESSMENT_FIELDS} />
      </section>

      <section>
        <h2 className="text-lg font-semibold">Passport</h2>
        <FieldRows data={response.passport} fields={PASSPORT_FIELDS} />
      </section>

      <section>
        <h2 className="text-lg font-semibold">Employment History</h2>
        <EntryList
          entries={response.employment}
          fields={EMPLOYMENT_ENTRY_FIELDS}
          emptyLabel="No employment history entered."
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold">Education History</h2>
        <EntryList
          entries={response.educationHistory}
          fields={EDUCATION_HISTORY_ENTRY_FIELDS}
          emptyLabel="No education history entered."
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold">Address History</h2>
        <EntryList
          entries={response.addressHistory}
          fields={ADDRESS_HISTORY_ENTRY_FIELDS}
          emptyLabel="No address history entered."
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold">Children</h2>
        <EntryList
          entries={response.children}
          fields={CHILD_ENTRY_FIELDS}
          emptyLabel="No children entered."
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold">Siblings</h2>
        <EntryList
          entries={response.siblings}
          fields={SIBLING_ENTRY_FIELDS}
          emptyLabel="No siblings entered."
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold">Travel History</h2>
        <EntryList
          entries={response.travelHistory.entries}
          fields={TRAVEL_HISTORY_ENTRY_FIELDS}
          emptyLabel="No travel history entered."
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold">Declaration</h2>
        <FieldRows data={response.declaration} fields={DECLARATION_FIELDS} />
      </section>
    </div>
  );
}
