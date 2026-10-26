import type { UserRole } from "../types.ts";

export const DEMO_ROLES: UserRole[] = ["client", "admin", "rcic"];

const ENV_KEY: Record<UserRole, string> = {
  client: "DEMO_CLIENT_UID",
  admin: "DEMO_ADMIN_UID",
  rcic: "DEMO_RCIC_UID",
};

export function getDemoUid(
  role: UserRole,
  env: Record<string, string | undefined> = process.env
): string | undefined {
  return env[ENV_KEY[role]];
}
