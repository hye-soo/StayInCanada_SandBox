import { randomUUID } from "node:crypto";
import { MOCK_INVITES } from "./data/mock-users.ts";

export interface ClientInvite {
  token: string;
  email: string;
  // The client's name from the consultation; greets them on A01.
  name?: string;
  createdAt: number;
  usedAt?: number;
}

export interface InviteStore {
  create(email: string, name?: string): ClientInvite;
  get(token: string): ClientInvite | undefined;
  markUsed(token: string): void;
}

export function isInviteValid(invite: ClientInvite | undefined): invite is ClientInvite {
  return invite !== undefined && invite.usedAt === undefined;
}

// ponytail: in-memory map keyed by token, same pattern as the other
// stores. Client accounts only — admin/rcic accounts are still
// Console-promoted (docs/DECISIONS.md 2026-10-26).
class InMemoryInviteStore implements InviteStore {
  private readonly invitesByToken = new Map<string, ClientInvite>();

  constructor(seed: { token: string; email: string; name?: string }[]) {
    for (const invite of seed) {
      this.invitesByToken.set(invite.token, { ...invite, createdAt: Date.now() });
    }
  }

  create(email: string, name?: string): ClientInvite {
    const invite: ClientInvite = { token: randomUUID(), email, name, createdAt: Date.now() };
    this.invitesByToken.set(invite.token, invite);
    return invite;
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
