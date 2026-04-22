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
            <div className="bg-white min-h-screen font-sans">
                <div className="max-w-6xl mx-auto px-6 md:px-12 py-10 md:py-16">

                    {/* ─── HEADER ─── */}
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
                            <button onClick={() => navigate("/")} className="hover:text-emerald-600 transition-colors">Wayza</button>
                            <ChevronRight size={10} />
                            <span className="text-slate-900">Secure Checkout</span>
                        </div>
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:border-emerald-400 hover:text-emerald-600 transition-all"
                        >
                            <ArrowLeft size={16} />
                        </button>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
                        Complete your payment
                    </h1>
                    <p className="text-slate-400 text-sm mb-10">Your booking is held for 10 minutes. Complete payment to confirm.</p>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                        {/* ── LEFT: PAYMENT FORM ── */}
                        <div className="lg:col-span-7 space-y-8">
                            {/* Payment Options */}
                            <section>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Select Payment Method</p>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handlePayment('upi')}
                                        disabled={submitting}
                                        className="w-full h-16 bg-white border border-slate-200 text-slate-900 rounded-xl px-6 flex items-center justify-between font-bold text-sm hover:border-emerald-400 hover:shadow-md transition-all active:scale-[0.99] disabled:opacity-50 group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center font-black text-[10px]">UPI</div>
                                            <span>Pay via UPI (GPay, PhonePe, Paytm)</span>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                    </button>

                                    <button
                                        onClick={() => handlePayment('card')}
                                        disabled={submitting}
                                        className="w-full h-16 bg-white border border-slate-200 text-slate-900 rounded-xl px-6 flex items-center justify-between font-bold text-sm hover:border-emerald-400 hover:shadow-md transition-all active:scale-[0.99] disabled:opacity-50 group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                                <CreditCard size={16} />
                                            </div>
                                            <span>Credit / Debit Card</span>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                    </button>
                                </div>
                                <p className="flex items-center gap-2 text-[10px] text-slate-400 font-medium mt-6">
                                    <Shield size={12} className="text-emerald-500" />
                                    Payments are securely processed by Razorpay Checkout.
                                </p>
                            </section>
                        </div>

                        {/* ── RIGHT: ORDER SUMMARY ── */}
                        <aside className="lg:col-span-5 lg:sticky lg:top-24">
                            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg">

                                {/* Property Info */}
                                <div className="p-6 border-b border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Your Booking</p>
                                    <h3 className="text-lg font-black text-slate-900 leading-tight">{title}</h3>
                                    <p className="text-sm text-slate-400 mt-1">
                                        {nights} night{nights > 1 ? "s" : ""} · Ref: WZ-{bookingId?.slice(-6).toUpperCase()}
                                    </p>
                                </div>

                                {/* Price Breakdown */}
                                <div className="p-6 space-y-3">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Price Summary</p>
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Accommodation</span>
                                        <span>₹{(price * 0.85).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Taxes & fees</span>
                                        <span>₹{(price * 0.15).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                                    </div>
                                    {couponCode && (
                                        <div className="flex justify-between text-sm text-emerald-600 font-semibold">
                                            <span>Promo: {couponCode}</span>
                                            <span>Applied ✓</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-black text-slate-900 text-base pt-4 border-t border-slate-100">
                                        <span>Total</span>
                                        <span>₹{price.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Trust */}
                                <div className="px-6 pb-6">
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                                        <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                                        <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                                            Free cancellation available. Your payment is protected by Razorpay's secure gateway.
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

