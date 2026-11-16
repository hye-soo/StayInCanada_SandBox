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
// (flagForAdmin, internal-only). admin deliberately excludes
// "approve": only RCIC gives final approval.
const PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  client: ["uploadOwnDocument", "viewOwnChecklist"],
  rcic: ["viewAllChecklists", "flagForAdmin", "approve"],
  admin: ["viewAllChecklists", "requestChanges"],
};

export function can(role: UserRole, action: PermissionAction): boolean {
  return PERMISSIONS[role].includes(action);
}
