import { createContext, useContext, useRef, useState, useEffect } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  function showToast(message, type = 'info') {
    // clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setToast({ message, type });

    timerRef.current = setTimeout(() => {
      setToast(null);
      timerRef.current = null;
    }, 2500);
  }

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const bg = toast?.type === 'success' ? '#16a34a' : toast?.type === 'error' ? '#dc2626' : '#111';

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            background: bg,
            color: 'white',
            padding: '12px 18px',
            borderRadius: 8,
            boxShadow: '0 6px 18px rgba(0,0,0,0.3)',
            zIndex: 9999,
          }}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);

  if (!ctx) {
    throw new Error('useToast must be used inside ToastProvider');
  }

  return ctx;
}
