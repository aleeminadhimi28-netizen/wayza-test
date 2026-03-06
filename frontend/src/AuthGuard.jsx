import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import VerificationSpinner from "./components/VerificationSpinner.jsx";

export default function AuthGuard({ children }) {

    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <VerificationSpinner
                message="Synchronizing Identity..."
                subtext="Verifying Active Session"
            />
        );
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