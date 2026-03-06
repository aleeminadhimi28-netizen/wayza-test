import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export default function Privacy() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto px-6 py-24 font-sans text-slate-900"
        >
            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600">
                    <Shield size={32} />
                </div>
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
                    <p className="text-slate-500 font-medium">Last updated: March 6, 2024</p>
                </div>
            </div>

            <div className="space-y-12 leading-relaxed">
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Eye size={20} className="text-emerald-500" />
                        1. Information We Collect
                    </h2>
                    <p className="text-slate-600 mb-4">
                        We collect information you provide directly to us when you create an account, make a booking, or communicate with us. This includes your name, email address, phone number, and payment information.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Lock size={20} className="text-emerald-500" />
                        2. How We Use Your Data
                    </h2>
                    <p className="text-slate-600 mb-4">
                        We use your data to process bookings, verify accounts, provide customer support, and send platform updates. We do not sell your personal information to third parties.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-emerald-500" />
                        3. Cookies & Tracking
                    </h2>
                    <p className="text-slate-600 mb-4">
                        Wayza uses cookies to enhance your browsing experience, remember your preferences, and analyze site traffic for performance improvements.
                    </p>
                </section>

                <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 italic text-slate-500 text-sm">
                    By using Wayza, you agree to the collection and use of information in accordance with this policy. If you have questions about your privacy, contact us at privacy@wayza.com.
                </div>
            </div>
        </motion.div>
    );
}
