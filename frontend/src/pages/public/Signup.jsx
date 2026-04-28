import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  UserPlus,
  User,
  Phone,
} from 'lucide-react';
import { useToast } from '../../ToastContext.jsx';
import { useAuth } from '../../AuthContext.jsx';
import VerificationSpinner from '../../components/VerificationSpinner.jsx';
import { useGoogleLogin } from '@react-oauth/google';

import { api } from '../../utils/api.js';

export default function Signup() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { login, user } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  // AUTO REDIRECT IF ALREADY LOGGED IN
  useEffect(() => {
    if (user && user.role === 'guest') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const googleLogin = useGoogleLogin({
    scope: 'openid email profile',
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await api.googleAuth(tokenResponse.credential || tokenResponse.access_token);
        if (res.ok) {
          login({ email: res.data.email, role: res.data.role });
          showToast('Google Authentication successful!', 'success');
          navigate('/');
        } else {
          showToast(res.message || 'Google Authentication failed.', 'error');
        }
      } catch (err) {
        showToast('Could not connect to server.', 'error');
      }
      setLoading(false);
    },
    onError: (errorResponse) => {
      console.error('Google login error:', errorResponse);
      showToast(
        errorResponse?.error_description || errorResponse?.error || 'Google Authentication failed.',
        'error'
      );
    },
  });

  async function handleSignup(e) {
    if (e) e.preventDefault();
    if (!name || !phone || !email || !password) {
      showToast('Please complete your profile with name and phone before signing up.', 'error');
      return;
    }

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1200)); // Cinematic delay for identity creation

      const data = await api.signup({ name, phone, email, password });

      if (data.ok) {
        showToast('Account created successfully!', 'success');
        navigate('/login');
      } else {
        showToast(data.message || 'Registration failed.', 'error');
      }
    } catch (err) {
      showToast('Could not connect to server.', 'error');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <AnimatePresence>
        {loading && (
          <VerificationSpinner
            message="Initializing Identity..."
            subtext="Synchronizing Member Records"
          />
        )}
      </AnimatePresence>

      {/* LEFT: REFINED VISUAL HERO */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-white items-center justify-center p-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

        <div className="relative z-10 max-w-lg space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 bg-white/10 border border-white/20 px-6 py-3 rounded-full text-white font-bold text-[10px] uppercase tracking-widest backdrop-blur-xl"
          >
            <UserPlus size={16} className="text-emerald-400" /> Join our community
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-7xl md:text-9xl font-bold text-white tracking-tighter leading-[0.8] uppercase"
          >
            Your <br />
            <span className="text-emerald-500 lowercase">Voyage</span> <br /> Commences.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-white/70 font-medium leading-relaxed"
          >
            Create an account to unlock exclusive properties, manage your bookings, and experience
            luxury travel like never before.
          </motion.p>
        </div>

        <div className="absolute bottom-12 left-12 flex gap-3">
          <div className="w-12 h-1.5 bg-emerald-500 rounded-full" />
          <div className="w-4 h-1.5 bg-white/30 rounded-full" />
          <div className="w-4 h-1.5 bg-white/30 rounded-full" />
        </div>
      </div>

      {/* RIGHT: AUTH INTERFACE */}
      <main className="w-full lg:w-1/2 flex flex-col justify-center p-6 md:p-12 lg:p-24 relative bg-white">
        <div className="max-w-md w-full mx-auto space-y-10">
          <Link
            to="/"
            className="inline-block text-2xl font-bold tracking-tight mb-8 group uppercase"
          >
            WAYZZA<span className="text-emerald-600">.</span>
            <div className="h-0.5 w-0 group-hover:w-full bg-emerald-500 transition-all duration-500 shadow-xl" />
          </Link>

          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tighter leading-none uppercase">
              Begin Your <span className="text-emerald-500 lowercase">Journey.</span>
            </h2>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] border-l-2 border-emerald-500/20 pl-4">
              Join the network to experience the ultimate luxury.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-8 group">
            <div className="space-y-6">
              <div className="space-y-3 group/field">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within/field:text-emerald-600 transition-colors">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-emerald-600 transition-colors"
                    size={18}
                  />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-16 bg-slate-50 border border-slate-100 rounded-2xl pl-16 pr-6 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200 shadow-inner"
                    placeholder="Your full name"
                  />
                </div>
              </div>

              <div className="space-y-3 group/field">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within/field:text-emerald-600 transition-colors">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-emerald-600 transition-colors"
                    size={18}
                  />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-16 bg-slate-50 border border-slate-100 rounded-2xl pl-16 pr-6 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200 shadow-inner"
                    placeholder="+1 555 555 5555"
                  />
                </div>
              </div>

              <div className="space-y-3 group/field">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within/field:text-emerald-600 transition-colors">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-emerald-600 transition-colors"
                    size={18}
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-16 bg-slate-50 border border-slate-100 rounded-2xl pl-16 pr-6 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200 shadow-inner"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="space-y-3 group/field">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within/field:text-emerald-600 transition-colors">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-emerald-600 transition-colors"
                    size={18}
                  />
                  <input
                    type={show ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-16 bg-slate-50 border border-slate-100 rounded-2xl pl-16 pr-20 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200 shadow-inner"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-600 transition-colors"
                  >
                    {show ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-20 bg-slate-900 text-white rounded-[32px] font-bold uppercase text-[11px] tracking-[0.3em] hover:bg-emerald-600 hover:shadow-emerald-500/25 hover:-translate-y-1 shadow-2xl shadow-slate-900/10 active:scale-95 transition-all duration-300 flex items-center justify-center gap-5 group disabled:opacity-20"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-2 transition-transform"
                  />
                </>
              )}
            </button>

            <div className="relative flex items-center pt-4">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Or continue with
              </span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => googleLogin()}
                className="w-full h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-xs font-bold text-slate-700">Continue with Google</span>
              </button>
            </div>
          </form>

          <p className="text-center font-bold text-slate-400 text-xs">
            Already a member?{' '}
            <Link
              to="/login"
              className="text-emerald-600 hover:text-emerald-700 font-bold border-b border-emerald-500/20 pb-0.5"
            >
              Sign In
            </Link>
          </p>

          <div className="pt-20 border-t border-slate-50 flex justify-between items-center opacity-40 hover:opacity-100 transition-opacity group">
            <div className="flex items-center gap-3">
              <ShieldCheck
                size={16}
                className="text-emerald-500 group-hover:scale-110 transition-transform"
              />
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">
                Enterprise Grade Security
              </span>
            </div>
            <div className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-100 group-hover:bg-emerald-200 transition-colors" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-100 group-hover:bg-emerald-400 transition-colors" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
