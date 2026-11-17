export interface ClientProfile {
  // Static placeholder — no assignment mechanism/admin UI exists yet,
  // every client gets the same default. Display-only, not used for
  // access control (any admin/rcic can still see any client).
  assignedAdvisorName: string;
  assignedRcicName: string;
  // Mock placeholders until applications have real records.
  applicationId: string;
  dueDate: string;
  // Label shown on staff screens ("Work permit", ...). The app itself
  // still runs one checklist/intake for every type (MVP).
  applicationType: string;
}

export interface ClientProfileStore {
  getProfile(clientId: string): ClientProfile;
  updateProfile(clientId: string, changes: Partial<ClientProfile>): void;
}

function defaultProfile(): ClientProfile {
  return {
    // Maya is the demo's staff member (case coordinator).
    assignedAdvisorName: "Maya Patel",
    assignedRcicName: "Jean Martin",
    applicationId: "FO-2026-014",
    dueDate: "06/14/2027",
    applicationType: "Study permit extension",
  };
}

class InMemoryClientProfileStore implements ClientProfileStore {
  private readonly profilesByClient = new Map<string, ClientProfile>();

  getProfile(clientId: string): ClientProfile {
    let profile = this.profilesByClient.get(clientId);
    if (!profile) {
      profile = defaultProfile();
      this.profilesByClient.set(clientId, profile);
    }
    return profile;
  }

  updateProfile(clientId: string, changes: Partial<ClientProfile>): void {
    this.profilesByClient.set(clientId, { ...this.getProfile(clientId), ...changes });
  }
}

let store: ClientProfileStore | undefined;

export function getClientProfileStore(): ClientProfileStore {
  if (!store) store = new InMemoryClientProfileStore();
  return store;
}

// Demo only: forget every profile override.
export function resetClientProfileStore(): void {
  store = undefined;
}
