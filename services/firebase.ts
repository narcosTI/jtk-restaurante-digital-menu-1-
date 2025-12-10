
// Firebase SDK imports removed due to resolution errors.
// Falling back to local/offline mode.

// Mock types
type Firestore = any;
type Auth = any;
type GoogleAuthProvider = any;

let db: Firestore | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let isFirebaseInitialized = false;

console.warn("Firebase SDK not found or configured incorrectly. Running in Offline Mode.");

export const updateFirebaseConfig = (config: any) => {
    localStorage.removeItem('jtk_firebase_config'); 
    window.location.reload();
};

export { db, auth, googleProvider, isFirebaseInitialized };
