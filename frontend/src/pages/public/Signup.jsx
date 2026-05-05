import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Phone,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../../ToastContext.jsx';
import { useAuth } from '../../AuthContext.jsx';
import VerificationSpinner from '../../components/VerificationSpinner.jsx';
import { useGoogleLogin } from '@react-oauth/google';
import { api } from '../../utils/api.js';
import './auth.css';

/* ── Floating-label input ── */
function FloatingInput({ id, type = 'text', label, value, onChange, icon: Icon, suffix }) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="su-field">
      <div
        className={`su-field-wrap ${active ? 'su-field-wrap--active' : ''} ${focused ? 'su-field-wrap--focused' : ''}`}
      >
        <Icon className="su-field-icon" size={16} />
        <input
          id={id}
          type={type}
          required
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="su-input"
          placeholder=" "
          autoComplete={id}
        />
        <label htmlFor={id} className="su-label">
          {label}
        </label>
        {suffix && <div className="su-suffix">{suffix}</div>}
      </div>
    </div>
  );
}

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
  const canvasRef = useRef(null);

  /* ── Animated particle canvas ── */
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

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
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

  useEffect(() => {
    if (user && user.role === 'guest') navigate('/', { replace: true });
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
      } catch {
        showToast('Could not connect to server.', 'error');
      }
      setLoading(false);
    },
    onError: (err) => {
      showToast(
        err?.error_description || err?.error || 'Google Popup failed or was closed.',
        'error'
      );
    },
  });

  async function handleSignup(e) {
    if (e) e.preventDefault();
    if (!name || !phone || !email || !password) {
      showToast('Please complete all fields before signing up.', 'error');
      return;
    }
    setLoading(true);
    try {
      const data = await api.signup({ name, phone, email, password });
      if (data.ok) {
        showToast('Account created successfully!', 'success');
        navigate('/login');
      } else {
        showToast(data.message || 'Registration failed.', 'error');
      }
    } catch {
      showToast('Could not connect to server.', 'error');
    }
    setLoading(false);
  }

  return (
    <>
      <style>{`
        /* ── Page shell ── */
        .su-page {
          min-height: 100dvh;
          display: flex;
          font-family: 'Inter', system-ui, sans-serif;
          background: #030b06;
          overflow: hidden;
          position: relative;
        }

        /* ── Canvas particles ── */
        .su-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        /* ── Gradient orbs ── */
        .su-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }
        .su-orb-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%);
          top: -200px; left: -150px;
          animation: su-float1 12s ease-in-out infinite;
        }
        .su-orb-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(5,150,105,0.12) 0%, transparent 70%);
          bottom: -150px; right: -100px;
          animation: su-float2 15s ease-in-out infinite;
        }
        .su-orb-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(110,231,183,0.08) 0%, transparent 70%);
          top: 40%; left: 30%;
          animation: su-float3 10s ease-in-out infinite;
        }
        @keyframes su-float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,30px)} }
        @keyframes su-float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-30px,-40px)} }
        @keyframes su-float3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-20px)} }

        /* ── Left hero panel ── */
        .su-hero {
          display: none;
          position: relative;
          z-index: 1;
          flex-direction: column;
          justify-content: flex-end;
          padding: 64px;
          overflow: hidden;
        }
        @media (min-width: 1024px) { .su-hero { display: flex; width: 48%; } }

        .su-hero-img {
          position: absolute;
          inset: 0;
          background: url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=85') center/cover no-repeat;
        }
        .su-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(160deg, rgba(3,11,6,0.3) 0%, rgba(3,11,6,0.85) 60%, #030b06 100%);
        }

        .su-hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(52,211,153,0.12);
          border: 1px solid rgba(52,211,153,0.25);
          border-radius: 100px;
          padding: 8px 18px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #6ee7b7;
          width: fit-content;
          margin-bottom: 32px;
          backdrop-filter: blur(8px);
        }
        .su-hero-title {
          font-size: clamp(52px, 6vw, 84px);
          font-weight: 900;
          line-height: 0.9;
          letter-spacing: -0.04em;
          color: #fff;
          text-transform: uppercase;
          margin-bottom: 24px;
        }
        .su-hero-title span { color: #34d399; }
        .su-hero-sub {
          font-size: 15px;
          color: rgba(255,255,255,0.5);
          line-height: 1.7;
          max-width: 340px;
          margin-bottom: 48px;
        }

        .su-hero-stats {
          display: flex;
          gap: 40px;
        }
        .su-stat-num {
          font-size: 28px;
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.03em;
        }
        .su-stat-num span { color: #34d399; }
        .su-stat-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-top: 2px;
        }

        /* ── Right form panel ── */
        .su-form-panel {
          position: relative;
          z-index: 1;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          overflow-y: auto;
        }
        @media (min-width: 1024px) { .su-form-panel { width: 52%; padding: 60px 72px; } }

        .su-card {
          width: 100%;
          max-width: 440px;
        }

        /* ── Brand ── */
        .su-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          margin-bottom: 44px;
        }
        .su-brand-mark {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #059669, #34d399);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 20px rgba(52,211,153,0.4);
        }
        .su-brand-name {
          font-size: 18px;
          font-weight: 900;
          letter-spacing: -0.02em;
          color: #fff;
          text-transform: uppercase;
        }
        .su-brand-name span { color: #34d399; }

        /* ── Heading ── */
        .su-heading {
          margin-bottom: 8px;
        }
        .su-heading h1 {
          font-size: clamp(32px, 4vw, 44px);
          font-weight: 900;
          letter-spacing: -0.04em;
          color: #fff;
          line-height: 1;
          text-transform: uppercase;
          margin: 0 0 12px;
        }
        .su-heading h1 span { color: #34d399; }
        .su-heading p {
          font-size: 13px;
          color: rgba(255,255,255,0.35);
          font-weight: 500;
          letter-spacing: 0.02em;
          margin: 0 0 36px;
        }

        /* ── Google button ── */
        .su-google {
          width: 100%;
          height: 52px;
          border-radius: 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 28px;
          color: rgba(255,255,255,0.8);
          font-size: 13px;
          font-weight: 600;
          backdrop-filter: blur(8px);
        }
        .su-google:hover {
          background: rgba(255,255,255,0.09);
          border-color: rgba(255,255,255,0.2);
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }

        /* ── Divider ── */
        .su-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 28px;
        }
        .su-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .su-divider-text {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
        }

        /* ── Field ── */
        .su-field { margin-bottom: 14px; }
        .su-field-wrap {
          position: relative;
          border-radius: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .su-field-wrap--focused,
        .su-field-wrap:focus-within {
          background: rgba(255,255,255,0.06);
          border-color: rgba(52,211,153,0.5);
          box-shadow: 0 0 0 3px rgba(52,211,153,0.08);
        }
        .su-field-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.2);
          transition: color 0.2s;
          pointer-events: none;
        }
        .su-field-wrap--focused .su-field-icon,
        .su-field-wrap:focus-within .su-field-icon { color: #34d399; }

        .su-input {
          width: 100%;
          height: 58px;
          background: transparent;
          border: none;
          outline: none;
          padding: 20px 18px 8px 46px;
          font-size: 14px;
          font-weight: 500;
          color: #fff;
          border-radius: 14px;
          box-sizing: border-box;
        }
        .su-input::placeholder { color: transparent; }

        .su-label {
          position: absolute;
          left: 46px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.3);
          pointer-events: none;
          transition: all 0.18s ease;
          transform-origin: left center;
        }
        .su-field-wrap--active .su-label,
        .su-field-wrap:focus-within .su-label {
          top: 10px;
          transform: translateY(0) scale(0.78);
          color: rgba(52,211,153,0.8);
          font-weight: 600;
        }

        .su-suffix {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
        }

        /* ── 2-col grid ── */
        .su-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        /* ── Submit button ── */
        .su-submit {
          width: 100%;
          height: 56px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);
          background-size: 200% 200%;
          background-position: 0% 50%;
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          display: flex; align-items: center; justify-content: center;
          gap: 12px;
          margin-top: 24px;
          margin-bottom: 20px;
          transition: all 0.3s ease;
          box-shadow: 0 8px 32px rgba(16,185,129,0.3);
          position: relative;
          overflow: hidden;
        }
        .su-submit::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .su-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 40px rgba(16,185,129,0.4);
          background-position: 100% 50%;
        }
        .su-submit:hover::before { opacity: 1; }
        .su-submit:active { transform: translateY(0); }
        .su-submit:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .su-submit .su-arrow { transition: transform 0.25s; }
        .su-submit:hover .su-arrow { transform: translateX(4px); }

        .su-spin {
          width: 20px; height: 20px;
          border: 3px solid rgba(255,255,255,0.25);
          border-top-color: #fff;
          border-radius: 50%;
          animation: su-spin 0.7s linear infinite;
        }
        @keyframes su-spin { to { transform: rotate(360deg); } }

        /* ── Footer links ── */
        .su-footer-link {
          text-align: center;
          font-size: 13px;
          color: rgba(255,255,255,0.3);
          font-weight: 500;
          margin-bottom: 32px;
        }
        .su-footer-link a {
          color: #34d399;
          font-weight: 700;
          text-decoration: none;
          border-bottom: 1px solid rgba(52,211,153,0.3);
          padding-bottom: 1px;
          transition: border-color 0.2s;
        }
        .su-footer-link a:hover { border-color: #34d399; }

        /* ── Security badge ── */
        .su-security {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .su-security span {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.15);
        }
        .su-security-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 6px #34d399;
          animation: su-pulse 2s ease-in-out infinite;
        }
        @keyframes su-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      <AnimatePresence>
        {loading && (
          <VerificationSpinner
            message="Initializing Identity..."
            subtext="Synchronizing Member Records"
          />
        )}
      </AnimatePresence>

      <div className="su-page">
        {/* Background FX */}
        <canvas ref={canvasRef} className="su-canvas" />
        <div className="su-orb su-orb-1" />
        <div className="su-orb su-orb-2" />
        <div className="su-orb su-orb-3" />

        {/* ── LEFT HERO ── */}
        <div className="su-hero">
          <div className="su-hero-img" />
          <div className="su-hero-overlay" />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <motion.div
              className="su-hero-tag"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles size={12} />
              Join the Collection
            </motion.div>
            <motion.h2
              className="su-hero-title"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              Your
              <br />
              <span>Voyage</span>
              <br />
              Commences.
            </motion.h2>
            <motion.p
              className="su-hero-sub"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Unlock curated clifftop sanctuaries, high-performance vehicles, and hidden Varkala
              secrets — all in one place.
            </motion.p>
            <motion.div
              className="su-hero-stats"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
            >
              <div>
                <div className="su-stat-num">
                  120<span>+</span>
                </div>
                <div className="su-stat-label">Sanctuaries</div>
              </div>
              <div>
                <div className="su-stat-num">
                  4.9<span>★</span>
                </div>
                <div className="su-stat-label">Avg Rating</div>
              </div>
              <div>
                <div className="su-stat-num">
                  2k<span>+</span>
                </div>
                <div className="su-stat-label">Members</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── RIGHT FORM ── */}
        <main className="su-form-panel">
          <motion.div
            className="su-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Brand */}
            <Link to="/" className="su-brand">
              <div className="su-brand-mark">
                <Sparkles size={16} color="#fff" />
              </div>
              <span className="su-brand-name">
                WAYZZA<span>.</span>
              </span>
            </Link>

            {/* Heading */}
            <div className="su-heading">
              <h1>
                Begin Your <span>Journey.</span>
              </h1>
              <p>Create your account — it only takes a minute.</p>
            </div>

            {/* Google */}
            <button type="button" className="su-google" onClick={() => googleLogin()}>
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

            <div className="su-divider">
              <div className="su-divider-line" />
              <span className="su-divider-text">or sign up with email</span>
              <div className="su-divider-line" />
            </div>

            {/* Form */}
            <form onSubmit={handleSignup}>
              {/* Row 1 — Name & Phone */}
              <div className="su-grid-2">
                <FloatingInput
                  id="name"
                  type="text"
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  icon={User}
                />
                <FloatingInput
                  id="phone"
                  type="tel"
                  label="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  icon={Phone}
                />
              </div>

              {/* Email */}
              <FloatingInput
                id="email"
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
              />

              {/* Password */}
              <FloatingInput
                id="password"
                type={show ? 'text' : 'password'}
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'rgba(255,255,255,0.25)',
                      display: 'flex',
                      padding: 0,
                    }}
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              {/* Submit */}
              <button type="submit" disabled={loading} className="su-submit">
                {loading ? (
                  <div className="su-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={18} className="su-arrow" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="su-footer-link">
              Already a member? <Link to="/login">Sign In</Link>
            </p>

            {/* Security badge */}
            <div className="su-security">
              <div className="su-security-dot" />
              <ShieldCheck size={13} color="rgba(52,211,153,0.5)" />
              <span>Enterprise-grade security</span>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
}
