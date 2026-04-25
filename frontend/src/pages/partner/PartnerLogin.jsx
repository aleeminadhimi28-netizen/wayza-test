import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext.jsx';
import { useToast } from '../../ToastContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Zap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Activity,
  ShieldCheck,
  Sparkles,
  Navigation,
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
      await new Promise((r) => setTimeout(r, 1200)); // Polished transition

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
    <div className="min-h-screen bg-white font-sans flex flex-col md:flex-row overflow-hidden selection:bg-emerald-100 selection:text-emerald-900">
      <AnimatePresence>
        {loading && (
          <VerificationSpinner
            message="Authenticating Access..."
            subtext="Connecting to Partner Network"
          />
        )}
      </AnimatePresence>

      {/* LEFT: BRAND EXCELLENCE */}
      <div className="hidden md:flex md:w-[45%] bg-slate-950 text-white p-20 flex-col justify-between relative overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center transition-transform duration-[20s] hover:scale-110 opacity-20 grayscale" />

        {/* Mesh Gradient Overlay */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[100px] rounded-full" />
        </div>

        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <Sparkles size={20} className="text-white" />
              </div>
              <span className="text-3xl font-black tracking-tighter uppercase">
                Wayzza<span className="text-emerald-500">Pro.</span>
              </span>
            </Link>
          </motion.div>
        </div>

        <div className="relative z-10 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-12 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
              Management Suite V2.5
            </div>
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase leading-[0.8] mb-12">
              Partner <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 lowercase pr-4">
                suite.
              </span>
            </h1>
            <p className="text-white/40 text-2xl font-medium leading-relaxed max-w-lg border-l-2 border-emerald-500/30 pl-8">
              "Orchestrate your hospitality portfolio with precision. Real-time analytics meets
              world-class design."
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-12">
          <div className="flex -space-x-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-800 overflow-hidden shadow-xl"
              >
                <img
                  src={`https://i.pravatar.cc/150?u=${i + 10}`}
                  alt="Partner"
                  className="w-full h-full object-cover grayscale opacity-50"
                />
              </div>
            ))}
            <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-emerald-500 flex items-center justify-center text-[10px] font-bold shadow-xl">
              +500
            </div>
          </div>
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
            Trusted by elite hosts worldwide
          </span>
        </div>
      </div>

      {/* RIGHT: AUTH INTERFACE */}
      <div className="flex-1 flex items-center justify-center p-8 md:px-24 relative bg-white">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50/50 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-md w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-16"
          >
            <header className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="h-px w-12 bg-emerald-500/20" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-600">
                  Access Key Req.
                </span>
              </div>
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 uppercase leading-[0.85]">
                Authorized <br />
                <span className="text-emerald-500 lowercase">SignIn.</span>
              </h2>
            </header>

            <form onSubmit={login} className="space-y-8">
              <div className="space-y-3 group/field">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2 group-focus-within/field:text-emerald-600 transition-colors">
                  Credential Email
                </label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-focus-within/field:bg-emerald-50 transition-colors">
                    <Mail
                      className="text-slate-300 group-focus-within/field:text-emerald-500 transition-colors"
                      size={20}
                    />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="partner@wayzza.com"
                    className="w-full h-22 bg-slate-50/50 border border-slate-100 rounded-[28px] pl-20 pr-10 font-bold text-xl tracking-tighter text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all placeholder:text-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-3 group/field">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2 group-focus-within/field:text-emerald-600 transition-colors">
                  Access Password
                </label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-focus-within/field:bg-emerald-50 transition-colors">
                    <Lock
                      className="text-slate-300 group-focus-within/field:text-emerald-500 transition-colors"
                      size={20}
                    />
                  </div>
                  <input
                    type={show ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-22 bg-slate-50/50 border border-slate-100 rounded-[28px] pl-20 pr-10 font-bold text-xl tracking-[0.2em] text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all placeholder:text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-600 transition-colors"
                  >
                    {show ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-22 bg-slate-950 text-white rounded-[32px] font-black uppercase text-xs tracking-[0.5em] transition-all hover:bg-emerald-600 shadow-2xl shadow-slate-900/20 active:scale-[0.98] flex items-center justify-center gap-6 disabled:opacity-20"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Initialize Suite</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="pt-12 flex flex-col items-center gap-8 text-center border-t border-slate-100">
              <div className="space-y-3">
                <p className="text-slate-300 font-bold text-[10px] uppercase tracking-widest leading-relaxed">
                  Don't have a professional portfolio?
                </p>
                <Link
                  to="/partner-register"
                  className="inline-flex items-center gap-4 text-emerald-600 font-black text-[10px] uppercase tracking-[0.5em] hover:text-emerald-700 transition-all group"
                >
                  Establish Residency{' '}
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </div>

              <Link
                to="/login"
                className="inline-flex items-center gap-4 text-slate-300 font-bold text-[9px] uppercase tracking-[0.4em] hover:text-slate-950 transition-colors pt-6 group"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />{' '}
                Back to Guest Access
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
