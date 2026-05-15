import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext.jsx';
import { useToast } from '../../ToastContext.jsx';
import { motion } from 'framer-motion';
import {
  Shield, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft,
  Activity, Server, Database, Globe,
} from 'lucide-react';
import { api } from '../../utils/api.js';

const SYSTEM_NODES = [
  { label: 'Auth Service', icon: Shield, status: 'online' },
  { label: 'Database', icon: Database, status: 'online' },
  { label: 'API Gateway', icon: Server, status: 'online' },
  { label: 'CDN Edge', icon: Globe, status: 'online' },
];

function TerminalLine({ text, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="font-mono text-[11px] text-indigo-300/50 leading-relaxed"
    >
      {text}
    </motion.div>
  );
}

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

  // Live clock tick
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-GB', { hour12: false });
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  useEffect(() => {
    if (user && user.role === 'admin') navigate('/admin', { replace: true });
  }, [user, navigate]);

  async function login(e) {
    if (e) e.preventDefault();
    if (loading) return;
    try {
      setLoading(true);
      const data = await api.adminLogin({ email, password });
      if (!data.ok) {
        showToast(data.message || 'Invalid admin credentials.', 'error');
        setLoading(false);
        return;
      }
      setAuth({ email: data.email, role: 'admin' });
      showToast('Welcome back, Administrator.', 'success');
      navigate('/admin', { replace: true });
    } catch {
      showToast('Connection error. Please try again.', 'error');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#06070f] font-sans flex overflow-hidden relative selection:bg-indigo-900/50 selection:text-indigo-200">
      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-[20%] w-[40%] h-[50%] bg-indigo-600/6 blur-[180px] rounded-full" />
        <div className="absolute bottom-0 right-[10%] w-[35%] h-[40%] bg-violet-600/5 blur-[160px] rounded-full" />
        {/* Scanline overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(99,102,241,0.8) 2px, rgba(99,102,241,0.8) 3px)',
          }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.8) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[48%] flex-col justify-between p-16 relative z-10 border-r border-white/[0.04]">
        {/* Logo */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:shadow-indigo-600/50 transition-all">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-black text-sm tracking-tight uppercase leading-none">Wayzza Admin</p>
              <p className="text-indigo-400/40 text-[9px] font-bold uppercase tracking-[0.3em] mt-0.5">Command Center</p>
            </div>
          </Link>
          {/* Live clock */}
          <div className="text-right">
            <p className="text-white font-mono text-lg font-bold tracking-tight tabular-nums">{timeStr}</p>
            <p className="text-white/20 font-mono text-[10px] uppercase tracking-widest">{dateStr}</p>
          </div>
        </div>

        {/* Center hero */}
        <div className="space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] mb-6">
              <Activity size={10} className="animate-pulse" />
              System Operational
            </div>
            <h1 className="text-[64px] font-black text-white tracking-[-0.04em] leading-[0.85] uppercase">
              Admin<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-500">
                Control
              </span><br />
              Panel.
            </h1>
          </div>
          <p className="text-white/25 text-base font-medium leading-relaxed max-w-sm">
            Manage users, listings, bookings, financials, and platform configuration from a secure unified interface.
          </p>

          {/* System nodes */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">System Status</p>
            {SYSTEM_NODES.map(({ label, icon: Icon, status }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.025] border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600/15 flex items-center justify-center">
                  <Icon size={14} className="text-indigo-400" />
                </div>
                <span className="text-white/50 text-xs font-bold uppercase tracking-widest flex-1">{label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/60 animate-pulse" />
                  <span className="text-emerald-400 text-[10px] font-black uppercase tracking-wider">{status}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Terminal snippet */}
          <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.05]">
            <div className="flex gap-1.5 mb-4">
              {['#ef4444', '#f59e0b', '#22c55e'].map((c) => (
                <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c, opacity: 0.6 }} />
              ))}
            </div>
            <TerminalLine text="$ wayzza-admin --connect secure" delay={0} />
            <TerminalLine text="> Establishing encrypted tunnel..." delay={0.3} />
            <TerminalLine text="> Auth service connected ✓" delay={0.6} />
            <TerminalLine text="> Session scope: SUPER_ADMIN" delay={0.9} />
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="font-mono text-[11px] text-indigo-400"
            >
              █
            </motion.span>
          </div>
        </div>

        <p className="text-white/8 text-[10px] font-mono uppercase tracking-[0.3em]">
          © 2026 Wayzza Inc · Internal Use Only · v2.6.0
        </p>
      </div>

      {/* ── RIGHT PANEL (Form) ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Security badge */}
          <div className="flex items-center justify-center mb-8">
            <motion.div
              animate={{ boxShadow: ['0 0 0px rgba(99,102,241,0)', '0 0 32px rgba(99,102,241,0.25)', '0 0 0px rgba(99,102,241,0)'] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="w-20 h-20 rounded-[28px] bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center"
            >
              <Shield size={36} className="text-indigo-400" strokeWidth={1.5} />
            </motion.div>
          </div>

          {/* Card */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-[28px] p-10 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
            {/* Mobile logo */}
            <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Shield size={14} className="text-white" />
              </div>
              <span className="text-white font-black tracking-tight text-sm uppercase">Wayzza Admin</span>
            </Link>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-px w-6 bg-indigo-500/60" />
                <span className="text-[10px] font-black text-indigo-400/60 uppercase tracking-[0.5em]">Restricted Access</span>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight leading-none uppercase">
                Administrator<br />
                <span className="text-indigo-400">Authentication.</span>
              </h2>
              <p className="text-white/20 text-xs font-medium mt-3 leading-relaxed">
                This area is restricted to authorized personnel only. All access attempts are logged and monitored.
              </p>
            </div>

            <form onSubmit={login} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/25 uppercase tracking-[0.4em]">
                  Admin Email
                </label>
                <div className={`relative rounded-xl transition-all duration-200 ${focused === 'email' ? 'ring-1 ring-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.08)]' : ''}`}>
                  <Mail
                    size={15}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'email' ? 'text-indigo-400' : 'text-white/15'}`}
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    placeholder="admin@wayzza.com"
                    autoComplete="email"
                    className="w-full h-13 bg-white/[0.05] border border-white/[0.07] rounded-xl pl-11 pr-4 text-sm font-semibold text-white placeholder:text-white/10 focus:outline-none focus:bg-white/[0.08] focus:border-indigo-500/30 transition-all py-3.5"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/25 uppercase tracking-[0.4em]">
                  Password
                </label>
                <div className={`relative rounded-xl transition-all duration-200 ${focused === 'pw' ? 'ring-1 ring-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.08)]' : ''}`}>
                  <Lock
                    size={15}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'pw' ? 'text-indigo-400' : 'text-white/15'}`}
                  />
                  <input
                    type={show ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused('pw')}
                    onBlur={() => setFocused(null)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full h-13 bg-white/[0.05] border border-white/[0.07] rounded-xl pl-11 pr-12 text-sm font-semibold text-white placeholder:text-white/10 focus:outline-none focus:bg-white/[0.08] focus:border-indigo-500/30 transition-all py-3.5 tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/15 hover:text-indigo-400 transition-colors"
                  >
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <Shield size={13} className="text-amber-400/60 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-400/40 font-medium leading-relaxed">
                  Unauthorized access is a criminal offence. All sessions are recorded and may be reviewed.
                </p>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full h-13 rounded-xl font-black text-[11px] uppercase tracking-[0.4em] overflow-hidden group transition-all active:scale-[0.98] disabled:opacity-40 py-3.5"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 transition-opacity group-hover:opacity-90" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 blur-sm scale-105" />
                  </div>
                  <span className="relative flex items-center justify-center gap-3 text-white">
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Authenticate
                        <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>

            {/* Back link */}
            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-[10px] font-semibold text-white/10 hover:text-white/30 uppercase tracking-widest transition-colors"
              >
                <ArrowLeft size={11} /> Back to Guest Portal
              </Link>
            </div>
          </div>

          {/* Activity indicator */}
          <div className="mt-5 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-[10px] text-white/10 font-mono uppercase tracking-widest">
              Session Encrypted · TLS 1.3
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
