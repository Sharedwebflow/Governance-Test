import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  browserLocalPersistence,
  setPersistence,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";

// Firebase configuration
const getAuthDomain = () => {
  // Use the Replit deployment domain if available
  if (window.location.hostname.includes('.replit.dev')) {
    return window.location.hostname;
  }
  // Fallback to Firebase default domain
  return `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`;
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: getAuthDomain(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app; // Declare app outside the try-catch block

try {
  if (!app) {
    app = initializeApp({
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    });
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Initialize Firebase - make sure we use the official authDomain from Firebase console
//const app = initializeApp({
//  ...firebaseConfig,
//  // Using the project ID for the authDomain - this needs to be authorized in Firebase console
//  authDomain: 'beautyai-dfa09.firebaseapp.com' 
//});
const auth = getAuth(app);

// Set persistence to local to keep user logged in
setPersistence(auth, browserLocalPersistence).catch(error => {
  console.error("Firebase persistence setting error:", error);
});

// Google sign-in
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Helper to check if we have a redirect result
export const checkRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      console.log("Got redirect result");
      return result.user;
    }
    return null;
  } catch (error) {
    console.error("Error getting redirect result:", error);
    return null;
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    // Make sure we document the current hostname for debugging
    console.log("Current hostname during signInWithGoogle:", window.location.hostname);

    // When running in development or on Replit domain, we need to add the domain to Firebase
    // Try to use popup first, as it's more reliable in some environments
    try {
      console.log("Attempting to sign in with popup...");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Popup sign-in successful");
      return result.user;
    } catch (popupError) {
      console.warn("Popup sign-in failed, falling back to redirect:", popupError);

      // Fall back to redirect if popup fails
      if (typeof window !== 'undefined') {
        await signInWithRedirect(auth, googleProvider);
      }
      return null;
    }
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

// Sign in with email/password
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error signing in with email", error);
    throw error;
  }
};

// Create account with email/password
export const createAccountWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error creating account with email", error);
    throw error;
  }
};

// Send password reset email
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending reset email", error);
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { auth };