import { motion } from "framer-motion";
import { Scale, CheckCircle, AlertCircle, HelpCircle } from "lucide-react";

export default function Terms() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto px-6 py-24 font-sans text-slate-900"
        >
            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600">
                    <Scale size={32} />
                </div>
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
                    <p className="text-slate-500 font-medium">Last updated: March 6, 2024</p>
                </div>
            </div>

            <div className="space-y-12 leading-relaxed">
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <CheckCircle size={20} className="text-blue-500" />
                        1. Acceptance of Terms
                    </h2>
                    <p className="text-slate-600 mb-4">
                        By accessing or using the Wayza platform, you agree to be bound by these Terms of Service. If you do not agree, you may not use our services.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <AlertCircle size={20} className="text-blue-500" />
                        2. Booking & Cancellation
                    </h2>
                    <p className="text-slate-600 mb-4">
                        All bookings are subject to the specific cancellation policy of the property or experience provider. Wayza acts as an intermediary and is not responsible for provider-side cancellations.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <HelpCircle size={20} className="text-blue-500" />
                        3. Liability
                    </h2>
                    <p className="text-slate-600 mb-4">
                        Wayza is not liable for any physical injury, property damage, or theft occurring during a stay or experience booked through our platform. Users are encouraged to maintain their own travel insurance.
                    </p>
                </section>

                <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 italic text-slate-500 text-sm">
                    Wayza reserves the right to terminate accounts that violate our community guidelines or engage in fraudulent activity.
                </div>
            </div>
        </motion.div>
    );
}
