import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ShieldCheck, LogOut, ArrowLeft } from 'lucide-react';
import VerificationSpinner from '../../components/VerificationSpinner.jsx';
import { useAuth } from '../../AuthContext.jsx';

import { api } from '../../utils/api.js';

export default function PartnerGuard({ children }) {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useAuth();
  const [checking, setChecking] = useState(
    () => sessionStorage.getItem('partner_onboarded') !== 'true'
  );
  const [pendingApproval, setPendingApproval] = useState(false);

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

    // ✅ check onboarding + approval status from backend
    api
      .partnerStatus()
      .then((data) => {
        if (!active) return;

        if (data.onboarded) {
          // Fully approved — allow access
          sessionStorage.setItem('partner_onboarded', 'true');
          setChecking(false);
        } else if (data.onboardingCompleted) {
          // Onboarding completed but admin hasn't approved yet
          setPendingApproval(true);
          setChecking(false);
        } else {
          // Partner hasn't completed onboarding form yet
          navigate('/partner-onboarding', { replace: true });
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

  // ── PENDING APPROVAL SCREEN ──
  if (pendingApproval) {
    return (
      <div className="min-h-screen bg-white font-sans flex items-center justify-center p-6 relative overflow-hidden selection:bg-emerald-100 selection:text-emerald-900">
        {/* Background mesh */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-50/60 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-100/60 blur-[120px] rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="w-full max-w-lg bg-white/60 backdrop-blur-3xl rounded-[48px] p-12 md:p-16 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.08)] border border-white/40 relative z-10 text-center space-y-10"
        >
          {/* Pulsing icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/20 blur-[40px] rounded-full scale-150 animate-pulse" />
              <div className="w-28 h-28 bg-amber-50 border-2 border-amber-200 text-amber-600 rounded-[36px] flex items-center justify-center relative shadow-xl">
                <Clock size={48} strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-amber-400" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-amber-600">
                Verification In Progress
              </span>
              <span className="h-px w-8 bg-amber-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 uppercase leading-[0.85]">
              Pending
              <br />
              <span className="text-amber-500 lowercase">Approval.</span>
            </h1>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
              Your onboarding has been submitted successfully. Our team is reviewing your business
              credentials and will activate your partner suite shortly.
            </p>
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-start gap-3 text-left">
              <ShieldCheck size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                This typically takes less than 24 hours. You will receive a notification once your
                account is approved and ready for operation.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={() => {
                // Re-check status
                setChecking(true);
                setPendingApproval(false);
                sessionStorage.removeItem('partner_onboarded');
              }}
              className="w-full h-14 bg-slate-950 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <ShieldCheck size={16} />
              Check Approval Status
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex-1 h-12 bg-slate-50 text-slate-500 border border-slate-200 rounded-xl font-semibold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={14} />
                Back to Site
              </button>
              <button
                onClick={() => {
                  sessionStorage.removeItem('partner_onboarded');
                  logout();
                  navigate('/partner-login');
                }}
                className="flex-1 h-12 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-semibold text-xs uppercase tracking-wider hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return children;
}
