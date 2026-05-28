import { useState } from 'react';
import { Star, Shield, CheckCircle, CreditCard, Minus, Plus, Calendar } from 'lucide-react';

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
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-900/5">
      {/* ── Emerald gradient accent strip ── */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400" />

      <div className="p-7">
        {/* ── Price + Rating ── */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-900 tracking-tight">
                ₹{basePrice.toLocaleString()}
              </span>
              <span className="text-sm text-slate-400 font-medium">
                / {isVehicle ? 'day' : 'night'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-slate-700">{avgRating || 'New'}</span>
              <span className="text-xs text-slate-400">
                · {reviewsCount} review{reviewsCount !== 1 ? 's' : ''}
                {avgRating && parseFloat(avgRating) >= 9 ? ' · Exceptional' : ''}
              </span>
            </div>
          </div>
          {avgRating && parseFloat(avgRating) >= 4.5 && (
            <div className="px-2.5 py-1.5 bg-amber-50 border border-amber-100 rounded-xl shrink-0">
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                Top Rated
              </span>
            </div>
          )}
        </div>

        {/* ── Date pickers ── */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden mb-3">
          <div className="grid grid-cols-2 divide-x divide-slate-200">
            {/* Check-in */}
            <div className="p-4 hover:bg-emerald-50/50 transition-colors cursor-pointer relative group">
              <div className="absolute top-4 left-3.5 text-slate-300 group-hover:text-emerald-500 transition-colors pointer-events-none">
                <Calendar size={13} />
              </div>
              <label
                htmlFor="booking-card-check-in"
                className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 pl-5 cursor-pointer"
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
            <div className="p-4 hover:bg-emerald-50/50 transition-colors cursor-pointer relative group">
              <div className="absolute top-4 left-3.5 text-slate-300 group-hover:text-emerald-500 transition-colors pointer-events-none">
                <Calendar size={13} />
              </div>
              <label
                htmlFor="booking-card-check-out"
                className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 pl-5 cursor-pointer"
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
          <div className="border border-slate-200 rounded-2xl p-4 mb-5 hover:border-slate-300 transition-colors">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Guests
            </label>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">
                {guests} guest{guests > 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  disabled={guests <= 1}
                  aria-label="Decrease guest count"
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-30 transition-all"
                >
                  <Minus size={13} />
                </button>
                <span className="w-5 text-center text-sm font-bold text-slate-900">{guests}</span>
                <button
                  onClick={() => setGuests((g) => Math.min(16, g + 1))}
                  disabled={guests >= 16}
                  aria-label="Increase guest count"
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-30 transition-all"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Reserve button with slide-up hover animation ── */}
        <button
          onClick={handleReserve}
          disabled={reserving}
          className={`relative w-full py-4 bg-slate-950 text-white font-black uppercase text-xs tracking-[0.3em] rounded-2xl transition-all duration-300 active:scale-[0.98] shadow-lg shadow-slate-900/15 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden group ${
            isVehicle ? 'mt-4' : ''
          }`}
        >
          {/* Hover fill */}
          <span className="absolute inset-0 bg-emerald-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-2xl" />
          <span className="relative flex items-center gap-2">
            {reserving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying Price...
              </>
            ) : (
              'Reserve Now'
            )}
          </span>
        </button>

        {/* ── Price Breakdown ── */}
        <div className="mt-5 space-y-3">
          {nights > 0 ? (
            <>
              <div className="flex justify-between text-sm text-slate-500">
                <span>
                  ₹{basePrice.toLocaleString()} ×{' '}
                  {nights}{' '}
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
                <span className="font-semibold text-slate-700">₹{serviceFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-black text-slate-900 pt-3 border-t-2 border-slate-100 text-base">
                <span>Total</span>
                <span className="text-emerald-700">₹{total.toLocaleString()}</span>
              </div>
            </>
          ) : (
            <p className="text-center text-xs text-slate-400 py-3 bg-slate-50 rounded-xl">
              Select dates to see pricing
            </p>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-3">You won&apos;t be charged yet</p>

        {/* ── Trust Badges ── */}
        <div className="flex justify-center gap-6 mt-5 pt-5 border-t border-slate-100">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
              <Shield size={16} className="text-slate-500" />
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Secure</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CheckCircle size={16} className="text-emerald-500" />
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Verified</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
              <CreditCard size={16} className="text-amber-500" />
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Razorpay</span>
          </div>
        </div>
      </div>
    </div>
  );
}
