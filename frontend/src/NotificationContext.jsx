import { createContext, useContext, useRef, useState, useEffect } from "react";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {

    const [message, setMessage] = useState(null);
    const timerRef = useRef(null);

    const notify = (msg) => {

        // clear old timer if exists
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        setMessage(msg);

        timerRef.current = setTimeout(() => {
            setMessage(null);
            timerRef.current = null;
        }, 3000);
    };

    // cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current)
                clearTimeout(timerRef.current);
        };
    }, []);

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}

            {message && (
                <div style={{
                    position: "fixed",
                    top: 20,
                    right: 20,
                    background: "#111",
                    color: "white",
                    padding: "12px 18px",
                    borderRadius: "8px",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
                    zIndex: 9999
                }}>
                    {message}
                </div>
            )}

        </NotificationContext.Provider>
    );
}

// safer hook
export const useNotify = () => {

    const ctx = useContext(NotificationContext);

    if (!ctx) {
        throw new Error("useNotify must be used inside NotificationProvider");
    }

    return ctx;
};