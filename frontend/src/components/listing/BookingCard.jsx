import { useState } from 'react';
import {
  Star,
  Shield,
  CheckCircle,
  CreditCard,
  Minus,
  Plus,
  Calendar,
  Zap,
  Lock,
} from 'lucide-react';

export default function BookingCard({
  basePrice,
  avgRating,
  reviewsCount,
  checkIn,
  checkOut,
  setCheckIn,
  setCheckOut,
  today,
  handleReserve,
  nights,
  gst,
  gstRate,
  isVehicle,
  serviceFee,
  total,
  reserving = false,
}) {
  const [guests, setGuests] = useState(1);

  return (
    <div
      className="relative rounded-3xl overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fffe 100%)',
        boxShadow:
          '0 0 0 1px rgba(16,185,129,0.12), 0 20px 60px -10px rgba(16,185,129,0.15), 0 8px 30px rgba(0,0,0,0.08)',
      }}
    >
      {/* ── Premium top gradient bar ── */}
      <div
        className="h-1.5 w-full"
        style={{
          background: 'linear-gradient(90deg, #10b981 0%, #34d399 40%, #6ee7b7 70%, #10b981 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s ease-in-out infinite',
        }}
      />

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(16,185,129,0.3), 0 4px 15px rgba(0,0,0,0.15); }
          50% { box-shadow: 0 0 35px rgba(16,185,129,0.5), 0 4px 20px rgba(0,0,0,0.2); }
        }
        .reserve-btn:hover { animation: none; }
        .reserve-btn { animation: pulse-glow 2.5s ease-in-out infinite; }
      `}</style>

      <div className="p-6 md:p-7">
        {/* ── Price + Rating ── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span
                className="font-black tracking-tight text-slate-900"
                style={{ fontSize: '2.4rem', lineHeight: 1 }}
              >
                ₹{basePrice.toLocaleString()}
              </span>
              <span className="text-sm text-slate-400 font-medium">
                / {isVehicle ? 'day' : 'night'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-2">
              {/* Star row */}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={11}
                    className={
                      avgRating && i <= Math.round(parseFloat(avgRating))
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-slate-200 text-slate-200'
                    }
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700">{avgRating || 'New'}</span>
              <span className="text-xs text-slate-400">
                ·{' '}
                {reviewsCount > 0
                  ? `${reviewsCount} review${reviewsCount !== 1 ? 's' : ''}`
                  : 'Be the first'}
              </span>
            </div>
          </div>

          {/* Badge */}
          {nights > 0 && (
            <div
              className="flex flex-col items-end gap-0.5 px-3 py-2 rounded-2xl shrink-0"
              style={{
                background:
                  'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(52,211,153,0.08) 100%)',
                border: '1px solid rgba(16,185,129,0.2)',
              }}
            >
              <span className="text-[11px] font-black text-emerald-700 leading-none">
                {nights}{' '}
                {isVehicle ? (nights > 1 ? 'days' : 'day') : nights > 1 ? 'nights' : 'night'}
              </span>
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                selected
              </span>
            </div>
          )}
        </div>

        {/* ── Date pickers ── */}
        <div
          className="rounded-2xl overflow-hidden mb-3"
          style={{
            border: '1.5px solid rgba(16,185,129,0.2)',
            background: 'rgba(248,255,252,0.8)',
          }}
        >
          <div
            className="grid grid-cols-2 divide-x"
            style={{ '--tw-divide-opacity': 1, borderColor: 'rgba(16,185,129,0.15)' }}
          >
            {/* Check-in */}
            <div className="p-4 hover:bg-emerald-50/60 transition-colors cursor-pointer relative group">
              <div className="absolute top-4 left-3.5 text-slate-300 group-hover:text-emerald-500 transition-colors pointer-events-none">
                <Calendar size={12} />
              </div>
              <label
                htmlFor="booking-card-check-in"
                className="block text-[9px] font-black uppercase tracking-[0.15em] mb-1.5 pl-5 cursor-pointer"
                style={{ color: '#10b981' }}
              >
                {isVehicle ? 'Pick-up' : 'Check-in'}
              </label>
              <input
                id="booking-card-check-in"
                type="date"
                value={checkIn}
                min={today}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full text-sm font-bold text-slate-900 bg-transparent outline-none cursor-pointer [color-scheme:light] appearance-none pl-5"
              />
            </div>
            {/* Check-out */}
            <div
              className="p-4 hover:bg-emerald-50/60 transition-colors cursor-pointer relative group"
              style={{ borderLeftColor: 'rgba(16,185,129,0.15)' }}
            >
              <div className="absolute top-4 left-3.5 text-slate-300 group-hover:text-emerald-500 transition-colors pointer-events-none">
                <Calendar size={12} />
              </div>
              <label
                htmlFor="booking-card-check-out"
                className="block text-[9px] font-black uppercase tracking-[0.15em] mb-1.5 pl-5 cursor-pointer"
                style={{ color: '#10b981' }}
              >
                {isVehicle ? 'Drop-off' : 'Check-out'}
              </label>
              <input
                id="booking-card-check-out"
                type="date"
                value={checkOut}
                min={checkIn || today}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full text-sm font-bold text-slate-900 bg-transparent outline-none cursor-pointer [color-scheme:light] appearance-none pl-5"
              />
            </div>
          </div>
        </div>

        {/* ── Guests (stays only) ── */}
        {!isVehicle && (
          <div
            className="rounded-2xl p-4 mb-5 transition-colors"
            style={{
              border: '1.5px solid rgba(16,185,129,0.15)',
              background: 'rgba(248,255,252,0.8)',
            }}
          >
            <label
              className="block text-[9px] font-black uppercase tracking-[0.15em] mb-2"
              style={{ color: '#10b981' }}
            >
              Guests
            </label>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">
                {guests} guest{guests > 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  disabled={guests <= 1}
                  aria-label="Decrease guest count"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 disabled:opacity-25 transition-all hover:scale-110 active:scale-95"
                  style={{
                    border: '1.5px solid rgba(16,185,129,0.3)',
                    background: 'rgba(16,185,129,0.05)',
                  }}
                >
                  <Minus size={12} />
                </button>
                <span className="w-5 text-center text-sm font-black text-slate-900">{guests}</span>
                <button
                  onClick={() => setGuests((g) => Math.min(16, g + 1))}
                  disabled={guests >= 16}
                  aria-label="Increase guest count"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 disabled:opacity-25 transition-all hover:scale-110 active:scale-95"
                  style={{
                    border: '1.5px solid rgba(16,185,129,0.3)',
                    background: 'rgba(16,185,129,0.05)',
                  }}
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Reserve CTA ── */}
        <button
          onClick={handleReserve}
          disabled={reserving}
          className={`reserve-btn relative w-full py-4 text-white font-black uppercase text-xs tracking-[0.3em] rounded-2xl transition-all duration-300 active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 overflow-hidden group ${isVehicle ? 'mt-4' : ''}`}
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
          }}
        >
          {/* Animated shimmer overlay on hover */}
          <span
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%)',
            }}
          />
          <span className="relative flex items-center gap-2.5">
            {reserving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying Price...
              </>
            ) : (
              <>
                <Zap size={14} className="fill-white" />
                Reserve Now
              </>
            )}
          </span>
        </button>

        {/* ── Price Breakdown ── */}
        <div className="mt-5 space-y-2.5">
          {nights > 0 ? (
            <>
              <div
                className="rounded-2xl p-4 space-y-2.5"
                style={{
                  background: 'rgba(248,250,252,0.8)',
                  border: '1px solid rgba(226,232,240,0.8)',
                }}
              >
                <div className="flex justify-between text-sm text-slate-500">
                  <span>
                    ₹{basePrice.toLocaleString()} × {nights}{' '}
                    {isVehicle ? `day${nights > 1 ? 's' : ''}` : `night${nights > 1 ? 's' : ''}`}
                  </span>
                  <span className="font-semibold text-slate-700">
                    ₹{(basePrice * nights).toLocaleString()}
                  </span>
                </div>
                {!isVehicle && gst > 0 && (
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>GST ({Math.round(gstRate * 100)}%)</span>
                    <span className="font-semibold text-slate-700">₹{gst.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Wayzza service fee</span>
                  <span className="font-semibold text-slate-700">
                    ₹{serviceFee.toLocaleString()}
                  </span>
                </div>
                <div
                  className="flex justify-between font-black text-base pt-2.5"
                  style={{ borderTop: '1.5px solid rgba(16,185,129,0.2)' }}
                >
                  <span className="text-slate-900">Total</span>
                  <span style={{ color: '#059669' }}>₹{total.toLocaleString()}</span>
                </div>
              </div>
            </>
          ) : (
            <div
              className="text-center text-xs text-slate-400 py-3.5 rounded-xl"
              style={{ background: 'rgba(241,245,249,0.8)' }}
            >
              Select dates to see full pricing
            </div>
          )}
        </div>

        {/* ── No-charge note ── */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <Lock size={10} className="text-slate-400" />
          <p className="text-center text-xs text-slate-400">You won&apos;t be charged yet</p>
        </div>

        {/* ── Trust Badges ── */}
        <div
          className="flex justify-around mt-5 pt-5"
          style={{ borderTop: '1px solid rgba(226,232,240,0.8)' }}
        >
          {[
            { icon: Shield, label: 'Secure', color: '#64748b', bg: 'rgba(241,245,249,0.9)' },
            { icon: CheckCircle, label: 'Verified', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
            { icon: CreditCard, label: 'Razorpay', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
          ].map(({ icon: Icon, label, color, bg }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: bg }}
              >
                <Icon size={15} style={{ color }} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wide text-slate-400">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
