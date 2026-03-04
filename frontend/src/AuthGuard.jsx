import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

export default function AuthGuard({ children }) {

    const { user, loading } = useAuth();
    const location = useLocation();

    // ✅ wait until auth is restored from localStorage
    if (loading) {
        return null; // or spinner component
    }

    // ✅ not logged in → go login and remember full URL
    if (!user) {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        );
    }

    // ✅ logged in → allow page
    return children;
}