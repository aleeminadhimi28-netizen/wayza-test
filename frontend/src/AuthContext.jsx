import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /* -------- RESTORE SESSION -------- */
    useEffect(() => {
        try {
            const email = localStorage.getItem("email");
            const role = localStorage.getItem("role");
            const loggedIn = localStorage.getItem("loggedIn");

            if (email && loggedIn === "true") {
                setUser({
                    email,
                    role: role || "guest"
                });
            } else {
                setUser(null);
            }

        } catch (err) {
            console.error("Auth restore error", err);
            setUser(null);
        }

        setLoading(false);
    }, []);

    /* -------- LOGIN -------- */
    function login(data) {
        if (!data?.email) return;

        const role = data.role || "guest";

        localStorage.setItem("email", data.email);
        localStorage.setItem("role", role);
        localStorage.setItem("loggedIn", "true");

        setUser({
            email: data.email,
            role
        });
    }

    /* -------- LOGOUT -------- */
    function logout() {
        localStorage.clear();
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
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}