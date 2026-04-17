import { useParams, useNavigate, useLocation } from "react-router-dom";
import { WayzaLayout, WayzaButton } from "../../WayzaUI.jsx"
import { useAuth } from "../../AuthContext.jsx"
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, CreditCard, Apple, Wallet, CheckCircle, Lock, Zap, ArrowLeft, ArrowRight, Shield, Activity, Globe, CreditCard as CardIcon, Sparkles, ChevronRight } from "lucide-react";
import { useToast } from "../../ToastContext.jsx";
import { useState, useEffect } from "react";

import { api } from "../../utils/api.js";

export default function Payment() {
    const { id: bookingId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();
    const { user } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate("/login", { state: { from: location.pathname } });
        }
    }, [user, navigate, location]);

    const price = location.state?.price || 0;
    const title = location.state?.title || "Premium Experience";
    const nights = location.state?.nights || 1;
    const couponCode = location.state?.couponCode;

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        }
    }, []);

    async function handlePayment(method = "card") {
        if (!bookingId) {
            showToast("Invalid transaction reference.", "error");
            return;
        }

        setSubmitting(true);

        try {
            // 1. Create Order on Backend
            const orderData = await api.createRazorpayOrder(bookingId);
            if (!orderData.ok) {
                showToast(orderData.message || "Failed to initiate payment.", "error");
                setSubmitting(false);
                return;
            }

            // 2. Configure Razorpay Options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SefBe7ldCASLlG",
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Wayza",
                description: `Booking: ${title}`,
                order_id: orderData.orderId,
                handler: async function (response) {
                    try {
                        // 3. Verify Payment on Backend
                        const confirmData = await api.confirmBooking({
                            bookingId,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (confirmData.ok) {
                            showToast("Payment confirmed! Your stay is verified. 🌿", "success");
                            navigate("/payment-success");
                        } else {
                            showToast(confirmData.message || "Payment verification failed.", "error");
                            setSubmitting(false);
                        }
                    } catch (err) {
                        showToast("Verification error. Contact support.", "error");
                        setSubmitting(false);
                    }
                },
                theme: {
                    color: "#059669",
                },
                modal: {
                    ondismiss: function () {
                        setSubmitting(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error("Razorpay Error:", err);
            showToast("Failed to connect to payment gateway.", "error");
            setSubmitting(false);
        }
    }

    return (
        <WayzaLayout noPadding>
            <div className="bg-white min-h-screen font-sans selection:bg-emerald-100 selection:text-emerald-900">

                {/* ─── PREMIUM MESH BACKGROUND ─── */}
                <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
                    <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-100/30 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-slate-100/50 blur-[120px] rounded-full" />
                </div>

                <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-10 md:py-16 relative z-10">

                    {/* ─── BREADCRUMB / BACK ─── */}
                    <div className="flex items-center justify-between mb-16">
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 overflow-x-auto no-scrollbar whitespace-nowrap">
                            <button onClick={() => navigate("/")} className="hover:text-emerald-600 transition-colors">Protocol</button>
                            <ChevronRight size={10} />
                            <span className="text-slate-900">Secure Checkout</span>
                        </div>
                        <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-900 hover:border-emerald-200 transition-all shadow-sm">
                            <ArrowLeft size={18} />
                        </button>
                    </div>

                    <header className="mb-20 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="px-3 py-1 bg-slate-950 text-white text-[9px] font-black uppercase tracking-[0.4em] rounded-md flex items-center gap-2">
                                <ShieldCheck size={12} className="text-emerald-400" />
                                Wayza Vault Secure
                            </div>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter uppercase leading-[0.8]">
                            Authorization <br />
                            <span className="lowercase">& settlement.</span>
                        </h1>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest max-w-sm">
                            "Execute your commitment via our encrypted liquidity bridge."
                        </p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">

                        {/* LEFT: PAYMENT INSTRUMENTS */}
                        <div className="lg:col-span-7 space-y-20">

                            {/* Rapid Access */}
                            <section className="space-y-10">
                                <div className="flex items-center gap-4">
                                    <span className="h-px w-12 bg-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-600">Rapid Access</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <button onClick={() => handlePayment('apple')} disabled={submitting} className="h-24 bg-slate-950 text-white rounded-[40px] flex items-center justify-center gap-4 transition-all hover:bg-black active:scale-[0.98] shadow-2xl shadow-slate-950/20 group">
                                        <Apple size={28} className="group-hover:scale-110 transition-transform" />
                                        <div className="text-left">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Pay with</p>
                                            <p className="text-xl font-black tracking-tighter">Apple Pay</p>
                                        </div>
                                    </button>
                                    <button onClick={() => handlePayment('google')} disabled={submitting} className="h-24 bg-white border border-slate-100 text-slate-900 rounded-[40px] flex items-center justify-center gap-4 transition-all hover:border-emerald-500 active:scale-[0.98] shadow-sm group">
                                        <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center font-black text-xs group-hover:bg-emerald-50 transition-colors">G</div>
                                        <div className="text-left">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Secure via</p>
                                            <p className="text-xl font-black tracking-tighter">Google Pay</p>
                                        </div>
                                    </button>
                                </div>
                            </section>

                            {/* Card Protocol */}
                            <section className="space-y-10 bg-slate-50/50 p-12 rounded-[48px] border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <span className="h-px w-12 bg-slate-200" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">Residency Instrument Protocol</span>
                                </div>

                                <div className="space-y-10">
                                    <div className="space-y-4 group">
                                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] ml-2 group-focus-within:text-emerald-600 transition-colors">Card Index Identifier</label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-emerald-500 transition-colors" size={24} />
                                            <input
                                                placeholder="0000 0000 0000 0000"
                                                className="w-full h-24 bg-white/50 border border-slate-100 rounded-[32px] pl-24 pr-10 font-bold text-2xl tracking-tighter text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-100 shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-4 group">
                                            <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] ml-2 group-focus-within:text-emerald-600 transition-colors">Expiry Cycle</label>
                                            <input
                                                placeholder="MM / YY"
                                                className="w-full h-24 bg-white/50 border border-slate-100 rounded-[32px] px-10 font-bold text-2xl tracking-tighter text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-100 shadow-sm text-center"
                                            />
                                        </div>
                                        <div className="space-y-4 group">
                                            <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] ml-2 group-focus-within:text-emerald-600 transition-colors">Auth Key (CVC)</label>
                                            <input
                                                type="password" placeholder="•••"
                                                className="w-full h-24 bg-white/50 border border-slate-100 rounded-[32px] px-10 font-bold text-2xl tracking-[0.5em] text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-100 shadow-sm text-center"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handlePayment('card')}
                                        disabled={submitting}
                                        className="w-full h-24 bg-slate-950 text-white rounded-[40px] font-black uppercase text-xs tracking-[0.5em] transition-all hover:bg-emerald-500 shadow-3xl shadow-slate-950/20 active:scale-[0.98] flex items-center justify-center gap-6 disabled:opacity-20 mt-4 group"
                                    >
                                        {submitting ? (
                                            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <span>Authorize Entry: ₹{price.toLocaleString()}</span>
                                                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </section>
                        </div>

                        {/* RIGHT: SETTLEMENT SUMMARY */}
                        <div className="lg:col-span-5 relative">
                            <div className="sticky top-32 space-y-8">
                                <div className="bg-slate-950 rounded-[48px] p-12 text-white shadow-3xl shadow-slate-900/40 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

                                    <div className="relative z-10 space-y-12">
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-400">Settlement Ledger</p>
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">{title}</h3>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-white/30 truncate max-w-[100px]">WZ-{bookingId?.slice(-8).toUpperCase()}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-6 pt-10 border-t border-white/10">
                                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-white/40">
                                                <span>Audit Period</span>
                                                <span className="text-white bg-white/5 px-4 py-2 rounded-xl">{nights} {nights > 1 ? 'Stages' : 'Stage'}</span>
                                            </div>
                                            {couponCode && (
                                                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-white/40">
                                                    <span>Promo Sequence</span>
                                                    <span className="text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl">{couponCode}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-white/40">
                                                <span>Security Protocol</span>
                                                <span className="text-emerald-400">WAYZA VAULT</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-8 border-t border-white/10">
                                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-400">Net Commitment</span>
                                                <span className="text-5xl font-black tracking-tighter text-white">₹{price.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="p-8 bg-white/5 backdrop-blur-md rounded-[32px] border border-white/10 flex items-start gap-6">
                                            <ShieldCheck size={24} className="text-emerald-500 shrink-0" />
                                            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest leading-relaxed">
                                                Your financial signature is protected by military-grade AES-256 encryption. We do not persist sensitive instrument data.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 flex items-center gap-6 group hover:bg-white hover:shadow-xl transition-all duration-500">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                        <Globe size={20} className="text-emerald-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black uppercase tracking-widest text-slate-900">Regional Node</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Dispatch Protocol Active</p>
                                    </div>
                                    <ChevronRight size={16} className="ml-auto text-slate-300" />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </WayzaLayout>
    );
}
