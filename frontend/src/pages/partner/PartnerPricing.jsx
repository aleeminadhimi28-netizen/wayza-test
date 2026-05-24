import { useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext.jsx';
import {
  TrendingUp,
  Lock,
  CheckCircle,
  Save,
  AlertCircle,
  Sparkles,
  Tag,
  Calendar,
  X,
  Layers,
} from 'lucide-react';
import { api, BASE_URL } from '../../utils/api.js';

export default function PartnerPricing() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [priceEdits, setPriceEdits] = useState({});
  const [variantPriceEdits, setVariantPriceEdits] = useState({});
  const [loading, setLoading] = useState(true);

  // Date Pricing modal states
  const [activeRulesModal, setActiveRulesModal] = useState(null); // { listingId, variantIdx, variantName }
  const [modalRules, setModalRules] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [newRuleStartDate, setNewRuleStartDate] = useState('');
  const [newRuleEndDate, setNewRuleEndDate] = useState('');
  const [newRulePrice, setNewRulePrice] = useState('');

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
        const initVarEdits = {};
        listingArr.forEach((lst) => {
          initEdits[lst._id] = {
            value: lst.price || 0,
            saving: false,
            error: null,
            success: false,
          };
          (lst.variants || []).forEach((v, idx) => {
            initVarEdits[`${lst._id}-${idx}`] = {
              value: v.price || 0,
              saving: false,
              error: null,
              success: false,
            };
          });
        });
        setPriceEdits(initEdits);
        setVariantPriceEdits(initVarEdits);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.email]);

  const setPriceField = (id, value) =>
    setPriceEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], value, error: null, success: false },
    }));

  const setVariantPriceField = (key, value) =>
    setVariantPriceEdits((prev) => ({
      ...prev,
      [key]: { ...prev[key], value, error: null, success: false },
    }));

  const updateVariantPrice = async (listingId, variantIdx) => {
    const key = `${listingId}-${variantIdx}`;
    const edit = variantPriceEdits[key];
    if (!edit) return;
    const newPrice = Number(edit.value);

    setVariantPriceEdits((prev) => ({
      ...prev,
      [key]: { ...prev[key], saving: true, error: null },
    }));
    try {
      const res = await api.updateVariant(listingId, variantIdx, { price: newPrice });
      if (res.ok) {
        setListings((prev) =>
          prev.map((l) => {
            if (l._id === listingId) {
              const updatedVariants = [...l.variants];
              updatedVariants[variantIdx] = { ...updatedVariants[variantIdx], price: newPrice };
              return { ...l, variants: updatedVariants };
            }
            return l;
          })
        );
        setVariantPriceEdits((prev) => ({
          ...prev,
          [key]: { value: newPrice, saving: false, error: null, success: true },
        }));
        setTimeout(() => {
          setVariantPriceEdits((prev) => ({
            ...prev,
            [key]: { ...prev[key], success: false },
          }));
        }, 3000);
      } else {
        throw new Error(res.message || 'Update failed');
      }
    } catch (err) {
      setVariantPriceEdits((prev) => ({
        ...prev,
        [key]: { ...prev[key], saving: false, error: err.message },
      }));
    }
  };

  const openRulesModal = (listingId, variantIdx, variantName) => {
    setModalLoading(true);
    setActiveRulesModal({ listingId, variantIdx, variantName });
    setNewRuleStartDate('');
    setNewRuleEndDate('');
    setNewRulePrice('');
    api
      .getPriceRules(listingId, variantIdx)
      .then((d) => {
        if (d.ok) setModalRules(d.priceRules || []);
        else setModalRules([]);
      })
      .catch(() => setModalRules([]))
      .finally(() => setModalLoading(false));
  };

  const handleAddRule = async (e) => {
    e.preventDefault();
    if (!newRuleStartDate || !newRulePrice || !activeRulesModal) return;

    setModalLoading(true);
    try {
      const priceVal = Number(newRulePrice);
      const start = new Date(newRuleStartDate);
      const end = newRuleEndDate ? new Date(newRuleEndDate) : start;

      const newRules = [...modalRules];

      const curr = new Date(start);
      while (curr <= end) {
        const yyyy = curr.getFullYear();
        const mm = String(curr.getMonth() + 1).padStart(2, '0');
        const dd = String(curr.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const idx = newRules.findIndex((r) => r.date === dateStr);
        if (idx > -1) {
          newRules[idx] = { date: dateStr, price: priceVal };
        } else {
          newRules.push({ date: dateStr, price: priceVal });
        }

        curr.setDate(curr.getDate() + 1);
      }

      newRules.sort((a, b) => a.date.localeCompare(b.date));

      const res = await api.savePriceRules(
        activeRulesModal.listingId,
        activeRulesModal.variantIdx,
        newRules
      );
      if (res.ok) {
        setModalRules(newRules);
        setNewRuleStartDate('');
        setNewRuleEndDate('');
        setNewRulePrice('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteRule = async (dateStr) => {
    if (!activeRulesModal) return;
    setModalLoading(true);
    try {
      const newRules = modalRules.filter((r) => r.date !== dateStr);
      const res = await api.savePriceRules(
        activeRulesModal.listingId,
        activeRulesModal.variantIdx,
        newRules
      );
      if (res.ok) {
        setModalRules(newRules);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

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

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12 py-10 space-y-8">
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

                      {/* Slider - ONLY SHOW IF NO VARIANTS */}
                      {!(lst.variants && lst.variants.length > 0) && (
                        <>
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
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wide mt-2 pt-2 border-t border-white/[0.05]">
                          <span className="text-emerald-400/70">Estimated Payout</span>
                          <span className="text-emerald-400 text-xs">
                            ₹{Math.round(Number(edit.value) * 0.9).toLocaleString()}
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
                        </>
                      )}
                    </div>

                    {!(lst.variants && lst.variants.length > 0) && edit.error && (
                      <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2">
                        <AlertCircle size={12} strokeWidth={2.5} /> {edit.error}
                      </div>
                    )}
                    {!(lst.variants && lst.variants.length > 0) && edit.success && (
                      <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2">
                        <CheckCircle size={12} strokeWidth={2.5} /> Price updated to ₹
                        {Number(edit.value).toLocaleString()}/night.
                      </div>
                    )}

                    {/* List of Variants (if any exist) */}
                    {lst.variants && lst.variants.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-white/[0.03] space-y-4">
                        <div className="flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-wider">
                          <Layers size={12} />
                          <span>
                            {lst.category === 'bike' || lst.category === 'car'
                              ? 'Vehicle Tiers'
                              : 'Room / Accommodation Tiers'}
                          </span>
                        </div>
                        <div className="grid gap-3">
                          {lst.variants.map((v, vIdx) => {
                            const key = `${lst._id}-${vIdx}`;
                            const vEdit = variantPriceEdits[key] || {
                              value: v.price || 0,
                              saving: false,
                              error: null,
                              success: false,
                            };
                            const isDirty = Number(vEdit.value) !== v.price;
                            const vFloor =
                              v.baseFloorPrice !== undefined ? v.baseFloorPrice : v.price || 0;
                            const vSliderMax = Math.max((v.price || 0) * 3, 5000);
                            const vPct =
                              vSliderMax > vFloor
                                ? Math.min(
                                    100,
                                    ((Number(vEdit.value) - vFloor) / (vSliderMax - vFloor)) * 100
                                  )
                                : 0;
                            const isVBelowFloor = Number(vEdit.value) < vFloor;
                            return (
                              <div key={vIdx} className="space-y-2">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl hover:border-white/[0.08] transition-all">
                                  {/* Variant Info */}
                                  <div className="flex items-center gap-3 min-w-0 md:w-56 shrink-0">
                                    {v.image ? (
                                      <img
                                        src={
                                          v.image.startsWith('http')
                                            ? v.image
                                            : `${BASE_URL}/${v.image}`
                                        }
                                        className="w-10 h-10 object-cover rounded-lg border border-white/[0.05] shrink-0"
                                        alt={v.name}
                                      />
                                    ) : (
                                      <div className="w-10 h-10 bg-white/[0.05] rounded-lg flex items-center justify-center text-white/30 text-xs font-bold shrink-0">
                                        {lst.category === 'bike' || lst.category === 'car'
                                          ? 'Unit'
                                          : 'Room'}
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <p className="font-bold text-white text-xs truncate">
                                        {v.name}
                                      </p>
                                      <p className="text-[10px] text-white/30 font-semibold truncate mt-0.5">
                                        {v.desc || 'No description provided.'}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Slider */}
                                  <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-black text-white/30 uppercase tracking-wide">
                                      <span>
                                        ₹{vFloor.toLocaleString()}{' '}
                                        <span className="text-white/10 font-medium">(floor)</span>
                                      </span>
                                      <span>₹{vSliderMax.toLocaleString()}</span>
                                    </div>
                                    <div className="relative h-1.5">
                                      <div className="absolute inset-0 rounded-full bg-white/[0.05]" />
                                      <div
                                        className={`absolute left-0 top-0 h-full rounded-full transition-all ${
                                          isVBelowFloor ? 'bg-rose-500' : 'bg-emerald-500'
                                        }`}
                                        style={{ width: `${Math.max(0, vPct)}%` }}
                                      />
                                      <input
                                        type="range"
                                        min={Math.min(vFloor, Number(vEdit.value))}
                                        max={vSliderMax}
                                        step={50}
                                        value={Number(vEdit.value)}
                                        onChange={(e) => setVariantPriceField(key, e.target.value)}
                                        className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                                      />
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wide">
                                      <span
                                        className={
                                          isVBelowFloor ? 'text-rose-400' : 'text-white/20'
                                        }
                                      >
                                        {isVBelowFloor
                                          ? '⚠ Below floor price'
                                          : isDirty
                                            ? '● Price changed'
                                            : 'Current price'}
                                      </span>
                                      <span
                                        className={isDirty ? 'text-emerald-400' : 'text-white/20'}
                                      >
                                        {isDirty
                                          ? `Was ₹${(v.price || 0).toLocaleString()}`
                                          : `₹${(v.price || 0).toLocaleString()}/${lst.category === 'bike' || lst.category === 'car' ? 'day' : 'night'}`}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wide mt-2 pt-2 border-t border-white/[0.05]">
                                      <span className="text-emerald-400/70">Estimated Payout</span>
                                      <span className="text-emerald-400 text-xs">
                                        ₹{Math.round(Number(vEdit.value) * 0.9).toLocaleString()}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Actions (Price edit + Manage rules) */}
                                  <div className="flex items-center gap-3 shrink-0">
                                    {/* Custom Price Input */}
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 font-bold text-sm">
                                        ₹
                                      </span>
                                      <input
                                        type="number"
                                        min={0}
                                        step={100}
                                        value={vEdit.value}
                                        onChange={(e) => setVariantPriceField(key, e.target.value)}
                                        className={`w-32 h-11 pl-7 pr-3 bg-white/[0.03] border rounded-lg text-sm font-bold text-white outline-none transition-all ${
                                          isVBelowFloor
                                            ? 'border-rose-500 focus:border-rose-500'
                                            : isDirty
                                              ? 'border-emerald-500 focus:border-emerald-500'
                                              : 'border-white/[0.08] focus:border-white/[0.2]'
                                        }`}
                                      />
                                    </div>

                                    {/* Update Button */}
                                    <button
                                      onClick={() => updateVariantPrice(lst._id, vIdx)}
                                      disabled={vEdit.saving || !isDirty || isVBelowFloor}
                                      className="h-11 px-5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/[0.05] disabled:text-white/20 text-[#050a08] disabled:border-transparent rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 disabled:cursor-not-allowed whitespace-nowrap shadow-lg shadow-emerald-500/10 disabled:shadow-none"
                                    >
                                      {vEdit.saving ? (
                                        <span className="w-4 h-4 border-2 border-[#050a08]/30 border-t-[#050a08] rounded-full animate-spin" />
                                      ) : vEdit.success ? (
                                        <CheckCircle size={14} strokeWidth={2.5} />
                                      ) : (
                                        <Save size={14} strokeWidth={2.5} />
                                      )}
                                      {vEdit.saving
                                        ? 'Saving...'
                                        : vEdit.success
                                          ? 'Saved!'
                                          : 'Update'}
                                    </button>

                                    {/* Date Rules Button */}
                                    <button
                                      onClick={() => openRulesModal(lst._id, vIdx, v.name)}
                                      className="h-11 w-11 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-white/60 hover:text-white rounded-lg flex items-center justify-center transition-all"
                                      title="Manage Date Price Overrides"
                                    >
                                      <Calendar size={18} />
                                    </button>
                                  </div>
                                </div>

                                {vEdit.error && (
                                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2">
                                    <AlertCircle size={12} strokeWidth={2.5} /> {vEdit.error}
                                  </div>
                                )}
                                {vEdit.success && (
                                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2">
                                    <CheckCircle size={12} strokeWidth={2.5} /> Price updated to ₹
                                    {Number(vEdit.value).toLocaleString()}/
                                    {lst.category === 'bike' || lst.category === 'car'
                                      ? 'day'
                                      : 'night'}
                                    .
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
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

      {/* ── Dynamic Price Overrides Modal ── */}
      {activeRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050a08]/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-white/[0.08] rounded-3xl p-6 shadow-2xl space-y-6">
            <button
              onClick={() => setActiveRulesModal(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">
                <Tag size={12} /> Dynamic pricing
              </div>
              <h3 className="text-xl font-black text-white tracking-tight uppercase">
                {activeRulesModal.variantName}
              </h3>
              <p className="text-xs text-white/40 font-medium">
                Set custom prices for specific date ranges (e.g., weekends, holidays).
              </p>
            </div>

            {/* Set Pricing Rules Form */}
            <form onSubmit={handleAddRule} className="space-y-4 pt-2 border-t border-white/[0.05]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-wider block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newRuleStartDate}
                    onChange={(e) => setNewRuleStartDate(e.target.value)}
                    className="w-full h-10 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 text-xs font-bold text-white outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-wider block mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newRuleEndDate}
                    onChange={(e) => setNewRuleEndDate(e.target.value)}
                    placeholder="Same day if blank"
                    className="w-full h-10 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 text-xs font-bold text-white outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-wider block mb-1">
                    Custom Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="Price per night"
                    value={newRulePrice}
                    onChange={(e) => setNewRulePrice(e.target.value)}
                    className="w-full h-10 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 text-xs font-bold text-white outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="h-10 px-5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/5 disabled:text-white/20 text-[#050a08] font-bold text-xs uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap"
                >
                  {modalLoading ? 'Setting...' : 'Set Pricing'}
                </button>
              </div>
            </form>

            {/* Active Pricing Rules List */}
            <div className="space-y-3 pt-4 border-t border-white/[0.05]">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-wider block">
                  Active Date Overrides
                </label>
                {modalRules.length > 0 && (
                  <span className="text-[10px] font-bold text-emerald-400">
                    {modalRules.length} rule(s) active
                  </span>
                )}
              </div>
              {modalRules.length === 0 ? (
                <div className="text-center py-6 bg-white/[0.01] border border-dashed border-white/[0.05] rounded-2xl">
                  <p className="text-xs text-white/20 font-medium italic">
                    No date overrides configured for this{' '}
                    {activeRulesModal &&
                    (listings.find((l) => l._id === activeRulesModal.listingId)?.category ===
                      'bike' ||
                      listings.find((l) => l._id === activeRulesModal.listingId)?.category ===
                        'car')
                      ? 'vehicle tier'
                      : 'room tier'}
                    .
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-white/[0.01] border border-white/[0.08] rounded-2xl">
                  {modalRules.map((rule) => (
                    <div
                      key={rule.date}
                      className="flex items-center justify-between gap-2 px-2.5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-400"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Calendar size={12} className="shrink-0" />
                        <span className="truncate">
                          {rule.date}: ₹{rule.price.toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteRule(rule.date)}
                        disabled={modalLoading}
                        className="text-white/40 hover:text-rose-400 hover:scale-110 transition-all font-black text-sm shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
