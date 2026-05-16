import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Activity,
  Globe,
  Sparkles,
  Building,
  Phone,
  Home,
  Car,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '../../ToastContext.jsx';
import { api } from '../../utils/api.js';

// ─── OTP input: 6 boxes ───────────────────────────────────────────────────────
function OtpInput({ value, onChange }) {
  const digits = value.split('');
  const handle = (i, v) => {
    const d = [...digits];
    d[i] = v.replace(/\D/, '').slice(-1);
    onChange(d.join(''));
    if (v && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  };
  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0)
      document.getElementById(`otp-${i - 1}`)?.focus();
  };
  return (
    <div className="flex gap-3 justify-center">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onChange={(e) => handle(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          className="w-12 h-14 text-center text-xl font-black text-slate-900 border-2 border-slate-100 rounded-2xl bg-slate-50/50 focus:bg-white focus:border-emerald-500 outline-none transition-all"
        />
      ))}
    </div>
  );
}

// ─── Terms Modal ──────────────────────────────────────────────────────────────
function TermsModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[32px] p-10 max-w-lg w-full shadow-2xl space-y-6 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <ShieldCheck size={22} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
            Partner Terms
          </h2>
        </div>
        <div className="space-y-5 text-sm text-slate-600 leading-relaxed">
          {[
            [
              'Commission & Financials',
              "I agree to Wayzza's platform commission fee as displayed on my dashboard during listing creation. Payouts are processed to my registered bank account after successful guest checkout.",
            ],
            [
              'Accuracy & Fraud',
              'I certify that all documents (KYC, RC Books, Tax receipts) and photos I upload are 100% genuine. Falsification results in permanent account termination and legal reporting.',
            ],
            [
              'Overbooking & Cancellations',
              'I agree to keep my Wayzza calendar updated. Cancelling a confirmed booking makes me subject to financial penalties and responsible for alternate guest accommodation.',
            ],
            [
              'Legal Liability',
              'I understand that Wayzza is a technology platform, not an insurance provider. I am solely responsible for guest safety, vehicle insurance validity, and compliance with all local laws.',
            ],
            [
              'Code of Conduct',
              'I agree to treat all guests with respect, maintain high standards of cleanliness, and honor the cancellation policy selected for my listings.',
            ],
          ].map(([title, body]) => (
            <div key={title}>
              <p className="font-black text-slate-900 uppercase tracking-widest text-[11px] mb-1">
                {title}
              </p>
              <p>{body}</p>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full h-14 bg-slate-950 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-emerald-600 transition-all"
        >
          Got it
        </button>
      </motion.div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PartnerRegister() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // form state
  const [step, setStep] = useState(1); // 1=details, 2=otp
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [mainSector, setMainSector] = useState('stays'); // 'stays' | 'vehicles'
  const [agreed, setAgreed] = useState(false);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const countdownRef = useRef(null);

  function startOtpCountdown() {
    setOtpCountdown(600); // 10 minutes in seconds
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setOtpCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  function formatCountdown(secs) {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // Password strength
  function getPasswordStrength(pw) {
    if (!pw) return null;
    const has8 = pw.length >= 8;
    const hasUpper = /[A-Z]/.test(pw);
    const hasNum = /\d/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);
    const score = [has8, hasUpper, hasNum, hasSpecial].filter(Boolean).length;
    if (score <= 1) return { label: 'Weak', color: '#ef4444', width: '25%' };
    if (score === 2) return { label: 'Fair', color: '#f59e0b', width: '50%' };
    if (score === 3) return { label: 'Good', color: '#3b82f6', width: '75%' };
    return { label: 'Strong', color: '#10b981', width: '100%' };
  }
  const pwStrength = getPasswordStrength(password);

  // ── Step 1: Send OTP & validate fields ──
  async function handleSendOtp(e) {
    if (e) e.preventDefault();
    if (!businessName.trim()) {
      showToast('Please enter your business name.', 'error');
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      showToast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }
    if (!email.trim()) {
      showToast('Please enter your email.', 'error');
      return;
    }
    if (!password || password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }
    if (!agreed) {
      showToast('Please accept the Partner Terms to continue.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendOTP(email);
      if (res.ok) {
        showToast('OTP sent to your email. Please verify.', 'success');
        startOtpCountdown();
        setStep(2);
      } else {
        showToast(res.message || 'Failed to send OTP.', 'error');
      }
    } catch {
      showToast('Connection error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: Verify OTP & Register ──
  async function handleVerifyAndRegister() {
    if (otp.length < 6) {
      showToast('Please enter the complete 6-digit OTP.', 'error');
      return;
    }
    setLoading(true);
    try {
      // Verify OTP first
      const otpRes = await api.verifyOTP({ email, otp });
      if (!otpRes.ok) {
        showToast(otpRes.message || 'Invalid OTP. Please try again.', 'error');
        setLoading(false);
        return;
      }

      // Register partner account
      const regRes = await api.partnerRegister({
        businessName,
        email,
        password,
        phone,
        mainSector,
      });
      if (regRes.ok) {
        showToast('Account established. Welcome to Wayzza Pro!', 'success');
        navigate('/partner-login');
      } else {
        showToast(regRes.message || 'Registration failed. Please try again.', 'error');
        setStep(1);
      }
    } catch {
      showToast('Connection failed. Please retry.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col md:flex-row overflow-hidden selection:bg-emerald-100 selection:text-emerald-900">
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}

      {/* LEFT PANEL */}
      <div className="hidden md:flex md:w-[45%] bg-slate-950 text-white p-20 flex-col justify-between relative overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-20 grayscale" />
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[100px] rounded-full" />
        </div>
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="text-3xl font-black tracking-tighter uppercase">
              Wayzza<span className="text-emerald-500">Pro.</span>
            </span>
          </Link>
        </div>
        <div className="relative z-10 space-y-12">
          <div>
            <div className="mb-12 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[11px] font-black uppercase tracking-[0.3em] text-emerald-400">
              Channel Expansion Phase II
            </div>
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase leading-[0.8] mb-12">
              Partner <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 lowercase pr-4">
                network.
              </span>
            </h1>
            <p className="text-white/40 text-2xl font-medium leading-relaxed max-w-lg border-l-2 border-emerald-500/30 pl-8">
              "Integrate your world-class stays into the Wayzza ecosystem."
            </p>
          </div>
          <div className="flex gap-12 opacity-30 pointer-events-none">
            {[
              { icon: Globe, label: 'Global Audience' },
              { icon: Zap, label: 'Direct Channel' },
              { icon: Activity, label: 'Verified Net' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-3">
                <Icon size={24} />
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-center">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-[11px] font-black text-white/10 uppercase tracking-[1em] select-none">
          Wayzza Professional Growth Architecture
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-8 md:px-24 relative bg-white overflow-y-auto no-scrollbar">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50/50 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-xl w-full relative z-10 pt-16 pb-20">
          <AnimatePresence mode="wait">
            {/* ── STEP 1: REGISTRATION DETAILS ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                <header className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-emerald-500/20" />
                    <span className="text-[11px] font-black uppercase tracking-[0.5em] text-emerald-600">
                      Partner Sign Up
                    </span>
                  </div>
                  <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 uppercase leading-[0.85]">
                    Partner <br />
                    <span className="text-emerald-500 lowercase">Registration.</span>
                  </h2>
                </header>

                <form onSubmit={handleSendOtp} className="space-y-8">
                  {/* Business Name */}
                  <div className="space-y-3 group/field">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2 group-focus-within/field:text-emerald-600 transition-colors">
                      Business Name
                    </label>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center group-focus-within/field:bg-emerald-50 transition-colors">
                        <Building
                          className="text-slate-300 group-focus-within/field:text-emerald-500 transition-colors"
                          size={16}
                        />
                      </div>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="AZURE CLIFF ESTATE"
                        className="w-full h-16 bg-slate-50/50 border border-slate-100 rounded-2xl pl-16 pr-4 font-bold text-base tracking-tighter text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200 uppercase"
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-3 group/field">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2 group-focus-within/field:text-emerald-600 transition-colors">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center group-focus-within/field:bg-emerald-50 transition-colors">
                        <Phone
                          className="text-slate-300 group-focus-within/field:text-emerald-500 transition-colors"
                          size={16}
                        />
                      </div>
                      <div className="absolute left-16 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm select-none">
                        +91
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/, '').slice(0, 10))}
                        placeholder="9876543210"
                        className="w-full h-16 bg-slate-50/50 border border-slate-100 rounded-2xl pl-24 pr-4 font-bold text-base tracking-widest text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-3 group/field">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2 group-focus-within/field:text-emerald-600 transition-colors">
                      Credential Email
                    </label>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center group-focus-within/field:bg-emerald-50 transition-colors">
                        <Mail
                          className="text-slate-300 group-focus-within/field:text-emerald-500 transition-colors"
                          size={16}
                        />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="partner@wayzza.com"
                        className="w-full h-16 bg-slate-50/50 border border-slate-100 rounded-2xl pl-16 pr-4 font-bold text-base tracking-tighter text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-3 group/field">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2 group-focus-within/field:text-emerald-600 transition-colors">
                      Account Password
                    </label>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center group-focus-within/field:bg-emerald-50 transition-colors">
                        <Lock
                          className="text-slate-300 group-focus-within/field:text-emerald-500 transition-colors"
                          size={16}
                        />
                      </div>
                      <input
                        type={show ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full h-16 bg-slate-50/50 border border-slate-100 rounded-2xl pl-16 pr-12 font-bold text-base tracking-widest text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShow(!show)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-600 transition-colors"
                      >
                        {show ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {/* Password strength bar */}
                    {pwStrength && (
                      <div className="space-y-1.5 px-2">
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: pwStrength.width, background: pwStrength.color }}
                          />
                        </div>
                        <p
                          className="text-[10px] font-black uppercase tracking-widest"
                          style={{ color: pwStrength.color }}
                        >
                          {pwStrength.label}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Main Sector */}
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">
                      Main Sector
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        {
                          value: 'stays',
                          label: 'Stays',
                          desc: 'Hotels, Villas, Hostels',
                          icon: Home,
                        },
                        {
                          value: 'vehicles',
                          label: 'Vehicles',
                          desc: 'Cars, Bikes, Scooters',
                          icon: Car,
                        },
                      ].map(({ value, label, desc, icon: Icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setMainSector(value)}
                          className={`p-5 rounded-[24px] border-2 text-left flex items-center gap-4 transition-all ${mainSector === value ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-600/20' : 'bg-slate-50/50 border-slate-100 hover:border-emerald-200 text-slate-900'}`}
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${mainSector === value ? 'bg-white/20' : 'bg-slate-100'}`}
                          >
                            <Icon
                              size={18}
                              className={mainSector === value ? 'text-white' : 'text-slate-400'}
                            />
                          </div>
                          <div>
                            <p className="font-black uppercase tracking-widest text-xs">{label}</p>
                            <p
                              className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${mainSector === value ? 'text-white/60' : 'text-slate-400'}`}
                            >
                              {desc}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Digital Agreement */}
                  <label className="flex items-start gap-4 cursor-pointer group p-5 rounded-[20px] border border-slate-100 hover:border-emerald-200 transition-all bg-slate-50/30 hover:bg-emerald-50/20">
                    <div
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${agreed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200 bg-white'}`}
                    >
                      {agreed && <CheckCircle size={14} className="text-white" strokeWidth={3} />}
                    </div>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                    />
                    <span className="text-sm font-semibold text-slate-600 leading-relaxed">
                      I agree to Wayzza's{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowTerms(true);
                        }}
                        className="text-emerald-600 font-black hover:underline"
                      >
                        Partner Terms & Conditions
                      </button>{' '}
                      including the platform commission structure and operational standards.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-16 bg-slate-950 text-white rounded-[28px] font-black uppercase text-xs tracking-[0.5em] transition-all hover:bg-emerald-600 shadow-xl shadow-slate-900/20 active:scale-[0.98] flex items-center justify-center gap-6 disabled:opacity-30"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Continue</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-10 flex flex-col items-center gap-6 text-center border-t border-slate-100">
                  <Link
                    to="/partner-login"
                    className="inline-flex items-center gap-3 text-emerald-600 font-black text-[11px] uppercase tracking-[0.5em] hover:text-emerald-700 transition-all group"
                  >
                    <ArrowLeft
                      size={14}
                      className="group-hover:-translate-x-1 transition-transform"
                    />
                    Already a Partner? Sign in
                  </Link>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: OTP VERIFICATION ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10 text-center"
              >
                <div className="w-20 h-20 bg-emerald-50 rounded-[28px] border border-emerald-100 flex items-center justify-center mx-auto">
                  <Phone size={36} className="text-emerald-600" />
                </div>

                <div className="space-y-4">
                  <h2 className="text-5xl font-black tracking-tighter text-slate-900 uppercase leading-[0.9]">
                    Verify <span className="text-emerald-500 lowercase">Email.</span>
                  </h2>
                  <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">
                    We sent a 6-digit OTP to <span className="text-slate-700">{email}</span>
                  </p>
                  {otpCountdown > 0 ? (
                    <p className="text-[11px] font-black uppercase tracking-widest text-amber-500">
                      Expires in {formatCountdown(otpCountdown)}
                    </p>
                  ) : (
                    <p className="text-[11px] font-black uppercase tracking-widest text-rose-500">
                      OTP expired — please resend
                    </p>
                  )}
                </div>

                <OtpInput value={otp} onChange={setOtp} />

                <button
                  onClick={handleVerifyAndRegister}
                  disabled={loading || otp.length < 6 || otpCountdown === 0}
                  className="w-full h-16 bg-slate-950 text-white rounded-[28px] font-black uppercase text-xs tracking-[0.5em] transition-all hover:bg-emerald-600 active:scale-[0.98] flex items-center justify-center gap-6 disabled:opacity-30"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      <span>Verify & Create Account</span>
                    </>
                  )}
                </button>

                <div className="flex flex-col items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp('');
                      setOtpCountdown(0);
                      if (countdownRef.current) clearInterval(countdownRef.current);
                    }}
                    className="inline-flex items-center gap-2 text-slate-400 font-bold text-[11px] uppercase tracking-widest hover:text-slate-700 transition-colors"
                  >
                    <ArrowLeft size={13} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSendOtp();
                    }}
                    disabled={otpCountdown > 0}
                    className="text-emerald-600 font-black text-[11px] uppercase tracking-widest hover:underline disabled:opacity-30 disabled:no-underline"
                  >
                    {otpCountdown > 0 ? `Resend in ${formatCountdown(otpCountdown)}` : 'Resend OTP'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
