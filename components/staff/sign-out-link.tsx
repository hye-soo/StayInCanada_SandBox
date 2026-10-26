"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client.ts";
import { clearSession } from "@/lib/firebase/session-actions.ts";

export function SignOutLink() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut(auth);
    await clearSession();
    router.push("/login");
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
    >
      Sign out
    </button>
  );
}
