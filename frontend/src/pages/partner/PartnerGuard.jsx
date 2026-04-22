import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import VerificationSpinner from "../../components/VerificationSpinner.jsx";
import { useAuth } from "../../AuthContext.jsx";

import { api } from "../../utils/api.js";

// Cache the onboarding check for the session so navigating between
// partner pages doesn't trigger a full re-check every time.
let _onboardingVerified = false;

export default function PartnerGuard({ children }) {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [checking, setChecking] = useState(!_onboardingVerified);

    useEffect(() => {
        if (authLoading) return;

        // ✅ must be logged in AND partner
        if (!user || user.role !== "partner") {
            _onboardingVerified = false;
            navigate("/partner-login", { replace: true });
            return;
        }

        // Already verified this session — skip API call
        if (_onboardingVerified) {
            setChecking(false);
            return;
        }

        let active = true;

        // ✅ check onboarding status from backend (only once per session)
        api.partnerStatus()
            .then(data => {
                if (!active) return;

                if (!data.onboarded) {
                    navigate("/partner-onboarding", { replace: true });
                } else {
                    _onboardingVerified = true;
                    setChecking(false);
                }
            })
            .catch(() => {
                if (active) navigate("/partner-login", { replace: true });
            });

        return () => {
            active = false;
        };

    }, [user, authLoading, navigate]);

    // Reset cache on logout (user becomes null)
    useEffect(() => {
        if (!authLoading && !user) {
            _onboardingVerified = false;
        }
    }, [user, authLoading]);

    if (authLoading || checking) {
        return (
            <VerificationSpinner
                message="Synchronizing Partner Network..."
                subtext="Verifying Business Credentials"
            />
        );
    }

    return children;
}