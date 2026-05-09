import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Mail,
  ArrowLeft,
  ArrowRight,
  Zap,
  CheckCircle,
  Lock,
  Sparkles,
} from 'lucide-react';

import { api } from '../../utils/api.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    try {
      // Manual delay for refined feel

      const data = await api.forgotPassword(email);

      if (data.ok) {
        setSent(true);
      } else {
        setError(data.message || "We couldn't process your request. Please try again later.");
      }
    } catch {
      setError('Connection lost. Please check your network and try again.');
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col md:flex-row overflow-hidden">
      {/* LEFT: REFINED BRANDING SIDEBAR */}
      <div className="hidden md:flex md:w-[45%] bg-white p-20 flex-col justify-between relative overflow-hidden border-r border-slate-200">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent)]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -ml-32 -mb-32" />

        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Link to="/" className="text-3xl font-bold tracking-tight text-slate-900 uppercase">
              Wayzza<span className="text-emerald-500">.</span>
            </Link>
          </motion.div>
        </div>

        <div className="relative z-10 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-20 h-20 bg-slate-900 rounded-[32px] flex items-center justify-center shadow-2xl mb-10">
              <Lock size={32} className="text-emerald-400" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-none uppercase mb-8">
              Account <br />
              <span className="text-emerald-500">Recovery.</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              "Forgot your password? No worries. We'll send you a secure link to reset your
              credentials and get you back to your journey."
            </p>
          </motion.div>

          <div className="flex gap-8 opacity-40">
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-600" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Secure
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Sparkles size={20} className="text-emerald-600" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Instant
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[11px] font-bold text-slate-300 uppercase tracking-[0.4em]">
          Wayzza Guest Security Network v4.2
        </div>
      </div>

      {/* RIGHT: THE FORM MODULE */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-24 relative bg-white">
        <div className="max-w-md w-full">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="text-center space-y-10"
              >
                <div className="w-32 h-32 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner border-8 border-white">
                  <CheckCircle size={56} strokeWidth={1.5} />
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">
                    Email Sent.
                  </h2>
                  <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest leading-relaxed">
                    A reset link has been sent to{' '}
                    <span className="text-slate-900 underline decoration-emerald-500 underline-offset-4">
                      {email}
                    </span>
                    . Please check your inbox.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full h-18 py-5 bg-slate-900 text-white rounded-3xl font-bold uppercase text-[11px] tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 active:scale-95"
                >
                  Back to Login <ArrowRight size={18} />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-[11px] uppercase tracking-widest">
                    <Sparkles size={14} /> Security Support
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-slate-900 uppercase tracking-tight leading-none">
                    Find Your <span className="text-emerald-500">Account.</span>
                  </h2>
                  <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest">
                    Enter your email address to receive a reset link
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-3 group">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-emerald-600 transition-colors">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-emerald-500 transition-colors"
                        size={20}
                      />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full h-16 bg-slate-50 border border-slate-100 rounded-2xl pl-16 pr-6 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200 shadow-inner"
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 font-bold text-[11px] uppercase tracking-widest flex items-center gap-3"
                    >
                      <Zap size={14} className="shrink-0" /> {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-18 py-5 bg-slate-900 text-white rounded-3xl font-bold uppercase text-[11px] tracking-widest transition-all hover:bg-emerald-600 shadow-xl shadow-slate-900/10 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send Reset Link</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-8 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-slate-300 font-bold text-[11px] uppercase tracking-widest hover:text-emerald-600 transition-colors"
                  >
                    <ArrowLeft size={14} /> Back to Login
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
