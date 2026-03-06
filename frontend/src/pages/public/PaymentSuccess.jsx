import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { WayzaLayout } from "../../WayzaUI.jsx";
import { useAuth } from "../../AuthContext.jsx";
import { CheckCircle, ArrowRight, History, Zap, Sparkles, MapPin, ShieldCheck, Home, Calendar } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PaymentSuccess() {
    const { token } = useAuth();
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const [confirmed, setConfirmed] = useState(false);

    useEffect(() => {
        const bookingId = params.get("bookingId");
        if (!bookingId || !token) return;

        fetch(`${API}/confirm-booking`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                bookingId,
                paymentId: "demo-verified-" + Date.now()
            })
        }).then(r => r.json()).then(data => {
            if (data.ok) setConfirmed(true);
        });
    }, [token]);

    return (
        <WayzaLayout noPadding>
            <div className="min-h-screen bg-slate-50 font-sans overflow-hidden flex flex-col items-center justify-center relative">

                {/* AMBIENT VISUALS */}
                <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] pointer-events-none" />

                <div className="relative z-10 max-w-4xl w-full px-6 flex flex-col items-center text-center">

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", damping: 12 }}
                        className="w-40 h-40 bg-white text-emerald-500 rounded-full flex items-center justify-center shadow-2xl mb-16 border-8 border-emerald-50"
                    >
                        <CheckCircle size={80} strokeWidth={1.5} className="fill-emerald-50/50" />
                    </motion.div>

                    <div className="space-y-8 mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-8 py-4 rounded-full text-emerald-600 font-bold text-[11px] uppercase tracking-[0.4em] italic"
                        >
                            <Sparkles size={18} /> Settlement Verified
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-7xl md:text-9xl font-bold text-slate-900 tracking-tighter leading-[0.8] uppercase"
                        >
                            Global Registry <br /><span className="text-emerald-500 italic font-serif lowercase">Updated.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] max-w-xl mx-auto italic"
                        >
                            "Your payment has been successfully processed and synchronized across our global distribution network."
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl px-4">
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            onClick={() => navigate("/my-bookings")}
                            className="h-20 bg-slate-900 text-white rounded-3xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-4 hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95 group"
                        >
                            View Bookings <Calendar size={18} className="group-hover:translate-y-[-2px] transition-transform" />
                        </motion.button>

                        <motion.button
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                            onClick={() => navigate("/")}
                            className="h-20 bg-white text-slate-900 border border-slate-200 rounded-3xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-4 hover:border-emerald-500 transition-all shadow-sm active:scale-95 group"
                        >
                            Back to Home <Home size={18} className="group-hover:scale-110 transition-transform" />
                        </motion.button>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-32 pt-12 border-t border-slate-200 w-full max-w-md flex flex-col items-center"
                    >
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic leading-relaxed">
                            "A journey of a thousand miles begins with a single step. Thank you for choosing Wayza."
                        </p>
                    </motion.div>
                </div>
            </div>
        </WayzaLayout>
    );
}