import { randomUUID } from "node:crypto";
import { MOCK_USERS, type MockUser } from "./data/mock-users.ts";

export type SignInError = "no_account" | "not_activated" | "wrong_password";
export type SignInResult = { user: MockUser } | { error: SignInError };

export interface MockAuthStore {
  findById(id: string): MockUser | undefined;
  findByEmail(email: string): MockUser | undefined;
  signIn(email: string, password: string): SignInResult;
  activateClient(input: { email: string; name: string; password: string }): MockUser;
}

function sameEmail(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function createMockAuthStore(seed: MockUser[]): MockAuthStore {
  const users = seed.map((user) => ({ ...user }));
  const findByEmail = (email: string) => users.find((user) => sameEmail(user.email, email));

  return {
    findById: (id) => users.find((user) => user.id === id),
    findByEmail,

    signIn(email, password) {
      const user = findByEmail(email);
      if (!user) return { error: "no_account" };
      if (user.password === null) return { error: "not_activated" };
      if (user.password !== password) return { error: "wrong_password" };
      return { user };
    },

    activateClient({ email, name, password }) {
      const existing = findByEmail(email);
      if (existing) {
        existing.name = name;
        existing.password = password;
        return existing;
      }
      const created: MockUser = {
        id: `client-${randomUUID()}`,
        role: "client",
        name,
        email,
        password,
      };
      users.push(created);
      return created;
    },
  };
}

let store: MockAuthStore | undefined;

export function getMockAuthStore(): MockAuthStore {
  if (!store) store = createMockAuthStore(MOCK_USERS);
  return store;
}

// Demo only: back to the seeded users (Alice invited, not activated).
export function resetMockAuthStore(): void {
  store = undefined;
}
