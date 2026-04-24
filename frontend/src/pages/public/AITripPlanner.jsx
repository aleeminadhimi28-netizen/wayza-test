import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WayzzaLayout } from "../../WayzzaUI.jsx";
import { Sparkles, MapPin, Calendar, Heart, Search, Compass, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCurrency } from "../../CurrencyContext.jsx";
import { api } from "../../utils/api.js";

export default function AITripPlanner() {
    const [destination, setDestination] = useState("");
    const [vibe, setVibe] = useState("chill");
    const [isGenerating, setIsGenerating] = useState(false);
    const [itinerary, setItinerary] = useState(null);
    const { formatPrice } = useCurrency();

    const generateTrip = async () => {
        if (!destination) return;
        setIsGenerating(true);
        setItinerary(null);

        try {
            const res = await api.generateTrip({ destination, vibe });
            if (res.ok) {
                // Formatting price on the frontend to match context
                const formattedData = {
                    ...res.data,
                    totalPrice: formatPrice(res.data.totalPrice)
                };
                setItinerary(formattedData);
            } else {
                alert(res.message || "Could not generate trip. Try a broader destination like 'Varkala'.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <WayzzaLayout noPadding>
            <div className="min-h-screen bg-slate-50 font-sans pb-32">
                {/* Hero Header */}
                <header className="bg-slate-900 pt-32 pb-24 px-6 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 blur-[100px] pointer-events-none" />
                    <div className="max-w-3xl mx-auto relative z-10 space-y-6">
                        <div className="inline-flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full text-emerald-400 font-bold text-[10px] uppercase tracking-widest mb-4">
                            <Sparkles size={14} /> Wayzza Intelligence
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight uppercase leading-[0.9]">
                            AI Trip <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 lowercase">Architect.</span>
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl font-medium border-l-4 border-emerald-500/30 pl-6 mx-auto max-w-xl text-left">
                            "Tell us where you want to go and how you want to feel. We will instantly orchestrate the perfect stay, wheels, and experiences."
                        </p>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-6 -mt-12 relative z-20">
                    {/* Input Panel */}
                    <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 flex flex-col md:flex-row gap-6 mb-12">
                        <div className="flex-1 space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Where to?</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={destination}
                                    onChange={e => setDestination(e.target.value)}
                                    placeholder="e.g. Varkala, Kovalam, Munnar..."
                                    className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-bold text-slate-900 transition-all placeholder:font-medium"
                                />
                            </div>
                        </div>

                        <div className="flex-1 space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">The Vibe</label>
                            <div className="relative">
                                <Compass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <select
                                    value={vibe}
                                    onChange={e => setVibe(e.target.value)}
                                    className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-emerald-500 font-bold text-slate-900 appearance-none cursor-pointer transition-all"
                                >
                                    <option value="chill">Relaxing & Chill</option>
                                    <option value="adventure">High Adrenaline Adventure</option>
                                    <option value="culture">Cultural Deep Dive</option>
                                    <option value="luxury">Ultra Luxury & Pampering</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={generateTrip}
                                disabled={isGenerating || !destination}
                                title={!destination ? "Enter a destination first" : ""}
                                className={`h-14 px-8 text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all w-full md:w-auto active:scale-95 ${
                                    !destination || isGenerating
                                        ? "bg-slate-300 cursor-not-allowed opacity-70"
                                        : "bg-slate-900 hover:bg-emerald-600 shadow-lg shadow-emerald-500/10 cursor-pointer"
                                }`}
                            >
                                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                {isGenerating ? "Manifesting..." : !destination ? "Enter Destination" : "Generate Magic"}
                            </button>
                        </div>
                    </div>

                    {/* Loading State or Results */}
                    <AnimatePresence mode="wait">
                        {isGenerating && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-[40px] border border-emerald-100 p-16 text-center flex flex-col items-center justify-center min-h-[400px]"
                            >
                                <div className="relative w-24 h-24 mb-8">
                                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                    <Sparkles className="absolute inset-0 m-auto text-emerald-500" size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-tight mb-2">Curating perfection...</h3>
                                <p className="text-slate-400 font-medium">Scouring thousands of verified Stays, Cars, and Experiences for {destination}.</p>
                            </motion.div>
                        )}

                        {itinerary && !isGenerating && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-[32px] border border-emerald-100 shadow-sm border-l-8 border-l-emerald-500">
                                    <div>
                                        <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Generated Itinerary</div>
                                        <h2 className="text-3xl font-bold text-slate-900 uppercase">{itinerary.destination}</h2>
                                        <p className="text-slate-500 font-medium mt-1 capitalize text-lg">"{itinerary.vibe} Experience"</p>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Est. Package Total</div>
                                        <div className="text-3xl font-bold text-emerald-600">{itinerary.totalPrice}</div>
                                        <button className="mt-4 w-full md:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
                                            Book Entire Package
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {itinerary.days.map((day, idx) => (
                                        <div key={idx} className="bg-white rounded-[32px] p-8 md:p-12 border border-slate-100 shadow-sm">
                                            <h3 className="text-xl font-bold text-slate-900 uppercase mb-8 flex items-center gap-3">
                                                <span className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">0{day.day}</span>
                                                {day.title}
                                            </h3>

                                            <div className="space-y-8 pl-5 border-l-2 border-slate-100 ml-5">
                                                {day.items.map((item, itemIdx) => (
                                                    <div key={itemIdx} className="relative pl-8">
                                                        <div className={`absolute -left-[45px] top-0 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center
                                                            ${item.type === 'hotel' ? 'bg-amber-400' : item.type === 'car' ? 'bg-blue-400' : 'bg-rose-400'}
                                                        `}></div>
                                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{item.time}</div>
                                                        <div className="text-lg font-bold text-slate-900">{item.title}</div>
                                                        <p className="text-slate-500 mt-1">{item.desc}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </WayzzaLayout>
    );
}
