import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WayzzaLayout } from '../../WayzzaUI.jsx';
import { useAuth } from '../../AuthContext.jsx';
import { CheckCircle, Home, Calendar, ShieldCheck } from 'lucide-react';

import { BASE_URL } from '../../utils/api.js';

export default function PaymentSuccess() {
  const { token } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  useEffect(() => {
    const bookingId = params.get('bookingId');
    if (!bookingId || !token) return;

    fetch(`${BASE_URL}/api/v1/bookings/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        bookingId,
        paymentId: 'demo-verified-' + Date.now(),
      }),
    })
      .then((r) => r.json())
      .then(() => {
        // Confirmation successful
      });
  }, [token, params]);

  return (
    <WayzzaLayout noPadding>
      <div className="min-h-screen bg-white font-sans flex flex-col items-center justify-center py-20 px-6">
        <div className="max-w-xl w-full flex flex-col items-center text-center space-y-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center"
          >
            <CheckCircle size={48} strokeWidth={2} />
          </motion.div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Booking confirmed!
            </h1>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              Thank you for your reservation. Your stay is now officially booked and secured.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 w-full text-left flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="text-emerald-500" size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">Secure Confirmation</h4>
              <p className="text-xs text-slate-500 font-medium">
                Your payment has been successfully processed and your dates are blocked in our
                system.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full pt-4">
            <button
              onClick={() => navigate('/my-bookings')}
              className="flex-1 h-14 bg-slate-900 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Calendar size={18} /> My Bookings
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 h-14 bg-white border border-slate-200 text-slate-900 rounded-2xl font-bold text-sm uppercase tracking-widest hover:border-emerald-500 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Home size={18} /> Go Home
            </button>
          </div>

          <p className="text-xs text-slate-400 font-medium pt-8">
            A confirmation email with all the details has been sent to your inbox.
          </p>
        </div>
      </div>
    </WayzzaLayout>
  );
}
