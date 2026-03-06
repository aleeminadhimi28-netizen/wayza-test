import React, { useEffect, useState } from "react";
import { WayzaLayout, WayzaHotelItem, WayzaSkeleton } from "../../WayzaUI.jsx";
import { useNavigate, Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
    Search, MapPin, Calendar, Users, ChevronRight, CheckCircle,
    Shield, Sparkles, Globe, Compass, MessageSquare,
    ArrowRight, Star, Heart, Info, Target,
    Layers, Award, Tent, Bike, Car, Music, Clock, Zap
} from "lucide-react";

import { api } from "../../utils/api.js";

export default function LandingPage() {
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("hotel");
    const [search, setSearch] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");

    const [showSuggestions, setShowSuggestions] = useState(false);

    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);
    const heroScale = useTransform(scrollY, [0, 600], [1, 1.1]);

    const fixImg = (img) => {
        if (!img) return "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80";
        if (img.startsWith("http")) return img;
        const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
        return `${BASE}/uploads/${img}`;
    };

    useEffect(() => {
        api.getListings()
            .then((data) => {
                const list = data.rows || data;
                if (Array.isArray(list)) setListings(list);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSearch = () => {
        const params = new URLSearchParams();
        params.set("category", tab);
        if (search) params.set("location", search);
        if (checkIn) params.set("start", checkIn);
        if (checkOut) params.set("end", checkOut);
        navigate(`/listings?${params.toString()}`);
    };

    const uniqueLocations = Array.from(new Set(listings.map(l => l.location).filter(Boolean)));
    const searchSuggestions = search
        ? uniqueLocations.filter(loc => loc.toLowerCase().includes(search.toLowerCase()))
        : [];

    const varkalaSpots = [
        { name: "Varkala Cliff", description: "Iconic red cliffs with breath-taking ocean views.", image: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=800&q=80", tag: "Nature" },
        { name: "Edava Beach", description: "A serene escape where backwaters meet the Arabian sea.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", tag: "Coastal" },
        { name: "Janardhana Temple", description: "A 2,000-year-old spiritual landmark on the hill.", image: "https://images.unsplash.com/photo-1626442651167-797745778a08?auto=format&fit=crop&w=800&q=80", tag: "Heritage" },
        { name: "Kappil Lake", description: "Quiet boat rides through lush coconut groves.", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80", tag: "Serene" }
    ];

    const trendingListings = listings.filter(l => (l.category === "hotel" || !l.category)).slice(0, 8);

    return (
        <WayzaLayout noPadding>
            <div className="bg-white font-sans text-slate-900 selection:bg-emerald-600 selection:text-white">

                {/* PREMIUM HERO SECTION */}
                <section className="relative h-screen min-h-[850px] flex items-center justify-center bg-slate-900 overflow-hidden">
                    <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="absolute inset-0 z-0">
                        <img
                            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2000&q=80"
                            alt="Luxury Stay"
                            className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-slate-900" />
                    </motion.div>

                    <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="space-y-10"
                        >
                            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-2.5 rounded-full text-white font-bold text-[10px] uppercase tracking-[0.3em] shadow-2xl">
                                <Sparkles size={14} className="text-emerald-400" /> Defining Modern Hospitality
                            </div>

                            <h1 className="text-6xl md:text-9xl font-bold text-white tracking-tighter leading-[0.85] uppercase mb-12">
                                Your Next <br />
                                <span className="text-emerald-400 italic font-serif lowercase">Masterpiece.</span>
                            </h1>

                            <p className="text-lg md:text-2xl text-white/50 max-w-2xl mx-auto font-medium leading-relaxed italic border-l-4 border-emerald-500/20 pl-8">
                                "Experience a world of curated stays and local adventures, handpicked for <span className="text-white font-bold">absolute excellence.</span>"
                            </p>

                            <div className="flex flex-wrap justify-center gap-12 pt-10 text-white/40">
                                {[
                                    { i: Globe, l: "Global Curations" },
                                    { i: Shield, l: "Verified Quality" },
                                    { i: Award, l: "Premium Service" }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-3">
                                        <item.i size={20} className="text-emerald-400/60" />
                                        <span className="text-[9px] font-bold uppercase tracking-[0.3em]">{item.l}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* SCROLL INDICATOR */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 text-white/20">
                        <div className="w-px h-20 bg-gradient-to-b from-emerald-500/50 to-transparent" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.5em] [writing-mode:vertical-lr] animate-pulse">Explore</span>
                    </div>
                </section>

                {/* FLOATING SEARCH CONSOLE */}
                <div className="max-w-6xl mx-auto px-6 relative z-30 -mt-24 md:-mt-32">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-[40px] p-8 md:p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100"
                    >
                        {/* SEARCH TABS */}
                        <div className="flex flex-wrap justify-center gap-3 mb-12">
                            {[
                                { label: "Stays", key: "hotel", icon: Tent },
                                { label: "Bikes & Scooters", key: "bike", icon: Bike },
                                { label: "Car Rentals", key: "car", icon: Car },
                                { label: "Experiences", key: "activity", icon: Music }
                            ].map((t) => (
                                <button
                                    key={t.key}
                                    onClick={() => setTab(t.key)}
                                    className={`px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 ${tab === t.key ? 'bg-slate-900 text-white shadow-xl translate-y-[-2px]' : 'bg-slate-50 text-slate-400 hover:text-slate-900'}`}
                                >
                                    <t.icon size={16} />
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* SEARCH INPUTS */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                            <div className="lg:col-span-5 space-y-3 relative group">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Destination</label>
                                <div className="relative">
                                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                    <input
                                        placeholder="Where would you like to go?"
                                        value={search}
                                        onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
                                        className="h-18 w-full rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-emerald-500 transition-all outline-none pl-16 pr-6 font-bold text-slate-900 placeholder:text-slate-200 shadow-inner"
                                    />
                                    {showSuggestions && search && searchSuggestions.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 z-50 overflow-hidden">
                                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-4 ml-2">Suggested Locations</p>
                                            {searchSuggestions.slice(0, 5).map((loc, i) => (
                                                <div key={i} onClick={() => { setSearch(loc); setShowSuggestions(false); }} className="px-6 py-4 hover:bg-emerald-50 rounded-2xl cursor-pointer font-bold text-slate-900 flex items-center justify-between transition-all group/loc">
                                                    <div className="flex items-center gap-4"><MapPin size={18} className="text-slate-300 group-hover/loc:text-emerald-500" /> {loc}</div>
                                                    <ArrowRight size={14} className="text-slate-200 group-hover/loc:text-emerald-500 opacity-0 group-hover/loc:opacity-100 translate-x-[-10px] group-hover/loc:translate-x-0 transition-all" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="lg:col-span-4 space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Stay Dates</label>
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="h-18 w-full rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-emerald-500 transition-all outline-none px-6 font-bold text-[11px] shadow-inner" />
                                    </div>
                                    <div className="relative flex-1">
                                        <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="h-18 w-full rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-emerald-500 transition-all outline-none px-6 font-bold text-[11px] shadow-inner" />
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-3 flex items-end">
                                <button onClick={handleSearch} className="h-18 w-full bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-4 shadow-xl shadow-slate-900/10 transition-all active:scale-95">
                                    <Search size={20} /> Discover Now
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* SERVICE PILLARS */}
                <section className="py-48 px-6 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
                            {[
                                { title: "Verified Listings", desc: "Every property and vehicle is meticulously inspected for quality and accuracy.", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
                                { title: "Seamless Experience", desc: "Enjoy a friction-less reservation process with instant confirmation and support.", icon: Sparkles, color: "text-blue-500", bg: "bg-blue-50" },
                                { title: "Curated Insights", desc: "Access handpicked local secrets and exclusive activities curated by experts.", icon: Compass, color: "text-amber-500", bg: "bg-amber-50" }
                            ].map((f, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="group">
                                    <div className={`w-20 h-20 ${f.bg} ${f.color} rounded-3xl flex items-center justify-center mb-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm`}>
                                        <f.icon size={36} />
                                    </div>
                                    <h3 className="text-3xl font-bold text-slate-900 mb-5 leading-tight uppercase tracking-tight">{f.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed font-medium italic">"{f.desc}"</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FEATURED DESTINATION - VARKALA */}
                <section className="bg-slate-900 py-48 px-6 md:px-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/5 blur-[150px] pointer-events-none" />
                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-10">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 text-emerald-400 font-bold text-[10px] uppercase tracking-[0.5em] italic">
                                    <Sparkles size={16} className="animate-pulse" /> Exclusive Guide
                                </div>
                                <h2 className="text-6xl md:text-9xl font-bold text-white tracking-tighter leading-none uppercase">Discover <br /><span className="text-emerald-50 italic font-serif lowercase">Varkala.</span></h2>
                            </div>
                            <button onClick={() => navigate('/listings')} className="h-20 px-16 bg-white text-slate-900 hover:bg-emerald-500 hover:text-white rounded-[24px] font-bold text-[10px] uppercase tracking-[0.4em] transition-all flex items-center gap-6 shadow-2xl active:scale-95 group">
                                Explore The Coast <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {varkalaSpots.map((spot, i) => (
                                <motion.div
                                    key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                                    onClick={() => navigate(`/listings?location=${spot.name}`)}
                                    className="group relative h-[600px] rounded-[48px] overflow-hidden cursor-pointer shadow-3xl transition-all duration-700 hover:translate-y-[-10px]"
                                >
                                    <img src={spot.image} alt={spot.name} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

                                    <div className="absolute top-8 left-8">
                                        <span className="px-5 py-2.5 bg-white/10 backdrop-blur-xl rounded-full text-[9px] font-bold text-white uppercase tracking-widest border border-white/10">{spot.tag}</span>
                                    </div>

                                    <div className="absolute bottom-12 left-10 right-10 space-y-3">
                                        <h3 className="text-3xl font-bold text-white leading-tight uppercase tracking-tight">{spot.name}</h3>
                                        <p className="text-white/40 text-xs font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 italic">"{spot.description}"</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* TRENDING SELECTIONS */}
                <section className="py-48 px-6 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <header className="flex flex-col items-center text-center space-y-6 mb-32">
                            <div className="flex items-center gap-3 text-emerald-600 font-bold text-[10px] uppercase tracking-[0.5em] italic">
                                <Target size={16} /> Curated Stays
                            </div>
                            <h2 className="text-6xl md:text-8xl font-bold text-slate-900 tracking-tighter uppercase leading-none">The <span className="text-emerald-500 italic font-serif lowercase">Collection.</span></h2>
                            <p className="text-slate-400 font-medium text-xl italic max-w-xl border-b border-emerald-500/10 pb-8">"Handpicked by our global scouts for distinguished explorers."</p>
                        </header>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                                {[1, 2, 3, 4].map(i => <WayzaSkeleton key={i} className="h-[450px] rounded-[40px]" />)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                                {trendingListings.map((l, i) => (
                                    <motion.div key={l._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                        <WayzaHotelItem hotel={{ id: l._id, name: l.title, location: l.location || "Coastline", price: l.price, image: fixImg(l.image) }} />
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        <div className="mt-32 text-center">
                            <Link to="/listings" className="h-20 px-16 bg-slate-900 text-white hover:bg-emerald-600 rounded-[32px] font-bold uppercase text-[10px] tracking-widest transition-all shadow-2xl shadow-slate-900/10 inline-flex items-center gap-6 active:scale-95">
                                Browse The Full Portfolio <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* TESTIMONIALS */}
                <section className="py-48 px-6 bg-slate-50 relative overflow-hidden">
                    <div className="max-w-6xl mx-auto relative z-10">
                        <header className="text-center space-y-6 mb-32">
                            <span className="text-emerald-600 font-bold text-[10px] uppercase tracking-[0.5em]">Guest Experience</span>
                            <h2 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight uppercase leading-none">Trusted Stories</h2>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {[
                                { name: "Rahul Sharma", city: "Bangalore", q: "Absolutely incredible experience. The cliffside stay was even better than the photos. Seamless booking and perfect support." },
                                { name: "Sarah Mitchell", city: "London", q: "The local insights were a game changer. Found spots I would have never seen on a typical travel site. 10/10." },
                                { name: "Anish Kumar", city: "Mumbai", q: "Best platform for verified stays in Kerala. The community and support team are world class professionals." }
                            ].map((t, i) => (
                                <motion.div key={i} whileHover={{ y: -10 }} className="bg-white p-12 rounded-[48px] shadow-sm border border-slate-100 transition-all duration-500">
                                    <div className="text-amber-400 mb-8 flex gap-1">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={18} className="fill-current" />)}
                                    </div>
                                    <p className="text-xl font-medium text-slate-700 italic leading-relaxed mb-12">"{t.q}"</p>
                                    <div className="flex items-center gap-5 pt-10 border-t border-slate-50">
                                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-2xl shadow-inner uppercase">{t.name[0]}</div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-lg uppercase tracking-tight">{t.name}</h4>
                                            <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest">{t.city}, India</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* PARTNER JOIN CTA */}
                <section className="py-48 px-6">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }}
                            className="relative rounded-[70px] bg-slate-950 p-20 md:p-32 text-center overflow-hidden shadow-3xl"
                        >
                            <img src="https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=2000&q=80" className="absolute inset-0 w-full h-full object-cover opacity-10" alt="Partner Join" />
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/20 via-transparent to-transparent opacity-40" />

                            <div className="relative z-10 max-w-4xl mx-auto space-y-12">
                                <span className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-2.5 rounded-full text-emerald-300 font-bold text-[10px] uppercase tracking-[0.3em]">
                                    <Award size={16} /> Partner Excellence Network
                                </span>

                                <h2 className="text-6xl md:text-8xl font-bold text-white tracking-tighter leading-tight uppercase">
                                    Become part of <br />the <span className="text-emerald-100 italic">Wayza Collection.</span>
                                </h2>

                                <p className="text-white/50 text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed italic">
                                    Showcase your property to a global audience. Join our network of premium hosts today.
                                </p>

                                <div className="flex flex-col md:flex-row justify-center gap-6 pt-10">
                                    <button onClick={() => navigate('/partner-register')} className="h-20 px-12 bg-emerald-600 text-white hover:bg-emerald-500 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all shadow-2xl shadow-emerald-600/20">
                                        Join as a Partner
                                    </button>
                                    <button onClick={() => navigate('/about')} className="h-20 px-12 border-2 border-white/20 text-white hover:bg-white/10 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all">
                                        Membership Details
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* REFINED FOOTER */}
                <footer className="bg-white py-48 px-6 md:px-12 border-t border-slate-100">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-20">
                        <div className="md:col-span-5 space-y-10">
                            <h2 className="text-4xl font-bold tracking-tighter text-slate-900 uppercase">Wayza<span className="text-emerald-500">.</span></h2>
                            <p className="text-slate-400 font-medium text-lg leading-relaxed italic max-w-md">
                                Your gateway to extraordinary stays and curated adventures. Bridging the gap between travelers and authentic local excellence.
                            </p>
                            <div className="flex gap-4">
                                {[Globe, Shield, Zap, MessageSquare].map((Icon, i) => (
                                    <div key={i} className="w-14 h-14 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all cursor-pointer">
                                        <Icon size={22} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-10">
                            <h3 className="text-slate-900 font-bold uppercase text-[10px] tracking-[0.4em]">Explore</h3>
                            <ul className="space-y-6">
                                {[
                                    { n: 'Our Stays', k: 'hotel' },
                                    { n: 'Explore Map', k: 'map' },
                                    { n: 'Bike Rentals', k: 'bike' },
                                    { n: 'Car Rentals', k: 'car' }
                                ].map(l => <li key={l.k}><Link to={l.k === 'map' ? '/explore-map' : `/listings?category=${l.k}`} className="text-slate-400 font-bold text-sm hover:text-emerald-600 transition-colors uppercase tracking-tight">{l.n}</Link></li>)}
                            </ul>
                        </div>

                        <div className="md:col-span-2 space-y-10">
                            <h3 className="text-slate-900 font-bold uppercase text-[10px] tracking-[0.4em]">Company</h3>
                            <ul className="space-y-6">
                                {['About Wayza', 'Support Center', 'Partner Program', 'Safety & Trust'].map(l => <li key={l}><Link to={l === 'Support Center' ? '/support' : '/'} className="text-slate-400 font-bold text-sm hover:text-emerald-600 transition-colors uppercase tracking-tight">{l}</Link></li>)}
                            </ul>
                        </div>

                        <div className="md:col-span-3 space-y-10">
                            <h3 className="text-slate-900 font-bold uppercase text-[10px] tracking-[0.4em]">Newsletter</h3>
                            <p className="text-slate-400 text-sm font-medium italic">Subscribe for early access to new stay collections and exclusive offers.</p>
                            <div className="relative">
                                <input placeholder="Your Email" className="w-full h-16 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-sm focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200" />
                                <button className="absolute right-3 top-3 bottom-3 px-6 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all">Join</button>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto mt-48 pt-12 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-10">
                        <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-300">© 2026 Wayza Travels • All Rights Reserved</span>
                        <div className="flex gap-16 text-[10px] font-bold uppercase tracking-[0.5em] text-slate-300">
                            <span className="hover:text-emerald-600 transition-colors cursor-pointer">Privacy Policy</span>
                            <span className="hover:text-emerald-600 transition-colors cursor-pointer">Terms of Service</span>
                        </div>
                    </div>
                </footer>
            </div>
        </WayzaLayout>
    );
}