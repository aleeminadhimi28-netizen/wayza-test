import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext.jsx';
import { useToast } from '../../ToastContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import { api } from '../../utils/api.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login: setAuth, user } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [tick, setTick] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);

  const isLocked = lockedUntil && Date.now() < lockedUntil;
  const lockSecondsLeft = isLocked ? Math.ceil((lockedUntil - Date.now()) / 1000) : 0;

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const { timeStr } = useMemo(
    () => ({
      timeStr: new Date().toLocaleTimeString('en-GB', { hour12: false }),
    }),
    [tick]
  );

  useEffect(() => {
    if (user && user.role === 'admin') navigate('/admin', { replace: true });
  }, [user, navigate]);

  async function login(e) {
    if (e) e.preventDefault();
    if (loading) return;

    if (lockedUntil && Date.now() < lockedUntil) {
      showToast(
        `Too many attempts. Try again in ${Math.ceil((lockedUntil - Date.now()) / 1000)}s.`,
        'error'
      );
      return;
    }

    try {
      setLoading(true);
      const data = await api.adminLogin({ email, password });
      if (!data.ok) {
        const newCount = failCount + 1;
        setFailCount(newCount);
        if (newCount >= 5) {
          setLockedUntil(Date.now() + 30000);
          setFailCount(0);
          showToast('Too many failed attempts. Locked for 30 seconds.', 'error');
        } else {
          showToast(
            `${data.message || 'Invalid credentials.'} (${5 - newCount} attempts left)`,
            'error'
          );
        }
        setLoading(false);
        return;
      }
      setFailCount(0);
      setLockedUntil(null);
      setAuth({ email: data.email, role: 'admin' });
      showToast('Welcome back, Administrator.', 'success');
      navigate('/admin', { replace: true });
    } catch {
      showToast('Connection error. Please try again.', 'error');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#080c0a] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-emerald-900 selection:text-emerald-100">
      {/* Soft glowing orbs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[30%] w-[600px] h-[500px] rounded-full bg-emerald-600/10 blur-[140px]" />
        <div className="absolute bottom-[-5%] right-[20%] w-[500px] h-[400px] rounded-full bg-teal-600/8 blur-[120px]" />
        {/* Fine grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(52,211,153,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(52,211,153,1) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* ── Main centered card ── */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        {/* Logo mark */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(52,211,153,0)',
                '0 0 0 12px rgba(52,211,153,0.08)',
                '0 0 0 0 rgba(52,211,153,0)',
              ],
            }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
            className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-5"
          >
            <Shield size={30} className="text-emerald-400" strokeWidth={1.75} />
          </motion.div>

          <h1 className="text-white font-black text-2xl tracking-tight">Wayzza Admin</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400/80 text-[11px] font-bold uppercase tracking-[0.25em]">
              {timeStr} · Secure Access
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.09] rounded-3xl px-8 py-9 shadow-[0_30px_80px_rgba(0,0,0,0.7)]">
          {/* Header */}
          <div className="mb-7">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-2">
              Administrator Login
            </p>
            <h2 className="text-white text-xl font-black tracking-tight leading-snug">
              Sign in to the
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                Control Panel
              </span>
            </h2>
          </div>

          <form onSubmit={login} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[10.5px] font-black text-white/70 uppercase tracking-[0.2em] mb-2">
                Email Address
              </label>
              <div
                className={`relative transition-all duration-200 rounded-xl ${
                  focused === 'email' ? 'ring-2 ring-emerald-500/50' : 'ring-1 ring-white/[0.07]'
                }`}
              >
                <Mail
                  size={15}
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                    focused === 'email' ? 'text-emerald-400' : 'text-white/30'
                  }`}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="admin@wayza.in"
                  autoComplete="email"
                  className="w-full h-11 bg-[#060a07] rounded-xl pl-10 pr-4 text-sm font-semibold text-white placeholder:text-white/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10.5px] font-black text-white/70 uppercase tracking-[0.2em] mb-2">
                Password
              </label>
              <div
                className={`relative transition-all duration-200 rounded-xl ${
                  focused === 'pw' ? 'ring-2 ring-emerald-500/50' : 'ring-1 ring-white/[0.07]'
                }`}
              >
                <Lock
                  size={15}
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                    focused === 'pw' ? 'text-emerald-400' : 'text-white/30'
                  }`}
                />
                <input
                  type={show ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused('pw')}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  className="w-full h-11 bg-[#060a07] rounded-xl pl-10 pr-11 text-sm font-semibold text-white placeholder:text-white/20 focus:outline-none transition-all tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-emerald-400 transition-colors p-0.5"
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Security notice */}
            <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-amber-500/8 border border-amber-500/15">
              <Shield size={13} className="text-amber-400 shrink-0" />
              <p className="text-[10.5px] text-amber-200/80 font-medium leading-snug">
                All access attempts are logged and monitored.
              </p>
            </div>

            {/* Divider */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-white/[0.06]" />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full h-12 rounded-xl relative overflow-hidden group font-black text-[11.5px] uppercase tracking-[0.3em] transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-emerald-900/40"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:from-emerald-400 group-hover:to-teal-400 transition-all duration-300" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-300 blur-md scale-110" />
              </div>
              <span className="relative flex items-center justify-center gap-2.5 text-[#050a08]">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-5 h-5 border-2 border-[#050a08]/30 border-t-[#050a08] rounded-full animate-spin"
                    />
                  ) : isLocked ? (
                    <motion.span
                      key="locked"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Locked — wait {lockSecondsLeft}s
                    </motion.span>
                  ) : (
                    <motion.span
                      key="default"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      Sign In
                      <ArrowRight
                        size={16}
                        strokeWidth={2.5}
                        className="group-hover:translate-x-0.5 transition-transform"
                      />
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
            </button>
          </form>
        </div>

        {/* Back link */}
        <div className="mt-5 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white/40 hover:text-white/80 uppercase tracking-wider transition-colors"
          >
            <ArrowLeft size={12} />
            Back to Guest Portal
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
