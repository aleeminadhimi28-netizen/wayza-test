import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Hammer, Zap, ShieldCheck, Mail, Lock, Briefcase, Eye, EyeOff, ArrowRight, ArrowLeft, Activity, Globe, Sparkles, Building, Wallet } from "lucide-react";
import { useToast } from "../../ToastContext.jsx";

import { api } from "../../utils/api.js";

export default function PartnerRegister() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [businessName, setBusinessName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [type, setType] = useState("hotel");
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    async function submit(e) {
        if (e) e.preventDefault();

        if (!businessName || !email || !password) {
            showToast("Please provide all required registration details.", "error");
            return;
        }

        try {
            setLoading(true);
            await new Promise(r => setTimeout(r, 1500)); // Polished registration flow

            const data = await api.partnerRegister({ businessName, email, password, type });

            if (data.ok) {
                showToast("Account established. Welcome to Wayza Pro.", "success");
                navigate("/partner-login");
            } else {
                showToast(data.msg || data.message || "Registration failed. Please try again.", "error");
            }
        } catch (error) {
            showToast("Connection failed. Please retry registration.", "error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col md:flex-row overflow-hidden selection:bg-emerald-100 selection:text-emerald-900">

            {/* LEFT: PARTNER NETWORK BRANDING */}
            <div className="hidden md:flex md:w-[45%] bg-slate-900 text-white p-20 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center transition-transform duration-[20s] hover:scale-110 opacity-30" />
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]" />

                <div className="relative z-10">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <Link to="/" className="text-4xl font-black italic tracking-tighter uppercase hover:text-emerald-400 transition-colors">Wayza<span className="text-emerald-500">Pro.</span></Link>
                    </motion.div>
                </div>

                <div className="relative z-10 space-y-12">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                        <div className="w-20 h-20 bg-emerald-500 rounded-[28px] flex items-center justify-center shadow-2xl shadow-emerald-500/20 mb-10 group overflow-hidden relative">
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            <Building size={32} className="relative z-10" />
                        </div>
                        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter uppercase leading-[0.85] mb-10">Partner <br /><span className="text-emerald-500 italic font-serif lowercase">Network.</span></h1>
                        <p className="text-white/40 text-xl font-medium italic leading-relaxed max-w-sm">
                            "Integrate your world-class stays into the Wayza ecosystem. Share your hospitality with a global collective of explorers."
                        </p>
                    </motion.div>

                    <div className="flex gap-12 opacity-30 pointer-events-none">
                        <div className="flex flex-col items-center gap-3">
                            <Globe size={20} />
                            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-center">Global Audience</span>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                            <Zap size={20} className="text-emerald-400" />
                            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-center">Direct Channel</span>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                            <Activity size={20} />
                            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-center">Verified Net</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-[9px] font-bold text-white/10 uppercase tracking-[1em] select-none hover:text-emerald-500/20 transition-colors">
                    Wayza Professional Growth Architecture
                </div>
            </div>

            {/* RIGHT: REGISTRATION INTERFACE */}
            <div className="flex-1 flex items-center justify-center p-8 md:p-24 relative bg-white overflow-y-auto no-scrollbar">
                <div className="max-w-xl w-full">

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-16"
                    >
                        <header className="space-y-6">
                            <div className="flex items-center gap-3 text-emerald-600 font-bold text-[10px] uppercase tracking-[0.4em] italic">
                                <Sparkles size={16} className="animate-pulse" /> Channel Authorization
                            </div>
                            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-900 uppercase leading-[0.9]">Partner <br /><span className="text-emerald-500 italic font-serif lowercase">Registration.</span></h2>
                            <p className="text-slate-300 font-bold uppercase text-[10px] tracking-[0.3em] italic leading-relaxed border-l-4 border-emerald-500/20 pl-6">Establish your presence in the <br />Wayza professional collection.</p>
                        </header>

                        <form onSubmit={submit} className="space-y-12">

                            {/* DUAL COLUMN FOR BUSINESS INFO */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4 group">
                                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em] ml-2 group-focus-within:text-emerald-600 transition-colors">Business Name</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-emerald-600 transition-colors" size={20} />
                                        <input
                                            type="text" required value={businessName} onChange={e => setBusinessName(e.target.value)}
                                            placeholder="BRAND NAME"
                                            className="w-full h-20 bg-slate-50 border border-slate-100 rounded-2xl pl-16 pr-6 font-bold text-xl tracking-tighter text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-100 shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 group">
                                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em] ml-2">Service Portfolio</label>
                                    <div className="relative">
                                        <select
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                            className="w-full h-20 bg-slate-50 border border-slate-100 rounded-2xl px-10 font-bold text-xl tracking-tighter text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all appearance-none uppercase shadow-inner"
                                        >
                                            <option value="hotel">Hotels & Stays</option>
                                            <option value="bike">Mobility: Bikes</option>
                                            <option value="car">Mobility: Cars</option>
                                            <option value="activity">Curated Experiences</option>
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                            <ArrowRight size={20} className="rotate-90" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 group">
                                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em] ml-2 group-focus-within:text-emerald-600 transition-colors">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-emerald-600 transition-colors" size={24} />
                                    <input
                                        type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                        placeholder="partner@wayza.com"
                                        className="w-full h-24 bg-slate-50 border border-slate-100 rounded-[32px] pl-20 pr-10 font-bold text-2xl tracking-tighter text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-100 shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 group">
                                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em] ml-2 group-focus-within:text-emerald-600 transition-colors">Account Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-emerald-600 transition-colors" size={24} />
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
                                className="w-full h-24 bg-slate-900 text-white rounded-[40px] font-bold uppercase text-[11px] tracking-[0.4em] transition-all hover:bg-emerald-600 shadow-3xl shadow-slate-950/10 active:scale-95 flex items-center justify-center gap-8 disabled:opacity-20"
                            >
                                {loading ? (
                                    <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Create Partner Account</span>
                                        <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="pt-16 flex flex-col items-center gap-8 text-center border-t border-slate-100">
                            <p className="text-slate-300 font-bold text-[10px] uppercase tracking-widest italic leading-relaxed max-w-sm">
                                "By creating an account, you agree to the Wayza Partner Terms and Professional Code of Conduct."
                            </p>
                            <Link to="/partner-login" className="inline-flex items-center gap-4 text-emerald-600 font-bold text-[10px] uppercase tracking-[0.4em] hover:text-emerald-700 transition-all border-b border-emerald-500/10 pb-1">
                                <ArrowLeft size={16} /> Already a partner? Sign in
                            </Link>
                        </div>
                    </motion.div>

                </div>
            </div>

        </div>
    );
}