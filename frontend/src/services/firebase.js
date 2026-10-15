import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';

// Firebase configuration (can be supplied via VITE_FIREBASE_* environment variables)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

let app = null;
let auth = null;
let googleProvider = null;

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (err) {
    console.warn("Firebase initialization skipped:", err);
  }
}

export async function loginWithGoogle() {
  if (auth && googleProvider) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
      localStorage.setItem('cyberguard_token', idToken);
      localStorage.setItem('cyberguard_user', JSON.stringify({
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        isGuest: false
      }));
      return user;
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  } else {
    // Demo / Guest Analyst Mode
    const demoUser = {
      uid: "demo_analyst_01",
      name: "Security Analyst (Demo)",
      email: "analyst@cyberguard.local",
      isGuest: true
    };
    localStorage.setItem('cyberguard_token', 'demo_analyst_token');
    localStorage.setItem('cyberguard_user', JSON.stringify(demoUser));
    return demoUser;
  }
}

export async function logoutUser() {
  if (auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.removeItem('cyberguard_token');
  localStorage.removeItem('cyberguard_user');
}

export function getSavedUser() {
  try {
    const raw = localStorage.getItem('cyberguard_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
