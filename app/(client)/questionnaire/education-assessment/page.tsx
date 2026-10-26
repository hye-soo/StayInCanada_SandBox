import Link from "next/link";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientQuestionnaire } from "@/lib/client-questionnaire.ts";
import { Button } from "@/components/ui/button";
import { saveEducationAssessment } from "./actions.ts";

export default async function EducationAssessmentPage() {
  const { uid } = await requireRole(["client"]);
  const { educationAssessment } = getClientQuestionnaire(uid);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <Link href="/questionnaire" className="text-sm text-muted-foreground hover:underline">
        Back to Client Information Form
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Education Credential Assessment</h1>

      <form action={saveEducationAssessment} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Have you had your Education Credentialing Assessment?
          <select
            name="hasECA"
            defaultValue={educationAssessment.hasECA ?? ""}
            className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Select one
            </option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          If yes, the date of assessment completion
          <input
            type="text"
            name="assessmentCompletionDate"
            defaultValue={educationAssessment.assessmentCompletionDate ?? ""}
            className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          ECA ID Number
          <input
            type="text"
            name="ecaIdNumber"
            defaultValue={educationAssessment.ecaIdNumber ?? ""}
            className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
          />
        </label>
        <Button type="submit" className="self-start">
          Save and finish
        </Button>
      </form>
    </main>
  );
}
