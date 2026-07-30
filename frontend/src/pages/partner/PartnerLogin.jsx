import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext.jsx';
import { useToast } from '../../ToastContext.jsx';
import { AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import VerificationSpinner from '../../components/VerificationSpinner.jsx';

import { api } from '../../utils/api.js';

export default function PartnerLogin() {
  const navigate = useNavigate();
  const { login: setAuth, user } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  // AUTO REDIRECT IF ALREADY LOGGED IN
  useEffect(() => {
    if (user && user.role === 'partner') {
      navigate('/partner', { replace: true });
    }
  }, [user, navigate]);

  async function login(e) {
    if (e) e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      const data = await api.partnerLogin({ email, password });

      if (!data.ok) {
        showToast(data.message || 'Partner access denied. Please verify credentials.', 'error');
        setLoading(false);
        return;
      }

      setAuth({ email: data.email, role: 'partner' });

      showToast('Welcome back to Wayzza Pro.', 'success');
      navigate('/partner', { replace: true });
    } catch (err) {
      showToast('Connection interrupted. Please try again.', 'error');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050a08] font-sans flex flex-col md:flex-row overflow-hidden selection:bg-emerald-900/50 selection:text-emerald-200">
      <AnimatePresence>
        {loading && (
          <VerificationSpinner
            message="Authenticating Access..."
            subtext="Connecting to Partner Network"
          />
        )}
      </AnimatePresence>

      {/* LEFT: BRAND & COMMUNITY PANEL */}
      <div className="hidden md:flex md:w-[46%] bg-[#070d0a] text-white p-12 lg:p-16 flex-col justify-between relative overflow-hidden border-r border-white/10">
        {/* Subtle ambient gradient glow */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-700/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Top Logo Header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-[#050a08] font-bold text-base shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              W
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Wayzza<span className="text-emerald-400">Pro</span>
            </span>
          </Link>
        </div>

        {/* Center Hero Information */}
        <div className="relative z-10 max-w-md my-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            <Sparkles size={12} /> Partner Suite
          </div>

          <h1 className="text-3xl lg:text-4xl font-semibold text-white tracking-tight leading-tight">
            Manage your hospitality business with confidence.
          </h1>

          <p className="text-white/50 text-sm font-normal leading-relaxed">
            Real-time booking management, dynamic pricing tools, and automated payouts — built
            specifically for hosts in Varkala and Kerala.
          </p>

          <div className="space-y-3 pt-2">
            {[
              'Real-time performance tracking & revenue insights',
              'Direct guest messaging & instant booking alerts',
              'Transparent 100% verified settlement payouts',
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-xs font-medium text-white/70">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Community Badge */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center gap-4">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-[#070d0a] bg-slate-800 overflow-hidden shadow-md"
              >
                <img
                  src={`https://i.pravatar.cc/150?u=${i + 20}`}
                  alt="Partner Host"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <div className="text-xs">
            <p className="font-semibold text-white">500+ Active Hosts</p>
            <p className="text-white/40 text-[11px]">Varkala & Kerala Stays</p>
          </div>
        </div>
      </div>

      {/* RIGHT: AUTH FORM */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 md:p-16 relative bg-white">
        <div className="max-w-md w-full">
          <div className="space-y-8">
            {/* Header */}
            <div>
              <Link to="/" className="md:hidden inline-flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-[#050a08] font-bold text-sm">
                  W
                </div>
                <span className="text-lg font-bold text-slate-900">
                  Wayzza<span className="text-emerald-600">Pro</span>
                </span>
              </Link>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold mb-3">
                <ShieldCheck size={13} /> Partner Access
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Welcome back
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Enter your credentials to access your partner dashboard.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={login} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="partner-login-email"
                  className="text-xs font-semibold text-slate-700"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="email"
                    required
                    id="partner-login-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="partner@example.com"
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="partner-login-password"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type={show ? 'text' : 'password'}
                    required
                    id="partner-login-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-11 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    aria-label="Toggle password visibility"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-slate-950 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-slate-900/10 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="pt-6 border-t border-slate-100 flex flex-col items-center gap-4 text-center">
              <p className="text-xs text-slate-500">
                Don't have a partner account?{' '}
                <Link
                  to="/partner-register"
                  className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Register as a Partner
                </Link>
              </p>

              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors"
              >
                <ArrowLeft size={14} /> Back to Guest Access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
