import { requireRole } from "@/lib/firebase/session.ts";
import { getClientIntake } from "@/lib/client-questionnaire.ts";
import { QuestionnaireSummary } from "@/components/questionnaire-summary.tsx";
import { PrintButton } from "@/components/print-button.tsx";
import { BackLink } from "@/components/ui/back-link";

export default async function QuestionnaireSummaryPage() {
  const { uid } = await requireRole(["client"]);

  return (
    <main className="flex max-w-3xl flex-col gap-6 pt-2 lg:pt-6">
      <div className="flex items-center justify-between gap-4 print:hidden">
        <BackLink href="/questionnaire/review">Check your answers</BackLink>
        <PrintButton />
      </div>
      <h1 className="text-[32px] font-bold leading-10 text-foreground">Client Information Form</h1>
      <QuestionnaireSummary answers={getClientIntake(uid)} />
    </main>
  );
}
