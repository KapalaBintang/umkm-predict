import {
    type User,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged as _onAuthStateChanged,
  } from 'firebase/auth';
  
  import {auth} from "./firebase"
import { removeSession } from '@/actions/auth-actions';
  
  export function onAuthStateChanged(callback: (authUser: User | null) => void) {
    return _onAuthStateChanged(auth, callback);
  }
  
  export async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);

      if (!result || !result.user) {
        throw new Error('Google sign in failed');
      }
      return {
        user: {
          uid: result.user.uid,
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL
        }
      };
    } catch (error) {
      console.error('Error signing in with Google', error);
      throw error;
    }
  }
  
  export async function signOutWithGoogle() {
    try {
      await auth.signOut();
      await removeSession();
    } catch (error) {
      console.error('Error signing out with Google', error);
    }
  }