// src/contexts/AuthContext.tsx
import React, { createContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { User } from 'firebase/auth';

interface AuthContextProps {
  currentUser: User | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextProps>({
  currentUser: null,
  loading: true, // Set default loading to true
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Initialize loading state

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false); // Authentication state has been determined
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
