import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Ensure config is valid
if (!firebaseConfig || !firebaseConfig.apiKey) {
  console.error("Firebase config is missing or invalid. Check firebase-applet-config.json");
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

// Auth Providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// Set custom parameters if needed
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Validate Connection
async function testConnection() {
  try {
    const testDoc = doc(db, 'test', 'connection');
    await getDocFromServer(testDoc);
    console.log("Firebase connection verified");
  } catch (error) {
    console.warn("Firebase connection test failed (expected if database is empty or rules restrict access):", error);
  }
}
testConnection();
