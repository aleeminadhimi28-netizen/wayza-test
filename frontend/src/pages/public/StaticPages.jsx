import { WayzaLayout } from "../../WayzaUI.jsx";
import { motion } from "framer-motion";
import { Shield, Lock, FileText, Globe, Zap, Compass, Activity, Server, Sparkles, CheckCircle, Heart, Star } from "lucide-react";

export default function StaticPage({ title, children, icon }) {
    return (
        <WayzaLayout noPadding>
            <div className="min-h-screen bg-slate-50 font-sans overflow-hidden">

                {/* REFINED HERO */}
                <header className="bg-white py-32 px-6 relative overflow-hidden border-b border-slate-200">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] -mr-32 -mt-32" />
                    <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center space-y-6">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center shadow-inner border-4 border-white"
                        >
                            {icon || <FileText size={32} strokeWidth={1.5} />}
                        </motion.div>
                        <div className="space-y-4">
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-emerald-600 font-bold text-[10px] uppercase tracking-widest block"
                            >
                                Information & Transparency
                            </motion.span>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight uppercase leading-none"
                            >
                                {title}<span className="text-emerald-500">.</span>
                            </motion.h1>
                        </div>
                    </div>
                </header>

                {/* CONTENT MODULE */}
                <main className="max-w-5xl mx-auto px-6 -mt-16 pb-40 relative z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-[48px] p-10 md:p-20 shadow-2xl border border-slate-100 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 blur-3xl -ml-16 -mt-16 pointer-events-none" />

                        <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-p:text-slate-600 prose-p:font-medium prose-headings:text-slate-900 prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-tight prose-strong:text-slate-900 prose-li:text-slate-600 prose-li:font-medium">
                            {children}
                        </div>

                        {/* FOOTER ACCENT */}
                        <div className="mt-32 pt-16 border-t border-slate-100 flex flex-wrap gap-12 justify-center">
                            <div className="flex flex-col items-center gap-2 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-default group">
                                <Shield size={24} className="text-emerald-600 group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-900">Secure</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-default group">
                                <Activity size={24} className="text-emerald-600 group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-900">Verified</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-default group">
                                <Globe size={24} className="text-emerald-600 group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-900">Global</span>
                            </div>
                        </div>
                    </motion.div>
                </main>
            </div>
        </WayzaLayout>
    );
}

export function PrivacyPolicy() {
    return (
        <StaticPage title="Privacy Policy" icon={<Lock size={32} />}>
            <p className="text-xl text-slate-900 font-bold mb-10">Last Updated: {new Date().toLocaleDateString()}</p>
            <p>At Wayza, we value your privacy and are committed to protecting your personal information. This policy outlines how we collect, use, and safeguard your data to provide a seamless travel experience.</p>

            <h2 className="text-2xl mt-16 mb-8 flex items-center gap-4">
                <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                Information We Collect
            </h2>
            <p>We only collect and process information that is necessary to provide our services and ensure a secure environment for all users:</p>
            <ul>
                <li><strong>Profile Information:</strong> Your name, email, and profile details provided during account creation.</li>
                <li><strong>Contact Information:</strong> Details used to communicate with you regarding bookings and updates.</li>
                <li><strong>Booking History:</strong> Records of your completed and upcoming stays and experiences.</li>
            </ul>

            <h2 className="text-2xl mt-16 mb-8 flex items-center gap-4">
                <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                How We Use Data
            </h2>
            <p>Your data is used strictly for provide our services, including: Confirming bookings, protecting your account, and providing personalized travel recommendations to enhance your journey.</p>

            <h2 className="text-2xl mt-16 mb-8 flex items-center gap-4">
                <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                Data Security
            </h2>
            <p>We use industry-standard encryption and security protocols to prevent unauthorized access. Your data is protected throughout its transit and storage within our platform.</p>
        </StaticPage>
    );
}

export function TermsOfService() {
    return (
        <StaticPage title="Terms of Service" icon={<Shield size={32} />}>
            <p className="text-xl text-slate-900 font-bold mb-10">Effective Date: {new Date().toLocaleDateString()}</p>
            <p>The following guidelines define the usage of the Wayza platform. By using our services, you agree to adhere to these terms and conditions.</p>

            <h2 className="text-2xl mt-16 mb-8 flex items-center gap-4">
                <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                User Registration
            </h2>
            <p>To use Wayza, you must provide accurate and current information. Maintaining the security of your account credentials is your responsibility.</p>

            <h2 className="text-2xl mt-16 mb-8 flex items-center gap-4">
                <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                Property Care
            </h2>
            <p>During your stay at our partner properties, we ask that you respect the property rules and maintain the space. Any damage incurred may be subject to our resolution process.</p>

            <h2 className="text-2xl mt-16 mb-8 flex items-center gap-4">
                <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                Service Termination
            </h2>
            <p>Wayza reserves the right to suspend or terminate accounts that violate our terms or exhibit inappropriate conduct within our community.</p>
        </StaticPage>
    );
}

export function AboutUs() {
    return (
        <StaticPage title="The Wayza Story" icon={<Compass size={32} />}>
            <p className="text-3xl font-bold tracking-tight text-emerald-600 uppercase mb-10">Extraordinary Stays. Simplified.</p>
            <p className="text-xl text-slate-600 font-medium mb-10 leading-relaxed">
                Wayza is a premier platform for luxury travel, designed to connect discerning travelers with unique stays and unforgettable experiences.
            </p>
            <p className="mb-10">
                Founded on the principles of quality and transparency, Wayza curates peaceful retreats, adventurous stays, and professional hosting services into one seamless platform. Whether you're looking for a coastal sanctuary or a city hideaway, our platform ensures a seamless and premium experience from start to finish.
            </p>

            <h2 className="text-2xl mt-20 mb-10 uppercase tracking-tight font-bold border-b border-slate-100 pb-6">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                <div className="bg-slate-50 p-10 rounded-[32px] border border-slate-100 hover:border-emerald-500 hover:bg-white transition-all duration-300 group">
                    <Star size={32} className="text-emerald-500 mb-6 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-lg uppercase tracking-tight text-slate-900 m-0">Curated Properties</h4>
                    <p className="text-sm mt-4 mb-0 text-slate-400 font-medium leading-relaxed">Every property on Wayza undergoes a rigorous quality check to ensure a premium stay for our guests.</p>
                </div>
                <div className="bg-slate-50 p-10 rounded-[32px] border border-slate-100 hover:border-emerald-500 hover:bg-white transition-all duration-300 group">
                    <Lock size={32} className="text-emerald-500 mb-6 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-lg uppercase tracking-tight text-slate-900 m-0">Safe & Secure</h4>
                    <p className="text-sm mt-4 mb-0 text-slate-400 font-medium leading-relaxed">We use industry-standard security to protect your data and transactions throughout your journey.</p>
                </div>
                <div className="bg-slate-50 p-10 rounded-[32px] border border-slate-100 hover:border-emerald-500 hover:bg-white transition-all duration-300 group">
                    <Sparkles size={32} className="text-emerald-500 mb-6 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-lg uppercase tracking-tight text-slate-900 m-0">Transparent Pricing</h4>
                    <p className="text-sm mt-4 mb-0 text-slate-400 font-medium leading-relaxed">What you see is what you pay. No hidden fees, just honest pricing from our verified hosts.</p>
                </div>
                <div className="bg-slate-50 p-10 rounded-[32px] border border-slate-100 hover:border-emerald-500 hover:bg-white transition-all duration-300 group">
                    <Heart size={32} className="text-emerald-500 mb-6 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-lg uppercase tracking-tight text-slate-900 m-0">Always Here for You</h4>
                    <p className="text-sm mt-4 mb-0 text-slate-400 font-medium leading-relaxed">Our support team is available around the clock to assist you with any of your travel needs.</p>
                </div>
            </div>
        </StaticPage>
    );
}
