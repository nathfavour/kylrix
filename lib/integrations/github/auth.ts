import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GithubAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../google/firebase-config.json'; // Reusing the same Firebase project

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GithubAuthProvider();
// Request repository access scopes
provider.addScope('repo');

// Cache the access token in memory.
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface GithubAuthState {
    user: User | null;
    accessToken: string | null;
    isSigningIn: boolean;
}

export const GithubAuthAdapter = {
    /** 
     * Initialize auth state listener. Call this on app load.
     */
    initAuth: (
      onAuthSuccess?: (user: User, token: string) => void,
      onAuthFailure?: () => void
    ) => {
      return onAuthStateChanged(auth, async (user: User | null) => {
        if (user) {
          if (cachedAccessToken) {
            if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
          } else {
            if (onAuthFailure) onAuthFailure();
          }
        } else {
          cachedAccessToken = null;
          if (onAuthFailure) onAuthFailure();
        }
      });
    },

    /** 
     * Must be called from a button click or user interaction
     */
    signIn: async (): Promise<{ user: User; accessToken: string } | null> => {
      try {
        isSigningIn = true;
        const result = await signInWithPopup(auth, provider);
        const credential = GithubAuthProvider.credentialFromResult(result);
        if (!credential?.accessToken) {
          throw new Error('Failed to get access token from Firebase Auth');
        }

        cachedAccessToken = credential.accessToken;
        return { user: result.user, accessToken: cachedAccessToken };
      } catch (error: any) {
        console.error('Sign in error:', error);
        throw error;
      } finally {
        isSigningIn = false;
      }
    },

    /** Retrieve cached token */
    getAccessToken: async (): Promise<string | null> => {
      return cachedAccessToken;
    },

    getCurrentUser: (): User | null => {
      return auth.currentUser;
    },
    
    /** Handle disconnect */
    logout: async () => {
      await auth.signOut();
      cachedAccessToken = null;
    }
}
