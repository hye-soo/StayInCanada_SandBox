import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, adminDb } from "./admin.ts";
import { SESSION_COOKIE_NAME } from "./session-constants.ts";
import type { UserRole } from "@/lib/types.ts";

export interface SessionUser {
  uid: string;
  role: UserRole;
}

// Verifies the session cookie with Admin SDK, then looks up the role
// fresh from Firestore each time (source of truth — a console-edited
// role must take effect immediately, not be stuck in a stale cookie).
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const snap = await adminDb.collection("users").doc(decoded.uid).get();
    const role = snap.data()?.role as UserRole | undefined;
    return role ? { uid: decoded.uid, role } : null;
  } catch {
    return null;
  }
}

// Call at the top of a protected Server Component. Redirects to
// /login if not signed in, or to /checklist if signed in but not an
// allowed role for this page.
export async function requireRole(allowedRoles: UserRole[]): Promise<SessionUser> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/login");
  if (!allowedRoles.includes(sessionUser.role)) redirect("/checklist");
  return sessionUser;
}
