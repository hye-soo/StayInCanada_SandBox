import { randomUUID } from "node:crypto";
import { MOCK_INVITES } from "./data/mock-users.ts";

export interface ClientInvite {
  token: string;
  email: string;
  // The client's name from the consultation; greets them on A01.
  name?: string;
  // Set on the client's profile when they accept (staff screens).
  applicationType: string;
  createdAt: number;
  usedAt?: number;
}

export interface InviteStore {
  create(email: string, name?: string, applicationType?: string): ClientInvite;
  // Newest first (staff Invitations page).
  list(): ClientInvite[];
  get(token: string): ClientInvite | undefined;
  markUsed(token: string): void;
}

export function isInviteValid(invite: ClientInvite | undefined): invite is ClientInvite {
  return invite !== undefined && invite.usedAt === undefined;
}

const DAY = 24 * 60 * 60 * 1000;
// Application types staff can invite a client for (display labels).
export const APPLICATION_TYPES = ["Study permit extension", "Study permit", "Work permit", "Visitor extension"];
const DEFAULT_TYPE = APPLICATION_TYPES[0]!;

// ponytail: in-memory map keyed by token, same pattern as the other
// stores. Client accounts only — admin/rcic accounts are still
// Console-promoted (docs/DECISIONS.md 2026-10-26).
class InMemoryInviteStore implements InviteStore {
  private readonly invitesByToken = new Map<string, ClientInvite>();

  constructor(seed: { token: string; email: string; name?: string; applicationType?: string; daysAgo?: number }[]) {
    for (const { daysAgo = 0, applicationType = DEFAULT_TYPE, ...invite } of seed) {
      this.invitesByToken.set(invite.token, { ...invite, applicationType, createdAt: Date.now() - daysAgo * DAY });
    }
  }

  create(email: string, name?: string, applicationType: string = DEFAULT_TYPE): ClientInvite {
    const invite: ClientInvite = { token: randomUUID(), email, name, applicationType, createdAt: Date.now() };
    this.invitesByToken.set(invite.token, invite);
    return invite;
  }

  list(): ClientInvite[] {
    // Reversed first so, within the same millisecond, the later one leads.
    return [...this.invitesByToken.values()].reverse().sort((a, b) => b.createdAt - a.createdAt);
  }

  get(token: string): ClientInvite | undefined {
    return this.invitesByToken.get(token);
  }

  markUsed(token: string): void {
    const invite = this.invitesByToken.get(token);
    if (invite) invite.usedAt = Date.now();
  }
}

let store: InviteStore | undefined;

export function getInviteStore(): InviteStore {
  if (!store) store = new InMemoryInviteStore(MOCK_INVITES);
  return store;
}

// Demo only: back to just the seeded invites, all unused.
export function resetInviteStore(): void {
  store = undefined;
}
