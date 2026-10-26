import { randomUUID } from "node:crypto";

export interface ClientInvite {
  token: string;
  email: string;
  createdAt: number;
  usedAt?: number;
}

export interface InviteStore {
  create(email: string): ClientInvite;
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

  create(email: string): ClientInvite {
    const invite: ClientInvite = { token: randomUUID(), email, createdAt: Date.now() };
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
  if (!store) store = new InMemoryInviteStore();
  return store;
}
