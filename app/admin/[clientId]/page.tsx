import Image from "next/image";
import { getClientChecklist } from "@/lib/client-checklist.ts";
import { getClientProfile } from "@/lib/client-profile.ts";
import { getClientIdentity } from "@/lib/client-identity.ts";
import { getClientIntake } from "@/lib/client-questionnaire.ts";
import { getClientSummary } from "@/lib/client-directory.ts";
import { getClientJourneyStep } from "@/lib/client-journey.ts";
import { getActivityLogStore } from "@/lib/activity-log-store.ts";
import { JOURNEY_STEPS } from "@/lib/dashboard-journey.ts";
import { ActivityList } from "@/components/patterns/activity-list";
import { ContentCard } from "@/components/patterns/content-card";
import { JourneyStepper } from "@/components/patterns/journey-stepper";
import { MemoBubble } from "@/components/patterns/memo-bubble";

const RECENT_ACTIVITY_COUNT = 3;

function InfoRow({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-1.5">
      <Image src={icon} alt="" width={14} height={14} />
      {children}
    </li>
  );
}

// Figma "All clients_Profile / Staff" — Overview tab.
export default async function AdminClientOverviewPage({ params }: PageProps<"/admin/[clientId]">) {
  const { clientId } = await params;
  const { items } = getClientChecklist(clientId);
  const profile = getClientProfile(clientId);
  const identity = getClientIdentity(clientId);
  const summary = getClientSummary(clientId);
  const country = getClientIntake(clientId)["current-address"]?.values.country?.trim();
  const memoItem = items.find((item) => item.staffComment);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-[21px] lg:grid-cols-[minmax(0,719fr)_minmax(0,380fr)]">
        <ContentCard title="Active Application">
          <p className="px-1 text-base text-foreground">
            {profile.applicationType}
            <br />
            {profile.applicationId}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">Application Progress</h2>
          <div className="overflow-x-auto pb-1">
            <JourneyStepper steps={JOURNEY_STEPS} currentStep={getClientJourneyStep(clientId)} />
          </div>
        </ContentCard>

        <ContentCard title="Client information" className="gap-2 px-4">
          <ul className="flex flex-col px-3 text-base text-foreground">
            <InfoRow icon="/icons/at.svg">{identity.email}</InfoRow>
            <InfoRow icon="/icons/globe.svg">Current location: {country || "Not provided"}</InfoRow>
            <InfoRow icon="/icons/document-14.svg">
              Intake: {summary.questionnaireComplete} of {summary.questionnaireTotal} completed
            </InfoRow>
            <InfoRow icon="/icons/folder-14.svg">
              Documents: {summary.checklistCounts.approved} of {items.length} completed
            </InfoRow>
          </ul>
          <h2 className="mt-4 text-xl font-semibold">Case Team</h2>
          <p className="px-3 text-base text-foreground">
            Consultant: {profile.assignedRcicName}, RCIC
            <br />
            Admin: {profile.assignedAdvisorName}
          </p>
        </ContentCard>
      </div>

      <section className="flex flex-col gap-4 rounded-lg border border-input bg-secondary p-6">
        <p className="text-sm font-medium text-primary">Updates &amp; Memo</p>
        {memoItem ? (
          <>
            <h2 className="text-xl font-semibold text-foreground">
              {memoItem.label}{" "}
              {memoItem.status === "changes_required" ? "needs replacing" : "feedback"} :{" "}
              <span className="text-primary">
                {memoItem.status === "changes_required" ? "Awaiting file from client" : "Client replied"}
              </span>
            </h2>
            <div className="flex justify-end">
              <MemoBubble
                side="right"
                avatarSrc="/overview/advisor-avatar.png"
                authorName={profile.assignedAdvisorName}
                authorCaption="Me"
                message={memoItem.staffComment!}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No memo sent to this client yet.</p>
        )}
      </section>

      <ContentCard title="Recent case activity">
        <ActivityList
          entries={getActivityLogStore().getForClient(clientId).slice(0, RECENT_ACTIVITY_COUNT)}
          emptyMessage="Nothing has happened on this case yet."
        />
      </ContentCard>
    </div>
  );
}
