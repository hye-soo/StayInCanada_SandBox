import type { UserRole } from "../types.ts";

// ponytail: seeded test accounts for the mocked auth (no backend yet).
// Plaintext test passwords, in memory only. Replace with a real auth
// provider before any real user data goes in.
export interface MockUser {
    id: string;
    role: UserRole;
    name: string;
    email: string;
    // null until the invited client accepts their invitation (A01).
    password: string | null;
}

export const MOCK_USERS: MockUser[] = [
    {
        id: "client-alice",
        role: "client",
        name: "Alice Chang",
        email: "alice@example.com",
        password: "alice-password",
    },
    {
        id: "staff-maya",
        role: "admin",
        name: "Maya Patel",
        email: "maya@example.com",
        password: "flowoui-staff-demo",
    },
];

// Open /invite/welcome-alice to accept Alice's invitation (A01).
export const MOCK_INVITES = [
    { token: "welcome-alice", email: "alice@example.com", name: "Alice Chang" },
];
