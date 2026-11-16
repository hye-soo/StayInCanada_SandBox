"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientQuestionnaireSubmittedAt } from "@/lib/client-questionnaire.ts";
import { getActivityLogStore } from "@/lib/activity-log-store.ts";
import { getNotificationStore } from "@/lib/notification-store.ts";

const MAX_MESSAGE = 1000;

// Figma "Request intake correction": a submitted intake stays on record;
// the client's note goes to Admin (notification + activity log) and My
// Intake shows "Your correction request has been received".
export async function requestIntakeCorrection(formData: FormData) {
  const { uid, displayName } = await requireRole(["client"]);
  const message = String(formData.get("message") ?? "").trim().slice(0, MAX_MESSAGE);
  if (!message || !getClientQuestionnaireSubmittedAt(uid)) redirect("/questionnaire");

  getActivityLogStore().append(uid, `Intake correction requested: ${message}`);
  getNotificationStore().create(
    "admin",
    `${displayName ?? "A client"} requested an intake correction`,
    `/admin/${uid}/intake`,
    message
  );
  revalidatePath("/questionnaire");
  // ponytail: the "received" banner rides on the URL; keep it in a store
  // once staff can resolve requests.
  redirect("/questionnaire?correction=sent");
}
