import { getClientSummary } from "@/lib/client-directory.ts";
import { ContentCard } from "@/components/patterns/content-card";
import { Button } from "@/components/ui/button";
import { preparePackage } from "../actions.ts";

// Package tab: Admin prepares the package once RCIC has validated the
// requirements (docs/DECISIONS.md 2026-10-26).
export default async function AdminClientPackagePage({
  params,
  searchParams,
}: PageProps<"/admin/[clientId]/package">) {
  const { clientId } = await params;
  const { error } = await searchParams;
  const { submission } = getClientSummary(clientId);

  const status: Record<typeof submission.state, string> = {
    awaiting_validation: "Waiting on RCIC to validate requirements before a package can be prepared.",
    validated: "Requirements validated by RCIC — ready for you to prepare the package.",
    package_prepared: `Package v${submission.package?.version} is with RCIC for final review.`,
    approved_for_submission: "Package approved — waiting on RCIC to record submission to IRCC.",
    submitted_to_ircc: "Submitted to IRCC.",
  };

  return (
    <ContentCard title="Application package">
      {typeof error === "string" ? <p className="text-sm text-destructive">{error}</p> : null}
      <p className="text-sm text-foreground">{status[submission.state]}</p>
      {submission.state === "validated" ? (
        <form action={preparePackage.bind(null, clientId)}>
          <Button type="submit" className="h-12 rounded-full px-6 font-semibold">
            Prepare package
          </Button>
        </form>
      ) : null}
    </ContentCard>
  );
}
