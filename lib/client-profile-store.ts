export interface ClientProfile {
  // Static placeholder — no assignment mechanism/admin UI exists yet,
  // every client gets the same default. Display-only, not used for
  // access control (any admin/rcic can still see any client).
  assignedAdvisorName: string;
  assignedRcicName: string;
  // Mock placeholders until applications have real records.
  applicationId: string;
  dueDate: string;
}

export interface ClientProfileStore {
  getProfile(clientId: string): ClientProfile;
}

function defaultProfile(): ClientProfile {
  return {
    assignedAdvisorName: "Alex Morgan",
    assignedRcicName: "Jean Martin",
    applicationId: "FO-2026-014",
    dueDate: "06/14/2027",
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
}

let store: ClientProfileStore | undefined;

export function getClientProfileStore(): ClientProfileStore {
  if (!store) store = new InMemoryClientProfileStore();
  return store;
}
