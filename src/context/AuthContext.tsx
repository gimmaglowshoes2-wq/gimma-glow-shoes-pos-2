import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../services/firebase';

export type UserRole = 'admin' | 'cashier';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'cashier',
  loading: true,
  error: null,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

const PRIMARY_ADMIN_EMAIL = 'gimmaglowshoes2@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('cashier');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const isPrimaryAdmin =
            currentUser.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();

          // Check if admin document exists
          let resolvedRole: UserRole = isPrimaryAdmin ? 'admin' : 'cashier';

          try {
            const adminDocRef = doc(db, 'admins', currentUser.uid);
            const adminDoc = await getDoc(adminDocRef);
            if (adminDoc.exists()) {
              resolvedRole = 'admin';
            } else if (isPrimaryAdmin) {
              // Ensure primary admin document exists in /admins
              await setDoc(adminDocRef, {
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName || 'Admin Gimma Glow',
                role: 'admin',
                createdAt: new Date().toISOString(),
              }, { merge: true });
              resolvedRole = 'admin';
            }
          } catch (e) {
            console.warn('Admin check handled:', e);
          }

          // Ensure user is registered in staff collection
          try {
            const staffDocRef = doc(db, 'staff', currentUser.uid);
            const staffDoc = await getDoc(staffDocRef);
            if (!staffDoc.exists()) {
              await setDoc(staffDocRef, {
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName || 'Staff Kasir',
                role: resolvedRole,
                createdAt: new Date().toISOString(),
              }, { merge: true });
            } else {
              const staffData = staffDoc.data();
              if (staffData?.role === 'admin') {
                resolvedRole = 'admin';
              }
            }
          } catch (e) {
            console.warn('Staff registration handled:', e);
          }

          setRole(resolvedRole);
        } catch (err: unknown) {
          console.error('Error establishing role in Firestore:', err);
        }
      } else {
        setRole('cashier');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Gagal login: ${msg}`);
      console.error('Sign-in error:', err);
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (err: unknown) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        error,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
