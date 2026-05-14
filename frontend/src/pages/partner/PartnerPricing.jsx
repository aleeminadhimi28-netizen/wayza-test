import { useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext.jsx';
import { TrendingUp, Lock, CheckCircle, Save, AlertCircle } from 'lucide-react';
import VerificationSpinner from '../../components/VerificationSpinner.jsx';
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
      <VerificationSpinner message="Loading Pricing Data..." subtext="Accessing Price Manager" />
    );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Price Manager</h1>
          <p className="text-slate-500 mt-1">
            Adjust your listing prices dynamically based on market demand.
          </p>
        </div>
      </div>

      {listings.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide mb-1">
                <TrendingUp size={14} /> Trend Adjuster
              </div>
              <h3 className="text-lg font-bold text-slate-900">Dynamic Pricing</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Adjust prices below. You cannot go below the base floor price set at creation.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
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
                <div key={lst._id} className="p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Property Info */}
                    <div className="flex items-center gap-4 min-w-0 md:w-64 shrink-0">
                      <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                        {(lst.title || 'P').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{lst.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Lock size={10} className="text-slate-400" />
                          <span className="text-[11px] text-slate-400 font-semibold">
                            Floor: ₹{floor.toLocaleString()}/night
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                            lst.approved
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${lst.approved ? 'bg-emerald-500' : 'bg-amber-400'}`}
                          />
                          {lst.approved ? 'Live' : 'Pending Approval'}
                        </span>
                      </div>
                    </div>

                    {/* Slider */}
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                        <span>
                          ₹{floor.toLocaleString()}{' '}
                          <span className="text-slate-300 font-normal">(floor)</span>
                        </span>
                        <span>₹{sliderMax.toLocaleString()}</span>
                      </div>
                      <div className="relative h-2">
                        <div className="absolute inset-0 rounded-full bg-slate-100" />
                        <div
                          className={`absolute left-0 top-0 h-full rounded-full transition-all ${
                            isBelowFloor ? 'bg-rose-400' : 'bg-emerald-500'
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
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className={isBelowFloor ? 'text-rose-500' : 'text-slate-400'}>
                          {isBelowFloor
                            ? '⚠ Below floor price'
                            : isDirty
                              ? '● Price changed'
                              : 'Current price'}
                        </span>
                        <span className={isDirty ? 'text-emerald-600' : 'text-slate-400'}>
                          {isDirty
                            ? `Was ₹${(lst.price || 0).toLocaleString()}`
                            : `₹${(lst.price || 0).toLocaleString()}/night`}
                        </span>
                      </div>
                    </div>

                    {/* Input + Save */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                          ₹
                        </span>
                        <input
                          type="number"
                          min={floor}
                          step={100}
                          value={edit.value}
                          onChange={(e) => setPriceField(lst._id, e.target.value)}
                          className={`w-32 h-11 pl-7 pr-3 border rounded-xl text-sm font-bold outline-none transition-all ${
                            isBelowFloor
                              ? 'border-rose-300 bg-rose-50 text-rose-700 focus:ring-2 focus:ring-rose-200'
                              : isDirty
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 focus:ring-2 focus:ring-emerald-200'
                                : 'border-slate-200 bg-white text-slate-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                          }`}
                        />
                      </div>
                      <button
                        onClick={() => updatePrice(lst)}
                        disabled={edit.saving || !isDirty || isBelowFloor}
                        className="h-11 px-5 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl font-semibold text-xs flex items-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shadow-sm"
                      >
                        {edit.saving ? (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : edit.success ? (
                          <CheckCircle size={14} />
                        ) : (
                          <Save size={14} />
                        )}
                        {edit.saving ? 'Saving...' : edit.success ? 'Saved!' : 'Update'}
                      </button>
                    </div>
                  </div>

                  {edit.error && (
                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                      <AlertCircle size={13} /> {edit.error}
                    </div>
                  )}
                  {edit.success && (
                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                      <CheckCircle size={13} /> Price updated to ₹
                      {Number(edit.value).toLocaleString()}/night. Guests will now see the new
                      price.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <p className="text-slate-500 font-medium">You don't have any properties yet.</p>
        </div>
      )}
    </div>
  );
}
