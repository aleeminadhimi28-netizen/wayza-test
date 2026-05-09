import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext.jsx';
import { useToast } from '../../ToastContext.jsx';
import { motion } from 'framer-motion';
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

  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin', { replace: true });
    }
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
    } catch (err) {
      showToast('Connection error. Please try again.', 'error');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col md:flex-row overflow-hidden">
      {/* LEFT: BRANDING PANEL */}
      <div className="hidden md:flex md:w-[45%] bg-slate-900 text-white p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/95 to-emerald-900/30" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
              W
            </div>
            <span className="text-2xl font-bold">
              Wayzza <span className="text-emerald-400">Admin</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="w-16 h-16 bg-emerald-600/20 rounded-2xl flex items-center justify-center border border-emerald-500/20">
            <Shield size={28} className="text-emerald-400" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
            Admin
            <br />
            <span className="text-emerald-400">Control Panel</span>
          </h1>
          <p className="text-white/40 text-base max-w-sm leading-relaxed">
            Manage users, properties, bookings, and platform settings from a single dashboard.
          </p>
        </div>

        <div className="relative z-10 text-xs text-white/20 font-medium">
          © 2026 Wayzza Inc. Internal Use Only.
        </div>
      </div>

      {/* RIGHT: LOGIN FORM */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 bg-white">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Mobile branding */}
            <div className="md:hidden flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                W
              </div>
              <span className="text-xl font-bold text-slate-900">
                Wayzza <span className="text-emerald-600">Admin</span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide mb-2">
                <Shield size={13} /> Admin Portal
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Sign in to Admin</h2>
              <p className="text-slate-500 text-sm mt-1">
                Enter your admin credentials to access the dashboard.
              </p>
            </div>

            <form onSubmit={login} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Email</label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@wayzza.com"
                    autoComplete="email"
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Password</label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type={show ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-12 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-slate-900 text-white rounded-xl font-semibold text-sm transition-all hover:bg-emerald-600 shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 text-center border-t border-slate-100">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-slate-500 text-sm font-medium hover:text-emerald-600 transition-colors"
              >
                <ArrowLeft size={14} /> Back to Guest Login
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
