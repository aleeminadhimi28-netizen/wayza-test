import { useState } from 'react';
import {
  Star,
  Shield,
  CheckCircle,
  CreditCard,
  Car,
  Bike,
  CalendarDays,
  Zap,
  ArrowRight,
  Clock,
} from 'lucide-react';

export default function VehicleRentalCard({
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
  serviceFee,
  total,
  reserving = false,
  isBike = false,
}) {
  const [agreed, setAgreed] = useState(false);

  const hasSelection = nights > 0 && checkIn && checkOut;

  /* Format date nicely: "20 May" */
  const fmtDate = (str) => {
    if (!str) return null;
    const d = new Date(str);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-900/10 overflow-hidden">
      {/* ── PRICE HERO ─────────────────────────────────────────────── */}
      <div className="relative bg-slate-950 px-8 pt-7 pb-8 overflow-hidden">
        {/* Decorative emerald glow orb */}
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

        {/* Rating pill */}
        {avgRating && (
          <div className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 mb-4">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-white">{avgRating}</span>
            <span className="text-[10px] text-white/40 font-medium">· {reviewsCount} reviews</span>
          </div>
        )}

        {/* Price block */}
        <div className="flex items-end gap-3">
          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">
              Daily Rate
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white tracking-tight leading-none">
                ₹{basePrice.toLocaleString()}
              </span>
              <span className="text-sm text-white/40 font-medium pb-1">/ day</span>
            </div>
          </div>
          <div className="ml-auto mb-1">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              {isBike ? (
                <Bike size={22} className="text-white" />
              ) : (
                <Car size={22} className="text-white" />
              )}
            </div>
          </div>
        </div>

        {/* Duration summary when dates are selected */}
        {hasSelection && (
          <div className="mt-4 flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/20 rounded-xl px-4 py-2.5">
            <Zap size={13} className="text-emerald-400 shrink-0" />
            <span className="text-sm font-bold text-emerald-300">
              {nights} day{nights !== 1 ? 's' : ''} · {fmtDate(checkIn)} → {fmtDate(checkOut)}
            </span>
          </div>
        )}
      </div>

      {/* ── BODY ───────────────────────────────────────────────────── */}
      <div className="p-6 space-y-4">
        {/* DATE PICKERS */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
            Your Rental Dates
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {/* Pick-up */}
            <div
              className={`relative rounded-2xl border-2 transition-all ${checkIn ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
            >
              <div className="px-4 pt-3 pb-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <CalendarDays
                    size={11}
                    className={checkIn ? 'text-emerald-500' : 'text-slate-400'}
                  />
                  <label
                    htmlFor="vehicle-rental-check-in"
                    className="text-[10px] font-bold uppercase tracking-widest text-slate-400 cursor-pointer"
                  >
                    Pick-up
                  </label>
                </div>
                <input
                  id="vehicle-rental-check-in"
                  type="date"
                  value={checkIn}
                  min={today}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full text-sm font-bold text-slate-900 bg-transparent outline-none cursor-pointer [color-scheme:light]"
                />
              </div>
              {checkIn && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                  <CheckCircle size={11} className="text-white" />
                </div>
              )}
            </div>

            {/* Drop-off */}
            <div
              className={`relative rounded-2xl border-2 transition-all ${checkOut ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
            >
              <div className="px-4 pt-3 pb-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <CalendarDays
                    size={11}
                    className={checkOut ? 'text-emerald-500' : 'text-slate-400'}
                  />
                  <label
                    htmlFor="vehicle-rental-check-out"
                    className="text-[10px] font-bold uppercase tracking-widest text-slate-400 cursor-pointer"
                  >
                    Drop-off
                  </label>
                </div>
                <input
                  id="vehicle-rental-check-out"
                  type="date"
                  value={checkOut}
                  min={checkIn || today}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full text-sm font-bold text-slate-900 bg-transparent outline-none cursor-pointer [color-scheme:light]"
                />
              </div>
              {checkOut && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                  <CheckCircle size={11} className="text-white" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PRICE BREAKDOWN */}
        {hasSelection ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden">
            <div className="px-5 py-4 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-medium">
                  ₹{basePrice.toLocaleString()} × {nights} day{nights > 1 ? 's' : ''}
                </span>
                <span className="text-sm font-bold text-slate-900">
                  ₹{(basePrice * nights).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-medium">Wayzza service fee</span>
                <span className="text-sm font-bold text-slate-900">
                  ₹{serviceFee.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center px-5 py-4 bg-slate-900 ">
              <span className="text-sm font-bold text-white/60 uppercase tracking-widest">
                Total
              </span>
              <span className="text-xl font-black text-white">₹{total.toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 px-5 py-5 flex items-center gap-3 text-slate-400">
            <Clock size={16} className="shrink-0" />
            <p className="text-xs font-semibold leading-snug">
              Select pick-up &amp; drop-off dates to see the total price
            </p>
          </div>
        )}

        {/* TERMS */}
        <button
          onClick={() => setAgreed((v) => !v)}
          role="checkbox"
          aria-checked={agreed}
          className="w-full flex items-start gap-3 text-left group"
        >
          <div
            className={`w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
              agreed
                ? 'bg-emerald-500 border-emerald-500'
                : 'border-slate-300 group-hover:border-emerald-400'
            }`}
          >
            {agreed && <CheckCircle size={11} className="text-white" />}
          </div>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            I agree to the rental terms &amp; cancellation policy, and confirm I hold a valid
            driving licence.
          </p>
        </button>

        {/* CTA BUTTON */}
        <button
          onClick={handleReserve}
          disabled={reserving}
          className="group w-full h-14 rounded-2xl font-black text-sm tracking-[0.15em] uppercase transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden bg-slate-950 hover:bg-emerald-600 text-white shadow-lg hover:shadow-emerald-500/25 hover:shadow-xl"
        >
          {/* shimmer */}
          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          {reserving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Verifying Price...
            </>
          ) : (
            <>
              {isBike ? <Bike size={16} /> : <Car size={16} />}
              Rent Now
              <ArrowRight
                size={15}
                className="ml-auto opacity-60 group-hover:translate-x-1 transition-transform"
              />
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-slate-400 font-medium">
          You won&apos;t be charged until confirmation
        </p>

        {/* TRUST BADGES */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
          <div className="flex flex-col items-center gap-1.5 py-2">
            <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
              <Shield size={15} className="text-slate-500" />
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">Insured</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 py-2">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CheckCircle size={15} className="text-emerald-500" />
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">Verified</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 py-2">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
              <CreditCard size={15} className="text-amber-500" />
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">Razorpay</span>
          </div>
        </div>
      </div>
    </div>
  );
}
