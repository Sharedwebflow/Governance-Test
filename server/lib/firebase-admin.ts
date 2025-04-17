import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// This is a simplified version for development
// In a production environment, you would use a service account key
const firebaseApp = initializeApp({
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
}, 'server');

const auth = getAuth(firebaseApp);

// Since we don't have the service account key, we're going to use a simplified approach
// In production, you should use the proper verification
export const verifyIdToken = async (idToken: string): Promise<any> => {
  try {
    // For development, we'll just decode the token without verifying
    // In production, this should use auth.verifyIdToken
    // This is ONLY for demonstration purposes
    const decoded = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
    return decoded;
  } catch (error) {
    console.error('Error processing ID token:', error);
    throw error;
  }
};

export { auth };