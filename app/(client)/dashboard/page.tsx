import Image from "next/image";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientChecklist, VISA_TYPE_LABEL } from "@/lib/client-checklist.ts";
import { getClientIntake } from "@/lib/client-questionnaire.ts";
import { getIntakeProgress } from "@/lib/intake.ts";
import { getClientProfile } from "@/lib/client-profile.ts";
import { JOURNEY_STEPS } from "@/lib/dashboard-journey.ts";
import { getClientJourneyStep } from "@/lib/client-journey.ts";
import { getChecklistSummary, getIntakeSummary } from "@/lib/overview-summary.ts";
import { getNotificationStore } from "@/lib/notification-store.ts";
import { PageHeader } from "@/components/layouts/page-header";
import { ContentCard } from "@/components/patterns/content-card";
import { JourneyStepper } from "@/components/patterns/journey-stepper";
import { MemoCard } from "@/components/patterns/memo-card";
import { NotificationFeed } from "@/components/patterns/notification-feed";
import { ProgressCard } from "@/components/patterns/progress-card";

const LATEST_NOTIFICATION_COUNT = 3;

function firstName(email: string | undefined, displayName: string | undefined): string {
  if (displayName) return displayName.split(" ")[0] ?? displayName;
  return email?.split("@")[0] ?? "there";
}

// C01 / Figma "01 Overview".
export default async function DashboardPage() {
  const { uid, email, displayName } = await requireRole(["client"]);

  const { visaType, items } = getClientChecklist(uid);
  const intakeProgress = getIntakeProgress(getClientIntake(uid));
  const profile = getClientProfile(uid);

  const intake = getIntakeSummary(intakeProgress.completeCategories, intakeProgress.totalCategories);
  const checklist = getChecklistSummary(items);

  const stepIndex = getClientJourneyStep(uid);

  // Latest staff feedback on a document; until there is any, the
  // advisor's welcome note points the client at their first step.
  const feedbackItem = items.find((item) => item.staffComment);
  const memo = feedbackItem
    ? {
        message: feedbackItem.staffComment!,
        href: `/checklist/${feedbackItem.id}`,
        linkLabel: `View ${feedbackItem.label.toLowerCase()}`,
      }
    : {
        message: `Welcome, ${firstName(email, displayName)}! Start with your intake so we can review your information.`,
        href: "/questionnaire",
        linkLabel: "Open my intake",
      };

  const notifications = getNotificationStore()
    .getForRecipient(uid)
    .slice(0, LATEST_NOTIFICATION_COUNT);

  return (
    <main className="flex flex-col gap-8 pt-2 lg:pt-6">
      <PageHeader
        title={`Welcome back, ${firstName(email, displayName)}`}
        subtitle={`${VISA_TYPE_LABEL[visaType]}  /  Application ${profile.applicationId}`}
      />

      <div className="flex flex-col gap-4">
        <MemoCard
          authorName={profile.assignedAdvisorName}
          avatarSrc="/overview/advisor-avatar.png"
          {...memo}
        />

        <ProgressCard
          href="/questionnaire"
          icon="/overview/document-24.svg"
          tone="lime"
          title="Client Intake"
          {...intake}
        />
        <ProgressCard
          href="/checklist"
          icon="/overview/list-check-24.svg"
          tone="sky"
          title="Document checklist"
          {...checklist}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,668fr)_minmax(0,428fr)]">
          <div className="flex flex-col gap-4">
            <ContentCard title="Your application journey">
              <div className="overflow-x-auto pb-1">
                <JourneyStepper steps={JOURNEY_STEPS} currentStep={stepIndex} />
              </div>
            </ContentCard>
            <ContentCard title="Your application Info" className="flex-1">
              <dl className="text-sm text-foreground">
                <div className="flex gap-1">
                  <dt>Visa type:</dt>
                  <dd>{VISA_TYPE_LABEL[visaType]}</dd>
                </div>
                <div className="flex gap-1">
                  <dt>Due date:</dt>
                  <dd>{profile.dueDate}</dd>
                </div>
              </dl>
            </ContentCard>
          </div>

          <ContentCard
            title="Latest Notifications"
            icon={<Image src="/icons/megaphone.svg" alt="" width={29} height={29} />}
            className="border-transparent"
          >
            <NotificationFeed notifications={notifications} />
          </ContentCard>
        </div>
      </div>
    </main>
  );
}
