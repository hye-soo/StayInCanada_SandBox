import { redirect } from "next/navigation";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientIntake, getClientQuestionnaireSubmittedAt } from "@/lib/client-questionnaire.ts";
import { getClientChecklist, VISA_TYPE_LABEL } from "@/lib/client-checklist.ts";
import { getClientProfileStore } from "@/lib/client-profile-store.ts";
import { getNextIncompleteStep } from "@/lib/intake.ts";
import { IntakeReady } from "@/components/patterns/intake-ready";

// Figma "C10 • Intake filled out • Ready to start review": where the last
// question's "Save & continue" lands. Later visits to My Intake show C11.
export default async function IntakeCompletePage() {
  const { uid } = await requireRole(["client"]);
  const answers = getClientIntake(uid);
  if (getClientQuestionnaireSubmittedAt(uid)) redirect("/questionnaire/review");
  if (getNextIncompleteStep(answers)) redirect("/questionnaire");

  return (
    <IntakeReady
      variant="done"
      answers={answers}
      visaLabel={VISA_TYPE_LABEL[getClientChecklist(uid).visaType]}
      applicationId={getClientProfileStore().getProfile(uid).applicationId}
    />
  );
}
