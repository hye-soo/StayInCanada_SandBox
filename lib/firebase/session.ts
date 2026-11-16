import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, adminDb } from "./admin.ts";
import { MOCK_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME } from "./session-constants.ts";
import { ROLE_LANDING } from "@/lib/role-landing.ts";
import { getMockAuthStore } from "@/lib/mock-auth-store.ts";
import type { UserRole } from "@/lib/types.ts";

export interface SessionUser {
  uid: string;
  role: UserRole;
  email: string | undefined;
  displayName: string | undefined;
}

// Verifies the session cookie with Admin SDK, then looks up the role
// fresh from Firestore each time (source of truth — a console-edited
// role must take effect immediately, not be stuck in a stale cookie).
// email/displayName come straight from the verified token's own
// claims — no extra Admin SDK call needed.
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();

  const mockUserId = cookieStore.get(MOCK_SESSION_COOKIE_NAME)?.value;
  const mockUser = mockUserId ? getMockAuthStore().findById(mockUserId) : undefined;
  if (mockUser) {
    return { uid: mockUser.id, role: mockUser.role, email: mockUser.email, displayName: mockUser.name };
  }

  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const snap = await adminDb.collection("users").doc(decoded.uid).get();
    const role = snap.data()?.role as UserRole | undefined;
    if (!role) return null;
    return { uid: decoded.uid, role, email: decoded.email, displayName: decoded.name };
  } catch {
    return null;
  }
}

// Call at the top of a protected Server Component. Redirects to
// /login if not signed in, or to that role's own landing page if
// signed in but not allowed on this particular page (never a fixed
// page, or a role that can't access it would loop).
export async function requireRole(allowedRoles: UserRole[]): Promise<SessionUser> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/login");
  if (!allowedRoles.includes(sessionUser.role)) redirect(ROLE_LANDING[sessionUser.role]);
  return sessionUser;
}
