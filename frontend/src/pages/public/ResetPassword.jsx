import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, Eye, EyeOff, CheckCircle, ArrowRight, Zap, Server, Activity, Sparkles } from "lucide-react";

import { api } from "../../utils/api.js";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 font-sans">
        <div className="text-center space-y-10 max-w-md bg-white p-12 rounded-[48px] shadow-sm border border-slate-200">
          <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 shadow-inner">
            <Zap size={40} />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">Link Expired.</h2>
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">The reset link is missing or has expired.</p>
          </div>
          <button
            onClick={() => navigate("/forgot-password")}
            className="w-full h-18 bg-slate-900 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
          >
            Request New Link <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await new Promise(r => setTimeout(r, 1500)); // Refined delay

      const data = await api.resetPassword({ token, password });

      if (data.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(data.message || "Failed to reset password. Link may have expired.");
      }
    } catch {
      setError("Connection error. Please try again.");
    }

    setLoading(false);
  }

  function strength(pw) {
    if (!pw) return { label: "Waiting", color: "bg-slate-100", width: "0%" };
    if (pw.length < 6) return { label: "Weak", color: "bg-rose-500", width: "25%" };
    if (pw.length < 8) return { label: "Fair", color: "bg-amber-500", width: "50%" };
    if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw))
      return { label: "Good", color: "bg-blue-500", width: "75%" };
    return { label: "Strong", color: "bg-emerald-500", width: "100%" };
  }

  const s = strength(password);

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col md:flex-row overflow-hidden">

      {/* LEFT: REFINED BRANDING SIDEBAR */}
      <div className="hidden md:flex md:w-[45%] bg-white p-20 flex-col justify-between relative overflow-hidden border-r border-slate-200">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent)]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -ml-32 -mb-32" />

        <div className="relative z-10">
          <Link to="/" className="text-3xl font-bold tracking-tight text-slate-900 uppercase">
            Wayzza<span className="text-emerald-500">.</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="w-20 h-20 bg-slate-900 rounded-[32px] flex items-center justify-center shadow-2xl mb-10">
              <ShieldCheck size={32} className="text-emerald-400" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-none uppercase mb-8">Password <br /><span className="text-emerald-500">Update.</span></h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              "Establish your new secure password. We recommend a unique combination of characters to keep your account safe."
            </p>
          </motion.div>

          <div className="flex gap-8 opacity-40">
            <div className="flex flex-col items-center gap-2">
              <Activity size={20} className="text-emerald-600" />
              <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Secure</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Sparkles size={20} className="text-emerald-600" />
              <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Encrypted</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em]">
          Wayzza Guest Security Network v4.2
        </div>
      </div>

      {/* RIGHT: THE FORM MODULE */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-24 relative bg-white">
        <div className="max-w-md w-full">

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-10"
              >
                <div className="w-32 h-32 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner border-8 border-white">
                  <CheckCircle size={56} strokeWidth={1.5} />
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">Update Complete.</h2>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest leading-relaxed">
                    Your new password is now active. Redirecting you to login...
                  </p>
                </div>
                <div className="w-full h-2 bg-slate-50 rounded-full mt-10 overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-500"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3 }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
                    <Lock size={14} /> Security Update
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-slate-900 uppercase tracking-tight leading-none">Choose <span className="text-emerald-500">New Password.</span></h2>
                  <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Enter your new password below to secure your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="space-y-6">
                    <div className="space-y-3 group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-emerald-600 transition-colors">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-emerald-600 transition-colors" size={20} />
                        <input
                          type={showPw ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full h-16 bg-slate-50 border border-slate-100 rounded-2xl pl-16 pr-16 font-bold text-xl tracking-tight text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200 shadow-inner"
                        />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-600 transition-colors">
                          {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {password && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="px-2 space-y-2">
                          <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest leading-none">
                            <span className="text-slate-300">Security Strength</span>
                            <span className={s.color.replace('bg-', 'text-')}>{s.label}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                            <div className={`h-full ${s.color} transition-all duration-500`} style={{ width: s.width }} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-3 group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-emerald-600 transition-colors">Confirm Password</label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-emerald-600 transition-colors" size={20} />
                        <input
                          type={showPw ? "text" : "password"} required value={confirm} onChange={e => setConfirm(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full h-16 bg-slate-50 border border-slate-100 rounded-2xl pl-16 pr-6 font-bold text-xl tracking-tight text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200 shadow-inner"
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 font-bold text-[10px] uppercase tracking-widest flex items-center gap-3">
                      <Zap size={14} className="shrink-0" /> {error}
                    </motion.div>
                  )}

                  <button
                    type="submit" disabled={loading}
                    className="w-full h-18 py-5 bg-slate-900 text-white rounded-3xl font-bold uppercase text-[10px] tracking-widest transition-all hover:bg-emerald-600 shadow-xl shadow-slate-900/10 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Update Password</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

    </div>
  );
}
