import { useNavigate } from "react-router-dom";
import { WayzaLayout } from "../../WayzaUI.jsx";
import { motion } from "framer-motion";
import { Compass, Map, ArrowLeft, Zap, Search, Globe, Home, Sparkles } from "lucide-react";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <WayzaLayout noPadding>
            <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center p-6 relative overflow-hidden">

                {/* AMBIENT BACKGROUND ELEMENTS */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] pointer-events-none" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-white border-l border-b border-slate-100 rounded-bl-[120px] pointer-events-none opacity-50" />

                <div className="relative z-10 text-center max-w-2xl bg-white p-12 md:p-20 rounded-[60px] shadow-sm border border-slate-100">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="mb-12 inline-block"
                    >
                        <div className="w-40 h-40 bg-slate-50 text-emerald-500 rounded-full flex items-center justify-center shadow-inner relative group border-8 border-white">
                            <Compass size={80} strokeWidth={1} className="animate-spin-slow" />
                        </div>
                    </motion.div>

                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-3 bg-slate-100 px-8 py-4 rounded-full text-slate-400 font-bold text-[11px] uppercase tracking-[0.4em] italic shadow-inner"
                        >
                            <Sparkles size={16} className="text-emerald-500" /> Identity Missing // 404
                        </motion.div>

                        <h1 className="text-7xl md:text-9xl font-bold text-slate-900 tracking-tighter uppercase leading-[0.8]">
                            Undefined <br /><span className="text-emerald-500 italic font-serif lowercase">Coordinates.</span>
                        </h1>

                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] italic leading-relaxed max-w-sm mx-auto border-l-2 border-emerald-500/20 pl-4">
                            "The current geographic sector is unrecognized by our registry. Let's recalibrate your experience."
                        </p>
                    </div>

                    <div className="mt-16 flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="h-16 px-10 rounded-2xl font-bold uppercase text-[10px] tracking-widest text-slate-900 bg-white border border-slate-200 hover:border-emerald-500 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            <ArrowLeft size={16} /> Go Back
                        </button>
                        <button
                            onClick={() => navigate("/")}
                            className="h-20 px-12 rounded-[28px] font-bold uppercase text-[11px] tracking-[0.3em] text-white bg-slate-900 hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-4 group"
                        >
                            <Home size={18} /> Experience Registry
                        </button>
                    </div>

                    <div className="mt-24 flex justify-center gap-10 opacity-10">
                        <Map size={24} />
                        <Search size={24} />
                        <Globe size={24} />
                    </div>
                </div>

                <style>{`
                    .animate-spin-slow {
                        animation: spin 15s linear infinite;
                    }
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </WayzaLayout>
    );
}
