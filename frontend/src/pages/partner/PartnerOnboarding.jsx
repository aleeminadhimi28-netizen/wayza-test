import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, MapPin, PlusCircle, CheckCircle, ArrowRight, ArrowLeft, Activity, Sparkles, Building, Wallet, Navigation } from "lucide-react";
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
        <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center p-6 relative overflow-hidden selection:bg-emerald-100 selection:text-emerald-900">

            {/* CINEMATIC BACKGROUND */}
            <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-500/[0.03] blur-[150px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-900/[0.02] blur-3xl pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-3xl bg-white rounded-[64px] p-12 md:p-20 shadow-2xl shadow-slate-950/5 border border-slate-100 relative overflow-hidden"
            >
                {/* PROGRESS TRACKER */}
                <div className="flex items-center gap-6 mb-24 relative z-10">
                    {steps.map((s, i) => (
                        <div key={s.id} className="flex-1 space-y-4">
                            <div className={`h-2.5 rounded-full transition-all duration-1000 ${step >= s.id ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-100'}`} />
                            <div className={`flex items-center gap-3 transition-opacity duration-500 ${step === s.id ? 'opacity-100' : 'opacity-20'}`}>
                                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-900">{s.title}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-16 relative z-10">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 text-emerald-600 font-bold text-[10px] uppercase tracking-[0.4em] italic">
                                    <Sparkles size={16} className="animate-pulse" /> Setup Phase 01
                                </div>
                                <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-900 uppercase leading-[0.9]">Partner <br /><span className="text-emerald-500 italic font-serif lowercase">Identity.</span></h2>
                                <p className="text-slate-400 font-medium text-lg italic max-w-sm">"Tell us about your brand. This identity will be visible to guests across the Wayza collection."</p>
                            </div>

                            <div className="space-y-12">
                                <FormInput label="Account Name (Business Name)" value={businessName} onChange={setBusinessName} placeholder="E.G. AZURE CLIFF RESORT" icon={<Building size={24} />} />
                                <FormSelect
                                    label="Service Category"
                                    value={category}
                                    onChange={setCategory}
                                    options={[
                                        { value: "hotel", label: "Hospitality & Stays" },
                                        { value: "bike", label: "Two-Wheeler Mobility" },
                                        { value: "car", label: "Four-Wheeler Mobility" },
                                        { value: "activity", label: "Local Experiences" }
                                    ]}
                                />
                            </div>
                            <Nav next={() => setStep(2)} />
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-16 relative z-10">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 text-emerald-600 font-bold text-[10px] uppercase tracking-[0.4em] italic">
                                    <Navigation size={16} /> Setup Phase 02
                                </div>
                                <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-900 uppercase leading-[0.9]">Primary <br /><span className="text-emerald-500 italic font-serif lowercase">Location.</span></h2>
                                <p className="text-slate-400 font-medium text-lg italic max-w-sm">"Specify your primary area of operation. We use this to map your properties for guests."</p>
                            </div>

                            <div className="space-y-12">
                                <FormInput label="Geographic Location" value={location} onChange={setLocation} placeholder="E.G. VARKALA CLIFF, KERALA" icon={<MapPin size={24} />} />
                                <div className="p-10 bg-emerald-50 border border-emerald-100 rounded-[32px] italic text-[11px] font-bold text-emerald-900 uppercase tracking-widest leading-relaxed opacity-60">
                                    "Accuracy is essential. Your properties will be discovered based on the location parameters provided here."
                                </div>
                            </div>
                            <Nav back={() => setStep(1)} next={() => setStep(3)} />
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-16 relative z-10">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 text-emerald-600 font-bold text-[10px] uppercase tracking-[0.4em] italic">
                                    <PlusCircle size={16} /> Setup Phase 03
                                </div>
                                <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-900 uppercase leading-[0.9]">Initial <br /><span className="text-emerald-500 italic font-serif lowercase">Listing.</span></h2>
                                <p className="text-slate-400 font-medium text-lg italic max-w-sm">"Create your first entry. You can always refine these details and add more later."</p>
                            </div>

                            <div className="space-y-12">
                                <FormInput label="Stay Title" value={listingName} onChange={setListingName} placeholder="E.G. LUXE OCEAN FRONT SUITE" icon={<Building size={24} />} />
                                <FormInput label="Nightly Investment (INR)" value={price} onChange={setPrice} placeholder="4999" icon={<Wallet size={24} />} />
                            </div>
                            <Nav back={() => setStep(2)} next={() => setStep(4)} />
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-20 relative z-10">
                            <div className="flex justify-center">
                                <div className="w-48 h-48 bg-emerald-50 text-emerald-500 rounded-[56px] flex items-center justify-center shadow-inner relative group overflow-hidden">
                                    <div className="absolute inset-0 bg-emerald-500/10 scale-0 group-hover:scale-100 transition-transform duration-700 rounded-full" />
                                    <CheckCircle size={80} strokeWidth={1} className="relative z-10 group-hover:scale-110 transition-transform duration-700" />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h2 className="text-6xl font-bold tracking-tighter text-slate-900 uppercase leading-none italic">Configuration <br /><span className="text-emerald-500">Complete.</span></h2>
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] italic max-w-xs mx-auto">
                                    Your partner profile is ready to be published to the Wayza network.
                                </p>
                            </div>

                            <button onClick={finishOnboarding} disabled={loading} className="w-full h-24 bg-slate-900 text-white rounded-[36px] font-bold uppercase text-[11px] tracking-[0.4em] hover:bg-emerald-600 transition-all shadow-3xl shadow-slate-950/20 active:scale-95 flex items-center justify-center gap-8">
                                {loading ? (
                                    <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Finalize Account Setup</span>
                                        <ArrowRight size={24} />
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
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em] ml-2 group-focus-within:text-emerald-600 transition-colors">{label}</label>
            <div className="relative">
                <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-emerald-600 transition-colors">{icon}</div>
                <input
                    value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                    className="w-full h-24 bg-slate-50 border border-slate-100 rounded-[32px] pl-24 pr-10 font-bold text-2xl tracking-tighter text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-100 shadow-inner"
                />
            </div>
        </div>
    );
}

function FormSelect({ label, value, onChange, options }) {
    return (
        <div className="space-y-4 group">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em] ml-2">{label}</label>
            <div className="relative">
                <select
                    value={value} onChange={e => onChange(e.target.value)}
                    className="w-full h-24 bg-slate-50 border border-slate-100 rounded-[32px] px-10 font-bold text-2xl tracking-tighter text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all appearance-none uppercase shadow-inner"
                >
                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none text-slate-200 group-hover:text-emerald-500 transition-colors"><ArrowRight size={24} className="rotate-90" /></div>
            </div>
        </div>
    );
}

function Nav({ back, next }) {
    return (
        <div className="flex gap-6 mt-16 pt-16 border-t border-slate-100">
            {back && (
                <button onClick={back} className="h-20 flex-1 bg-white text-slate-400 rounded-[24px] font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-slate-50 hover:text-slate-950 transition-all flex items-center justify-center gap-4 border border-slate-100">
                    <ArrowLeft size={18} /> Back
                </button>
            )}
            {next && (
                <button onClick={next} className="h-20 flex-[2] bg-slate-900 text-white rounded-[24px] font-bold uppercase text-[10px] tracking-[0.4em] hover:bg-emerald-600 transition-all flex items-center justify-center gap-4 shadow-3xl shadow-slate-950/10 active:scale-95">
                    Continue <ArrowRight size={18} />
                </button>
            )}
        </div>
    );
}