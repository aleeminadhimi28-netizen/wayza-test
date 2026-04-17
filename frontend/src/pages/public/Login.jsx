import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../AuthContext.jsx";
import { useToast } from "../../ToastContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, Zap, Sparkles, User, LogIn, Heart } from "lucide-react";
import VerificationSpinner from "../../components/VerificationSpinner.jsx";

import { api } from "../../utils/api.js";

export default function Login() {
    const navigate = useNavigate();
    const { login, user } = useAuth();
    const { showToast } = useToast();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    // AUTO REDIRECT IF ALREADY LOGGED IN
    useEffect(() => {
        if (user && user.role === "guest") {
            navigate("/", { replace: true });
        }
    }, [user, navigate]);

    async function handleLogin(e) {
        if (e) e.preventDefault();
        if (!email || !password) {
            showToast("Please enter your credentials.", "error");
            return;
        }

        try {
            setLoading(true);
            await new Promise(r => setTimeout(r, 1200)); // Cinematic delay for identity sync

            const data = await api.login({ email, password });

            if (!data.ok || !data.data?.token) {
                showToast("Invalid email or password.", "error");
                setLoading(false);
                return;
            }

            login({ email: data.data.email, role: data.data.role, token: data.data.token });
            showToast("Welcome back to Wayza!", "success");
            navigate("/");
        } catch (error) {
            showToast("Could not connect to server.", "error");
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans selection:bg-emerald-100 selection:text-emerald-900">
            <AnimatePresence>
                {loading && (
                    <VerificationSpinner
                        message="Synchronizing Identity..."
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
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-3 bg-white/10 border border-white/20 px-6 py-3 rounded-full text-white font-bold text-[10px] uppercase tracking-[0.2em] backdrop-blur-xl">
                        <Sparkles size={16} className="text-emerald-400" /> Curated Travel Experiences
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-7xl md:text-9xl font-bold text-white tracking-tighter leading-[0.8] uppercase">
                        Your <br /><span className="text-emerald-500 lowercase">Experience</span> <br /> Resumes.
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-xl text-white/60 font-medium leading-relaxed">
                        "Log in to access your curated collection of unique stays and personalized itineraries."
                    </motion.p>
                </div>

                <div className="absolute bottom-12 left-12 flex items-center gap-4">
                    <div className="w-12 h-1 bg-emerald-500 rounded-full" />
                    <div className="w-2 h-1 bg-white/20 rounded-full" />
                    <div className="w-2 h-1 bg-white/20 rounded-full" />
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.4em] ml-4">Wayza Guest Network</span>
                </div>
            </div>

            {/* RIGHT: AUTH INTERFACE */}
            <main className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-24 relative bg-white">
                <div className="max-w-md w-full mx-auto space-y-12">

                    <Link to="/" className="inline-block text-3xl font-bold tracking-tight mb-8 group uppercase">
                        Wayza<span className="text-emerald-600">.</span>
                        <div className="h-1 text-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                    </Link>

                    <div className="space-y-4">
                        <h2 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tighter leading-none uppercase">Access <span className="text-emerald-500 lowercase">Identity.</span></h2>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] border-l-2 border-emerald-500/20 pl-4">"Enter your credentials to synchronize with the network."</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-10 group">
                        <div className="space-y-6">
                            <div className="space-y-3 group/field">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within/field:text-emerald-600 transition-colors">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within/field:text-emerald-600 transition-colors" size={20} />
                                    <input
                                        type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                        autoComplete="email"
                                        className="w-full h-18 bg-slate-50 border border-slate-100 rounded-2xl pl-16 pr-6 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200 shadow-inner"
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 group/field">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-focus-within/field:text-emerald-600 transition-colors">Password</label>
                                    <Link to="/forgot-password" size={14} className="text-[9px] font-bold uppercase text-emerald-600 tracking-widest hover:text-emerald-700 transition-colors">Recovery Link?</Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within/field:text-emerald-600 transition-colors" size={20} />
                                    <input
                                        type={show ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                        className="w-full h-18 bg-slate-50 border border-slate-100 rounded-2xl pl-16 pr-20 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200 shadow-inner"
                                        placeholder="••••••••"
                                    />
                                    <button type="button" onClick={() => setShow(!show)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-600 transition-colors">
                                        {show ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full h-20 bg-slate-900 text-white rounded-[32px] font-bold uppercase text-[11px] tracking-[0.3em] hover:bg-emerald-600 shadow-2xl shadow-slate-900/10 active:scale-95 transition-all flex items-center justify-center gap-5 group disabled:opacity-20"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Synchronize Identity</span>
                                    <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center space-y-6 pt-6">
                        <p className="font-bold text-slate-400 text-[10px] uppercase tracking-widest">
                            New to Wayza? <Link to="/signup" className="text-emerald-600 hover:text-emerald-700 font-bold border-b border-emerald-500/30">Create Account</Link>
                        </p>
                    </div>

                    <div className="pt-16 border-t border-slate-50 flex justify-between items-center opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-default group">
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={18} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Secure Protocol Active</span>
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
