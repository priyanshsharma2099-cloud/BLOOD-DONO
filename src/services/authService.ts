import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// All authorized Gmail scopes for sending, reading, composing alerts
export const GMAIL_SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.readonly',
];

export const createGoogleProvider = () => {
  const provider = new GoogleAuthProvider();
  GMAIL_SCOPES.forEach((scope) => provider.addScope(scope));
  provider.setCustomParameters({
    prompt: 'consent',
    access_type: 'offline',
  });
  return provider;
};

const TOKEN_KEY = 'lifelink_gmail_access_token_v2';
const USER_KEY = 'lifelink_gmail_user_email_v2';

let isSigningIn = false;
let cachedAccessToken: string | null = (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null);

/**
 * Initialize auth state listener. Call this on app load.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    const token = cachedAccessToken || (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null);
    if (user && token) {
      cachedAccessToken = token;
      if (onAuthSuccess) onAuthSuccess(user, token);
    } else if (user && !token) {
      // User is logged in via Firebase but Gmail token not in memory
      if (onAuthSuccess) onAuthSuccess(user, '');
    } else {
      if (!isSigningIn && onAuthFailure) {
        onAuthFailure();
      }
    }
  });
};

/**
 * Sign in with Google Popup and acquire access token for Gmail API
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const provider = createGoogleProvider();
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('Google did not return an access token. Please ensure Gmail permissions were granted in the popup.');
    }

    cachedAccessToken = credential.accessToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, credential.accessToken);
      if (result.user.email) {
        localStorage.setItem(USER_KEY, result.user.email);
      }
    }

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  if (cachedAccessToken) return cachedAccessToken;
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) {
      cachedAccessToken = saved;
      return saved;
    }
  }
  return null;
};

export const hasActiveAccessToken = (): boolean => {
  return Boolean(cachedAccessToken || (typeof window !== 'undefined' && localStorage.getItem(TOKEN_KEY)));
};

export const getStoredUserEmail = (): string | null => {
  if (auth.currentUser?.email) return auth.currentUser.email;
  if (typeof window !== 'undefined') {
    return localStorage.getItem(USER_KEY);
  }
  return null;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }
};

export const logoutGoogle = async () => {
  try {
    await signOut(auth);
  } finally {
    cachedAccessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }
};
