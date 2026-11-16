import Image from "next/image";
import Link from "next/link";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientChecklist, VISA_TYPE_LABEL } from "@/lib/client-checklist.ts";
import { getClientProfile } from "@/lib/client-profile.ts";
import { getClientIntake, getClientQuestionnaireSubmittedAt } from "@/lib/client-questionnaire.ts";
import { getIntakeProgress } from "@/lib/intake.ts";
import { ProfileHeader } from "@/components/layouts/profile-header";
import { ArrowLink } from "@/components/ui/arrow-link";

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      {children}
      {action ? <div className="mt-auto pt-2">{action}</div> : null}
    </section>
  );
}

function Rows({ rows }: { rows: [string, string | undefined][] }) {
  return (
    <dl className="flex flex-col">
      {rows.map(([label, value]) => (
        <div key={label} className="flex gap-4 border-b border-border py-2.5 text-sm last:border-b-0">
          <dt className="w-40 shrink-0 text-muted-foreground">{label}</dt>
          <dd className={value ? "font-medium text-foreground" : "text-muted-foreground"}>{value || "Not provided yet"}</dd>
        </div>
      ))}
    </dl>
  );
}

function Person({ src, name, role }: { src?: string; name: string; role: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
  return (
    <div className="flex items-center gap-3">
      {src ? (
        <Image src={src} alt="" width={44} height={44} className="size-11 rounded-full bg-peach object-cover" />
      ) : (
        <span aria-hidden className="flex size-11 items-center justify-center rounded-full bg-sky-tint text-sm font-semibold text-primary">
          {initials}
        </span>
      )}
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-foreground">{name}</span>
        <span className="text-xs text-muted-foreground">{role}</span>
      </div>
    </div>
  );
}

// Client "My Profile". Figma has no client profile frame, so this follows
// the staff "All clients_Profile" layout (avatar header + cards) and
// shows the client's own details, application and case team.
export default async function ProfilePage() {
  const { uid, email, displayName } = await requireRole(["client"]);
  const { items, visaType } = getClientChecklist(uid);
  const profile = getClientProfile(uid);
  const answers = getClientIntake(uid);
  const progress = getIntakeProgress(answers);
  const submittedAt = getClientQuestionnaireSubmittedAt(uid);

  const identity = answers["legal-identity"]?.values ?? {};
  const birth = answers["birth-physical"]?.values ?? {};
  const contact = answers.contact?.values ?? {};
  const address = answers["current-address"]?.values ?? {};
  const legalName = [identity.firstName, identity.middleName, identity.lastName].filter(Boolean).join(" ");
  const addressLine = [address.street, address.city, address.province, address.country].filter(Boolean).join(", ");
  const name = legalName || displayName || "My profile";
  const completedDocuments = items.filter((item) => item.status === "approved").length;

  return (
    <main className="flex flex-col gap-6 pt-2">
      <ProfileHeader
        name={name}
        subtitle={`Application ${profile.applicationId} • ${VISA_TYPE_LABEL[visaType]}`}
        avatarSrc="/overview/client-avatar.png"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <Card
          title="Personal details"
          action={
            <ArrowLink href="/questionnaire/review?section=personal">
              {submittedAt ? "View in My Intake" : "Edit in My Intake"}
            </ArrowLink>
          }
        >
          <p className="-mt-2 text-xs text-muted-foreground">From your intake form. Your case team uses these details.</p>
          <Rows
            rows={[
              ["Legal name", legalName],
              ["Date of birth", birth.dateOfBirth],
              ["Citizenship", identity.citizenship],
              ["Email", contact.email || email || undefined],
              ["Cellphone", contact.cellphone],
              ["Current address", addressLine],
            ]}
          />
        </Card>

        <Card
          title="Your case team"
          action={
            <Link
              href="/updates"
              className="flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Send a memo
            </Link>
          }
        >
          <Person src="/overview/advisor-avatar.png" name={profile.assignedAdvisorName} role="Case coordinator" />
          <Person name={profile.assignedRcicName} role="Regulated immigration consultant (RCIC)" />
          <p className="text-xs text-muted-foreground">Questions about your case? Send your team a memo any time.</p>
        </Card>

        <Card title="Application">
          <Rows
            rows={[
              ["Application type", VISA_TYPE_LABEL[visaType]],
              ["Application ID", profile.applicationId],
              ["Target date", profile.dueDate],
              [
                "Intake",
                submittedAt
                  ? "Submitted"
                  : `${progress.completeCategories} of ${progress.totalCategories} sections complete`,
              ],
              ["Documents", `${completedDocuments} of ${items.length} completed`],
            ]}
          />
        </Card>

        <Card title="Account">
          <Rows
            rows={[
              ["Sign-in email", email ?? undefined],
              ["Password", "\u2022".repeat(12)],
            ]}
          />
          <p className="text-xs text-muted-foreground">
            To change your sign-in email or password, contact your case team.
          </p>
        </Card>
      </div>
    </main>
  );
}
