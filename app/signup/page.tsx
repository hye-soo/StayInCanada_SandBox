"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client.ts";
import { createSession } from "@/lib/firebase/session-actions.ts";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
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
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      // Matches firestore.rules: create-only, role must be "client".
      await setDoc(doc(db, "users", credential.user.uid), { role: "client" });
      await createSession(await credential.user.getIdToken());
      router.push("/checklist");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Sign up</h1>
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
          minLength={6}
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Signing up..." : "Sign up"}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground">
        New accounts are always created with the client role. Already have an
        account? <Link href="/login" className="underline">Log in</Link>
      </p>
    </main>
  );
}
