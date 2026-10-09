"use server";

import { cookies } from "next/headers";
import { adminAuth } from "./admin.ts";
import { SESSION_COOKIE_NAME } from "./session-constants.ts";

const SESSION_EXPIRES_IN_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

// Called right after a successful client-side Firebase sign-in, with
// the fresh ID token. Verifies it via Admin SDK and mints an httpOnly
// session cookie the server can trust on later requests.
export async function createSession(idToken: string) {
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRES_IN_MS,
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    maxAge: SESSION_EXPIRES_IN_MS / 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
