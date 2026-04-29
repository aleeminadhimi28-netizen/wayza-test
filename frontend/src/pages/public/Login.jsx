import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext.jsx';
import { useToast } from '../../ToastContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  LogIn,
  Shield,
  Loader2,
} from 'lucide-react';
import VerificationSpinner from '../../components/VerificationSpinner.jsx';
import { useGoogleLogin } from '@react-oauth/google';

import { api } from '../../utils/api.js';

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [otp, setOtp] = useState('');
  const [useOTP, setUseOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showing2FA, setShowing2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');

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
      const errorMsg =
        errorResponse?.error_description ||
        errorResponse?.error ||
        'Google Popup failed or was closed.';
      showToast(errorMsg, 'error');
    },
  });

  async function handleRequestOTP() {
    if (!email) {
      showToast('Please enter email first', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await api.sendOTP(email);
      if (res.ok) {
        setOtpSent(true);
        showToast('OTP sent to your email!', 'success');
      } else {
        showToast(res.message || 'Failed to send OTP', 'error');
      }
    } catch {
      showToast('Could not send OTP.', 'error');
    }
    setLoading(false);
  }

  async function handleLogin(e) {
    if (e) e.preventDefault();

    if (useOTP) {
      if (!otpSent) return handleRequestOTP();
      if (!email || !otp) {
        showToast('Please enter email and OTP.', 'error');
        return;
      }
      try {
        setLoading(true);
        const data = await api.verifyOTP({ email, otp });
        if (!data.ok) {
          if (data.twoFactorRequired) {
            setTempToken(data.tempToken);
            setShowing2FA(true);
            setLoading(false);
            return;
          }
          showToast(data.message || 'Invalid OTP.', 'error');
          setLoading(false);
          return;
        }
        login({ email: data.data.email, role: data.data.role });
        showToast('Welcome to Wayzza!', 'success');
        navigate('/');
      } catch (error) {
        showToast('Server error.', 'error');
      }
      setLoading(false);
      return;
    }

    // Standard Login
    if (!email || !password) {
      showToast('Please enter your credentials.', 'error');
      return;
    }

    try {
      setLoading(true);

      const data = await api.login({ email, password });

      if (!data.ok) {
        if (data.twoFactorRequired) {
          setTempToken(data.tempToken);
          setShowing2FA(true);
          setLoading(false);
          return;
        }
        showToast('Invalid email or password.', 'error');
        setLoading(false);
        return;
      }

      login({ email: data.data.email, role: data.data.role });
      showToast('Welcome back to Wayzza!', 'success');
      navigate('/');
    } catch (error) {
      showToast('Could not connect to server.', 'error');
    }
    setLoading(false);
  }

  async function handle2FAVerify(e) {
    if (e) e.preventDefault();
    if (twoFactorCode.length !== 6) return;
    setLoading(true);
    try {
      const data = await api.verify2FA({ tempToken, token: twoFactorCode });
      if (data.ok && data.data) {
        login({ email: data.data.email, role: data.data.role });
        showToast('Success! Secure connection established.', 'success');
        navigate('/');
      } else {
        showToast(data.message || 'Invalid Authenticator code', 'error');
      }
    } catch {
      showToast('2FA verification failed', 'error');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <AnimatePresence>
        {loading && (
          <VerificationSpinner
            message={useOTP && !otpSent ? 'Generating OTP...' : 'Logging in...'}
            subtext="Verifying Member Presence"
          />
        )}
      </AnimatePresence>

      {/* LEFT: REFINED BRAND IMAGE */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center p-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center transition-transform duration-[10s] hover:scale-110" />
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

        <div className="relative z-10 max-w-lg space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 bg-white/10 border border-white/20 px-6 py-3 rounded-full text-white font-bold text-[11px] uppercase tracking-[0.2em] backdrop-blur-xl"
          >
            <Sparkles size={16} className="text-emerald-400" /> Curated Travel Experiences
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-7xl md:text-9xl font-bold text-white tracking-tighter leading-[0.8] uppercase"
          >
            Your <br />
            <span className="text-emerald-500 lowercase">Experience</span> <br /> Resumes.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-white/60 font-medium leading-relaxed"
          >
            Log in to access your curated collection of unique stays and personalized itineraries.
          </motion.p>
        </div>

        <div className="absolute bottom-12 left-12 flex items-center gap-4">
          <div className="w-12 h-1 bg-emerald-500 rounded-full" />
          <div className="w-2 h-1 bg-white/20 rounded-full" />
          <div className="w-2 h-1 bg-white/20 rounded-full" />
          <span className="text-[11px] font-bold text-white/30 uppercase tracking-[0.4em] ml-4">
            Wayzza Guest Network
          </span>
        </div>
      </div>

      {/* RIGHT: AUTH INTERFACE */}
      <main className="w-full lg:w-1/2 flex flex-col justify-center p-6 md:p-12 lg:p-24 relative bg-white">
        <div className="max-w-md w-full mx-auto space-y-12">
          <Link
            to="/"
            className="inline-block text-3xl font-bold tracking-tight mb-8 group uppercase"
          >
            Wayzza<span className="text-emerald-600">.</span>
            <div className="h-1 text-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </Link>

          <AnimatePresence mode="wait">
            {!showing2FA ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <form onSubmit={handleLogin} className="space-y-8 group">
                  <div className="space-y-6">
                    <div className="space-y-3 group/field">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within/field:text-emerald-600 transition-colors">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail
                          className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within/field:text-emerald-600 transition-colors"
                          size={20}
                        />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setOtpSent(false);
                          }}
                          autoComplete="email"
                          className="w-full h-16 bg-slate-50 border border-slate-100 rounded-2xl pl-16 pr-6 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200 shadow-inner"
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>

                    {!useOTP ? (
                      <div className="space-y-3 group/field">
                        <div className="flex justify-between items-center ml-1">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest group-focus-within/field:text-emerald-600 transition-colors">
                            Password
                          </label>
                          <Link
                            to="/forgot-password"
                            size={14}
                            className="text-[11px] font-bold uppercase text-emerald-600 tracking-widest hover:text-emerald-700 transition-colors"
                          >
                            Recovery Link?
                          </Link>
                        </div>
                        <div className="relative">
                          <Lock
                            className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within/field:text-emerald-600 transition-colors"
                            size={20}
                          />
                          <input
                            type={show ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            className="w-full h-16 bg-slate-50 border border-slate-100 rounded-2xl pl-16 pr-20 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200 shadow-inner"
                            placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                          />
                          <button
                            type="button"
                            onClick={() => setShow(!show)}
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-600 transition-colors"
                          >
                            {show ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        <div className="text-right">
                          <button
                            type="button"
                            onClick={() => setUseOTP(true)}
                            className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700 mt-2"
                          >
                            Log in with OTP instead
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 group/field">
                        <div className="flex justify-between items-center ml-1">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest group-focus-within/field:text-emerald-600 transition-colors">
                            6-Digit Code
                          </label>
                          <button
                            type="button"
                            onClick={() => setUseOTP(false)}
                            className="text-[11px] font-bold uppercase text-emerald-600 tracking-widest hover:text-emerald-700 transition-colors"
                          >
                            Use Password?
                          </button>
                        </div>
                        {otpSent ? (
                          <div className="relative">
                            <Lock
                              className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within/field:text-emerald-600 transition-colors"
                              size={20}
                            />
                            <input
                              type="text"
                              required
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              className="w-full h-16 bg-slate-50 border border-slate-100 rounded-2xl pl-16 pr-20 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200 shadow-inner tracking-[0.5em] text-lg"
                              placeholder="123456"
                              maxLength={6}
                            />
                          </div>
                        ) : (
                          <div className="flex bg-slate-50 border border-slate-100 rounded-2xl p-4 items-center justify-center">
                            <p className="text-xs font-medium text-slate-400">
                              Click below to receive an OTP.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-16 bg-slate-900 text-white rounded-2xl font-bold uppercase text-[11px] tracking-[0.3em] hover:bg-emerald-600 shadow-2xl shadow-slate-900/10 active:scale-95 transition-all flex items-center justify-center gap-5 group disabled:opacity-20"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{useOTP && !otpSent ? 'Send OTP' : 'Log In'}</span>
                        <LogIn
                          size={20}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </>
                    )}
                  </button>

                  <div className="relative flex items-center pt-4">
                    <div className="flex-grow border-t border-slate-100"></div>
                    <span className="flex-shrink-0 mx-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
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
              </motion.div>
            ) : (
              <motion.div
                key="2fa-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-12"
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-6">
                    <Shield size={32} />
                  </div>
                  <h2 className="text-5xl font-bold text-slate-900 tracking-tighter leading-none uppercase">
                    Secondary <br />
                    <span className="text-emerald-500 lowercase">Protocol.</span>
                  </h2>
                  <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.4em] border-l-2 border-emerald-500/20 pl-4">
                    Enter the 6-digit code from your authenticator app.
                  </p>
                </div>

                <form onSubmit={handle2FAVerify} className="space-y-10">
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full h-24 bg-slate-50 border border-slate-100 rounded-[32px] text-center text-5xl font-black tracking-[0.4em] text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all shadow-inner"
                    placeholder="000000"
                  />

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setShowing2FA(false)}
                      className="h-20 px-8 bg-slate-100 text-slate-500 rounded-[32px] font-bold uppercase text-[11px] tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || twoFactorCode.length !== 6}
                      className="flex-1 h-20 bg-emerald-600 text-white rounded-[32px] font-bold uppercase text-[11px] tracking-[0.3em] hover:bg-emerald-700 shadow-2xl shadow-emerald-600/10 active:scale-95 transition-all flex items-center justify-center gap-5 disabled:opacity-20"
                    >
                      {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <span>Verify Protocol</span>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center space-y-6 pt-6">
            <p className="font-bold text-slate-400 text-[11px] uppercase tracking-widest">
              New to Wayzza?{' '}
              <Link
                to="/signup"
                className="text-emerald-600 hover:text-emerald-700 font-bold border-b border-emerald-500/30"
              >
                Create Account
              </Link>
            </p>
          </div>

          <div className="pt-16 border-t border-slate-50 flex justify-between items-center opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-default group">
            <div className="flex items-center gap-3">
              <ShieldCheck
                size={18}
                className="text-emerald-500 group-hover:scale-110 transition-transform"
              />
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Secure Protocol Active
              </span>
            </div>
            <div className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
