import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { WayzaLayout } from "../../WayzaUI.jsx";
import { Anchor, Compass, Navigation, ArrowRight, PlayCircle, Star, Target, MapPin } from "lucide-react";
import { useCurrency } from "../../CurrencyContext.jsx";

const EXPERIENCES = [
    { title: "Neon Night Ride", location: "Tokyo, Japan", type: "bike", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80", price: "4,500" },
    { title: "Coastal Drift Tour", location: "Malibu, USA", type: "car", img: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80", price: "12,000" },
    { title: "Hidden Waterfall Dive", location: "Bali, Indonesia", type: "activity", img: "https://images.unsplash.com/photo-1504280658428-ec2f2db7bb25?auto=format&fit=crop&w=800&q=80", price: "3,200" },
    { title: "Glacier Summit Trek", location: "Zermatt, Swiss", type: "activity", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80", price: "24,000" },
];

export default function Experiences() {
    const navigate = useNavigate();
    const { formatPrice } = useCurrency();

    return (
        <WayzaLayout noPadding>
            <div className="bg-slate-50 min-h-screen font-sans">

                {/* Cinematic Hero */}
                <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900 z-0">
                        <img
                            src="https://images.unsplash.com/photo-1682695797221-8164ff1fafc9?auto=format&fit=crop&w=2000&q=80"
                            alt="Experience Header"
                            className="w-full h-full object-cover opacity-60 scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-6 text-center pt-20">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-white font-bold text-[10px] uppercase tracking-widest mb-6 shadow-2xl">
                            <Anchor size={14} className="text-amber-400" /> Beyond the Stay
                        </motion.div>
                        <h1 className="text-5xl md:text-8xl font-bold text-white tracking-tighter uppercase leading-[0.85] relative">
                            Beyond <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 italic font-serif lowercase block mt-2">Extraordinary.</span>
                        </h1>
                        <motion.p initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto font-medium italic">
                            "Curated local tours, high-adrenaline excursions, and private guided experiences handpicked by Wayza experts."
                        </motion.p>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                            <button onClick={() => navigate('/listings?category=activity')} className="h-14 px-10 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-500/20 active:scale-95">
                                Explore Activities
                            </button>
                            <button className="h-14 px-10 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all active:scale-95">
                                <PlayCircle size={18} /> Watch Trailer
                            </button>
                        </motion.div>
                    </div>
                </section>

                {/* Popular Categories Strip */}
                <section className="bg-slate-900 py-12 border-b border-white/10 -mt-10 relative z-20 shadow-2xl overflow-x-auto no-scrollbar">
                    <div className="max-w-7xl mx-auto px-6 flex gap-8 whitespace-nowrap justify-center min-w-max">
                        {['Culinary Tours', 'Extreme Sports', 'Ocean Drives', 'Cultural Dives', 'Luxury Cruises'].map((c, i) => (
                            <div key={i} className="flex items-center gap-3 text-slate-400 hover:text-white cursor-pointer transition-colors group">
                                <Target size={16} className="text-amber-500 group-hover:rotate-45 transition-transform" />
                                <span className="font-bold uppercase tracking-widest text-sm">{c}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Trending grid */}
                <section className="py-32 max-w-7xl mx-auto px-6">
                    <div className="mb-16 md:flex justify-between items-end border-b-2 border-slate-900 pb-6">
                        <div>
                            <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Star size={12} className="fill-amber-500" /> Top Rated
                            </div>
                            <h2 className="text-5xl font-bold text-slate-900 uppercase tracking-tight">Iconic <span className="italic text-slate-400">Picks</span></h2>
                        </div>
                        <Link to="/listings?category=activity" className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-900 hover:text-amber-600 transition-colors">
                            View All Experiences <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {EXPERIENCES.map((exp, i) => (
                            <div key={i} onClick={() => navigate('/listings?category=activity')} className="group cursor-pointer">
                                <div className="relative aspect-[3/4] rounded-[32px] overflow-hidden bg-slate-200 shadow-md mb-6">
                                    <img src={exp.img} alt={exp.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent" />

                                    <div className="absolute bottom-6 left-6 right-6">
                                        <div className="flex items-center gap-1 text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                                            <MapPin size={12} /> {exp.location}
                                        </div>
                                        <h3 className="text-2xl font-bold text-white uppercase leading-tight line-clamp-2">{exp.title}</h3>
                                    </div>
                                    <div className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 text-white">
                                        <ArrowRight size={16} className="-rotate-45 group-hover:rotate-0 transition-transform" />
                                    </div>
                                </div>
                                <div className="px-2">
                                    <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest">
                                        <span className="text-slate-400">{exp.type}</span>
                                        <span className="text-slate-900">{formatPrice(parseInt(exp.price.replace(',', '')))}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </WayzaLayout>
    );
}
