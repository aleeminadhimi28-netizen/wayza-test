import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  ChevronDown,
} from 'lucide-react';
import { useToast } from '../../ToastContext.jsx';

import { api } from '../../utils/api.js';

export default function PartnerRegister() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState('hotel');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    if (e) e.preventDefault();

    if (!businessName || !email || !password) {
      showToast('Please provide all required registration details.', 'error');
      return;
    }

    try {
      setLoading(true);

      const data = await api.partnerRegister({ businessName, email, password, type });

      if (data.ok) {
        showToast('Account established. Welcome to Wayzza Pro.', 'success');
        navigate('/partner-login');
      } else {
        showToast(data.msg || data.message || 'Registration failed. Please try again.', 'error');
      }
    } catch (error) {
      showToast('Connection failed. Please retry registration.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col md:flex-row overflow-hidden selection:bg-emerald-100 selection:text-emerald-900">
      {/* LEFT: PARTNER NETWORK BRANDING */}
      <div className="hidden md:flex md:w-[45%] bg-slate-950 text-white p-20 flex-col justify-between relative overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center transition-transform duration-[20s] hover:scale-110 opacity-20 grayscale" />

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

        <div className="relative z-10 space-y-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
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
              "Integrate your world-class stays into the Wayzza ecosystem. Share your hospitality
              with a global collective of explorers."
            </p>
          </motion.div>

          <div className="flex gap-12 opacity-30 pointer-events-none">
            <div className="flex flex-col items-center gap-3">
              <Globe size={24} />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-center">
                Global Audience
              </span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Zap size={24} className="text-emerald-400" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-center">
                Direct Channel
              </span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Activity size={24} />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-center">
                Verified Net
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[11px] font-black text-white/10 uppercase tracking-[1em] select-none hover:text-emerald-500/20 transition-colors">
          Wayzza Professional Growth Architecture
        </div>
      </div>

      {/* RIGHT: REGISTRATION INTERFACE */}
      <div className="flex-1 flex items-center justify-center p-8 md:px-24 relative bg-white overflow-y-auto no-scrollbar">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50/50 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-xl w-full relative z-10 pt-20 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-16"
          >
            <header className="space-y-8">
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

            <form onSubmit={submit} className="space-y-10">
              {/* DUAL COLUMN FOR BUSINESS INFO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3 group/field">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2 group-focus-within/field:text-emerald-600 transition-colors">
                    Legal Instance
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center group-focus-within/field:bg-emerald-50 transition-colors">
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
                      placeholder="BRAND NAME"
                      className="w-full h-18 bg-slate-50/50 border border-slate-100 rounded-2xl pl-14 pr-4 font-bold text-lg tracking-tighter text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-3 group/field">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">
                    Service Portfolio
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center pointer-events-none">
                      <Sparkles className="text-slate-300" size={16} />
                    </div>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full h-18 bg-slate-50/50 border border-slate-100 rounded-2xl pl-14 pr-10 font-bold text-lg tracking-tighter text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all appearance-none uppercase cursor-pointer"
                    >
                      <option value="hotel">Hotels & Stays</option>
                      <option value="bike">Mobility: Bikes</option>
                      <option value="car">Mobility: Cars</option>
                      <option value="activity">Curated Experiences</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 group/field">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2 group-focus-within/field:text-emerald-600 transition-colors">
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
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2 group-focus-within/field:text-emerald-600 transition-colors">
                  Account Access Password
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
                className="w-full h-22 bg-slate-950 text-white rounded-[40px] font-black uppercase text-xs tracking-[0.5em] transition-all hover:bg-emerald-600 shadow-3xl shadow-slate-900/20 active:scale-[0.98] flex items-center justify-center gap-8 disabled:opacity-20"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Establish Account</span>
                    <ArrowRight
                      size={20}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>

            <div className="pt-16 flex flex-col items-center gap-10 text-center border-t border-slate-100">
              <p className="text-slate-300 font-bold text-[11px] uppercase tracking-widest leading-relaxed max-w-sm">
                "By establishing an account, you adhere to the Wayzza Pro Merchant Guidelines and
                Operational Standards."
              </p>
              <Link
                to="/partner-login"
                className="inline-flex items-center gap-4 text-emerald-600 font-black text-[11px] uppercase tracking-[0.5em] hover:text-emerald-700 transition-all group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />{' '}
                Already Resident? Sign in
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
