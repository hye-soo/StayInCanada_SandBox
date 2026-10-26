export interface ClientProfile {
  // Static placeholder — no assignment mechanism/admin UI exists yet,
  // every client gets the same default. Display-only, not used for
  // access control (any admin/rcic can still see any client).
  assignedAdvisorName: string;
}

export interface ClientProfileStore {
  getProfile(clientId: string): ClientProfile;
}

function defaultProfile(): ClientProfile {
  return { assignedAdvisorName: "Alex Morgan" };
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
