import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, MapPin, PlusCircle, CheckCircle, ArrowRight, ArrowLeft, Activity, Sparkles, Building, Wallet, Navigation, ChevronDown } from "lucide-react";
import { useAuth } from "../../AuthContext.jsx";
import { useToast } from "../../ToastContext.jsx";

import { api } from "../../utils/api.js";

export default function PartnerOnboarding() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { user, loading: authLoading } = useAuth();

    const [email, setEmail] = useState(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [businessName, setBusinessName] = useState("");
    const [category, setCategory] = useState("hotel");
    const [location, setLocation] = useState("");
    const [listingName, setListingName] = useState("");
    const [price, setPrice] = useState("");

    // ensure logged in partner
    useEffect(() => {
        if (authLoading) return;
        if (!user || user.role !== "partner") {
            navigate("/partner-login", { replace: true });
        } else {
            setEmail(user.email);
        }
    }, [user, authLoading, navigate]);

    async function finishOnboarding() {
        if (!email) return;
        if (!businessName || !location) {
            showToast("Please provide all required business details.", "error");
            return;
        }

        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 1500)); // Smooth transition

            const data = await api.partnerOnboard({
                email,
                businessName,
                category,
                location,
                firstListing: listingName
                    ? {
                        title: listingName,
                        price: Number(price)
                    }
                    : null
            });

            if (!data.ok) throw new Error();
            showToast("Account successfully configured.", "success");
            navigate("/partner", { replace: true });
        } catch (err) {
            showToast("Failed to finalize setup. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    }

    if (!email) return null;

    const steps = [
        { id: 1, title: "Identity", icon: <Briefcase /> },
        { id: 2, title: "Location", icon: <MapPin /> },
        { id: 3, title: "Listing", icon: <PlusCircle /> },
        { id: 4, title: "Finalize", icon: <CheckCircle /> }
    ];

    return (
        <div className="min-h-screen bg-white font-sans flex items-center justify-center p-6 relative overflow-hidden selection:bg-emerald-100 selection:text-emerald-900">

            {/* ─── PREMIUM MESH BACKGROUND ─── */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/40 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-100/60 blur-[120px] rounded-full" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-amber-50/30 blur-[100px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-4xl bg-white/40 backdrop-blur-3xl rounded-[64px] p-12 md:p-20 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.08)] border border-white/40 relative z-10 overflow-hidden"
            >
                {/* PRO BRANDING */}
                <div className="absolute top-12 right-12 flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-300">Wayza</span>
                    <div className="px-3 py-1 bg-slate-950 text-white text-[9px] font-black uppercase tracking-[0.4em] rounded-md">Pro</div>
                </div>

                {/* PROGRESS TRACKER */}
                <div className="flex items-center gap-6 mb-24">
                    {steps.map((s, i) => (
                        <div key={s.id} className="flex-1 space-y-4">
                            <div className={`h-1.5 rounded-full transition-all duration-1000 ${step >= s.id ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-100'}`} />
                            <div className={`flex items-center gap-3 transition-opacity duration-500 ${step === s.id ? 'opacity-100' : 'opacity-20'}`}>
                                <span className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-900">{s.title}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-16">
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <span className="h-px w-12 bg-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-600 italic">Phase 01: Onboarding</span>
                                </div>
                                <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 uppercase leading-[0.8] font-serif italic">Partner <br /><span className="lowercase">Identity.</span></h2>
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest italic leading-relaxed max-w-sm">"Define your presence within the Wayza luxury network architecture."</p>
                            </div>

                            <div className="space-y-12">
                                <FormInput label="Official Asset Name" value={businessName} onChange={setBusinessName} placeholder="E.G. AZURE CLIFF ESTATE" icon={<Building size={24} />} />
                                <FormSelect
                                    label="Operation Category"
                                    value={category}
                                    onChange={setCategory}
                                    options={[
                                        { value: "hotel", label: "Hospitality & Stays" },
                                        { value: "bike", label: "Premium Mobility (Two-Wheeler)" },
                                        { value: "car", label: "Luxury Mobility (Four-Wheeler)" },
                                        { value: "activity", label: "Curated Experiences" }
                                    ]}
                                />
                            </div>
                            <Nav next={() => setStep(2)} />
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-16">
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <span className="h-px w-12 bg-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-600 italic">Phase 02: Deployment</span>
                                </div>
                                <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 uppercase leading-[0.8] font-serif italic">Operational <br /><span className="lowercase">Location.</span></h2>
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest italic leading-relaxed max-w-sm">"Specify your geographic focus for guest discovery and route optimization."</p>
                            </div>

                            <div className="space-y-12">
                                <FormInput label="Geographic Coordinates" value={location} onChange={setLocation} placeholder="E.G. VARKALA, KERALA" icon={<MapPin size={24} />} />
                                <div className="p-12 bg-slate-950/5 border border-slate-900/5 rounded-[40px] italic text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                                    "Accuracy in location indexing ensures your assets are presented to the correct guest tier based on proximity and travel intent."
                                </div>
                            </div>
                            <Nav back={() => setStep(1)} next={() => setStep(3)} />
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-16">
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <span className="h-px w-12 bg-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-600 italic">Phase 03: Inventory</span>
                                </div>
                                <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 uppercase leading-[0.8] font-serif italic">Primary <br /><span className="lowercase">Listing.</span></h2>
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest italic leading-relaxed max-w-sm">"Initial asset configuration. Granular details and variance controls can be audited later."</p>
                            </div>

                            <div className="space-y-12">
                                <FormInput label="Listing Descriptor" value={listingName} onChange={setListingName} placeholder="E.G. OCEAN FRONT SANCTUARY" icon={<Building size={24} />} />
                                <FormInput label="Base Access Rate (INR)" value={price} onChange={setPrice} placeholder="7500" icon={<Wallet size={24} />} />
                            </div>
                            <Nav back={() => setStep(2)} next={() => setStep(4)} />
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-20">
                            <div className="flex justify-center relative">
                                <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] rounded-full scale-50" />
                                <div className="w-56 h-56 bg-white border border-slate-100 text-emerald-500 rounded-[72px] flex items-center justify-center shadow-2xl relative group overflow-hidden">
                                    <div className="absolute inset-0 bg-emerald-500 text-white scale-0 group-hover:scale-100 transition-transform duration-700 rounded-[72px] flex items-center justify-center">
                                        <CheckCircle size={80} strokeWidth={1} />
                                    </div>
                                    <CheckCircle size={80} strokeWidth={1} className="relative z-10 transition-transform duration-700" />
                                </div>
                            </div>
                            <div className="space-y-8">
                                <h2 className="text-7xl font-black tracking-tighter text-slate-900 uppercase leading-[0.8] italic font-serif">Protocol <br /><span className="text-emerald-500">Initialized.</span></h2>
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.5em] italic max-w-xs mx-auto">
                                    Your partner signature is ready for audit and network activation.
                                </p>
                            </div>

                            <button onClick={finishOnboarding} disabled={loading} className="w-full h-24 bg-slate-950 text-white rounded-[40px] font-black uppercase text-[11px] tracking-[0.5em] hover:bg-emerald-500 transition-all shadow-3xl shadow-slate-950/30 active:scale-[0.98] flex items-center justify-center gap-8 group">
                                {loading ? (
                                    <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Authorize Final Configuration</span>
                                        <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                                    </>
                                )}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

function FormInput({ label, value, onChange, placeholder, icon }) {
    return (
        <div className="space-y-4 group">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] ml-2 group-focus-within:text-emerald-600 transition-colors italic">{label}</label>
            <div className="relative">
                <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-emerald-500 transition-colors">{icon}</div>
                <input
                    value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                    className="w-full h-24 bg-white/50 border border-slate-100 rounded-[32px] pl-24 pr-10 font-bold text-2xl tracking-tighter text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-100 shadow-sm"
                />
            </div>
        </div>
    );
}

function FormSelect({ label, value, onChange, options }) {
    return (
        <div className="space-y-4 group">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] ml-2 italic">{label}</label>
            <div className="relative">
                <select
                    value={value} onChange={e => onChange(e.target.value)}
                    className="w-full h-24 bg-white/50 border border-slate-100 rounded-[32px] px-10 font-bold text-2xl tracking-tighter text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all appearance-none uppercase shadow-sm cursor-pointer"
                >
                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none text-slate-200 group-hover:text-emerald-500 transition-colors"><ChevronDown size={24} /></div>
            </div>
        </div>
    );
}

function Nav({ back, next }) {
    return (
        <div className="flex gap-6 mt-16 pt-16 border-t border-slate-100">
            {back && (
                <button onClick={back} className="h-20 flex-1 bg-white text-slate-400 rounded-[28px] font-black uppercase text-[10px] tracking-[0.4em] hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center justify-center gap-4 border border-slate-100">
                    <ArrowLeft size={18} /> Prev
                </button>
            )}
            {next && (
                <button onClick={next} className="h-20 flex-[2] bg-slate-950 text-white rounded-[28px] font-black uppercase text-[10px] tracking-[0.5em] hover:bg-emerald-600 transition-all flex items-center justify-center gap-4 shadow-xl shadow-slate-950/10 active:scale-[0.98]">
                    Continue <ArrowRight size={18} />
                </button>
            )}
        </div>
    );
}
