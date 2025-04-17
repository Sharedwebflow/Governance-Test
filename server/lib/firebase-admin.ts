import { initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let firebaseApp: App;

// Initialize Firebase Admin SDK
try {
  firebaseApp = initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    credential: cert({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 
                   `${process.env.VITE_FIREBASE_PROJECT_ID}@appspot.gserviceaccount.com`,
      // For development, we can use a placeholder private key
      // In production, this should be a proper service account key
      privateKey: process.env.FIREBASE_PRIVATE_KEY ? 
                  process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : 
                  'placeholder-key'
    }),
  });
} catch (error) {
  console.error('Firebase admin initialization error:', error);
  // Initialize with a minimal app for development
  firebaseApp = initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  });
}

const auth = getAuth(firebaseApp);

// Verify a Firebase ID token
export const verifyIdToken = async (idToken: string) => {
  try {
    return await auth.verifyIdToken(idToken);
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw error;
  }
};

export { auth };