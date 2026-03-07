import { useParams, useNavigate, useLocation } from "react-router-dom";
import { WayzaLayout, WayzaButton } from "../../WayzaUI.jsx"
import { useAuth } from "../../AuthContext.jsx"
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, CreditCard, Apple, Wallet, CheckCircle, Lock, Zap, ArrowLeft, ArrowRight, Shield, Activity, Globe, CreditCard as CardIcon, Sparkles } from "lucide-react";
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
            <div className="bg-white min-h-screen font-sans selection:bg-emerald-50 selection:text-emerald-900">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 md:py-20">
                    <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Payment</h1>
                            <p className="text-slate-500 font-medium">Choose your payment method and complete your booking.</p>
                        </div>
                        <button onClick={() => navigate(-1)} className="h-12 px-6 bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-100 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all flex items-center gap-2">
                            <ArrowLeft size={14} /> Back
                        </button>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        {/* LEFT COLUMN: PAYMENT METHODS */}
                        <div className="lg:col-span-7 space-y-12">
                            <section className="space-y-6">
                                <h3 className="text-sm font-bold text-slate-900">1. Fast checkout</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button onClick={() => handlePayment('apple')} disabled={submitting} className="h-20 bg-slate-950 text-white rounded-[24px] flex items-center justify-center gap-3 transition-all hover:bg-black active:scale-95 disabled:opacity-50">
                                        <Apple size={24} />
                                        <span className="text-lg font-bold">Apple Pay</span>
                                    </button>
                                    <button onClick={() => handlePayment('google')} disabled={submitting} className="h-20 bg-white border border-slate-200 text-slate-900 rounded-[24px] flex items-center justify-center gap-3 transition-all hover:border-emerald-500 active:scale-95 disabled:opacity-50">
                                        <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center font-bold text-[10px]">G</div>
                                        <span className="text-lg font-bold">Google Pay</span>
                                    </button>
                                </div>
                            </section>

                            <div className="relative py-2 flex items-center">
                                <div className="flex-1 border-t border-slate-100"></div>
                                <span className="px-6 text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Or card payment</span>
                                <div className="flex-1 border-t border-slate-100"></div>
                            </div>

                            <section className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 md:p-12">
                                <h3 className="text-sm font-bold text-slate-900 mb-8">2. Credit or Debit card</h3>
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Card Number</label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input placeholder="0000 0000 0000 0000" className="w-full h-14 bg-white border border-slate-200 rounded-xl pl-12 pr-4 font-bold text-slate-900 focus:border-emerald-500 outline-none transition-all" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Expiry Date</label>
                                            <input placeholder="MM / YY" className="w-full h-14 bg-white border border-slate-200 rounded-xl px-4 font-bold text-slate-900 focus:border-emerald-500 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">CVC</label>
                                            <input placeholder="123" className="w-full h-14 bg-white border border-slate-200 rounded-xl px-4 font-bold text-slate-900 focus:border-emerald-500 outline-none transition-all" />
                                        </div>
                                    </div>

                                    <button onClick={() => handlePayment('card')} disabled={submitting} className="w-full h-16 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-bold uppercase text-xs tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-4">
                                        {submitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Pay ₹{price.toLocaleString()}</span>
                                                <ArrowRight size={16} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </section>
                        </div>

                        {/* RIGHT COLUMN: SUMMARY */}
                        <aside className="lg:col-span-5 lg:sticky lg:top-24">
                            <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-xl p-8 md:p-10">
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-bold text-slate-900">Order Summary</h2>
                                        <p className="text-sm font-medium text-slate-500">{title}</p>
                                    </div>

                                    <div className="space-y-3 pt-6 border-t border-slate-100">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Total stay</span>
                                            <span className="font-bold text-slate-900">{nights} {nights > 1 ? 'Nights' : 'Night'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Booking ID</span>
                                            <span className="font-mono text-xs font-bold text-emerald-600">WZ-{bookingId?.slice(-8).toUpperCase()}</span>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                                        <span className="text-slate-900 font-bold">Total amount</span>
                                        <span className="text-4xl font-bold text-slate-900 tracking-tight">₹{price.toLocaleString()}</span>
                                    </div>

                                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-3">
                                        <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                                        <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">
                                            Your transaction is encrypted and secured. Wayza does not store your card details.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </WayzaLayout>
    );
}