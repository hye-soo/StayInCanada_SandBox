import Link from "next/link";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientQuestionnaire } from "@/lib/client-questionnaire.ts";
import { QuestionnaireSummary } from "@/components/questionnaire-summary.tsx";
import { PrintButton } from "@/components/print-button.tsx";

export default async function RcicClientSummaryPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  await requireRole(["rcic"]);
  const { clientId } = await params;
  const response = getClientQuestionnaire(clientId);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="flex items-center justify-between gap-4 print:hidden">
        <Link href={`/rcic/${clientId}`} className="text-sm text-muted-foreground hover:underline">
          Back to client
        </Link>
        <PrintButton />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Client {clientId} — Client Information Form
      </h1>
      <QuestionnaireSummary response={response} />
    </main>
  );
}
