import Link from "next/link";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientQuestionnaire } from "@/lib/client-questionnaire.ts";
import { getSectionStatus } from "@/lib/questionnaire-progress.ts";
import {
  BUILT_SECTIONS,
  SECTION_LABELS,
  SECTION_STATUS_BADGE_CLASS,
  SECTION_STATUS_LABEL,
} from "@/lib/questionnaire-fields.ts";
import { Badge } from "@/components/ui/badge";
import { Progress, ProgressLabel, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import type { QuestionnaireSectionId } from "@/lib/types.ts";

const SECTION_ROUTES: Partial<Record<QuestionnaireSectionId, string>> = {
  applicantInfo: "/questionnaire/applicant-info",
  languageTest: "/questionnaire/language-test",
  educationAssessment: "/questionnaire/education-assessment",
  passport: "/questionnaire/passport",
  employment: "/questionnaire/employment",
  educationHistory: "/questionnaire/education-history",
  addressHistory: "/questionnaire/address-history",
  children: "/questionnaire/children",
  siblings: "/questionnaire/siblings",
  travelHistory: "/questionnaire/travel-history",
  declaration: "/questionnaire/declaration",
};

export default async function QuestionnairePage() {
  const { uid } = await requireRole(["client"]);
  const response = getClientQuestionnaire(uid);
  const sectionIds = Object.keys(SECTION_LABELS) as QuestionnaireSectionId[];
  const completeCount = sectionIds.filter(
    (sectionId) => getSectionStatus(response, sectionId) === "complete"
  ).length;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Client Information Form</h1>

      <Progress value={(completeCount / sectionIds.length) * 100}>
        <ProgressLabel>
          {completeCount} of {sectionIds.length} sections complete
        </ProgressLabel>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>

      <ul className="flex flex-col gap-3">
        {sectionIds.map((sectionId) => {
          const status = getSectionStatus(response, sectionId);
          const href = SECTION_ROUTES[sectionId];
          const isBuilt = BUILT_SECTIONS.includes(sectionId);

          const content = (
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium">{SECTION_LABELS[sectionId]}</span>
              <Badge variant="outline" className={SECTION_STATUS_BADGE_CLASS[status]}>
                {SECTION_STATUS_LABEL[status]}
              </Badge>
            </div>
          );

          return (
            <li
              key={sectionId}
              className="rounded-[var(--radius-lg)] border border-border bg-card p-4"
            >
              {isBuilt && href ? (
                <Link href={href} className="block hover:underline">
                  {content}
                </Link>
              ) : (
                <div className="opacity-50">
                  {content}
                  <p className="mt-1 text-xs text-muted-foreground">Coming soon</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
