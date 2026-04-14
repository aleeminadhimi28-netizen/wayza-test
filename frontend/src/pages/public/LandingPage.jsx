import React, { useEffect, useState } from "react";
import { WayzaLayout, WayzaHotelItem, WayzaSkeleton } from "../../WayzaUI.jsx";
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
    { name: "Varkala Cliff", properties: "45+ Properties", image: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=800&q=80", colSpan: 2 },
    { name: "Edava", properties: "20+ Properties", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80", colSpan: 1 },
    { name: "Bali", properties: "Exploring", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80", colSpan: 1 },
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
                showToast("Subscribed to the Wayza Newsletter!", "success");
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
        api.getListings()
            .then((data) => {
                const list = data.rows || data;
                if (Array.isArray(list)) setListings(list);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const fixImg = (img) => {
        if (!img) return "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80";
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

    const trendingList = listings.filter(l => (l.category === "hotel" || !l.category)).slice(0, 8);

    return (
        <WayzaLayout noPadding hideFooter>
            <SEO title="Escape the ordinary" />
            <div className="bg-white font-sans text-slate-900 selection:bg-emerald-50 selection:text-emerald-900 leading-relaxed antialiased">

                {/* ════ SECTION: REFINED MINI-HERO ════ */}
                <header className="relative h-[55vh] min-h-[500px] flex flex-col items-center justify-end pb-16">
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        <motion.img
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2400&q=85"
                            alt="Luxury Background"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white to-transparent" />
                    </div>

                    <div className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4 mb-10 pt-36 md:pt-0"
                        >
                            <h1 className="text-3xl md:text-6xl font-medium tracking-tight text-white drop-shadow-md leading-tight">
                                Escape the ordinary <br className="md:hidden" />
                                <span className="text-emerald-500 italic font-serif">gracefully.</span>
                            </h1>
                            <p className="text-base md:text-lg font-normal text-white/90 max-w-2xl mx-auto drop-shadow-sm">
                                Handpicked villas, premium bikes, and local secrets in Varkala.
                            </p>
                        </motion.div>

                        {/* PILL SEARCH ORCHESTRATOR */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="max-w-4xl mx-auto w-full px-4 md:px-0"
                        >
                            <div className="bg-white rounded-3xl md:rounded-full p-2 md:p-3 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col md:flex-row items-center gap-1">

                                {/* Location */}
                                <div className="flex-[1.5] w-full group px-8 py-3 rounded-full hover:bg-slate-50 transition-colors text-left cursor-pointer">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Location</p>
                                    <input
                                        placeholder="Where to go?"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full bg-transparent border-none outline-none font-medium text-slate-800 text-sm p-0 placeholder:text-slate-300"
                                    />
                                </div>

                                <div className="hidden md:block w-px h-10 bg-slate-100" />

                                {/* Check In/Out */}
                                <div className="flex-1 w-full px-8 py-3 rounded-full hover:bg-slate-50 transition-colors text-left cursor-pointer">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Stay Dates</p>
                                    <div className="flex items-center gap-2">
                                        <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="bg-transparent border-none outline-none font-medium text-slate-800 text-xs p-0 w-24 cursor-pointer" />
                                        <span className="text-slate-300">-</span>
                                        <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="bg-transparent border-none outline-none font-medium text-slate-800 text-xs p-0 w-24 cursor-pointer" />
                                    </div>
                                </div>

                                <div className="hidden md:block w-px h-10 bg-slate-100" />

                                {/* Guests */}
                                <div className="flex-1 w-full px-8 py-3 rounded-full hover:bg-slate-50 transition-colors text-left cursor-pointer">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Guests</p>
                                    <input
                                        type="number"
                                        min="1"
                                        value={guests}
                                        onChange={e => setGuests(e.target.value)}
                                        className="w-full bg-transparent border-none outline-none font-medium text-slate-800 text-sm p-0 cursor-pointer"
                                    />
                                </div>

                                {/* Search Button */}
                                <button onClick={handleSearch} className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white p-5 md:p-5 rounded-2xl md:rounded-full shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] md:hover:scale-105 active:scale-95 group flex items-center justify-center gap-3">
                                    <Search size={20} strokeWidth={2.5} className="group-hover:rotate-6 transition-transform" />
                                    <span className="md:hidden font-bold uppercase tracking-widest text-xs">Search Stays</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </header>

                {/* ════ TAB STRIP ════ */}
                <div className="max-w-7xl mx-auto px-6 mt-12 mb-20 flex flex-wrap items-center justify-center gap-4">
                    {CATEGORIES.map(c => (
                        <button
                            key={c.key}
                            onClick={() => {
                                if (c.key === 'experience') navigate('/experiences');
                                else setTab(c.key);
                            }}
                            className={`flex items-center gap-3 px-8 py-3.5 rounded-full transition-all border ${tab === c.key ? 'bg-slate-900 border-slate-900 text-white shadow-xl translate-y-[-2px]' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-700'}`}
                        >
                            <c.icon size={16} />
                            <span className="text-[13px] font-semibold uppercase tracking-widest">{c.label}</span>
                        </button>
                    ))}
                </div>

                {/* ════ TRENDING COLLECTION ════ */}
                <section className="px-6 max-w-7xl mx-auto mb-32">
                    <div className="flex flex-col md:flex-row items-baseline justify-between gap-4 mb-12 border-b border-slate-50 pb-8">
                        <div>
                            <h2 className="text-3xl font-medium tracking-tight text-slate-900">Featured collection.</h2>
                            <p className="text-slate-400 text-sm font-normal mt-1">Directly from our verified local hosts.</p>
                        </div>
                        <Link to="/listings" className="text-emerald-500 font-semibold text-sm flex items-center gap-1.5 hover:gap-2.5 transition-all">
                            View inventory <ArrowRight size={14} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[1, 2, 3, 4].map(i => <WayzaSkeleton key={i} className="h-80 rounded-3xl" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {trendingList.map(l => (
                                <motion.div key={l._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                    <WayzaHotelItem
                                        hotel={{
                                            id: l._id,
                                            name: l.title,
                                            location: l.location || "Varkala Coast",
                                            price: l.price,
                                            image: fixImg(l.image)
                                        }}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                {/* ════ DESTINATIONS MASONRYish ════ */}
                <section className="py-24 bg-slate-50 px-6">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-2xl font-medium text-slate-800 mb-12 text-center">Where we operate.</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {DESTINATIONS.map((d, i) => (
                                <div
                                    key={i}
                                    className={`group cursor-pointer relative h-80 rounded-[40px] overflow-hidden shadow-2xl-soft ${d.colSpan === 2 ? 'md:col-span-2' : 'md:col-span-1'}`}
                                    onClick={() => navigate(`/listings?location=${d.name}`)}
                                >
                                    <img src={d.image} alt={d.name} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-8 left-8 text-white">
                                        <p className="font-medium text-2xl tracking-tight mb-1">{d.name}</p>
                                        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/60">{d.properties}</p>
                                    </div>
                                    <div className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                        <ArrowRight size={20} className="text-white" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════ TRUST STRIP ════ */}
                <section className="py-20 px-6 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        {[
                            { icon: CheckCircle2, title: "Verified Stays", desc: "Every property is personally inspected by our team for absolute quality." },
                            { icon: Compass, title: "Local Secrets", desc: "Access hidden beaches and cafes curated by our native guides." },
                            { icon: Sparkles, title: "Wayza AI", desc: "Plan your entire stay + vehicle combination in seconds with our AI engine." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-6 items-start">
                                <div className="shrink-0 w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                                    <item.icon size={24} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ════ SECTION: AI TRIP ARCHITECT ════ */}
                <section className="py-20 px-6 bg-slate-950 text-white overflow-hidden relative">
                    {/* Abstract Decorative Elements */}
                    <div className="absolute top-0 right-0 w-[50%] h-full bg-emerald-500/5 blur-[150px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[30%] h-1/2 bg-blue-500/5 blur-[120px] pointer-events-none" />

                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            {/* Content Side */}
                            <div className="space-y-8">
                                <div className="inline-flex items-center gap-2.5 px-5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[9px] font-bold uppercase tracking-[0.3em]">
                                    <Cpu size={12} className="animate-pulse" /> Neural Mapping v4.0
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-4xl md:text-5xl font-medium tracking-tight leading-[1.1]">
                                        Conversational <br />
                                        <span className="text-emerald-500 italic font-serif">intelligence.</span>
                                    </h2>
                                    <p className="text-white/40 text-sm font-light leading-relaxed max-w-md">
                                        Forget filters. Describe your mood and vibe. Our AI constructs a verified itinerary in real-time.
                                    </p>
                                </div>

                                {/* Interactive Chat Simulation */}
                                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 space-y-8 relative group overflow-hidden">
                                    <div className="flex items-center gap-4 text-white/20 border-b border-white/5 pb-6">
                                        <Terminal size={18} />
                                        <span className="text-[10px] font-bold tracking-widest uppercase">Live Session</span>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white/50 text-[10px] font-bold">ME</div>
                                            <p className="text-white/80 text-sm md:text-base italic">"I need a quiet clifftop villa in Varkala with a bike for exploring secret cafes."</p>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white"><Sparkles size={14} /></div>
                                            <div className="space-y-3 flex-1">
                                                <div className="flex gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" />
                                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                                                </div>
                                                <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20">
                                                    <p className="text-emerald-400 text-sm font-medium">Analyzing 142 properties... Matching 'Clifftop' + 'Cafe Access' + 'Verify Mobility'...</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Fake Input */}
                                    <div className="flex items-center gap-4 bg-black/40 rounded-3xl px-6 py-4 border border-white/5">
                                        <input
                                            placeholder="Ask for your dream stay..."
                                            className="bg-transparent border-none outline-none flex-1 text-sm text-white/30"
                                            readOnly
                                        />
                                        <button className="text-emerald-500"><Send size={18} /></button>
                                    </div>
                                </div>

                                <button onClick={() => navigate('/ai-trip-planner')} className="h-14 px-10 bg-white text-slate-950 hover:bg-emerald-500 hover:text-white rounded-full font-bold uppercase text-[10px] tracking-[0.3em] transition-all flex items-center gap-4 shadow-xl">
                                    Launch Planner <ArrowRight size={14} />
                                </button>
                            </div>

                            <div className="relative hidden lg:block">
                                <div className="aspect-square rounded-[48px] overflow-hidden border border-white/10 shadow-3xl bg-slate-900 group">
                                    <motion.img
                                        initial={{ scale: 1.2, opacity: 0.6 }}
                                        whileInView={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 1.5 }}
                                        src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80"
                                        alt="AI Visualization"
                                        className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                                    {/* Data Blobs */}
                                    <motion.div
                                        animate={{ y: [0, -20, 0] }}
                                        transition={{ repeat: Infinity, duration: 4 }}
                                        className="absolute top-12 left-12 p-6 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl"
                                    >
                                        <BrainCircuit size={32} className="text-emerald-400 mb-2" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Semantic Match</p>
                                        <p className="text-xl font-bold">98.4% Accuracy</p>
                                    </motion.div>

                                    <motion.div
                                        animate={{ y: [0, 20, 0] }}
                                        transition={{ repeat: Infinity, duration: 5 }}
                                        className="absolute bottom-12 right-12 p-6 bg-emerald-500/20 backdrop-blur-3xl border border-emerald-500/30 rounded-3xl text-right"
                                    >
                                        <Waves size={32} className="text-emerald-400 mb-2 ml-auto" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Vibration Index</p>
                                        <p className="text-xl font-bold">Ocean Calm</p>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="bg-slate-950 pt-16 pb-8 px-6 overflow-hidden relative border-t border-white/5">
                    {/* Subtle Watermark */}
                    <div className="absolute -bottom-6 -right-6 text-[10vw] font-black text-white/[0.02] select-none pointer-events-none uppercase tracking-tighter">
                        Wayza
                    </div>

                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16 relative z-10">
                            {/* Brand DNA */}
                            <div className="md:col-span-4 space-y-6">
                                <div className="space-y-3">
                                    <h2 className="text-xl font-bold tracking-tighter text-white uppercase">Wayza<span className="text-emerald-500">.</span></h2>
                                    <p className="text-white/30 text-xs leading-relaxed font-light italic max-w-[240px]">
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
                                <span>Wayza Travels © 2026</span>
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
        </WayzaLayout>
    );
}