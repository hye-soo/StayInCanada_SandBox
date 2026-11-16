import { getQuestionnaireFlagStore } from "./questionnaire-flag-store.ts";
import { getActivityLogStore } from "./activity-log-store.ts";
import { getNotificationStore } from "./notification-store.ts";
import { getIntakeReviewStore } from "./intake-review-store.ts";
import { INTAKE_CATEGORIES, type IntakeCategoryId } from "./data/intake-steps.ts";
import { getCategorySteps } from "./intake.ts";

// Admin flags an intake category straight to the client (docs/DECISIONS.md
// 2026-10-26: Admin does all client-facing operational work). Mocked
// email + a real, clickable notification — no email provider is wired
// up yet.
export function flagIntakeCategory(
  clientId: string,
  category: IntakeCategoryId,
  note: string,
  actorName: string
): void {
  const label = INTAKE_CATEGORIES.find((c) => c.id === category)?.label ?? category;
  getQuestionnaireFlagStore().setFlag(clientId, category, note);
  getIntakeReviewStore().clearReviewed(clientId, category);
  getActivityLogStore().append(
    clientId,
    `${actorName} flagged "${label}" — client notified by email (mocked)`
  );
  getNotificationStore().create(
    clientId,
    `${actorName} flagged "${label}" — check your intake`,
    `/questionnaire/${getCategorySteps(category)[0]?.id ?? ""}`
  );
}
