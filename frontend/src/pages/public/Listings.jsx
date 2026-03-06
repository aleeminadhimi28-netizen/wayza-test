import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { WayzaLayout } from "../../WayzaUI.jsx";
import { useAuth } from "../../AuthContext.jsx";
import {
    Search, Heart, MapPin, ChevronLeft, ChevronRight,
    Hotel, Bike, Car, Anchor, Calendar,
    ChevronDown, Wifi, Coffee, Shield, Navigation,
    CheckCircle, X, Filter, ThumbsUp, Star, ArrowRight, Sparkles, SlidersHorizontal
} from "lucide-react";

import { api } from "../../utils/api.js";

const CATEGORIES = [
    { id: 'hotel', label: 'Stays', icon: Hotel },
    { id: 'bike', label: 'Bikes', icon: Bike },
    { id: 'car', label: 'Cars', icon: Car },
    { id: 'activity', label: 'Experiences', icon: Anchor },
];

const SORT_OPTIONS = [
    { value: "", label: "Our Top Picks" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "new", label: "Newest First" },
];

function getRatingLabel(score) {
    if (score >= 9.0) return "Exceptional";
    if (score >= 8.5) return "Excellent";
    if (score >= 7.5) return "Very Good";
    if (score >= 6.5) return "Good";
    return "Pleasant";
}

export default function Listings() {
    const [params, setParams] = useSearchParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const realToken = token || localStorage.getItem("token");

    const [rows, setRows] = useState([]);
    const [saved, setSaved] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sort, setSort] = useState(params.get("sort") || "");
    const [category, setCategory] = useState(params.get("category") || "hotel");

    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [searchInput, setSearchInput] = useState(params.get("location") || "");
    const [checkInInput, setCheckInInput] = useState(params.get("start") || "");
    const [checkOutInput, setCheckOutInput] = useState(params.get("end") || "");

    const location = params.get("location") || "";
    const start = params.get("start") || "";
    const end = params.get("end") || "";

    const fixImg = (img) => {
        if (!img) return "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80";
        if (img.startsWith("http")) return img;
        // Use the base URL for uploads
        const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
        return `${BASE}/uploads/${img}`;
    };

    async function loadWishlist() {
        if (!realToken) return;
        try {
            const data = await api.getWishlist();
            if (data.ok) {
                setSaved(new Set(data.data?.map(x => x.listingId) || []));
            }
        } catch { }
    }

    async function loadListings() {
        setLoading(true);
        try {
            const data = await api.getListings({
                location, minPrice, maxPrice, sort, category, start, end, page, limit: 10
            });
            setRows(data.rows || []);
            setPages(data.pages || 1);
            setTotal(data.total || (data.rows?.length || 0));
        } catch { }
        setLoading(false);
    }

    async function toggleWishlist(e, listingId) {
        e.preventDefault();
        e.stopPropagation();
        if (!realToken) { navigate("/login"); return; }

        const data = await api.toggleWishlist({ listingId });
        if (data.ok) {
            setSaved(prev => {
                const s = new Set(prev);
                if (s.has(listingId)) s.delete(listingId); else s.add(listingId);
                return s;
            });
        }
    }

    function handleSearch() {
        const p = new URLSearchParams(params);
        if (searchInput) p.set("location", searchInput); else p.delete("location");
        if (checkInInput) p.set("start", checkInInput); else p.delete("start");
        if (checkOutInput) p.set("end", checkOutInput); else p.delete("end");
        p.set("category", category);
        setParams(p);
    }

    useEffect(() => {
        loadListings();
        loadWishlist();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [location, minPrice, maxPrice, sort, category, page, start, end]);

    useEffect(() => { setPage(1); }, [location, minPrice, maxPrice, sort, category]);

    const mockScore = (id) => {
        const hash = id?.split("").reduce((a, c) => a + c.charCodeAt(0), 0) || 0;
        return 7.0 + (hash % 30) / 10;
    };
    const mockReviewCount = (id) => {
        const hash = id?.split("").reduce((a, c) => a + c.charCodeAt(0), 0) || 0;
        return 18 + (hash % 220);
    };

    const catLabel = CATEGORIES.find(c => c.id === category)?.label || "Properties";

    return (
        <WayzaLayout noPadding>
            <div className="bg-slate-50 min-h-screen font-sans selection:bg-emerald-100 selection:text-emerald-900">

                {/* ─── SEARCH & FILTER STRIP ─── */}
                <div className="bg-white border-b border-slate-200 sticky top-24 z-40 shadow-sm">
                    <div className="max-w-[1200px] mx-auto px-4 sm:px-6">

                        <div className="py-3">
                            <div className="grid grid-cols-1 sm:flex sm:flex-row gap-2">
                                <div className="relative flex-[2] min-w-0">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        value={searchInput}
                                        onChange={e => setSearchInput(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && handleSearch()}
                                        placeholder="Where are you going?"
                                        className="w-full h-11 pl-9 pr-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-white transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 sm:contents gap-2">
                                    <div className="relative min-w-0">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="date"
                                            value={checkInInput}
                                            onChange={e => setCheckInInput(e.target.value)}
                                            className="w-full h-11 pl-9 pr-2 text-[11px] sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 bg-white transition-all"
                                        />
                                    </div>
                                    <div className="relative min-w-0">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="date"
                                            value={checkOutInput}
                                            onChange={e => setCheckOutInput(e.target.value)}
                                            className="w-full h-11 pl-9 pr-2 text-[11px] sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 bg-white transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 sm:flex gap-2">
                                    <button
                                        onClick={handleSearch}
                                        className="h-11 px-6 bg-slate-900 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-md active:scale-95"
                                    >
                                        <Search size={16} />
                                        Search
                                    </button>
                                    <Link
                                        to="/explore-map"
                                        className="h-11 px-6 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-sm active:scale-95"
                                    >
                                        <Navigation size={16} className="text-emerald-500" />
                                        <span className="hidden xs:inline">Map</span>
                                        <span className="xs:hidden">Map</span>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Categories + Sort */}
                        <div className="flex items-center justify-between gap-4 pb-3 overflow-x-auto no-scrollbar">
                            <div className="flex gap-2 shrink-0">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setCategory(cat.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${category === cat.id
                                            ? "bg-slate-900 text-white shadow-md"
                                            : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                                            }`}
                                    >
                                        <cat.icon size={14} />
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <div className="relative">
                                    <select
                                        value={sort}
                                        onChange={e => setSort(e.target.value)}
                                        className="h-9 pl-3 pr-8 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer text-slate-700 font-medium"
                                    >
                                        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                                <button
                                    onClick={() => setShowFilters(f => !f)}
                                    className={`h-9 px-4 border rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${showFilters ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-slate-300 text-slate-600 hover:border-emerald-500 hover:text-emerald-600'}`}
                                >
                                    <SlidersHorizontal size={14} />
                                    Filters
                                </button>
                            </div>
                        </div>

                        {/* Filter panel */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <div className="py-3 flex flex-wrap gap-4 border-t border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-slate-600">Budget (₹/night):</span>
                                            <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-24 h-9 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 text-center" />
                                            <span className="text-slate-400">—</span>
                                            <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-24 h-9 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 text-center" />
                                        </div>
                                        {(minPrice || maxPrice) && (
                                            <button onClick={() => { setMinPrice(""); setMaxPrice(""); }} className="h-9 px-3 text-sm text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors font-medium">
                                                <X size={14} /> Clear
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ─── RESULTS ─── */}
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">

                    {/* Result summary */}
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                {location
                                    ? <>{location}: <span className="text-emerald-600">{loading ? "..." : total}</span> {catLabel.toLowerCase()} found</>
                                    : <>{catLabel}: <span className="text-emerald-600">{loading ? "..." : total}</span> available</>
                                }
                            </h1>
                            {(start || end) && (
                                <p className="text-sm text-slate-400 mt-0.5">
                                    {start && `Check-in: ${start}`}{start && end && " · "}{end && `Check-out: ${end}`}
                                </p>
                            )}
                        </div>
                        {!loading && total > 0 && (
                            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
                                <CheckCircle size={16} className="text-emerald-500" />
                                <span>All verified by Wayza</span>
                            </div>
                        )}
                    </div>

                    {/* Cards */}
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex h-52 animate-pulse">
                                        <div className="w-64 shrink-0 bg-slate-200" />
                                        <div className="flex-1 p-5 space-y-3">
                                            <div className="h-4 bg-slate-100 rounded-full w-16" />
                                            <div className="h-5 bg-slate-100 rounded-full w-1/2" />
                                            <div className="h-4 bg-slate-100 rounded-full w-1/3" />
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        ) : rows.length === 0 ? (
                            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-slate-200 p-20 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                    <Search size={28} className="text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">No properties found</h3>
                                <p className="text-slate-400 text-sm mb-6">Try adjusting your filters or explore a different destination.</p>
                                <button
                                    onClick={() => { setMinPrice(""); setMaxPrice(""); navigate(`/listings?category=${category}`); }}
                                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors"
                                >
                                    Clear all filters
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                {rows.map((l, i) => {
                                    const score = mockScore(l._id);
                                    const reviewCount = mockReviewCount(l._id);
                                    const minVariantPrice = l.variants?.length
                                        ? Math.min(...l.variants.map(v => v.price || 0))
                                        : l.price || 0;
                                    const isSaved = saved.has(l._id);

                                    return (
                                        <motion.div
                                            key={l._id}
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            onClick={() => navigate(`/listing/${l._id}`)}
                                            className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col sm:flex-row hover:shadow-xl hover:shadow-slate-200/80 hover:border-emerald-200 transition-all duration-300 cursor-pointer group"
                                        >
                                            {/* Image */}
                                            <div className="relative sm:w-72 h-56 sm:h-auto shrink-0 overflow-hidden">
                                                <img
                                                    src={fixImg(l.image)}
                                                    alt={l.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                                {/* Wishlist */}
                                                <button
                                                    onClick={e => toggleWishlist(e, l._id)}
                                                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:scale-110 transition-transform z-10"
                                                >
                                                    <Heart size={16} className={isSaved ? "fill-rose-500 text-rose-500" : "text-slate-400 group-hover:text-slate-600"} />
                                                </button>
                                                {/* Verified */}
                                                {l.approved && (
                                                    <div className="absolute bottom-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
                                                        <CheckCircle size={11} /> Verified
                                                    </div>
                                                )}
                                                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                                                    {/* Category label */}
                                                    <div className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide w-max shadow-sm">
                                                        {CATEGORIES.find(c => c.id === l.category)?.label || "Stay"}
                                                    </div>
                                                    {/* Superhost */}
                                                    {score >= 8.5 && reviewCount > 50 && (
                                                        <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md w-max">
                                                            <Sparkles size={11} className="text-slate-900" /> Superhost
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="flex flex-1 flex-col sm:flex-row p-5 gap-4">
                                                <div className="flex-1 space-y-2.5">
                                                    {/* Title */}
                                                    <h3 className="text-slate-900 font-bold text-lg leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                                                        {l.title}
                                                    </h3>

                                                    {/* Location */}
                                                    <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                                                        <MapPin size={14} className="text-emerald-500 shrink-0" />
                                                        <span>{l.location || "Kerala, India"}</span>
                                                    </div>

                                                    {/* Amenity tags */}
                                                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                                                        {[
                                                            { icon: Wifi, text: "Free WiFi" },
                                                            { icon: Coffee, text: "Breakfast available" },
                                                            { icon: Shield, text: "Free cancellation" },
                                                        ].map((a, idx) => (
                                                            <span key={idx} className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full font-medium">
                                                                <a.icon size={11} />
                                                                {a.text}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    {/* Star rating preview */}
                                                    <div className="flex items-center gap-1.5 pt-0.5">
                                                        {[1, 2, 3, 4, 5].map(s => (
                                                            <Star key={s} size={13} className={s <= Math.round(score / 2) ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-200"} />
                                                        ))}
                                                        <span className="text-xs text-slate-400 ml-1">{reviewCount} reviews</span>
                                                    </div>

                                                    {/* Variants */}
                                                    {l.variants?.length > 0 && (
                                                        <p className="text-xs text-slate-400 font-medium">{l.variants.length} room type{l.variants.length > 1 ? "s" : ""} available</p>
                                                    )}
                                                </div>

                                                {/* Price + CTA */}
                                                <div className="sm:w-44 shrink-0 flex flex-row sm:flex-col justify-between sm:justify-end sm:items-end items-center gap-4 sm:border-l sm:border-slate-100 sm:pl-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">

                                                    {/* Score badge */}
                                                    <div className="flex flex-col items-end gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-semibold text-slate-600 hidden sm:block">{getRatingLabel(score)}</span>
                                                            <div className="w-9 h-9 bg-emerald-600 text-white text-sm font-bold rounded-tl-xl rounded-tr-xl rounded-bl-xl flex items-center justify-center shadow-md">
                                                                {score.toFixed(1)}
                                                            </div>
                                                        </div>
                                                        <span className="text-[11px] text-slate-400 hidden sm:block">{reviewCount} reviews</span>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="text-right">
                                                        {minVariantPrice > 0 ? (
                                                            <>
                                                                <p className="text-xs text-slate-400 hidden sm:block">Starting from</p>
                                                                <p className="text-2xl font-bold text-slate-900">₹{minVariantPrice.toLocaleString()}</p>
                                                                <p className="text-xs text-slate-400">per night</p>
                                                                <p className="text-[11px] text-emerald-600 font-medium">incl. taxes & fees</p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <p className="text-sm font-bold text-slate-900">Price on request</p>
                                                                <p className="text-xs text-slate-400">Contact host</p>
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* CTA */}
                                                    <button
                                                        onClick={e => { e.stopPropagation(); navigate(`/listing/${l._id}`); }}
                                                        className="hidden sm:flex items-center justify-center gap-2 mt-1 w-full px-4 py-2.5 bg-slate-900 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-all active:scale-95 group/btn"
                                                    >
                                                        See availability
                                                        <ArrowRight size={15} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ─── PAGINATION ─── */}
                    {!loading && pages > 1 && (
                        <div className="mt-8 flex items-center justify-center gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                                const pg = i + 1;
                                return (
                                    <button
                                        key={pg}
                                        onClick={() => { setPage(pg); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${pg === page ? "bg-slate-900 text-white shadow-lg" : "border border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600"}`}
                                    >
                                        {pg}
                                    </button>
                                );
                            })}
                            {pages > 7 && <span className="text-slate-300 px-1 font-bold">···</span>}
                            <button
                                disabled={page >= pages}
                                onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* ─── TRUST STRIP ─── */}
                    <div className="mt-12 pt-8 border-t border-slate-200">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                { icon: Shield, title: "Secure Payments", desc: "Your payment is protected with end-to-end encryption." },
                                { icon: CheckCircle, title: "Verified Listings", desc: "Every stay is reviewed and approved by our quality team." },
                                { icon: ThumbsUp, title: "Free Cancellation", desc: "Flexible cancellation policies on most bookings." }
                            ].map((b, i) => (
                                <div key={i} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                                        <b.icon size={20} className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{b.title}</p>
                                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{b.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </WayzaLayout>
    );
}
