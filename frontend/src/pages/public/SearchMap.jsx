import { useEffect, useState } from "react";
import { WayzzaLayout, WayzzaHotelItem, WayzzaSkeleton } from "../../WayzzaUI.jsx";
import MapView from "../../components/MapView.jsx";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Map as MapIcon, Layers, Target, Compass, Zap, MapPin, Grid, Activity, Sparkles, Navigation } from "lucide-react";

import { api } from "../../utils/api.js";

export default function SearchMap() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.getListings()
            .then(data => {
                const rows = data.rows || data.data || (Array.isArray(data) ? data : []);
                setListings(rows);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const fixImg = (img) => api.fixImg(img);

    return (
        <WayzzaLayout noPadding>
            <div className="h-screen flex flex-col md:flex-row bg-white overflow-hidden font-sans text-slate-900">

                {/* LEFT SIDE — PROPERTY BROWSER */}
                <div className="w-full md:w-[450px] lg:w-[500px] flex flex-col h-full border-r border-slate-200 bg-white relative z-20 shadow-xl">

                    {/* SEARCH HEADER */}
                    <header className="p-8 border-b border-slate-100 space-y-4 bg-white sticky top-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
                                <Activity size={14} className="animate-pulse" /> Live Discovery
                            </div>
                            <button onClick={() => navigate('/listings')} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all border border-slate-100 hover:bg-white hover:shadow-md">
                                <Grid size={18} />
                            </button>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase leading-none">Interactive <span className="text-emerald-500">Explorer.</span></h1>
                        <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Found {listings.length} properties in this region</p>
                    </header>

                    {/* LISTING FEED */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-slate-50/30">
                        {loading ? (
                            <div className="space-y-6">
                                {[1, 2, 3].map(i => <WayzzaSkeleton key={i} className="h-40 rounded-3xl" />)}
                            </div>
                        ) : listings.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center gap-6">
                                <Compass size={48} className="text-slate-200" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">No properties found here</span>
                            </div>
                        ) : (
                            listings.map((l, i) => (
                                <motion.div
                                    key={l._id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group cursor-pointer"
                                    onClick={() => navigate(`/listing/${l._id}`)}
                                >
                                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex gap-5 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                                        <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0 border border-slate-100">
                                            <img src={fixImg(l.image)} alt={l.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{l.title}</h3>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    <MapPin size={12} className="text-emerald-500" /> {l.location || "Coastline"}
                                                </div>
                                            </div>
                                            <div className="flex items-end justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Per Night</span>
                                                    <span className="text-xl font-bold text-slate-900 tracking-tight">₹{l.price.toLocaleString()}</span>
                                                </div>
                                                <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-bold uppercase tracking-widest opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                                                    View Details
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE — INTERACTIVE MAP */}
                <div className="flex-1 relative h-[50vh] md:h-full bg-slate-100">

                    {/* MAP CONTROLS */}
                    <div className="absolute top-8 right-8 z-30 space-y-3">
                        <button className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl border border-slate-100 hover:bg-emerald-500 hover:text-white transition-all group">
                            <Navigation size={22} className="group-hover:scale-110 transition-transform" />
                        </button>
                        <button className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl border border-slate-100 hover:bg-slate-900 hover:text-white transition-all group">
                            <Layers size={22} className="group-hover:rotate-12 transition-transform" />
                        </button>
                    </div>

                    <div className="absolute top-8 left-8 z-30">
                        <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-200 flex items-center gap-3 text-slate-900 shadow-xl">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Live View Active</span>
                        </div>
                    </div>

                    <MapView
                        markers={listings.map(l => ({
                            id: l._id,
                            lat: l.latitude || 8.7379,
                            lng: l.longitude || 76.7163,
                            title: l.title,
                            price: l.price
                        }))}
                    />

                    {/* MAP HUD FOOTER */}
                    <div className="absolute bottom-8 inset-x-8 z-30 flex justify-between items-end pointer-events-none">
                        <div className="hidden md:block p-8 bg-white/90 backdrop-blur-xl rounded-[32px] border border-slate-200 shadow-2xl pointer-events-auto space-y-4 max-w-xs">
                            <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
                                <Sparkles size={14} /> Location Guide
                            </div>
                            <p className="text-slate-500 text-[11px] font-bold leading-relaxed uppercase tracking-widest">
                                "Interactive mapping for a seamless discovery experience. All properties are verified for quality."
                            </p>
                        </div>

                        <div className="flex gap-4 pointer-events-auto">
                            <div className="w-28 h-28 bg-slate-900 rounded-[32px] flex flex-col items-center justify-center text-white border border-white/5 shadow-2xl">
                                <span className="text-3xl font-bold tracking-tight">{listings.length}</span>
                                <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Properties</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </WayzzaLayout>
    );
}