import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../AuthContext.jsx";
import { useToast } from "../../ToastContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Zap, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Activity, ShieldCheck, Sparkles, Navigation } from "lucide-react";
import VerificationSpinner from "../../components/VerificationSpinner.jsx";

import { api } from "../../utils/api.js";

export default function PartnerLogin() {
    const navigate = useNavigate();
    const { login: setAuth } = useAuth();
    const { showToast } = useToast();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    // AUTO REDIRECT IF ALREADY LOGGED IN
    useEffect(() => {
        const email = localStorage.getItem("email");
        const role = localStorage.getItem("role");
        const loggedIn = localStorage.getItem("loggedIn");
        if (email && loggedIn === "true" && role === "partner") {
            navigate("/partner", { replace: true });
        }
    }, [navigate]);

    async function login(e) {
        if (e) e.preventDefault();
        if (loading) return;

        try {
            setLoading(true);
            await new Promise(r => setTimeout(r, 1200)); // Polished transition

            const data = await api.partnerLogin({ email, password });

            if (!data.ok) {
                showToast(data.message || "Partner access denied. Please verify credentials.", "error");
                setLoading(false);
                return;
            }

            localStorage.setItem("token", data.token);
            setAuth({ email: data.email, role: "partner" });

            showToast("Welcome back to Wayza Pro.", "success");
            navigate("/partner", { replace: true });

        } catch (err) {
            showToast("Connection interrupted. Please try again.", "error");
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col md:flex-row overflow-hidden selection:bg-emerald-100 selection:text-emerald-900">
            <AnimatePresence>
                {loading && (
                    <VerificationSpinner
                        message="Authenticating Access..."
                        subtext="Connecting to Partner Network"
                    />
                )}
            </AnimatePresence>

            {/* LEFT: BRAND EXCELLENCE */}
            <div className="hidden md:flex md:w-[45%] bg-slate-900 text-white p-20 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center transition-transform duration-[20s] hover:scale-110 opacity-30" />
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]" />

                <div className="relative z-10">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <Link to="/" className="text-4xl font-black italic tracking-tighter uppercase hover:text-emerald-400 transition-colors">Wayza<span className="text-emerald-500">Pro.</span></Link>
                    </motion.div>
                </div>

                <div className="relative z-10 space-y-12">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <div className="w-20 h-20 bg-emerald-50 rounded-[28px] flex items-center justify-center shadow-2xl shadow-emerald-500/20 mb-10 group overflow-hidden relative">
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            <Briefcase size={32} className="relative z-10" />
                        </div>
                        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter uppercase leading-[0.85] mb-10">Partner <br /><span className="text-emerald-500 italic font-serif lowercase">Suite.</span></h1>
                        <p className="text-white/40 text-xl font-medium italic leading-relaxed max-w-sm">
                            "Manage your property collection with elegance. Access real-time insights, verified earnings, and guest experiences."
                        </p>
                    </motion.div>

                    <div className="flex gap-12 opacity-30 pointer-events-none">
                        <div className="flex flex-col items-center gap-3">
                            <Activity size={20} />
                            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-center">Live Insights</span>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                            <ShieldCheck size={20} className="text-emerald-400" />
                            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-center">Secure Access</span>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                            <Navigation size={20} />
                            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-center">Verified Net</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-[9px] font-bold text-white/10 uppercase tracking-[1em] select-none hover:text-emerald-500/20 transition-colors">
                    Wayza Professional Services Architecture
                </div>
            </div>

            {/* RIGHT: AUTH INTERFACE */}
            <div className="flex-1 flex items-center justify-center p-8 md:p-24 relative bg-white">
                <div className="max-w-md w-full">

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-16"
                    >
                        <header className="space-y-6">
                            <div className="flex items-center gap-3 text-emerald-600 font-bold text-[10px] uppercase tracking-[0.4em] italic">
                                <Sparkles size={16} className="animate-pulse" /> Access Authorization
                            </div>
                            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-900 uppercase leading-[0.9]">Sign <br /><span className="text-emerald-500 italic font-serif lowercase">In.</span></h2>
                            <p className="text-slate-300 font-bold uppercase text-[10px] tracking-[0.3em] italic leading-relaxed border-l-4 border-emerald-500/20 pl-6">Please provide your credentials <br />to access the management suite.</p>
                        </header>

                        <form onSubmit={login} className="space-y-10 group">
                            <div className="space-y-4 group/field">
                                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em] ml-2 group-focus-within/field:text-emerald-600 transition-colors">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within/field:text-emerald-600 transition-colors" size={24} />
                                    <input
                                        type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                        placeholder="partner@wayza.com"
                                        className="w-full h-24 bg-slate-50 border border-slate-100 rounded-[32px] pl-20 pr-10 font-bold text-2xl tracking-tighter text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-100 shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 group/field">
                                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em] ml-2 group-focus-within/field:text-emerald-600 transition-colors">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within/field:text-emerald-600 transition-colors" size={24} />
                                    <input
                                        type={show ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full h-24 bg-slate-50 border border-slate-100 rounded-[32px] pl-20 pr-10 font-bold text-2xl tracking-[0.1em] text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-100 shadow-inner"
                                    />
                                    <button type="button" onClick={() => setShow(!show)} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-600 transition-colors">
                                        {show ? <EyeOff size={24} /> : <Eye size={24} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit" disabled={loading}
                                className="w-full h-24 bg-slate-900 text-white rounded-[32px] font-bold uppercase text-[11px] tracking-[0.4em] transition-all hover:bg-emerald-600 shadow-3xl shadow-slate-950/10 active:scale-95 flex items-center justify-center gap-8 disabled:opacity-20"
                            >
                                {loading ? (
                                    <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Sign In to Suite</span>
                                        <ArrowRight size={24} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="pt-16 flex flex-col items-center gap-10 text-center border-t border-slate-100">
                            <div className="space-y-4">
                                <p className="text-slate-300 font-bold text-[10px] uppercase tracking-widest">
                                    Ready to join the network?
                                </p>
                                <Link to="/partner-register" className="inline-flex items-center gap-4 text-emerald-600 font-bold text-[10px] uppercase tracking-[0.4em] hover:text-emerald-700 transition-all border-b border-emerald-500/20 pb-1">
                                    Join Partner Network <ArrowRight size={16} />
                                </Link>
                            </div>

                            <Link to="/login" className="inline-flex items-center gap-4 text-slate-400 font-bold text-[9px] uppercase tracking-[0.3em] hover:text-slate-950 transition-colors pt-6">
                                <ArrowLeft size={14} /> Back to Guest Sign In
                            </Link>
                        </div>
                    </motion.div>

                </div>
            </div>

        </div>
    );
}
