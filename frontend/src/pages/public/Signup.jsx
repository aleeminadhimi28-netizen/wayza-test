import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus, Zap, Sparkles, User } from "lucide-react";
import { useToast } from "../../ToastContext.jsx";
import VerificationSpinner from "../../components/VerificationSpinner.jsx";

import { api } from "../../utils/api.js";

export default function Signup() {
    const navigate = useNavigate();
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
        if (email && loggedIn === "true" && role === "guest") {
            navigate("/", { replace: true });
        }
    }, [navigate]);

    async function handleSignup(e) {
        if (e) e.preventDefault();
        if (!email || !password) return;

        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 1200)); // Cinematic delay for identity creation

            const data = await api.signup({ email, password });

            if (data.ok) {
                showToast("Account created successfully!", "success");
                navigate("/login");
            } else {
                showToast(data.message || "Registration failed.", "error");
            }
        } catch (err) {
            showToast("Could not connect to server.", "error");
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
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-3 bg-white/10 border border-white/20 px-6 py-3 rounded-full text-white font-bold text-[10px] uppercase tracking-widest backdrop-blur-xl">
                        <UserPlus size={16} className="text-emerald-400" /> Join our community
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-7xl md:text-9xl font-bold text-white tracking-tighter leading-[0.8] uppercase">
                        Your <br /><span className="text-emerald-500 italic font-serif lowercase">Voyage</span> <br /> Commences.
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-xl text-white/70 font-medium leading-relaxed italic">
                        Create an account to unlock exclusive properties, manage your bookings, and experience luxury travel like never before.
                    </motion.p>
                </div>

                <div className="absolute bottom-12 left-12 flex gap-3">
                    <div className="w-12 h-1.5 bg-emerald-500 rounded-full" />
                    <div className="w-4 h-1.5 bg-white/30 rounded-full" />
                    <div className="w-4 h-1.5 bg-white/30 rounded-full" />
                </div>
            </div>

            {/* RIGHT: AUTH INTERFACE */}
            <main className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-24 relative bg-white">
                <div className="max-w-md w-full mx-auto space-y-10">

                    <Link to="/" className="inline-block text-2xl font-bold tracking-tight mb-8 group uppercase">
                        WAYZA<span className="text-emerald-600">.</span>
                        <div className="h-0.5 w-0 group-hover:w-full bg-emerald-500 transition-all duration-500 shadow-xl" />
                    </Link>

                    <div className="space-y-4">
                        <h2 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tighter leading-none uppercase">Initialize <span className="text-emerald-500 italic font-serif lowercase">Identity.</span></h2>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] italic border-l-2 border-emerald-500/20 pl-4">"Join the network to experience the matrix of luxury."</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-8 group">
                        <div className="space-y-6">
                            <div className="space-y-3 group/field">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within/field:text-emerald-600 transition-colors">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-emerald-600 transition-colors" size={18} />
                                    <input
                                        type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                        className="w-full h-16 bg-slate-50 border border-slate-100 rounded-2xl pl-16 pr-6 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200 shadow-inner"
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 group/field">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within/field:text-emerald-600 transition-colors">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-emerald-600 transition-colors" size={18} />
                                    <input
                                        type={show ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                                        className="w-full h-16 bg-slate-50 border border-slate-100 rounded-2xl pl-16 pr-20 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200 shadow-inner"
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
                                    <span>Initialize Identity</span>
                                    <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center font-bold text-slate-400 text-xs">
                        Already a member? <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-bold border-b border-emerald-500/20 pb-0.5">Sign In</Link>
                    </p>

                    <div className="pt-20 border-t border-slate-50 flex justify-between items-center opacity-40 hover:opacity-100 transition-opacity group">
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={16} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300 italic">Enterprise Grade Security</span>
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
