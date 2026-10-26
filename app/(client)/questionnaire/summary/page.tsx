import Link from "next/link";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientQuestionnaire } from "@/lib/client-questionnaire.ts";
import { QuestionnaireSummary } from "@/components/questionnaire-summary.tsx";
import { PrintButton } from "@/components/print-button.tsx";

export default async function QuestionnaireSummaryPage() {
  const { uid } = await requireRole(["client"]);
  const response = getClientQuestionnaire(uid);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="flex items-center justify-between gap-4 print:hidden">
        <Link href="/questionnaire" className="text-sm text-muted-foreground hover:underline">
          Back to Client Information Form
        </Link>
        <PrintButton />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">Client Information Form Summary</h1>
      <QuestionnaireSummary response={response} />
    </main>
  );
}
