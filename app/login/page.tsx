"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client.ts";
import { createSession } from "@/lib/firebase/session-actions.ts";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/lib/types.ts";

const ROLE_LANDING: Record<UserRole, string> = {
  client: "/checklist",
  admin: "/admin",
  rcic: "/rcic",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await createSession(await credential.user.getIdToken());
      const snap = await getDoc(doc(db, "users", credential.user.uid));
      const role = (snap.data()?.role as UserRole | undefined) ?? "client";
      router.push(ROLE_LANDING[role]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Log in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Log in"}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground">
        Need an account? <Link href="/signup" className="underline">Sign up</Link>
      </p>
    </main>
  );
}
