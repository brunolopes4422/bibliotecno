// src/contexts/AuthContext.js
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
    setCurrentUser(auth.currentUser);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setCurrentUser(null);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Auto logout after 2 hours
  useEffect(() => {
    let timer;
    if (currentUser) {
      timer = setTimeout(logout, 2 * 30 * 30 * 1000); // 2 hours in milliseconds
    }
    return () => clearTimeout(timer);
  }, [currentUser, logout]);

  const value = {
    currentUser,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
