"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./client.ts";
import type { UserRole } from "@/lib/types.ts";

interface AuthState {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
}

const AuthContext = createContext<AuthState>({ user: null, role: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeRole: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (nextUser) => {
      unsubscribeRole?.();
      setUser(nextUser);

      if (!nextUser) {
        setRole(null);
        setLoading(false);
        return;
      }

      // Firestore rules only allow reading this user's own doc.
      unsubscribeRole = onSnapshot(doc(db, "users", nextUser.uid), (snap) => {
        setRole((snap.data()?.role as UserRole | undefined) ?? null);
        setLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      unsubscribeRole?.();
    };
  }, []);

  return <AuthContext.Provider value={{ user, role, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
