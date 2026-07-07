import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Helper to robustly parse the private key and check env vars
function getFirebaseAdminConfig() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || typeof projectId !== 'string') {
    throw new Error('FIREBASE_ADMIN_PROJECT_ID env var is missing or not a string');
  }
  if (!clientEmail || typeof clientEmail !== 'string') {
    throw new Error('FIREBASE_ADMIN_CLIENT_EMAIL env var is missing or not a string');
  }
  if (!privateKey || typeof privateKey !== 'string') {
    throw new Error('FIREBASE_ADMIN_PRIVATE_KEY env var is missing or not a string');
  }
  // Handle multiline env (with \n or real newlines)
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  return {
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  };
}

const firebaseAdminConfig = getFirebaseAdminConfig();

const adminApp: App = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];

export { adminApp };
export const adminAuth = getAuth(adminApp); 