import { useParams, useNavigate, useLocation } from "react-router-dom";
import { WayzaLayout, WayzaButton } from "../../WayzaUI.jsx"
import { useAuth } from "../../AuthContext.jsx"
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, CreditCard, Apple, Wallet, CheckCircle, Lock, Zap, ArrowLeft, ArrowRight, Shield, Activity, Globe, CreditCard as CardIcon } from "lucide-react";
import { useToast } from "../../ToastContext.jsx";
import { useState } from "react";

import { api } from "../../utils/api.js";

export default function Payment() {
    const { id: bookingId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();
    const [submitting, setSubmitting] = useState(false);

    const price = location.state?.price || 0;
    const title = location.state?.title || "Premium Experience";
    const nights = location.state?.nights || 1;

    async function handlePayment(method = "card") {
        if (!bookingId) {
            showToast("Invalid transaction reference.", "error");
            return;
        }

        setSubmitting(true);
        // Simulated latency for verification
        await new Promise(r => setTimeout(r, 2000));

        try {
            const data = await api.confirmBooking({
                bookingId,
                paymentId: `PAY-${method.toUpperCase()}-` + Date.now()
            });

            if (!data.ok) {
                showToast(data.message || "Payment authorization failed.", "error");
                setSubmitting(false);
                return;
            }

            showToast("Payment confirmed! Your stay is verified. 🌿", "success");
            navigate("/payment-success");
        } catch (err) {
            showToast("Connection error during payment.", "error");
            setSubmitting(false);
        }
    }

    return (
        <WayzaLayout noPadding>
            <div className="bg-slate-50 min-h-screen font-sans font-medium text-slate-900">

                {/* PROGRESS INDICATOR */}
                <div className="bg-white border-b border-slate-200 sticky top-20 z-40">
                    <div className="max-w-7xl mx-auto py-6 px-6 lg:px-12 flex items-center justify-between gap-8">
                        <div className="flex-1 flex gap-2">
                            <div className="h-1.5 flex-1 bg-emerald-500 rounded-full" />
                            <div className="h-1.5 flex-1 bg-emerald-500 rounded-full" />
                        </div>
                        <div className="flex items-center gap-4 text-emerald-600 font-bold text-[11px] uppercase tracking-[0.4em] italic leading-none shrink-0">
                            <Sparkles size={18} className="animate-pulse" /> Phase 02 // Settlement Protocol
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
                    <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-emerald-600 font-bold text-[11px] uppercase tracking-[0.4em] italic mb-2 leading-none">
                                <Lock size={18} strokeWidth={2.5} /> Authorize Settlement
                            </div>
                            <h1 className="text-5xl md:text-8xl font-bold text-slate-900 tracking-tighter leading-[0.8] uppercase">Configure your <br /><span className="text-emerald-500 italic font-serif lowercase">Investment.</span></h1>
                        </div>
                        <button onClick={() => navigate(-1)} className="h-14 px-8 bg-white text-slate-400 hover:text-slate-900 border border-slate-200 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 active:scale-95 shadow-sm">
                            <ArrowLeft size={16} /> Back to Details
                        </button>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                        {/* PAYMENT OPTIONS */}
                        <div className="lg:col-span-7 space-y-12">
                            <section className="space-y-6">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Express Checkout</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <button onClick={() => handlePayment('apple')} disabled={submitting} className="h-28 bg-slate-900 text-white rounded-3xl flex items-center justify-center gap-4 transition-all hover:bg-black active:scale-95 shadow-xl shadow-slate-900/10 disabled:opacity-50">
                                        <Apple size={28} />
                                        <span className="text-xl font-bold tracking-tight">Apple Pay</span>
                                    </button>
                                    <button onClick={() => handlePayment('google')} disabled={submitting} className="h-28 bg-white border border-slate-200 text-slate-900 rounded-3xl flex items-center justify-center gap-4 transition-all hover:border-emerald-500 active:scale-95 shadow-sm disabled:opacity-50">
                                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-sm">G</div>
                                        <span className="text-xl font-bold tracking-tight">Google Pay</span>
                                    </button>
                                </div>
                            </section>

                            <div className="relative py-4 flex items-center">
                                <div className="flex-1 border-t border-slate-200"></div>
                                <span className="px-6 text-[10px] font-bold text-slate-300 uppercase tracking-widest">Or pay with card</span>
                                <div className="flex-1 border-t border-slate-200"></div>
                            </div>

                            <section className="bg-white border border-slate-200 rounded-[32px] p-8 md:p-12 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />

                                <div className="relative z-10 space-y-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Card Number</label>
                                        <div className="relative group">
                                            <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                            <input placeholder="0000 0000 0000 0000" className="w-full h-16 bg-slate-50 border border-slate-100 rounded-2xl pl-16 pr-6 font-bold text-lg focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200 shadow-inner" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
                                            <input placeholder="MM / YY" className="w-full h-16 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-lg focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200 shadow-inner" />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Security Code</label>
                                            <input placeholder="CVC" className="w-full h-16 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-lg focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200 shadow-inner" />
                                        </div>
                                    </div>

                                    <button onClick={() => handlePayment('card')} disabled={submitting} className="w-full h-18 py-5 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-bold uppercase text-[11px] tracking-widest transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                                        {submitting ? (
                                            <>
                                                <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                                <span>Processing Payment...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Confirm & Pay Now</span>
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </section>

                            <div className="flex items-center justify-center gap-10 opacity-40">
                                <Shield size={20} className="text-emerald-600" />
                                <Globe size={20} />
                                <Zap size={20} />
                            </div>
                        </div>

                        {/* ORDER SUMMARY */}
                        <aside className="lg:col-span-5 sticky top-40">
                            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 rounded-[40px] p-10 md:p-12 text-white shadow-2xl relative overflow-hidden border border-white/5">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32 pointer-events-none" />

                                <div className="relative z-10 space-y-10">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-emerald-400 font-bold text-[11px] uppercase tracking-[0.4em] italic mb-2">
                                            <Activity size={18} className="animate-pulse" /> Manifest Valuation
                                        </div>
                                        <h2 className="text-4xl font-bold tracking-tighter uppercase leading-none italic">Stay Summary.</h2>
                                        <p className="text-white/30 font-bold uppercase text-[9px] tracking-[0.4em] pt-4 border-t border-white/5">{title}</p>
                                    </div>

                                    <div className="space-y-4 pt-6 border-t border-white/5">
                                        <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5">
                                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Stay Duration</span>
                                            <span className="text-sm font-bold uppercase">{nights} {nights > 1 ? 'Nights' : 'Night'}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5">
                                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Booking ID</span>
                                            <span className="font-mono text-[10px] font-bold text-emerald-400">#WZ-{bookingId?.slice(-8).toUpperCase()}</span>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-white/10 space-y-8 text-center">
                                        <div className="flex flex-col items-center">
                                            <p className="text-[11px] font-bold text-white/20 uppercase tracking-[0.5em] mb-6">Net Settlement Value</p>
                                            <p className="text-7xl font-bold tracking-tighter text-white mb-6 italic">₹{price.toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] italic">Authorized Portfolio Rate</p>
                                        </div>

                                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                                            <div className="flex gap-4 items-start">
                                                <ShieldCheck size={20} className="text-emerald-500 shrink-0" />
                                                <p className="text-white/50 text-[10px] font-medium leading-relaxed italic text-left">
                                                    "Your transaction is secured with world-class encryption. Wayza guarantees a safe and verified booking experience."
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </aside>
                    </div>
                </div>

                <div className="py-20 text-center opacity-30 select-none pointer-events-none">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Wayza Global Secure Payment v4.5</p>
                </div>
            </div>
        </WayzaLayout>
    );
}