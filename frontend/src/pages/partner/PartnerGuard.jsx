import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PartnerGuard({ children }) {

    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);

    useEffect(() => {

        let active = true;

        const email = localStorage.getItem("email");
        const role = localStorage.getItem("role");

        // ✅ must be logged in AND partner
        if (!email || role !== "partner") {
            navigate("/partner-login", { replace: true });
            return;
        }

        // ✅ check onboarding status from backend
        fetch(`${API}/partner/status/${email}`)
            .then(r => r.json())
            .then(data => {

                if (!active) return;

                if (!data.onboarded) {
                    navigate("/partner-onboarding", { replace: true });
                } else {
                    setChecking(false);
                }

            })
            .catch(() => {
                if (active) navigate("/partner-login", { replace: true });
            });

        return () => {
            active = false;
        };

    }, [navigate]);

    if (checking) {
        return <div style={{ padding: 40 }}>Loading...</div>;
    }

    return children;
}