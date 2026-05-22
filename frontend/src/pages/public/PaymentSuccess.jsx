import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WayzzaLayout } from '../../WayzzaUI.jsx';
import { CheckCircle, Home, Calendar, ShieldCheck, Loader2 } from 'lucide-react';
import SEO from '../../components/SEO.jsx';

/**
 * PaymentSuccess.jsx — Pure display page.
 *
 * Payment confirmation (razorpay_payment_id / signature verification) is handled
 * entirely inside Payment.jsx's Razorpay handler callback BEFORE navigating here.
 * This page must NOT make any additional /confirm API calls — doing so with fake
 * or missing payment IDs is a critical security vulnerability.
 */
export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-redirect to My Bookings after 10 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/my-bookings');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate, isPaused]);

  return (
    <WayzzaLayout noPadding>
      <SEO title="Booking Confirmed — Wayzza" noindex={true} />
      <div className="min-h-screen bg-white font-sans flex flex-col items-center justify-center py-20 px-6">
        <div className="max-w-xl w-full flex flex-col items-center text-center space-y-8">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center"
          >
            <CheckCircle size={48} strokeWidth={2} />
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Booking confirmed!
            </h1>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              Thank you for your reservation. Your booking is now officially confirmed and secured.
            </p>
          </motion.div>

          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-50 border border-slate-100 rounded-3xl p-6 w-full text-left flex items-start gap-4"
          >
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="text-emerald-500" size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">Secure Confirmation</h4>
              <p className="text-xs text-slate-500 font-medium">
                Your payment has been successfully processed and verified by Razorpay. Your dates
                are now blocked in our system.
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col md:flex-row gap-4 w-full pt-4"
          >
            <Link
              to="/my-bookings"
              className="flex-1 h-14 bg-slate-900 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Calendar size={18} /> My Bookings
            </Link>
            <Link
              to="/"
              className="flex-1 h-14 bg-white border border-slate-200 text-slate-900 rounded-2xl font-bold text-sm uppercase tracking-widest hover:border-emerald-500 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Home size={18} /> Go Home
            </Link>
          </motion.div>

          {/* Auto-redirect countdown */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 justify-center">
              <Loader2
                size={12}
                className={`animate-spin ${isPaused ? '[animation-play-state:paused]' : ''}`}
              />
              {isPaused ? 'Auto-redirect paused' : `Redirecting to My Bookings in ${countdown}s…`}
            </p>
            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold uppercase tracking-wider underline active:scale-95 transition-all"
            >
              {isPaused ? 'Resume Redirect' : 'Pause Redirect'}
            </button>
          </div>

          <p className="text-xs text-slate-400 font-medium pt-2">
            A confirmation email with all the details has been sent to your inbox.
          </p>
        </div>
      </div>
    </WayzzaLayout>
  );
}
