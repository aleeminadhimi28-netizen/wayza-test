import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import VerificationSpinner from "../../components/VerificationSpinner.jsx";

import { api } from "../../utils/api.js";

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
        api.partnerStatus(email)
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
        return (
            <VerificationSpinner
                message="Synchronizing Partner Network..."
                subtext="Verifying Business Credentials"
            />
        );
    }

    return children;
}