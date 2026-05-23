import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api, clearCSRFToken } from './utils/api.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // BUG-017 fix: keep a ref so the session-expired handler always has the latest user
  // without needing to close over the state variable (which causes stale closures)
  const userRef = useRef(null);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

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

  /* -------- SESSION-EXPIRED LISTENER (FIX #124, BUG-017) -------- */
  // Uses userRef instead of closing over user state — prevents stale closure race conditions.
  // Empty deps: registered once, reads latest user via ref.
  useEffect(() => {
    const handleExpired = () => {
      if (userRef.current) {
        setUser(null);
        clearCSRFToken();
        if (window.location.pathname !== '/login') {
          window.location.href = `/login?expired=1`;
        }
      }
    };
    window.addEventListener('wayzza:session-expired', handleExpired);
    return () => window.removeEventListener('wayzza:session-expired', handleExpired);
  }, []); // empty deps — intentional, uses ref for latest user value

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
