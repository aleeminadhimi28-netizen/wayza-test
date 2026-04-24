import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { WayzzaLayout } from "../../WayzzaUI.jsx";
import { CheckCircle, ArrowRight, Home, Calendar, CreditCard, MapPin, Zap, MessageSquare, Sparkles } from "lucide-react";

export default function BookingSuccess() {
    const { state } = useLocation();
    const navigate = useNavigate();

    if (!state) {
        return (
            <WayzzaLayout>
                <div className="min-h-[70vh] flex flex-col items-center justify-center p-10 text-center space-y-10">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto shadow-inner border border-slate-100">
                        <Zap size={32} className="text-slate-200" />
                    </div>
                    <div className="space-y-4 max-w-sm">
                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">Reservation Not Found.</h3>
                        <p className="text-slate-400 font-medium">We couldn't find your active reservation data. Please check your bookings history.</p>
                    </div>
                    <Link to="/my-bookings" className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95 inline-flex items-center gap-3">
                        View My Bookings <Calendar size={18} />
                    </Link>
                </div>
            </WayzzaLayout>
        );
    }

    const { bookingId, title, price, startDate, endDate } = state;

    return (
        <WayzzaLayout noPadding>
            <div className="min-h-screen bg-slate-50 font-sans overflow-hidden">

                {/* CELEBRATION HERO */}
                <div className="relative pt-32 pb-48 flex flex-col items-center text-center px-6 overflow-hidden bg-white border-b border-slate-200">
                    <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-emerald-500/5 to-transparent -z-10" />

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-32 h-32 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-inner mb-12 border-8 border-white"
                    >
                        <CheckCircle size={56} strokeWidth={1.5} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        <div className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-8 py-4 rounded-full text-emerald-600 font-bold text-[11px] uppercase tracking-[0.4em] mb-6">
                            <Sparkles size={18} /> Verified Confirmation
                        </div>
                        <h1 className="text-7xl md:text-9xl font-bold text-slate-900 tracking-tighter leading-[0.8] uppercase">
                            Voyage <br /><span className="text-emerald-500 lowercase">Commenced.</span>
                        </h1>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest max-w-xl mx-auto mt-6">
                            Pack your bags! Your extraordinary stay is fixed and we can't wait to host you.
                        </p>
                    </motion.div>
                </div>

                {/* RESERVATION CARD */}
                <div className="max-w-4xl mx-auto px-6 -mt-24 relative z-20 pb-40">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white rounded-[48px] shadow-2xl border border-slate-100 p-10 md:p-16 overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />

                        <div className="relative z-10 space-y-12">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-bold text-slate-900 leading-none uppercase">Great Choice!</h3>
                                    <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Your Reservation Details</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] block mb-3">Manifest Reference</span>
                                    <span className="font-mono text-sm font-bold text-emerald-600 bg-emerald-50 px-5 py-2.5 rounded-2xl border border-emerald-100 uppercase tracking-tighter shadow-sm">WZ-{bookingId?.slice(-12).toUpperCase()}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-slate-100">
                                <div className="space-y-3 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <Home size={18} className="text-emerald-500" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Property</span>
                                    </div>
                                    <p className="text-xl font-bold text-slate-900 tracking-tight uppercase leading-tight">{title}</p>
                                </div>

                                <div className="space-y-3 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <Calendar size={18} className="text-emerald-500" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Dates</span>
                                    </div>
                                    <p className="text-xl font-bold text-slate-900 tracking-tight">{startDate} → {endDate}</p>
                                </div>

                                <div className="space-y-3 bg-slate-50 p-8 rounded-[32px] border border-slate-100 shadow-inner group/card hover:bg-white hover:border-emerald-200 transition-all">
                                    <div className="flex items-center gap-3 text-slate-400 group-hover:text-emerald-500 transition-colors">
                                        <CreditCard size={20} />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Net Settlement</span>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900 tracking-tighter">₹{price.toLocaleString()}</p>
                                </div>

                                <div className="space-y-3 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <MessageSquare size={18} className="text-emerald-500" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Need Help?</span>
                                    </div>
                                    <Link to="/guest-chat" className="inline-flex items-center gap-3 text-emerald-600 font-bold text-xs uppercase tracking-widest hover:translate-x-1 transition-transform">
                                        Message the host <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>

                            <div className="pt-10 flex flex-col md:flex-row gap-4">
                                <button
                                    onClick={() => navigate("/")}
                                    className="flex-1 h-18 py-5 bg-slate-900 text-white rounded-3xl font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                                >
                                    Return to Home <Home size={18} />
                                </button>
                                <button
                                    onClick={() => navigate("/my-bookings")}
                                    className="px-10 h-18 py-5 bg-white text-slate-900 border border-slate-200 rounded-3xl font-bold uppercase text-[10px] tracking-widest hover:border-emerald-600 transition-all active:scale-95"
                                >
                                    My Bookings
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </WayzzaLayout>
    );
}