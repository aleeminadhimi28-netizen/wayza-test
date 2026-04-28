import { Star, Shield, CheckCircle, CreditCard } from 'lucide-react';

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
}) {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-900/8">
      {/* Price */}
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-4xl font-black text-slate-900 tracking-tight">
          ₹{basePrice.toLocaleString()}
        </span>
        <span className="text-sm text-slate-400 font-medium">/ night</span>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
        <Star size={13} className="fill-amber-400 text-amber-400" />
        <span>
          {avgRating || 'New'} · {reviewsCount} review{reviewsCount !== 1 ? 's' : ''}
          {avgRating && avgRating >= 9 ? ' · Exceptional' : ''}
        </span>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 border border-slate-200 rounded-xl overflow-hidden mb-3">
        <div className="p-3 border-r border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
          <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">
            Check-in
          </label>
          <input
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full text-sm font-semibold text-slate-900 bg-transparent outline-none cursor-pointer"
          />
        </div>
        <div className="p-3 hover:bg-slate-50 transition-colors cursor-pointer">
          <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">
            Check-out
          </label>
          <input
            type="date"
            value={checkOut}
            min={checkIn || today}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full text-sm font-semibold text-slate-900 bg-transparent outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Guests */}
      <div className="border border-slate-200 rounded-xl p-3 mb-5 hover:bg-slate-50 transition-colors cursor-pointer">
        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">
          Guests
        </label>
        <span className="text-sm font-semibold text-slate-900">1 guest</span>
      </div>

      {/* Reserve Button */}
      <button
        onClick={handleReserve}
        className="w-full py-4 bg-slate-950 hover:bg-slate-800 text-white font-black uppercase text-xs tracking-[0.3em] rounded-xl transition-all active:scale-[0.98] shadow-sm"
      >
        Reserve Now
      </button>

      {/* Price Breakdown */}
      <div className="mt-5 space-y-3">
        {nights > 0 ? (
          <>
            <div className="flex justify-between text-sm text-slate-600">
              <span>
                ₹{basePrice.toLocaleString()} × {nights} night{nights > 1 ? 's' : ''}
              </span>
              <span>₹{(basePrice * nights).toLocaleString()}</span>
            </div>
            {!isVehicle && gst > 0 && (
              <div className="flex justify-between text-sm text-slate-600">
                <span>GST ({Math.round(gstRate * 100)}%)</span>
                <span>₹{gst.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-slate-600">
              <span>Wayzza service fee</span>
              <span>₹{serviceFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-black text-slate-900 pt-3 border-t border-slate-100 text-base">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
          </>
        ) : (
          <p className="text-center text-xs text-slate-400 py-2">Select dates to see pricing</p>
        )}
      </div>

      <p className="text-center text-xs text-slate-400 mt-3">You won't be charged yet</p>

      {/* Trust Badges */}
      <div className="flex justify-center gap-8 mt-5 pt-5 border-t border-slate-100">
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-slate-500" />
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Secure</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
            <CheckCircle size={16} className="text-emerald-500" />
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Verified</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
            <CreditCard size={16} className="text-amber-500" />
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Razorpay</span>
        </div>
      </div>
    </div>
  );
}
