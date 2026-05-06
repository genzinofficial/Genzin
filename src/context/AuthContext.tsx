import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider, appleProvider, db } from '../lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isAdmin: boolean;
  loading: boolean;
  login: (provider?: 'google' | 'facebook' | 'apple') => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
  setAuthError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        const authUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified
        };
        setUser(authUser);
        setIsAdmin(firebaseUser.email === 'genzin.official@gmail.com');

        // Sync to Firestore
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            await setDoc(userRef, {
              userId: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || 'Genzin Member',
              photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
              createdAt: serverTimestamp()
            });
          }
        } catch (error) {
          console.error("Error syncing user profile:", error);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (providerName: 'google' | 'facebook' | 'apple' = 'google') => {
    setAuthError(null);
    setLoading(true);
    try {
      let provider;
      switch (providerName) {
        case 'google':
          provider = googleProvider;
          break;
        case 'facebook':
          provider = facebookProvider;
          break;
        case 'apple':
          provider = appleProvider;
          break;
        default:
          provider = googleProvider;
      }

      const result = await signInWithPopup(auth, provider);
      console.log('Login success:', result.user.email);
    } catch (error: any) {
      console.error('Login failed details:', {
        code: error.code,
        message: error.message,
        domain: window.location.hostname
      });
      
      let message = 'Login failed. Please try again.';
      
      if (error.code === 'auth/popup-blocked') {
        message = 'Login popup was blocked by your browser. Please allow popups for this site.';
      } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        message = 'Login was cancelled.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        message = 'An account already exists with a different login method. Please use the original provider.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your internet connection.';
      } else if (error.code === 'auth/unauthorized-domain') {
        message = `Domain "${window.location.hostname}" is not authorized. Add it to Firebase Console > Authentication > Settings > Authorized Domains.`;
      } else if (error.code === 'auth/operation-not-allowed') {
        message = 'This login method is not enabled in your Firebase project.';
      } else if (error.code === 'auth/internal-error') {
        message = 'An internal authentication error occurred. Please try again later.';
      } else {
        message = `${error.message.replace('Firebase:', '').trim()} (${error.code})`;
      }
      
      setAuthError(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin, 
      loading, 
      login, 
      logout, 
      authError,
      setAuthError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
