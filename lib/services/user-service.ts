import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  DocumentData,
  orderBy
} from 'firebase/firestore';

const USERS_COLLECTION = 'users';

export interface UserData {
  name: string;
  email: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
  photoURL?: string;
  uid?: string;
}

/**
 * Creates a new user or updates existing user in Firestore
 */
export async function createOrUpdateUser(uid: string, userData: Partial<UserData>): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userDoc = await getDoc(userRef);
    
    const now = new Date();
    
    if (userDoc.exists()) {
      // Update existing user
      await setDoc(userRef, {
        ...userDoc.data(),
        ...userData,
        updatedAt: now,
      }, { merge: true });
    } else {
      // Create new user with default role
      await setDoc(userRef, {
        ...userData,
        role: userData.role || 'user', // Default role is 'user'
        createdAt: now,
        updatedAt: now,
      });
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
}

/**
 * Gets user data from Firestore
 */
export async function getUserData(uid: string): Promise<UserData | null> {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return { ...userDoc.data(), uid } as UserData;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
}

/**
 * Gets all users from Firestore
 */
export async function getAllUsers(): Promise<UserData[]> {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const users: UserData[] = [];
    querySnapshot.forEach((doc) => {
      users.push({ 
        ...doc.data() as UserData,
        uid: doc.id 
      });
    });
    
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}

/**
 * Update user role
 */
export async function updateUserRole(uid: string, newRole: string): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, { 
      role: newRole,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

/**
 * Delete user from Firestore
 */
export async function deleteUser(uid: string): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}
