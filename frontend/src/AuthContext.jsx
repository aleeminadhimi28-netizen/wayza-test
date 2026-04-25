import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './utils/api.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* -------- RESTORE SESSION -------- */
  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await api.getProfile();
        if (res.ok && res.data?.email) {
          setUser({
            email: res.data.email,
            role: res.data.role,
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth session fetch error', err);
        setUser(null);
      }
      setLoading(false);
    };
    loadSession();
  }, []);

  /* -------- LOGIN -------- */
  function login(data) {
    if (!data?.email) return;

    const role = data.role || 'guest';
    setUser({
      email: data.email,
      role,
    });
  }

  /* -------- LOGOUT -------- */
  async function logout() {
    try {
      await api.logout();
    } catch (e) {
      // Ignore logout errors
    }

    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

/* -------- HOOK -------- */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
