import { requireRole } from "@/lib/firebase/session.ts";
import { StaffSidebar } from "@/components/staff/staff-sidebar.tsx";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["admin"]);

  return (
    <div className="flex flex-1">
      <StaffSidebar role="admin" />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
