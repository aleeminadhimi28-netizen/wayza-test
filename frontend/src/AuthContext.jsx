import { createContext, useContext, useState, useEffect } from 'react';
import { api, clearCSRFToken } from './utils/api.js';

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

  /* -------- SESSION-EXPIRED LISTENER (FIX #124) -------- */
  // Listen for the global 'wayzza:session-expired' event fired by api.js's 401 interceptor
  useEffect(() => {
    const handleExpired = () => {
      if (user) {
        setUser(null);
        clearCSRFToken();
        // Navigate to /login preserving the current path for redirect-after-login
        if (window.location.pathname !== '/login') {
          window.location.href = `/login?expired=1`;
        }
      }
    };
    window.addEventListener('wayzza:session-expired', handleExpired);
    return () => window.removeEventListener('wayzza:session-expired', handleExpired);
  }, [user]);

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
