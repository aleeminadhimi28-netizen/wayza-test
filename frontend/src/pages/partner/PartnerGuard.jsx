import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VerificationSpinner from '../../components/VerificationSpinner.jsx';
import { useAuth } from '../../AuthContext.jsx';

import { api } from '../../utils/api.js';

export default function PartnerGuard({ children }) {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(
    () => sessionStorage.getItem('partner_onboarded') !== 'true'
  );

  useEffect(() => {
    if (authLoading) return;

    // ✅ must be logged in AND partner
    if (!user || user.role !== 'partner') {
      sessionStorage.removeItem('partner_onboarded');
      navigate('/partner-login', { replace: true });
      return;
    }

    // Already verified this session — skip API call
    if (sessionStorage.getItem('partner_onboarded') === 'true') {
      setChecking(false);
      return;
    }

    let active = true;

    // ✅ check onboarding status from backend
    api
      .partnerStatus()
      .then((data) => {
        if (!active) return;

        if (!data.onboarded) {
          navigate('/partner-onboarding', { replace: true });
        } else {
          sessionStorage.setItem('partner_onboarded', 'true');
          setChecking(false);
        }
      })
      .catch(() => {
        if (active) navigate('/partner-login', { replace: true });
      });

    return () => {
      active = false;
    };
  }, [user, authLoading, navigate]);

  // Reset cache on logout (user becomes null)
  useEffect(() => {
    if (!authLoading && !user) {
      sessionStorage.removeItem('partner_onboarded');
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
