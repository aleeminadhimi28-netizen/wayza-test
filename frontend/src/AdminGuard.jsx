import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import VerificationSpinner from "./components/VerificationSpinner.jsx";

export default function AdminGuard({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <VerificationSpinner
                message="Verifying Admin Authority..."
                subtext="Accessing Oversight Suite"
            />
        );
    }

    if (!user || user.role !== "admin") {
        return (
            <Navigate
                to="/admin-login"
                state={{ from: location }}
                replace
            />
        );
    }

    return children;
}
