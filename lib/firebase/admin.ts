import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Server-only — never import this from a client component. The
// private key in .env.local has literal "\n" sequences, not real
// newlines; convert them back before passing to the SDK.
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

const app = getApps().length
  ? getApps()[0]!
  : initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey,
      }),
    });

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
