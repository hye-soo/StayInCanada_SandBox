import { getMockAuthStore } from "./mock-auth-store.ts";
import { DEMO_CLIENTS } from "./data/demo-clients.ts";

// Name and email for a client id; falls back to the id for accounts
// that exist outside the mocked user list (e.g. Firebase demo users).
export function getClientIdentity(clientId: string): { name: string; email: string } {
  const user = getMockAuthStore().findById(clientId) ?? DEMO_CLIENTS.find((client) => client.id === clientId);
  return { name: user?.name ?? `Client ${clientId}`, email: user?.email ?? "—" };
}
