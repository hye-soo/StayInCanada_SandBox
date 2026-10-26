import { getClientProfileStore, type ClientProfile } from "./client-profile-store.ts";

export function getClientProfile(clientId: string): ClientProfile {
  return getClientProfileStore().getProfile(clientId);
}
