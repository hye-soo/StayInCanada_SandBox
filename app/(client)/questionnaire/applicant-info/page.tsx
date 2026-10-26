import { redirect } from "next/navigation";
import { APPLICANT_INFO_STEPS } from "@/lib/questionnaire-fields.ts";

export default function ApplicantInfoPage() {
  redirect(`/questionnaire/applicant-info/${APPLICANT_INFO_STEPS[0].id}`);
}
