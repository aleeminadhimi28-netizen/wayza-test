import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext.jsx";
import { useToast } from "../../ToastContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, CheckCircle, Zap, Info, ArrowRight, Home, CreditCard, Sparkles, MapPin, Clock, Shield, Globe, Star, Navigation, Target, Tag } from "lucide-react";
import { WayzzaLayout, WayzzaSkeleton } from "../../WayzzaUI.jsx";

import { api } from "../../utils/api.js";

export default function Booking() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [listing, setListing] = useState(null);
    const todayStr = new Date().toISOString().split("T")[0];
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const [startDate, setStartDate] = useState(todayStr);
    const [endDate, setEndDate] = useState(tomorrowStr);
    const [blocked, setBlocked] = useState([]);
    const [loading, setLoading] = useState(true);

    const [couponCode, setCouponCode] = useState("");
    const [discountInfo, setDiscountInfo] = useState(null);
    const [validatingCoupon, setValidatingCoupon] = useState(false);

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

    const [platformConfig, setPlatformConfig] = useState(null);

    useEffect(() => {
        api.getPlatformConfig().then(res => { if (res.ok) setPlatformConfig(res.data); }).catch(() => {});
    }, []);

    const baseAmount = nights * pricePerNight;
    const isVehicle = listing?.category === "bike" || listing?.category === "car";
    const gstRate = platformConfig?.gstRate ?? 0.12;
    const serviceFeeRate = platformConfig?.serviceFee ?? 99;

    const discountAmount = discountInfo ? Math.round(baseAmount * discountInfo.discountPercentage) : 0;
    const discountedBase = baseAmount - discountAmount;

    const gst = isVehicle ? 0 : Math.round(discountedBase * gstRate);
    const serviceFee = nights > 0 ? serviceFeeRate : 0;
    const totalAmount = discountedBase + gst + serviceFee;

    const stayInvalid = nights > 0 && nights < minStay;
    const blockedDates = isBlocked(startDate, endDate);

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setValidatingCoupon(true);
        try {
            const res = await api.validateCoupon(couponCode);
            if (res.ok) {
                setDiscountInfo({ discountPercentage: res.discountPercentage, code: res.code });
                showToast(`Coupon applied! ${Math.round(res.discountPercentage * 100)}% off.`, "success");
            } else {
                setDiscountInfo(null);
                showToast(res.message || "Invalid coupon", "error");
            }
        } catch (err) {
            setDiscountInfo(null);
            showToast("Failed to validate coupon", "error");
        }
        setValidatingCoupon(false);
    };

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
                checkOut: endDate,
                couponCode: discountInfo ? discountInfo.code : undefined
            });

            if (!data.ok) {
                showToast(data.message || "Failed to initialize reservation.", "error");
                return;
            }

            navigate(`/payment/${data.bookingId}`, {
                state: { bookingId: data.bookingId, price: totalAmount, title: listing?.title, nights, couponCode: discountInfo ? discountInfo.code : null }
            });
        } catch {
            showToast("Connection error. Please try again.", "error");
        }
    }

    if (loading) return (
        <WayzzaLayout noPadding>
            <div className="max-w-7xl mx-auto py-32 px-6 space-y-16 bg-white rounded-[48px] shadow-sm border border-slate-50">
                <WayzzaSkeleton className="h-12 w-1/3 rounded-full" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 space-y-10">
                        <WayzzaSkeleton className="h-48 rounded-[32px]" />
                        <WayzzaSkeleton className="h-[400px] rounded-[32px]" />
                    </div>
                    <div className="lg:col-span-4">
                        <WayzzaSkeleton className="h-[600px] rounded-[32px]" />
                    </div>
                </div>
            </div>
        </WayzzaLayout>
    );

    function fixImg(img) {
        if (!img) return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";
        if (img.startsWith("http")) return img;
        const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
        return `${BASE}/uploads/${img}`;
    }

    return (
        <WayzzaLayout noPadding>
            <div className="bg-white min-h-screen font-sans selection:bg-emerald-50 selection:text-emerald-900">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 md:py-20">
                    <header className="mb-12 space-y-2">
                        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Confirm your booking</h1>
                        <p className="text-slate-500 font-medium">Please review your stay details and complete the reservation.</p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        {/* LEFT COLUMN */}
                        <div className="lg:col-span-7 space-y-12">
                            {/* DATE SELECTION */}
                            <section className="bg-slate-50 rounded-[32px] p-8 md:p-12 border border-slate-100">
                                <h2 className="text-xl font-bold text-slate-900 mb-8">1. Your stay</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Check-in</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="date" min={todayStr} value={startDate}
                                                onChange={e => { const ns = e.target.value; setStartDate(ns); if (endDate && ns >= endDate) setEndDate(""); }}
                                                className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 font-bold text-slate-900 focus:border-emerald-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Check-out</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="date" min={startDate || todayStr} value={endDate}
                                                onChange={e => setEndDate(e.target.value)}
                                                className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 font-bold text-slate-900 focus:border-emerald-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {blockedDates && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 text-sm font-medium flex items-center gap-3">
                                            <Info size={18} />
                                            These dates are already booked.
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                
                                <div className="mt-8 pt-8 border-t border-slate-200/60">
                                    <label className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                        <Tag size={16} className="text-emerald-500" /> Have a promo code?
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            placeholder="Enter code here"
                                            className="flex-1 h-12 bg-white border border-slate-200 rounded-xl px-4 font-bold text-slate-900 focus:border-emerald-500 outline-none uppercase transition-all"
                                            disabled={!!discountInfo}
                                        />
                                        {!discountInfo ? (
                                            <button 
                                                onClick={handleApplyCoupon}
                                                disabled={validatingCoupon || !couponCode}
                                                className="h-12 px-6 bg-slate-900 text-white rounded-xl font-bold text-sm disabled:opacity-50 transition-all hover:bg-emerald-600"
                                            >
                                                {validatingCoupon ? "Checking..." : "Apply"}
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => { setDiscountInfo(null); setCouponCode(""); }}
                                                className="h-12 px-6 bg-rose-50 text-rose-600 rounded-xl font-bold text-sm transition-all hover:bg-rose-100"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* POLICIES */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold text-slate-900">2. Things to know</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { t: "Check-in time", d: "Standard arrival after 12:00 PM", i: <Clock /> },
                                        { t: "Quiet hours", d: "Please keep noise down after 10:00 PM", i: <Zap /> },
                                        { t: "No smoking", d: "A smoke-free environment for all", i: <Info /> },
                                        { t: "House rules", d: "Please respect the property and amenities", i: <CheckCircle /> }
                                    ].map((rule, i) => (
                                        <div key={i} className="flex gap-4 p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                                            <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center shrink-0">
                                                {rule.i}
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-sm text-slate-900">{rule.t}</h4>
                                                <p className="text-xs text-slate-500 leading-none">{rule.d}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* RIGHT COLUMN: PRICE SUMMARY */}
                        <aside className="lg:col-span-5 lg:sticky lg:top-24">
                            <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-xl">
                                <div className="p-6 md:p-8 space-y-8">
                                    {/* LISTING PREVIEW */}
                                    <div className="flex gap-4 items-center border-b border-slate-100 pb-8">
                                        <img src={fixImg(listing.image)} className="w-24 h-24 rounded-2xl object-cover border border-slate-100" alt="" />
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-lg text-slate-900 leading-tight">{listing.title}</h3>
                                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{variant ? variant.name : "Standard Stays"}</p>
                                        </div>
                                    </div>

                                    {/* PRICE BREAKDOWN */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Price Details</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-slate-600 font-medium">
                                                <span>₹{pricePerNight.toLocaleString()} x {nights || 0} nights</span>
                                                <span>₹{baseAmount.toLocaleString()}</span>
                                            </div>
                                            {discountInfo && (
                                                <div className="flex justify-between text-emerald-600 font-bold">
                                                    <span>Discount ({Math.round(discountInfo.discountPercentage * 100)}%)</span>
                                                    <span>-₹{discountAmount.toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-slate-600 font-medium">
                                                <span>GST {isVehicle ? "(Waived for Vehicles)" : `(${gstRate * 100}%)`}</span>
                                                {isVehicle ? <span className="text-emerald-500 font-bold">Waived</span> : <span>₹{gst.toLocaleString()}</span>}
                                            </div>
                                            <div className="flex justify-between text-slate-600 font-medium">
                                                <span>Service Fee</span>
                                                <span>₹{serviceFee.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* TOTAL */}
                                    <div className="pt-6 border-t border-slate-100 flex justify-between items-center mb-4">
                                        <span className="text-xl font-bold text-slate-900">Total</span>
                                        <span className="text-3xl font-bold text-slate-900">₹{totalAmount.toLocaleString()}</span>
                                    </div>

                                    <button
                                        onClick={reserve}
                                        disabled={blockedDates}
                                        className="w-full h-16 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest transition-all disabled:bg-slate-200 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/20 active:scale-95"
                                    >
                                        Reserve Now
                                    </button>

                                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">
                                        <Shield size={12} className="text-emerald-500" /> Secure Payment Guaranteed
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </WayzzaLayout>
    );
}