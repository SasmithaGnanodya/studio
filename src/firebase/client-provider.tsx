'use client';

import React, { useMemo, type ReactNode, useRef, useEffect } from 'react';
import { FirebaseProvider, useFirebase } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import type { User } from 'firebase/auth';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * A internal component that listens for auth state changes and redirects 
 * to the landing page when a user session ends.
 */
function AuthRedirectListener({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useFirebase();
  const router = useRouter();
  const prevUserRef = useRef<User | null>(null);

  useEffect(() => {
    // If we had an authenticated user and now we don't, and loading has finished,
    // it indicates a explicit logout or session termination.
    if (prevUserRef.current && !user && !isUserLoading) {
      router.push('/');
    }
    
    // Update the reference to track the user state for the next update cycle
    if (!isUserLoading) {
      prevUserRef.current = user;
    }
  }, [user, isUserLoading, router]);

  return <>{children}</>;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
      storage={firebaseServices.storage}
    >
      <AuthRedirectListener>
        {children}
      </AuthRedirectListener>
    </FirebaseProvider>
  );
}
