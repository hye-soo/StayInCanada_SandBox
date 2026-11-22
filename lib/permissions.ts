import type { UserRole } from "./types.ts";

export type PermissionAction =
  | "uploadOwnDocument"
  | "viewOwnChecklist"
  | "viewAllChecklists"
  | "requestChanges"
  | "flagForAdmin"
  | "approve";

// Draft matrix — confirm with the team before treating as final (see
// docs/MEETING.md Permission Matrix). Admin is the sole client-facing
// gate (docs/DECISIONS.md 2026-10-26): only Admin can requestChanges
// (client-visible); RCIC routes issues through Admin instead
// (flagForAdmin, internal-only). Admin approves documents from the
// Review queue after checking the AI findings (docs/DECISIONS.md
// 2026-11-22); AI never approves anything.
const PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  client: ["uploadOwnDocument", "viewOwnChecklist"],
  rcic: ["viewAllChecklists", "flagForAdmin", "approve"],
  admin: ["viewAllChecklists", "requestChanges", "approve"],
};

export function can(role: UserRole, action: PermissionAction): boolean {
  return PERMISSIONS[role].includes(action);
}
