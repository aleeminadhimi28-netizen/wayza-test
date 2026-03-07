import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext.jsx";
import { useToast } from "../../ToastContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, CheckCircle, Zap, Info, ArrowRight, Home, CreditCard, Sparkles, MapPin, Clock, Shield, Globe, Star, Navigation, Target } from "lucide-react";
import { WayzaLayout, WayzaSkeleton } from "../../WayzaUI.jsx";

import { api } from "../../utils/api.js";

export default function Booking() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [listing, setListing] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [blocked, setBlocked] = useState([]);
    const [loading, setLoading] = useState(true);

    const todayStr = new Date().toISOString().split("T")[0];
    const minStay = 1;

    useEffect(() => {
        window.scrollTo(0, 0);
        if (!id) return;

        Promise.all([
            api.getListing(id),
            api.getBookedDates(id)
        ])
            .then(([listingData, blockedData]) => {
                const l = listingData?.data || listingData;
                setListing(l || null);
                setBlocked(Array.isArray(blockedData) ? blockedData : []);
                setLoading(false);
            })
            .catch(() => {
                setListing(null);
                setBlocked([]);
                setLoading(false);
            });
    }, [id]);

    function isBlocked(start, end) {
        if (!start || !end) return false;
        const s = new Date(start);
        const e = new Date(end);
        return blocked.some(b => {
            if (b.status === "cancelled") return false;
            const bs = new Date(b.checkIn);
            const be = new Date(b.checkOut);
            return s < be && e > bs;
        });
    }

    const variantIndex = location.state?.variantIndex || 0;
    const variant = listing?.variants?.[variantIndex];
    const pricePerNight = variant?.price || listing?.price || 0;

    const nights = startDate && endDate
        ? Math.max(0, Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000))
        : 0;

    const baseAmount = nights * pricePerNight;
    const gst = Math.round(baseAmount * 0.12);
    const serviceFee = nights > 0 ? 199 : 0;
    const totalAmount = baseAmount + gst + serviceFee;

    const stayInvalid = nights > 0 && nights < minStay;
    const blockedDates = isBlocked(startDate, endDate);

    async function reserve() {
        if (!user?.email) {
            showToast("Identification required. Please sign in to continue.", "error");
            navigate("/login", { state: { from: location } });
            return;
        }
        if (!startDate || !endDate) {
            showToast("Please select your stay duration.", "error");
            return;
        }
        if (stayInvalid) {
            showToast(`The minimum stay is ${minStay} night.`, "error");
            return;
        }
        if (blockedDates) {
            showToast("The selected dates are currently unavailable.", "error");
            return;
        }

        try {
            const data = await api.bookListing({
                listingId: id,
                variantIndex,
                title: listing?.title,
                ownerEmail: listing?.ownerEmail,
                checkIn: startDate,
                checkOut: endDate
            });

            if (!data.ok) {
                showToast(data.message || "Failed to initialize reservation.", "error");
                return;
            }

            navigate(`/payment/${data.bookingId}`, {
                state: { bookingId: data.bookingId, price: totalAmount, title: listing?.title, nights }
            });
        } catch {
            showToast("Connection error. Please try again.", "error");
        }
    }

    if (loading) return (
        <WayzaLayout noPadding>
            <div className="max-w-7xl mx-auto py-32 px-6 space-y-16 bg-white rounded-[48px] shadow-sm border border-slate-50">
                <WayzaSkeleton className="h-12 w-1/3 rounded-full" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 space-y-10">
                        <WayzaSkeleton className="h-48 rounded-[32px]" />
                        <WayzaSkeleton className="h-[400px] rounded-[32px]" />
                    </div>
                    <div className="lg:col-span-4">
                        <WayzaSkeleton className="h-[600px] rounded-[32px]" />
                    </div>
                </div>
            </div>
        </WayzaLayout>
    );

    function fixImg(img) {
        if (!img) return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";
        if (img.startsWith("http")) return img;
        const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
        return `${BASE}/uploads/${img}`;
    }

    return (
        <WayzaLayout noPadding>
            <div className="bg-slate-50 min-h-screen font-sans selection:bg-emerald-100 selection:text-emerald-900">

                {/* PROGRESS BAR - REFINED GLASS */}
                <div className="bg-white/80 backdrop-blur-2xl border-b border-slate-100 sticky top-20 z-40 transition-all">
                    <div className="max-w-7xl mx-auto py-6 px-6 lg:px-12 flex items-center justify-between gap-12">
                        <div className="flex-1 flex gap-3">
                            <div className="h-2 flex-1 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                            <div className="h-2 flex-1 bg-slate-100 rounded-full" />
                            <div className="h-2 flex-1 bg-slate-100 rounded-full" />
                        </div>
                        <div className="flex items-center gap-4 text-emerald-600 font-bold text-[11px] uppercase tracking-[0.4em] leading-none italic shrink-0">
                            <Sparkles size={18} className="animate-pulse" /> Phase 01 // Validation Protocol
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
                    <header className="mb-20 space-y-6 max-w-4xl">
                        <div className="flex items-center gap-3 text-slate-300 font-bold text-[11px] uppercase tracking-[0.5em] italic">
                            <Navigation size={18} /> Secure Settlement Portal
                        </div>
                        <h1 className="text-5xl md:text-9xl font-bold text-slate-900 tracking-tighter leading-[0.8] uppercase">Finalize Your <br /><span className="text-emerald-500 italic font-serif lowercase">Sanctuary.</span></h1>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

                        {/* CONFIGURATION COLUMN */}
                        <div className="lg:col-span-7 space-y-16">

                            {/* DATE SELECTION */}
                            <section className="bg-white border border-slate-100 rounded-[48px] p-10 md:p-16 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 blur-[100px] -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10 space-y-12">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-[32px] bg-slate-900 text-white flex items-center justify-center text-3xl font-bold shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                            01
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-4xl font-bold text-slate-900 uppercase tracking-tighter">Stay Schedule.</h2>
                                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] italic leading-none">Arrival & Departure Chronology</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4 group/input">
                                            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-2 group-focus-within/input:text-emerald-500 transition-colors">Check-in Date</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within/input:text-emerald-500 transition-colors" size={20} />
                                                <input
                                                    type="date" min={todayStr} value={startDate}
                                                    onChange={e => { const ns = e.target.value; setStartDate(ns); if (endDate && ns >= endDate) setEndDate(""); }}
                                                    className="w-full h-18 bg-slate-50 border border-slate-100 rounded-[20px] pl-16 pr-6 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all shadow-inner"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4 group/input">
                                            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-2 group-focus-within/input:text-emerald-500 transition-colors">Check-out Date</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within/input:text-emerald-500 transition-colors" size={20} />
                                                <input
                                                    type="date" min={startDate || todayStr} value={endDate}
                                                    onChange={e => setEndDate(e.target.value)}
                                                    className="w-full h-18 bg-slate-50 border border-slate-100 rounded-[20px] pl-16 pr-6 font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all shadow-inner"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {blockedDates && (
                                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 bg-rose-50 text-rose-600 rounded-[28px] border border-rose-100 text-sm font-bold flex items-center gap-6 shadow-sm">
                                                <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                                                    <Info size={24} />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="uppercase tracking-tight">Timeline Conflict</p>
                                                    <p className="text-xs font-medium opacity-70 italic">The selected dates are currently unavailable in the distribution network.</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </section>

                            {/* HOUSE POLICIES */}
                            <section className="space-y-12">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-emerald-600 font-bold text-[11px] uppercase tracking-[0.4em] italic">
                                        <Shield size={18} strokeWidth={3} /> Respect & Responsibility
                                    </div>
                                    <h2 className="text-5xl font-bold text-slate-900 uppercase tracking-tighter leading-none mb-4">Guest Protocol.</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { t: "Check-in Registry", d: "Standard arrival window begins after 12:00 PM", i: <Clock /> },
                                        { t: "Atmospheric Peace", d: "Kindly maintain serenity after 10:00 PM", i: <Zap /> },
                                        { t: "Pure Environment", d: "A smoke-free sanctuary for all guests", i: <Info /> },
                                        { t: "Sacred Space", d: "Please treat the architecture with reverence", i: <CheckCircle /> }
                                    ].map((rule, i) => (
                                        <div key={i} className="flex gap-6 p-10 bg-white border border-slate-100 rounded-[36px] shadow-sm hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group">
                                            <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors shadow-inner">
                                                {rule.i}
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="font-bold text-[11px] uppercase tracking-widest text-slate-900 leading-none">{rule.t}</h4>
                                                <p className="text-[10px] font-medium text-slate-400 leading-relaxed italic">{rule.d}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* VALUATION SUMMARY */}
                        <aside className="lg:col-span-5 sticky top-44">
                            <div className="bg-slate-950 rounded-[64px] p-12 md:p-14 text-white shadow-[0_50px_150px_-30px_rgba(0,0,0,0.5)] overflow-hidden relative border border-white/5 group">
                                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] -mr-64 -mt-64 group-hover:bg-emerald-500/20 transition-colors duration-1000 pointer-events-none" />

                                <div className="relative z-10 space-y-12">
                                    <div className="flex gap-8 items-center bg-white/5 p-8 rounded-[40px] border border-white/10 group/item hover:bg-white/10 transition-all">
                                        <div className="w-24 h-24 rounded-[28px] overflow-hidden border-4 border-white/10 shrink-0 group-hover/item:scale-105 transition-transform duration-500">
                                            <img src={fixImg(listing.image)} className="w-full h-full object-cover" alt="Stay Feature" />
                                        </div>
                                        <div className="space-y-3 min-w-0">
                                            <h3 className="text-2xl font-bold tracking-tight uppercase leading-none truncate pr-4 italic">{listing.title}</h3>
                                            <div className="flex items-center gap-3 text-emerald-400 font-bold text-[10px] uppercase tracking-[0.2em] bg-emerald-500/10 w-fit px-3 py-1 rounded-lg">
                                                <Home size={14} /> {variant ? variant.name : "Superior Stay"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        <div className="flex items-center gap-3 text-emerald-400 font-bold text-[11px] uppercase tracking-[0.4em] italic mb-6">
                                            <Target size={18} /> Financial Projection
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center group/fee">
                                                <span className="text-white/20 font-bold uppercase tracking-[0.4em] text-[10px] group-hover/fee:text-white/40 transition-colors">Principal Investment</span>
                                                <span className="text-white/40 font-bold text-lg tracking-widest italic group-hover/fee:text-white transition-colors">₹{pricePerNight.toLocaleString()} × {nights || 0}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xl font-bold">
                                                <span className="text-white/20 font-bold uppercase tracking-[0.2em] text-[10px]">Base Stay Value</span>
                                                <span className="tracking-tighter italic">₹{baseAmount.toLocaleString()}</span>
                                            </div>
                                            {nights > 0 && (
                                                <div className="space-y-6 pt-10 border-t border-white/5">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-white/20 font-bold uppercase tracking-[0.2em] text-[10px]">Taxes & Surcharges (12%)</span>
                                                        <span className="font-bold text-lg tracking-tight italic text-emerald-400">₹{gst.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-white/20 font-bold uppercase tracking-[0.2em] text-[10px]">Concierge & Network Fee</span>
                                                        <span className="font-bold text-lg tracking-tight italic text-emerald-400">₹{serviceFee.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-12 border-t border-white/10 space-y-10 text-center">
                                            <div className="flex flex-col items-center">
                                                <p className="text-[12px] font-bold text-white/20 uppercase tracking-[0.6em] mb-6">Net Settlement Value</p>
                                                <p className="text-7xl md:text-9xl font-bold tracking-tighter text-white mb-6 italic">₹{totalAmount.toLocaleString()}</p>
                                                <div className="flex items-center gap-3 text-[9px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                                                    <Shield size={12} /> Guaranteed Rate
                                                </div>
                                            </div>

                                            <button
                                                onClick={reserve}
                                                disabled={blockedDates}
                                                className="w-full h-20 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[32px] font-bold uppercase text-[12px] tracking-[0.3em] shadow-[0_20px_60px_-10px_rgba(16,185,129,0.3)] active:scale-95 transition-all flex items-center justify-center gap-6 disabled:bg-white/5 disabled:text-white/10 disabled:cursor-not-allowed group/btn"
                                            >
                                                Initialize Payment <CreditCard size={20} className="group-hover/btn:rotate-12 transition-transform" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex justify-center gap-10 pt-10 border-t border-white/5 opacity-10 group-hover:opacity-30 transition-opacity">
                                        <div className="flex flex-col items-center gap-2">
                                            <Shield size={20} />
                                            <span className="text-[8px] font-bold uppercase tracking-widest">End-to-End</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <Globe size={20} />
                                            <span className="text-[8px] font-bold uppercase tracking-widest">Universal</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <Navigation size={20} />
                                            <span className="text-[8px] font-bold uppercase tracking-widest">Verified</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>

                {/* ARCHIVE FOOTER */}
                <div className="py-24 text-center">
                    <div className="inline-flex items-center gap-6 px-10 py-6 bg-white rounded-full border border-slate-100 shadow-sm text-slate-200 font-bold text-[9px] uppercase tracking-[0.5em] select-none hover:text-emerald-500 transition-colors">
                        <Navigation size={14} /> Wayza Hospitality Services // Secure Link <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                </div>
            </div>
        </WayzaLayout>
    );
}