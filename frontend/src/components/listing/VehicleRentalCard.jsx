import { useState } from 'react';
import {
  Star,
  Shield,
  CheckCircle,
  CreditCard,
  Car,
  Bike,
  CalendarDays,
  ChevronRight,
  Zap,
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

  const accentClass = 'emerald';

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-900/8 overflow-hidden">
      {/* Header band */}
      <div className="bg-slate-950 px-7 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
            {isBike ? (
              <Bike size={18} className="text-white" />
            ) : (
              <Car size={18} className="text-white" />
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              Daily Rate
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white tracking-tight">
                ₹{basePrice.toLocaleString()}
              </span>
              <span className="text-xs text-white/40 font-medium">/ day</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        {avgRating && (
          <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-2">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-white">{avgRating}</span>
            <span className="text-[10px] text-white/40 font-medium">
              ({reviewsCount})
            </span>
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        {/* Date Picker */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-slate-200">
            <div className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 cursor-pointer">
                <CalendarDays size={11} className="text-emerald-500" />
                Pick-up
              </label>
              <input
                type="date"
                value={checkIn}
                min={today}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full text-sm font-bold text-slate-900 bg-transparent outline-none cursor-pointer [color-scheme:light]"
              />
            </div>
            <div className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 cursor-pointer">
                <CalendarDays size={11} className="text-emerald-500" />
                Drop-off
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || today}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full text-sm font-bold text-slate-900 bg-transparent outline-none cursor-pointer [color-scheme:light]"
              />
            </div>
          </div>
          {nights > 0 && (
            <div className="bg-emerald-50 border-t border-emerald-100 px-4 py-2 flex items-center gap-2">
              <Zap size={11} className="text-emerald-600" />
              <span className="text-[11px] font-bold text-emerald-700">
                {nights} day{nights !== 1 ? 's' : ''} selected ·{' '}
                {checkIn} → {checkOut}
              </span>
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        {nights > 0 ? (
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-2.5">
            <div className="flex justify-between text-sm text-slate-600">
              <span>
                ₹{basePrice.toLocaleString()} × {nights} day
                {nights > 1 ? 's' : ''}
              </span>
              <span className="font-semibold">
                ₹{(basePrice * nights).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Wayzza service fee</span>
              <span className="font-semibold">
                ₹{serviceFee.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between font-black text-slate-900 pt-2.5 border-t border-slate-200 text-base">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl border border-slate-100 px-4 py-5 text-center">
            <CalendarDays
              size={20}
              className="text-slate-300 mx-auto mb-2"
            />
            <p className="text-xs text-slate-400 font-semibold">
              Select pick-up & drop-off dates to see total
            </p>
          </div>
        )}

        {/* Terms checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div
            onClick={() => setAgreed((v) => !v)}
            className={`w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
              agreed
                ? 'bg-emerald-500 border-emerald-500'
                : 'border-slate-300 group-hover:border-emerald-400'
            }`}
          >
            {agreed && <CheckCircle size={12} className="text-white" />}
          </div>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            I agree to the rental terms, cancellation policy, and
            acknowledge I hold a valid driving licence.
          </p>
        </label>

        {/* CTA */}
        <button
          onClick={handleReserve}
          disabled={reserving}
          className="w-full h-14 bg-slate-950 hover:bg-emerald-600 text-white font-black uppercase text-xs tracking-[0.3em] rounded-2xl transition-all active:scale-[0.98] shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {reserving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              {isBike ? <Bike size={15} /> : <Car size={15} />}
              Rent Now
              <ChevronRight size={14} className="ml-auto opacity-50" />
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-slate-400 font-medium">
          You won&apos;t be charged until confirmation
        </p>

        {/* Trust badges */}
        <div className="flex justify-center gap-6 pt-1 border-t border-slate-100">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-slate-500" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              Insured
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
              <CheckCircle size={16} className="text-emerald-500" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              Verified
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
              <CreditCard size={16} className="text-amber-500" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              Razorpay
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
