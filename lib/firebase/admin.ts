import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// Server-only — never import this from a client component. The
// private key in .env.local has literal "\n" sequences, not real
// newlines; convert them back before passing to the SDK.
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

// Without .env.local (a fresh clone) Firebase is simply off and the app
// runs on the mock users only, instead of every page failing on import.
export const firebaseAdminConfigured = Boolean(projectId && clientEmail && privateKey);

const app = firebaseAdminConfigured
  ? (getApps()[0] ?? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) }))
  : undefined;

export const adminAuth: Auth | undefined = app ? getAuth(app) : undefined;
export const adminDb: Firestore | undefined = app ? getFirestore(app) : undefined;
