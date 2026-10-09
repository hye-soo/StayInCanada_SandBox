import type { Client } from "./types.ts";

export const MOCK_CLIENT_ID = "mock-client-1";

// ponytail: hardcoded stub — the one place auth plugs in later (swap
// the body for a real session lookup; callers don't need to change).
export function getCurrentClient(): Client {
  return {
    id: MOCK_CLIENT_ID,
    role: "client",
    name: "Jordan Lee",
    visaType: "student",
  };
}
