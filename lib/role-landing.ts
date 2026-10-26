import type { UserRole } from "./types.ts";

// Where each role lands after login, and where requireRole() sends a
// signed-in user who hit a page their role isn't allowed on (must
// always be a page that role itself can access, or this loops).
export const ROLE_LANDING: Record<UserRole, string> = {
  client: "/dashboard",
  admin: "/admin",
  rcic: "/rcic",
};
