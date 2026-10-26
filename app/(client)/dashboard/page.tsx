import Link from "next/link";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientChecklist, VISA_TYPE_LABEL } from "@/lib/client-checklist.ts";
import {
  getClientQuestionnaireLastSavedAt,
  getClientQuestionnaire,
} from "@/lib/client-questionnaire.ts";
import { getSectionStatus } from "@/lib/questionnaire-progress.ts";
import { SECTION_LABELS } from "@/lib/questionnaire-fields.ts";
import { getClientProfile } from "@/lib/client-profile.ts";
import { getApplicationStage } from "@/lib/application-stage.ts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import type { QuestionnaireSectionId } from "@/lib/types.ts";

function greetingName(email: string | undefined, displayName: string | undefined): string {
  if (displayName) return displayName.split(" ")[0];
  if (email) return email.split("@")[0];
  return "there";
}

export default async function DashboardPage() {
  const { uid, email, displayName } = await requireRole(["client"]);

  const { visaType, items } = getClientChecklist(uid);
  const questionnaire = getClientQuestionnaire(uid);
  const lastSavedAt = getClientQuestionnaireLastSavedAt(uid);
  const profile = getClientProfile(uid);

  const sectionIds = Object.keys(SECTION_LABELS) as QuestionnaireSectionId[];
  const completeSections = sectionIds.filter(
    (sectionId) => getSectionStatus(questionnaire, sectionId) === "complete"
  ).length;
  const incompleteSections = sectionIds.length - completeSections;

  const required = items.filter((item) => item.status === "required").length;
  const changesRequired = items.filter((item) => item.status === "changes_required").length;
  const awaitingReview = items.filter(
    (item) => item.status === "submitted" || item.status === "under_review"
  ).length;
  const approved = items.filter((item) => item.status === "approved").length;

  const stage = getApplicationStage(items);
  const latestFeedbackItem = items.find((item) => item.rcicComment);

  return (
    <main className="flex w-full flex-col gap-4 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {greetingName(email, displayName)}
        </h1>
        <p className="text-sm text-muted-foreground">
          {VISA_TYPE_LABEL[visaType]} • Your advisor: {profile.assignedAdvisorName}
        </p>
      </div>

      {incompleteSections > 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-border bg-muted/50 p-6">
          <h2 className="text-lg font-semibold">Your next action: finish your intake</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {incompleteSections} section{incompleteSections === 1 ? "" : "s"} still need your
            attention.
            {lastSavedAt
              ? ` Your draft was last saved ${new Date(lastSavedAt).toLocaleString()}.`
              : ""}
          </p>
          <Button render={<Link href="/questionnaire">Continue intake</Link>} className="mt-3" />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Intake completion</CardTitle>
            <CardDescription>
              {completeSections} of {sectionIds.length} sections complete
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={(completeSections / sectionIds.length) * 100}>
              <ProgressTrack>
                <ProgressIndicator />
              </ProgressTrack>
            </Progress>
          </CardContent>
          <CardFooter>
            <Button variant="outline" render={<Link href="/questionnaire">View sections</Link>} />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>
              {changesRequired} needs changes · {required} required · {awaitingReview} awaiting
              review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {approved} approved out of {items.length} requirements
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" render={<Link href="/checklist">View checklist</Link>} />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application stage</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <span className="w-fit rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
              {stage.label}
            </span>
            <p className="text-sm text-muted-foreground">{stage.description}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" render={<Link href="/checklist">See stages & next steps</Link>} />
          </CardFooter>
        </Card>

        {latestFeedbackItem ? (
          <Card>
            <CardHeader>
              <CardTitle>Latest update</CardTitle>
              <CardDescription>{latestFeedbackItem.label} needs your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{latestFeedbackItem.rcicComment}</p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                render={<Link href={`/checklist/${latestFeedbackItem.id}`}>Read feedback</Link>}
              />
            </CardFooter>
          </Card>
        ) : null}
      </div>
    </main>
  );
}
