export interface ActivityEntry {
  timestamp: number;
  message: string;
}

export interface ActivityLogStore {
  append(clientId: string, message: string): void;
  getForClient(clientId: string): ActivityEntry[];
}

// ponytail: in-memory map keyed by client uid, same pattern as the
// other stores. Newest-first, matching the "Application activity"
// wireframe.
class InMemoryActivityLogStore implements ActivityLogStore {
  private readonly entriesByClient = new Map<string, ActivityEntry[]>();

  append(clientId: string, message: string): void {
    const entries = this.entriesByClient.get(clientId) ?? [];
    entries.unshift({ timestamp: Date.now(), message });
    this.entriesByClient.set(clientId, entries);
  }

  getForClient(clientId: string): ActivityEntry[] {
    return this.entriesByClient.get(clientId) ?? [];
  }
}

let store: ActivityLogStore | undefined;

export function getActivityLogStore(): ActivityLogStore {
  if (!store) store = new InMemoryActivityLogStore();
  return store;
}
