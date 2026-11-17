import { requireRole } from "@/lib/firebase/session.ts";
import { getClientProfile } from "@/lib/client-profile.ts";
import { getClientIdentity } from "@/lib/client-identity.ts";
import { ProfileHeader } from "@/components/layouts/profile-header";
import { DEMO_CLIENTS } from "@/lib/data/demo-clients.ts";
import { TabNav } from "@/components/patterns/tab-nav";

// Figma "All clients_Profile / Staff": profile heading + tabs shared by
// every tab page of one client.
export default async function AdminClientLayout({ children, params }: LayoutProps<"/admin/[clientId]">) {
  await requireRole(["admin"]);
  const { clientId } = await params;
  const { applicationId, applicationType } = getClientProfile(clientId);
  const base = `/admin/${clientId}`;

  return (
    <div className="flex flex-col gap-6 pt-2 lg:pt-6">
      <div className="flex flex-col gap-3 print:hidden">
        <ProfileHeader
          name={getClientIdentity(clientId).name}
          subtitle={`Client profile / Application ${applicationId} • ${applicationType}`}
          avatarSrc={DEMO_CLIENTS.some((client) => client.id === clientId) ? undefined : "/overview/client-avatar.png"}
        />
        <TabNav
          tabs={[
            { href: base, label: "Overview" },
            { href: `${base}/intake`, label: "Intake" },
            { href: `${base}/checklist`, label: "Checklist" },
            { href: `${base}/package`, label: "Package" },
            { href: `${base}/activity`, label: "Activity" },
          ]}
        />
      </div>
      {children}
    </div>
  );
}
