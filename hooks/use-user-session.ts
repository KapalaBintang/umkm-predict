import { useEffect, useState } from 'react';

import { onAuthStateChanged } from '../lib/auth';

export function useUserSession() {
  const [user, setUser] = useState<{
    uid: string;
    email: string;
    photoURL: string;
    displayName: string;
  } | null>(null);

  // Listen for changes to the user session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (authUser) => {
      if (authUser) {
        console.log(authUser.photoURL)
        setUser({
          uid: authUser.uid,
          email: authUser?.email || '',
          photoURL: authUser?.photoURL || '/placeholder-user.jpg',
          displayName: authUser?.displayName || 'UMKM User'
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return user;
}