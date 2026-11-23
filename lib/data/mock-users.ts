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
        id: "client-olivia",
        role: "client",
        name: "Olivia Chang",
        email: "olivia@example.com",
        password: "olivia-password",
    },
    {
        id: "staff-noah",
        role: "admin",
        name: "Noah Patel",
        email: "noah@example.com",
        password: "flowoui-staff-demo",
    },
];

// Open /invite/welcome-olivia to accept Olivia's invitation (A01).
export const MOCK_INVITES = [
    { token: "welcome-olivia", email: "olivia@example.com", name: "Olivia Chang" },
    // Demo only: invitations still waiting on the client (staff Invitations page).
    { token: "welcome-ethan", email: "ethan@example.com", name: "Ethan Kim", applicationType: "Work permit", daysAgo: 2 },
    { token: "welcome-lena", email: "lena@example.com", name: "Lena Ortiz", applicationType: "Visitor extension", daysAgo: 6 },
];
