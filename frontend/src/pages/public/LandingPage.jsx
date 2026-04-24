import React, { useEffect, useState } from "react";
import { WayzzaLayout, WayzzaHotelItem, WayzzaSkeleton } from "../../WayzzaUI.jsx";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, MapPin, Calendar, Users, ChevronRight,
    Shield, Sparkles, Globe, Compass,
    ArrowRight, Star, Heart, Award,
    Tent, Bike, Car, Music, Zap, Play, Home,
    Instagram, Twitter, Facebook, Mail, Phone,
    CheckCircle2, Cpu, MessageSquare, Terminal,
    Send, BrainCircuit, Waves, Landmark
} from "lucide-react";

import { api } from "../../utils/api.js";
import { useCurrency } from "../../CurrencyContext.jsx";
import { useToast } from "../../ToastContext.jsx";
import SEO from "../../components/SEO.jsx";

const CATEGORIES = [
    { label: "Villas", key: "hotel", icon: Home },
    { label: "Bikes", key: "bike", icon: Bike },
    { label: "Cars", key: "car", icon: Car },
    { label: "Secrets", key: "experience", icon: Sparkles }
];

const DESTINATIONS = [
    { name: "Varkala Cliff", properties: "45+ Properties", image: "/images/varkala_cliff.png", className: "md:col-span-8 md:row-span-2 h-[400px] md:h-full" },
    { name: "Edava", properties: "20+ Properties", image: "/images/varkala_edava.png", className: "md:col-span-4 h-[300px] md:h-[284px]" },
    { name: "Odayam", properties: "15+ Properties", image: "/images/varkala_odayam.png", className: "md:col-span-4 h-[300px] md:h-[284px]" },
];

export default function LandingPage() {
    const navigate = useNavigate();
    const { formatPrice } = useCurrency();
    const { showToast } = useToast();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("hotel");
    const [search, setSearch] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState(1);
    
    // Newsletter State
    const [newsletterEmail, setNewsletterEmail] = useState("");
    const [newsletterLoading, setNewsletterLoading] = useState(false);

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        if (!newsletterEmail) return;
        setNewsletterLoading(true);
        try {
            const data = await api.subscribeNewsletter(newsletterEmail);
            if (data.ok) {
                showToast("Subscribed to the Wayzza Newsletter!", "success");
                setNewsletterEmail("");
            } else {
                showToast(data.message || "Failed to subscribe.", "error");
            }
        } catch (err) {
            showToast("Network error.", "error");
        }
        setNewsletterLoading(false);
    };

    // AI Section Interactive State
    const [aiPrompt, setAiPrompt] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        setLoading(true);
        api.getListings({ category: tab, limit: 8 })
            .then((data) => {
                const list = data.rows || data;
                if (Array.isArray(list)) setListings(list);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [tab]);

    const fixImg = (img) => {
        if (!img) return "/images/varkala_hero.png";
        if (img.startsWith("http")) return img;
        const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
        return `${BASE}/uploads/${img}`;
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        params.set("category", tab);
        if (search) params.set("location", search);
        if (checkIn) params.set("start", checkIn);
        if (checkOut) params.set("end", checkOut);
        if (guests) params.set("guests", guests);
        navigate(`/listings?${params.toString()}`);
    };

    const trendingList = listings.slice(0, 8);

    return (
        <WayzzaLayout noPadding hideFooter>
            <SEO title="Escape the ordinary" />
            <div className="bg-white font-sans text-slate-900 selection:bg-emerald-50 selection:text-emerald-900 leading-relaxed antialiased">

                {/* ════ SECTION: PREMIUM HERO ════ */}
                <header className="relative h-[85vh] min-h-[700px] flex flex-col items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <motion.div
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 2.5, ease: "easeOut" }}
                            className="w-full h-full"
                        >
                            <img
                                src="/images/varkala_hero.png"
                                alt="Luxury Sanctuary"
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white" />
                    </div>

                    <div className="relative z-10 w-full max-w-7xl mx-auto px-10 text-center space-y-16">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
                                <Sparkles size={12} className="text-emerald-400" /> Curated Luxury
                            </div>
                            <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] drop-shadow-2xl">
                                Escape the ordinary <br />
                                <span className="text-emerald-400 italic">gracefully.</span>
                            </h1>
                            <p className="text-lg md:text-xl font-medium text-white/90 max-w-2xl mx-auto drop-shadow-lg leading-relaxed">
                                Handpicked sanctuaries and high-performance mobility curated <br className="hidden md:block" /> for the modern explorer.
                            </p>
                        </motion.div>

                        {/* PILL SEARCH ORCHESTRATOR */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="max-w-5xl mx-auto w-full px-4"
                        >
                            <div className="bg-white/90 backdrop-blur-2xl rounded-[40px] p-3 shadow-[0_40px_100px_rgba(0,0,0,0.15)] border border-white/50 flex flex-col md:flex-row items-center gap-2">

                                {/* Location */}
                                <div className="flex-[1.5] w-full px-10 py-5 rounded-[32px] hover:bg-slate-50/50 transition-all text-left cursor-pointer group">
                                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-1.5 group-hover:text-emerald-600 transition-colors">Destinations</p>
                                    <input
                                        placeholder="Where to go?"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full bg-transparent border-none outline-none font-bold text-slate-900 text-lg p-0 placeholder:text-slate-300"
                                    />
                                </div>

                                <div className="hidden md:block w-px h-12 bg-slate-200/50" />

                                {/* Check In/Out */}
                                <div className="flex-1 w-full px-10 py-5 rounded-[32px] hover:bg-slate-50/50 transition-all text-left cursor-pointer group">
                                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-1.5 group-hover:text-emerald-600 transition-colors">Timeframe</p>
                                    <div className="flex items-center gap-3">
                                        <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="bg-transparent border-none outline-none font-bold text-slate-900 text-sm p-0 w-28 cursor-pointer" />
                                        <span className="text-slate-300">-</span>
                                        <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="bg-transparent border-none outline-none font-bold text-slate-900 text-sm p-0 w-28 cursor-pointer" />
                                    </div>
                                </div>

                                <div className="hidden md:block w-px h-12 bg-slate-200/50" />

                                {/* Guests */}
                                <div className="flex-1 w-full px-10 py-5 rounded-[32px] hover:bg-slate-50/50 transition-all text-left cursor-pointer group">
                                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-1.5 group-hover:text-emerald-600 transition-colors">Guests</p>
                                    <div className="flex items-center gap-3">
                                        <Users size={16} className="text-slate-400" />
                                        <input
                                            type="number"
                                            min="1"
                                            value={guests}
                                            onChange={e => setGuests(e.target.value)}
                                            className="w-full bg-transparent border-none outline-none font-bold text-slate-900 text-lg p-0 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* Search Button */}
                                <button onClick={handleSearch} className="w-full md:w-auto bg-slate-900 text-white px-10 py-6 rounded-[32px] shadow-2xl shadow-slate-900/20 transition-all hover:bg-emerald-600 hover:scale-[1.02] active:scale-95 group flex items-center justify-center gap-4">
                                    <Search size={22} strokeWidth={3} className="transition-transform group-hover:rotate-12" />
                                    <span className="font-black uppercase tracking-[0.3em] text-[11px]">Explore</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Scroll Indicator */}
                    <motion.div 
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 border border-slate-300/30 rounded-full p-2"
                    >
                        <div className="w-1 h-3 bg-slate-300 rounded-full" />
                    </motion.div>
                </header>

                {/* ════ TAB STRIP ════ */}
                <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20 mb-32 flex flex-wrap items-center justify-center gap-6">
                    {CATEGORIES.map(c => (
                        <button
                            key={c.key}
                            onClick={() => {
                                if (c.key === 'experience') navigate('/experiences');
                                else setTab(c.key);
                            }}
                            className={`group flex items-center gap-4 px-10 py-5 rounded-[32px] transition-all duration-500 border ${tab === c.key ? 'bg-slate-900 border-slate-900 text-white shadow-[0_20px_40px_rgba(0,0,0,0.2)] -translate-y-2' : 'bg-white/80 backdrop-blur-md border-slate-100 text-slate-400 hover:border-emerald-200 hover:text-slate-900 hover:-translate-y-1'}`}
                        >
                            <c.icon size={18} className={`${tab === c.key ? 'text-emerald-400' : 'group-hover:text-emerald-500'} transition-colors`} />
                            <span className="text-[14px] font-bold uppercase tracking-[0.2em]">{c.label}</span>
                        </button>
                    ))}
                </div>

                {/* ════ TRENDING COLLECTION ════ */}
                <section className="px-6 max-w-7xl mx-auto mb-32">
                    <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16 border-b border-slate-100 pb-12">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-emerald-500 font-black uppercase tracking-[0.4em] text-[10px]">
                                <Award size={14} /> Curated Selection
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">Featured collection.</h2>
                            <p className="text-slate-400 text-lg font-medium">Directly from our verified local hosts.</p>
                        </div>
                        <Link to="/listings" className="group h-14 px-8 bg-slate-50 text-slate-950 hover:bg-slate-900 hover:text-white rounded-2xl font-bold text-xs flex items-center gap-3 transition-all">
                            View all inventory <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[1, 2, 3, 4].map(i => <WayzzaSkeleton key={i} className="h-80 rounded-3xl" />)}
                        </div>
                    ) : trendingList.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-sm bg-slate-50 rounded-[32px] border border-slate-100 flex items-center justify-center min-h-[300px]">
                                No {CATEGORIES.find(c => c.key === tab)?.label.toLowerCase() || "items"} available at the moment.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {trendingList.map(l => (
                                    <motion.div key={l._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                        <WayzzaHotelItem
                                            hotel={{
                                                id: l._id,
                                                name: l.title,
                                                location: l.location || "Varkala Coast",
                                                price: l.price,
                                                image: fixImg(l.image),
                                                wifiSpeed: l.wifiSpeed || 0
                                            }}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                </section>

                {/* ════ DESTINATIONS MASONRY ════ */}
                <section className="py-32 bg-slate-50 px-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent" />
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row items-end justify-between gap-10 mb-20">
                            <div className="space-y-4">
                                <p className="text-emerald-500 font-black uppercase tracking-[0.4em] text-[10px]">Territories</p>
                                <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-slate-900">Where we operate.</h2>
                            </div>
                            <p className="text-slate-400 font-medium max-w-sm text-lg leading-relaxed">
                                Our network spans unique ecosystems, each personally verified for soul and security.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                            {DESTINATIONS.map((d, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`group cursor-pointer relative rounded-[56px] overflow-hidden shadow-2xl-soft transition-all duration-700 hover:shadow-3xl ${d.className}`}
                                    onClick={() => navigate(`/listings?location=${d.name}`)}
                                >
                                    <img src={d.image} alt={d.name} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 group-hover:rotate-1" />
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                    
                                    <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
                                        <div className="space-y-2">
                                            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-emerald-400">{d.properties}</p>
                                            <h3 className="font-bold text-4xl text-white tracking-tight">{d.name}</h3>
                                        </div>
                                        <div className="w-16 h-16 rounded-[24px] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-emerald-400 transition-all duration-500">
                                            <ArrowRight size={24} className="text-white group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════ TRUST STRIP ════ */}
                <section className="py-32 px-6 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: CheckCircle2, title: "Verified Stays", desc: "Every property is personally inspected by our team for absolute quality.", color: "emerald" },
                            { icon: Compass, title: "Local Secrets", desc: "Access hidden beaches and cafes curated by our native guides.", color: "blue" },
                            { icon: Sparkles, title: "Wayzza AI", desc: "Plan your entire stay + vehicle combination in seconds with our AI engine.", color: "indigo" }
                        ].map((item, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group p-10 bg-white border border-slate-100 rounded-[48px] hover:border-slate-300 hover:shadow-2xl-soft transition-all duration-500"
                            >
                                <div className={`w-16 h-16 bg-slate-50 rounded-[24px] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                                    <item.icon size={28} strokeWidth={1.5} className="text-slate-900" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">{item.title}</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ════ SECTION: AI TRIP PLANNER ════ */}
                <section className="py-24 px-6 bg-[#030a07] text-white overflow-hidden relative">
                    {/* Rich background gradient */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-[-20%] left-[20%] w-[60%] h-[80%] bg-emerald-500/10 blur-[140px] rounded-full" />
                        <div className="absolute bottom-0 right-[10%] w-[40%] h-[50%] bg-emerald-700/8 blur-[120px] rounded-full" />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/30 via-transparent to-transparent" />
                    </div>

                    <div className="max-w-5xl mx-auto relative z-10">

                        {/* ── Section Header ── */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16 space-y-6"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/25 rounded-full">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">Wayzza AI · Live</span>
                            </div>
                            <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white leading-tight">
                                Your trip, planned by AI.
                            </h2>
                            <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
                                Describe your vibe in plain English. Our AI instantly finds the perfect villa, vehicle, and local experiences.
                            </p>
                        </motion.div>

                        {/* ── Chat Card (full width, rich) ── */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.15 }}
                            className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
                        >
                            {/* Chat titlebar */}
                            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/8 bg-white/[0.03]">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-rose-500/70" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                                </div>
                                <div className="flex-1 flex items-center justify-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Wayzza AI Trip Planner</span>
                                </div>
                            </div>

                            {/* Messages area */}
                            <div className="p-8 space-y-6 min-h-[280px]">
                                {/* User message */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="flex justify-end"
                                >
                                    <div className="bg-slate-700/80 rounded-2xl rounded-tr-sm px-5 py-3.5 max-w-lg">
                                        <p className="text-sm text-white/90 leading-relaxed">
                                            I want a quiet clifftop villa in Varkala for 3 nights, with a motorbike and tips for hidden cafes. Budget around ₹15,000/night.
                                        </p>
                                    </div>
                                </motion.div>

                                {/* AI response */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.25 }}
                                    className="flex items-start gap-4"
                                >
                                    <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                                        <Sparkles size={15} className="text-slate-950" />
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <p className="text-sm text-white/70">Here's your curated Varkala plan 🌿</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {[
                                                { emoji: "🏡", title: "Sea Cliff Retreat", sub: "₹12,500 · night · Clifftop", tag: "Best match" },
                                                { emoji: "🏍️", title: "Royal Enfield 350", sub: "₹850 · day · Includes helmet", tag: "Available" },
                                                { emoji: "☕", title: "Secret Café Trail", sub: "6 hidden spots · 2.4km route", tag: "Exclusive" },
                                            ].map((card, i) => (
                                                <div key={i} className="bg-white/[0.05] border border-white/10 rounded-2xl p-4 space-y-2 hover:border-emerald-500/30 transition-colors cursor-default">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xl">{card.emoji}</span>
                                                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full">{card.tag}</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-white">{card.title}</p>
                                                    <p className="text-[11px] text-white/40 leading-snug">{card.sub}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-emerald-400/70 font-medium">
                                            <CheckCircle2 size={13} className="text-emerald-500" />
                                            3-night stay · ₹42,550 total · Instant booking available
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Input bar + suggestions */}
                            <div className="border-t border-white/8 p-5 space-y-3 bg-white/[0.02]">
                                {/* Suggestion pills */}
                                <div className="flex flex-wrap gap-2">
                                    {["Beachfront villa Varkala 🌊", "Budget under ₹5k", "Couples getaway", "Solo adventure 🏍️"].map((pill, i) => (
                                        <button
                                            key={i}
                                            onClick={() => navigate('/ai-trip-planner')}
                                            className="text-[11px] font-semibold text-white/50 border border-white/10 rounded-full px-3 py-1.5 hover:border-emerald-500/40 hover:text-emerald-400 transition-all"
                                        >
                                            {pill}
                                        </button>
                                    ))}
                                </div>
                                {/* Input */}
                                <div
                                    onClick={() => navigate('/ai-trip-planner')}
                                    className="flex items-center gap-3 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-emerald-500/30 rounded-2xl px-5 py-3.5 cursor-pointer transition-all group"
                                >
                                    <MessageSquare size={16} className="text-white/25 shrink-0" />
                                    <span className="flex-1 text-sm text-white/25">Describe your dream trip...</span>
                                    <div className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 rounded-xl px-4 py-2 transition-colors shrink-0">
                                        <span className="text-[11px] font-black text-slate-950 uppercase tracking-wider">Plan it</span>
                                        <ArrowRight size={13} className="text-slate-950 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* ── Bottom CTA strip ── */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-12 pt-10 border-t border-white/8"
                        >
                            <div className="flex items-center gap-10">
                                {[
                                    { value: "< 2s", label: "Response time" },
                                    { value: "98%", label: "Accuracy" },
                                    { value: "500+", label: "Trips planned" },
                                ].map((s, i) => (
                                    <div key={i} className="text-center">
                                        <p className="text-xl font-black text-emerald-400">{s.value}</p>
                                        <p className="text-[10px] text-slate-600 uppercase tracking-wider font-bold">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => navigate('/ai-trip-planner')}
                                className="group h-12 px-8 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg shadow-emerald-500/20 shrink-0"
                            >
                                Open AI Planner
                                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>

                    </div>
                </section>



                <footer className="bg-slate-950 pt-16 pb-8 px-6 overflow-hidden relative border-t border-white/5">
                    {/* Subtle Watermark */}
                    <div className="absolute -bottom-6 -right-6 text-[10vw] font-black text-white/[0.02] select-none pointer-events-none uppercase tracking-tighter">
                        Wayzza
                    </div>

                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16 relative z-10">
                            {/* Brand DNA */}
                            <div className="md:col-span-4 space-y-6">
                                <div className="space-y-3">
                                    <h2 className="text-xl font-bold tracking-tighter text-white uppercase">Wayzza<span className="text-emerald-500">.</span></h2>
                                    <p className="text-white/30 text-xs leading-relaxed font-light max-w-[240px]">
                                        "Defining verified inventory and soulful exploration."
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <form onSubmit={handleNewsletterSubmit} className={`flex bg-white/5 rounded-full p-1 border border-white/10 max-w-xs transition-all focus-within:border-emerald-500 ${newsletterLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <input 
                                            type="email" 
                                            placeholder="Newsletter" 
                                            value={newsletterEmail}
                                            onChange={e => setNewsletterEmail(e.target.value)}
                                            className="bg-transparent border-none outline-none flex-1 px-4 text-[10px] py-1 text-white/70 placeholder:text-white/20" 
                                        />
                                        <button type="submit" disabled={newsletterLoading} className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-emerald-400 transition-colors">
                                            <ArrowRight size={10} />
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Links Grid */}
                            <div className="md:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
                                <div className="space-y-4">
                                    <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-emerald-500/50">Protocol</p>
                                    <ul className="space-y-2">
                                        <li><Link to="/about" className="text-[11px] font-medium text-white/50 hover:text-white transition-colors uppercase tracking-tight">The Method</Link></li>
                                        <li><Link to="/about" className="text-[11px] font-medium text-white/50 hover:text-white transition-colors uppercase tracking-tight">Verification</Link></li>
                                        <li><Link to="/partner-register" className="text-[11px] font-medium text-white/50 hover:text-white transition-colors uppercase tracking-tight">Partners</Link></li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-emerald-500/50">Inventory</p>
                                    <ul className="space-y-2">
                                        {['Villas', 'Mobility', 'Secrets'].map(l => (
                                            <li key={l}><Link to="/listings" className="text-[11px] font-medium text-white/50 hover:text-white transition-colors uppercase tracking-tight">{l}</Link></li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-emerald-500/50">Connect</p>
                                    <ul className="space-y-2">
                                        <li><a href="#" className="flex items-center gap-2 text-[11px] font-medium text-white/50 hover:text-white transition-colors uppercase tracking-tight"><Instagram size={11} /> Instagram</a></li>
                                        <li><a href="#" className="flex items-center gap-2 text-[11px] font-medium text-white/50 hover:text-white transition-colors uppercase tracking-tight"><Mail size={11} /> Contact</a></li>
                                    </ul>
                                </div>
                                <div className="space-y-2 bg-white/[0.03] backdrop-blur-md rounded-2xl p-4 border border-white/10 self-start">
                                    <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-[9px] uppercase tracking-widest">
                                        <Shield size={14} /> Secured
                                    </div>
                                    <p className="text-[9px] text-white/30 leading-relaxed mt-2">Verified encryption enabled.</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">
                            <div className="flex gap-6">
                                <span>Wayzza Travels © 2026</span>
                                <Link to="/privacy" className="hover:text-white/60">Privacy</Link>
                                <Link to="/terms" className="hover:text-white/60">Terms</Link>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5"><Globe size={10} /> Gateway</span>
                                <span className="flex items-center gap-1.5"><Landmark size={10} /> Varkala</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </WayzzaLayout>
    );
}
