"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client.ts";
import { useAuth } from "@/lib/firebase/auth-context.tsx";
import { clearSession } from "@/lib/firebase/session-actions.ts";
import { Button } from "@/components/ui/button";

export function AuthStatus() {
  const router = useRouter();
  const { user, role, loading } = useAuth();

  async function handleLogOut() {
    await signOut(auth);
    await clearSession();
    router.push("/login");
  }

  if (loading) return <span className="text-xs text-muted-foreground">Loading...</span>;

  if (!user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <Link href="/login" className="hover:underline">
          Log in
        </Link>
        <Link href="/signup" className="hover:underline">
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-muted-foreground">
        {user.email} ({role ?? "no role set"})
      </span>
      <Button type="button" variant="outline" size="sm" onClick={handleLogOut}>
        Log out
      </Button>
    </div>
  );
}
