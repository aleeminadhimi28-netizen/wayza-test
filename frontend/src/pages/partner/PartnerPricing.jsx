import { useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext.jsx';
import { TrendingUp, Lock, CheckCircle, Save, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../../utils/api.js';

export default function PartnerPricing() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [priceEdits, setPriceEdits] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    window.scrollTo(0, 0);

    api
      .getOwnerListings(user.email)
      .then((l) => {
        const listingArr = Array.isArray(l) ? l : [];
        setListings(listingArr);

        // Initialise price editor state from fetched listings
        const initEdits = {};
        listingArr.forEach((lst) => {
          initEdits[lst._id] = {
            value: lst.price || 0,
            saving: false,
            error: null,
            success: false,
          };
        });
        setPriceEdits(initEdits);
      })
      .catch((err) => console.error('Failed to load listings for pricing:', err))
      .finally(() => setLoading(false));
  }, [user?.email]);

  const setPriceField = (id, value) =>
    setPriceEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], value, error: null, success: false },
    }));

  const updatePrice = async (listing) => {
    const edit = priceEdits[listing._id];
    if (!edit) return;
    const newPrice = Number(edit.value);
    const floor = listing.baseFloorPrice || 0;

    if (newPrice < floor) {
      setPriceEdits((prev) => ({
        ...prev,
        [listing._id]: {
          ...prev[listing._id],
          error: `Cannot go below floor price ₹${floor.toLocaleString()}`,
        },
      }));
      return;
    }

    setPriceEdits((prev) => ({
      ...prev,
      [listing._id]: { ...prev[listing._id], saving: true, error: null },
    }));
    try {
      const res = await api.updateListing(listing._id, { price: newPrice });
      if (res.ok) {
        setListings((prev) =>
          prev.map((l) => (l._id === listing._id ? { ...l, price: newPrice } : l))
        );
        setPriceEdits((prev) => ({
          ...prev,
          [listing._id]: { value: newPrice, saving: false, error: null, success: true },
        }));
        setTimeout(() => {
          setPriceEdits((prev) => ({
            ...prev,
            [listing._id]: { ...prev[listing._id], success: false },
          }));
        }, 3000);
      } else {
        throw new Error(res.message || 'Update failed');
      }
    } catch (err) {
      setPriceEdits((prev) => ({
        ...prev,
        [listing._id]: { ...prev[listing._id], saving: false, error: err.message },
      }));
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#050a08]">
        <div className="w-10 h-10 border-2 border-white/10 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#050a08] font-sans text-white selection:bg-emerald-900/50 selection:text-emerald-200 pb-20">
      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[30%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-emerald-700/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.03] border border-white/[0.08] p-8 rounded-3xl backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-[0.4em] mb-1">
              <Sparkles size={12} /> Revenue
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">
              Price Manager
            </h1>
            <p className="text-sm text-white/30 font-medium mt-1">
              Adjust your listing prices dynamically based on market demand.
            </p>
          </div>
        </div>

        {listings.length > 0 ? (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl backdrop-blur-xl overflow-hidden">
            <div className="p-6 border-b border-white/[0.05] bg-white/[0.02]">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">
                  <TrendingUp size={14} /> Trend Adjuster
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                  Dynamic Pricing
                </h3>
                <p className="text-xs text-white/30 font-medium mt-0.5">
                  Adjust prices below. You cannot go below the base floor price set at creation.
                </p>
              </div>
            </div>

            <div className="divide-y divide-white/[0.03]">
              {listings.map((lst) => {
                const edit = priceEdits[lst._id] || {
                  value: lst.price || 0,
                  saving: false,
                  error: null,
                  success: false,
                };
                const floor = lst.baseFloorPrice || 0;
                const sliderMax = Math.max(floor * 3, (lst.price || 0) * 3, 5000);
                const pct =
                  sliderMax > floor
                    ? Math.min(100, ((Number(edit.value) - floor) / (sliderMax - floor)) * 100)
                    : 0;
                const isDirty = Number(edit.value) !== lst.price;
                const isBelowFloor = Number(edit.value) < floor;

                return (
                  <div key={lst._id} className="p-6 hover:bg-white/[0.01] transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      {/* Property Info */}
                      <div className="flex items-center gap-4 min-w-0 md:w-64 shrink-0">
                        <div className="w-12 h-12 bg-white/[0.05] text-white rounded-xl flex items-center justify-center font-bold text-lg border border-white/[0.05] shrink-0">
                          {(lst.title || 'P').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white text-sm truncate">{lst.title}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Lock size={10} className="text-white/30" />
                            <span className="text-[10px] text-white/30 font-black uppercase tracking-wide">
                              Floor: ₹{floor.toLocaleString()}
                            </span>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide border ${
                              lst.approved
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}
                          >
                            <div
                              className={`w-1 h-1 rounded-full ${lst.approved ? 'bg-emerald-400' : 'bg-amber-400'}`}
                            />
                            {lst.approved ? 'Live' : 'Pending'}
                          </span>
                        </div>
                      </div>

                      {/* Slider */}
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black text-white/30 uppercase tracking-wide">
                          <span>
                            ₹{floor.toLocaleString()}{' '}
                            <span className="text-white/10 font-medium">(floor)</span>
                          </span>
                          <span>₹{sliderMax.toLocaleString()}</span>
                        </div>
                        <div className="relative h-1.5">
                          <div className="absolute inset-0 rounded-full bg-white/[0.05]" />
                          <div
                            className={`absolute left-0 top-0 h-full rounded-full transition-all ${
                              isBelowFloor ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.max(0, pct)}%` }}
                          />
                          <input
                            type="range"
                            min={floor}
                            max={sliderMax}
                            step={50}
                            value={Number(edit.value)}
                            onChange={(e) => setPriceField(lst._id, e.target.value)}
                            className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-wide">
                          <span className={isBelowFloor ? 'text-rose-400' : 'text-white/20'}>
                            {isBelowFloor
                              ? '⚠ Below floor price'
                              : isDirty
                                ? '● Price changed'
                                : 'Current price'}
                          </span>
                          <span className={isDirty ? 'text-emerald-400' : 'text-white/20'}>
                            {isDirty
                              ? `Was ₹${(lst.price || 0).toLocaleString()}`
                              : `₹${(lst.price || 0).toLocaleString()}/night`}
                          </span>
                        </div>
                      </div>

                      {/* Input + Save */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 font-bold text-sm">
                            ₹
                          </span>
                          <input
                            type="number"
                            min={floor}
                            step={100}
                            value={edit.value}
                            onChange={(e) => setPriceField(lst._id, e.target.value)}
                            className={`w-32 h-11 pl-7 pr-3 bg-white/[0.03] border rounded-lg text-sm font-bold text-white outline-none transition-all ${
                              isBelowFloor
                                ? 'border-rose-500 focus:border-rose-500'
                                : isDirty
                                  ? 'border-emerald-500 focus:border-emerald-500'
                                  : 'border-white/[0.08] focus:border-white/[0.2]'
                            }`}
                          />
                        </div>
                        <button
                          onClick={() => updatePrice(lst)}
                          disabled={edit.saving || !isDirty || isBelowFloor}
                          className="h-11 px-5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/[0.05] disabled:text-white/20 text-[#050a08] disabled:border-transparent rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 disabled:cursor-not-allowed whitespace-nowrap shadow-lg shadow-emerald-500/10 disabled:shadow-none"
                        >
                          {edit.saving ? (
                            <span className="w-4 h-4 border-2 border-[#050a08]/30 border-t-[#050a08] rounded-full animate-spin" />
                          ) : edit.success ? (
                            <CheckCircle size={14} strokeWidth={2.5} />
                          ) : (
                            <Save size={14} strokeWidth={2.5} />
                          )}
                          {edit.saving ? 'Saving...' : edit.success ? 'Saved!' : 'Update'}
                        </button>
                      </div>
                    </div>

                    {edit.error && (
                      <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2">
                        <AlertCircle size={12} strokeWidth={2.5} /> {edit.error}
                      </div>
                    )}
                    {edit.success && (
                      <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2">
                        <CheckCircle size={12} strokeWidth={2.5} /> Price updated to ₹
                        {Number(edit.value).toLocaleString()}/night.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-12 text-center backdrop-blur-xl">
            <p className="text-sm font-bold text-white/20 uppercase tracking-widest">
              You don't have any properties yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
