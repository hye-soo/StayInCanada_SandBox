import "server-only";
import { cookies } from "next/headers";
import type { MockUser } from "./data/mock-users.ts";
import {
  LAST_USER_COOKIE_NAME,
  MOCK_SESSION_COOKIE_NAME,
} from "./firebase/session-constants.ts";

const SESSION_MAX_AGE_S = 5 * 24 * 60 * 60;
const LAST_USER_MAX_AGE_S = 365 * 24 * 60 * 60;

// Call only from a Server Function (cookies can't be set while rendering).
export async function startMockSession(user: MockUser) {
  const cookieStore = await cookies();
  cookieStore.set(MOCK_SESSION_COOKIE_NAME, user.id, {
    maxAge: SESSION_MAX_AGE_S,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  cookieStore.set(LAST_USER_COOKIE_NAME, user.name.split(" ")[0] ?? user.name, {
    maxAge: LAST_USER_MAX_AGE_S,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}
