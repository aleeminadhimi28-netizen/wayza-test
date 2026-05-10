import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext.jsx';
import { useToast } from '../../ToastContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Sparkles, LogIn, Shield } from 'lucide-react';
import VerificationSpinner from '../../components/VerificationSpinner.jsx';
import { useGoogleLogin } from '@react-oauth/google';
import { api } from '../../utils/api.js';
import SEO from '../../components/SEO.jsx';
import './auth.css';

function FloatingInput({
  id,
  type = 'text',
  label,
  value,
  onChange,
  icon: Icon,
  suffix,
  autoComplete,
}) {
  return (
    <div className="au-field">
      <div className={`au-field-wrap${value ? ' au-active' : ''}`}>
        <Icon className="au-field-icon" size={16} />
        <input
          id={id}
          type={type}
          required
          value={value}
          onChange={onChange}
          className="au-input"
          placeholder=" "
          autoComplete={autoComplete || id}
        />
        <label htmlFor={id} className="au-label">
          {label}
        </label>
        {suffix && <div className="au-suffix">{suffix}</div>}
      </div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const { showToast } = useToast();
  const canvasRef = useRef(null);

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

  useEffect(() => {
    if (user && user.role === 'guest') navigate('/', { replace: true });
  }, [user, navigate]);

  /* particle canvas */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.5 + 0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52,211,153,${p.o})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const googleLogin = useGoogleLogin({
    scope: 'openid email profile',
    onSuccess: async (t) => {
      setLoading(true);
      try {
        const res = await api.googleAuth(t.credential || t.access_token);
        if (res.ok) {
          login({ email: res.data.email, role: res.data.role });
          showToast('Google Authentication successful!', 'success');
          navigate('/');
        } else showToast(res.message || 'Google Authentication failed.', 'error');
      } catch {
        showToast('Could not connect to server.', 'error');
      }
      setLoading(false);
    },
    onError: (e) =>
      showToast(e?.error_description || e?.error || 'Google Popup failed or was closed.', 'error'),
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
      } else showToast(res.message || 'Failed to send OTP', 'error');
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
      setLoading(true);
      try {
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
      } catch {
        showToast('Server error.', 'error');
      }
      setLoading(false);
      return;
    }
    if (!email || !password) {
      showToast('Please enter your credentials.', 'error');
      return;
    }
    setLoading(true);
    try {
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
    } catch {
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
        showToast('Secure connection established.', 'success');
        navigate('/');
      } else showToast(data.message || 'Invalid Authenticator code', 'error');
    } catch {
      showToast('2FA verification failed', 'error');
    }
    setLoading(false);
  }

  const EyeBtn = () => (
    <button
      type="button"
      onClick={() => setShow(!show)}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'rgba(255,255,255,.25)',
        display: 'flex',
        padding: 0,
      }}
    >
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  return (
    <>
      <SEO title="Secure Access" noindex={true} />
      <AnimatePresence>
        {loading && (
          <VerificationSpinner
            message={useOTP && !otpSent ? 'Generating OTP...' : 'Logging in...'}
            subtext="Verifying Member Presence"
          />
        )}
      </AnimatePresence>

      <div className="au-page">
        <canvas ref={canvasRef} className="au-canvas" />
        <div className="au-orb au-orb-1" />
        <div className="au-orb au-orb-2" />
        <div className="au-orb au-orb-3" />

        {/* LEFT HERO */}
        <div className="au-hero">
          <div
            className="au-hero-img"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1200&q=85')",
            }}
          />
          <div className="au-hero-overlay" />
          <div className="au-hero-content">
            <motion.div
              className="au-hero-tag"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles size={12} /> Curated Travel Experiences
            </motion.div>
            <motion.h2
              className="au-hero-title"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              Your
              <br />
              <span>Experience</span>
              <br />
              Resumes.
            </motion.h2>
            <motion.p
              className="au-hero-sub"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Log in to access your curated sanctuaries, bookings, and personalised Varkala
              itineraries.
            </motion.p>
            <motion.div
              className="au-stats"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
            >
              <div>
                <div className="au-stat-num">
                  120<span>+</span>
                </div>
                <div className="au-stat-label">Properties</div>
              </div>
              <div>
                <div className="au-stat-num">
                  4.9<span>★</span>
                </div>
                <div className="au-stat-label">Avg Rating</div>
              </div>
              <div>
                <div className="au-stat-num">
                  2k<span>+</span>
                </div>
                <div className="au-stat-label">Members</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* RIGHT FORM */}
        <main className="au-panel">
          <motion.div
            className="au-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <Link to="/" className="au-brand">
              <div className="au-brand-mark">
                <Sparkles size={16} color="#fff" />
              </div>
              <span className="au-brand-name">
                WAYZZA<span>.</span>
              </span>
            </Link>

            <AnimatePresence mode="wait">
              {!showing2FA ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h1 className="au-h1">
                    Welcome <span>Back.</span>
                  </h1>
                  <p className="au-sub">Sign in to your account to continue.</p>

                  {/* Google */}
                  <button type="button" className="au-google" onClick={() => googleLogin()}>
                    <svg viewBox="0 0 24 24" width="18" height="18">
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
                    Continue with Google
                  </button>

                  <div className="au-divider">
                    <div className="au-divider-line" />
                    <span className="au-divider-text">or sign in with email</span>
                    <div className="au-divider-line" />
                  </div>

                  <form onSubmit={handleLogin}>
                    <FloatingInput
                      id="email"
                      type="email"
                      label="Email Address"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setOtpSent(false);
                      }}
                      icon={Mail}
                      autoComplete="email"
                    />

                    {!useOTP ? (
                      <>
                        <FloatingInput
                          id="password"
                          type={show ? 'text' : 'password'}
                          label="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          icon={Lock}
                          autoComplete="current-password"
                          suffix={<EyeBtn />}
                        />
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: 6,
                            marginTop: -4,
                          }}
                        >
                          <button
                            type="button"
                            className="au-toggle"
                            onClick={() => setUseOTP(true)}
                          >
                            Use OTP instead
                          </button>
                          <Link to="/forgot-password" className="au-forgot">
                            Forgot password?
                          </Link>
                        </div>
                      </>
                    ) : (
                      <>
                        {otpSent ? (
                          <div className="au-field">
                            <input
                              type="text"
                              maxLength={6}
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              className="au-otp-input"
                              placeholder="000000"
                            />
                          </div>
                        ) : (
                          <div className="au-otp-hint">Click below to receive your OTP code</div>
                        )}
                        <div style={{ marginBottom: 6 }}>
                          <button
                            type="button"
                            className="au-toggle"
                            onClick={() => setUseOTP(false)}
                          >
                            Use password instead
                          </button>
                        </div>
                      </>
                    )}

                    <button type="submit" disabled={loading} className="au-submit">
                      {loading ? (
                        <div className="au-spin" />
                      ) : (
                        <>
                          <span>{useOTP && !otpSent ? 'Send OTP' : 'Sign In'}</span>
                          <LogIn size={18} className="au-arrow" />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="au-footer-link">
                    New to Wayzza? <Link to="/signup">Create Account</Link>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="2fa"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="au-2fa-icon">
                    <Shield size={28} color="#34d399" />
                  </div>
                  <h1 className="au-2fa-h">
                    Secondary <span>Protocol.</span>
                  </h1>
                  <p className="au-2fa-sub">Enter the 6-digit code from your authenticator app.</p>
                  <form onSubmit={handle2FAVerify}>
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                      className="au-otp-input"
                      placeholder="000000"
                      style={{ marginBottom: 0 }}
                    />
                    <div className="au-2fa-btns">
                      <button
                        type="button"
                        className="au-back-btn"
                        onClick={() => setShowing2FA(false)}
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading || twoFactorCode.length !== 6}
                        className="au-submit"
                        style={{ margin: 0, flex: 1 }}
                      >
                        {loading ? <div className="au-spin" /> : <span>Verify Protocol</span>}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="au-security" style={{ marginTop: 24 }}>
              <div className="au-dot" />
              <ShieldCheck size={13} color="rgba(52,211,153,.5)" />
              <span>Enterprise-grade security</span>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
}
