import type { UserRole } from "./types.ts";

export type PermissionAction =
  | "uploadOwnDocument"
  | "viewOwnChecklist"
  | "viewAllChecklists"
  | "requestChanges"
  | "approve";

// Draft matrix — confirm with the team before treating as final (see
// docs/MEETING.md Permission Matrix). admin deliberately excludes
// "approve": only RCIC gives final approval (docs/CURRENT_USER_FLOW_V2.md).
const PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  client: ["uploadOwnDocument", "viewOwnChecklist"],
  rcic: ["viewAllChecklists", "requestChanges", "approve"],
  admin: ["viewAllChecklists", "requestChanges"],
};

export function can(role: UserRole, action: PermissionAction): boolean {
  return PERMISSIONS[role].includes(action);
}
