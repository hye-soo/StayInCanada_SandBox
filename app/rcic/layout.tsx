import { requireRole } from "@/lib/firebase/session.ts";
import { ensureDemoClients } from "@/lib/demo-clients.ts";
import { StaffSidebar } from "@/components/staff/staff-sidebar.tsx";

export default async function RcicLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["rcic"]);
  ensureDemoClients();

  return (
    <div className="flex flex-1">
      <StaffSidebar role="rcic" />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
