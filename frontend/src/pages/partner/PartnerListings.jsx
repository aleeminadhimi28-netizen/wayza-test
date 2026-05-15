import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext.jsx';
import { useToast } from '../../ToastContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Plus,
  Trash2,
  Edit3,
  MapPin,
  ShieldCheck,
  Clock,
  Activity,
  Building,
  ChevronRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

import { api } from '../../utils/api.js';
import { fixImg } from '../../utils/image.js';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';

export default function PartnerListings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, onConfirm: () => {} });

  const load = useCallback(async () => {
    if (!user?.email) return;
    try {
      const data = await api.getOwnerListings(user.email);
      setListings(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  }, [user?.email]);

  useEffect(() => {
    load();
  }, [load]);

  async function executeDelete(id) {
    setDeleting(id);
    try {
      const data = await api.deleteListing(id);
      if (data.ok) {
        showToast('Property deleted successfully.', 'success');
        setListings((prev) => prev.filter((l) => l._id !== id));
      } else {
        showToast('Unable to delete property.', 'error');
      }
    } catch {
      showToast('Connection error.', 'error');
    }
    setDeleting(null);
  }

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      onConfirm: () => executeDelete(id),
    });
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-[#050a08]">
        <div className="w-10 h-10 border-2 border-white/10 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-sm font-bold text-white/30 uppercase tracking-widest">Loading your properties...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#050a08] font-sans text-white selection:bg-emerald-900/50 selection:text-emerald-200 pb-20">
      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[30%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-emerald-700/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-10 space-y-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.03] border border-white/[0.08] p-8 rounded-3xl backdrop-blur-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-[0.4em]">
              <Sparkles size={12} /> My Properties
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              Property <span className="text-emerald-400">Portfolio</span>
            </h1>
            <p className="text-white/30 text-sm font-medium">
              You are managing{' '}
              <span className="font-bold text-white">
                {listings.length} {listings.length === 1 ? 'property' : 'properties'}
              </span>{' '}
              on Wayzza.
            </p>
          </div>
          <button
            onClick={() => navigate('/partner/create')}
            className="h-11 px-6 bg-emerald-500 text-[#050a08] rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/10 active:scale-95 whitespace-nowrap"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add New Property</span>
          </button>
        </div>

        {/* EMPTY STATE */}
        {listings.length === 0 ? (
          <div className="bg-white/[0.02] border border-dashed border-white/[0.08] rounded-3xl py-24 text-center flex flex-col items-center gap-6 backdrop-blur-xl">
            <div className="w-16 h-16 bg-white/[0.05] rounded-2xl flex items-center justify-center text-white/20 border border-white/[0.05]">
              <Home size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">No properties yet</h2>
              <p className="text-white/30 text-xs font-medium max-w-sm mx-auto">
                Add your first property to start receiving bookings on Wayzza.
              </p>
            </div>
            <button
              onClick={() => navigate('/partner/create')}
              className="h-11 px-6 bg-emerald-500 text-[#050a08] rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/10 active:scale-95"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Create First Listing</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {listings.map((listing, i) => {
                const lowestPrice =
                  listing.variants?.length > 0
                    ? Math.min(...listing.variants.map((v) => v.price || 0))
                    : listing.price || 0;

                return (
                  <motion.div
                    key={listing._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="group bg-white/[0.02] rounded-2xl border border-white/[0.05] overflow-hidden shadow-sm hover:shadow-lg hover:border-white/[0.1] hover:bg-white/[0.03] transition-all duration-300 flex flex-col backdrop-blur-xl"
                  >
                    {/* Image */}
                    <div
                      className="relative h-52 overflow-hidden cursor-pointer"
                      onClick={() => navigate('/partner/property/' + listing._id)}
                    >
                      <img
                        src={fixImg(listing.image)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                        alt={listing.title}
                      />

                      {/* overlay on hover */}
                      <div className="absolute inset-0 bg-[#050a08]/0 group-hover:bg-[#050a08]/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300">
                        <div className="bg-white text-[#050a08] px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 shadow-2xl">
                          <Edit3 size={14} /> Manage Variants
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <div className="bg-[#050a08]/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-white font-black text-[10px] uppercase tracking-wider border border-white/[0.05]">
                          {listing.category || 'hotel'}
                        </div>
                        <div
                          className={`backdrop-blur-sm px-2.5 py-1 rounded-lg text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 border ${listing.approved ? 'bg-emerald-500/80 border-emerald-500/20' : 'bg-amber-500/80 border-amber-500/20'}`}
                        >
                          {listing.approved ? <ShieldCheck size={12} /> : <Clock size={12} />}
                          {listing.approved ? 'Verified' : 'Pending'}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                      <div className="space-y-1.5">
                        <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors truncate">
                          {listing.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-white/40 text-xs font-medium">
                          <MapPin size={12} className="text-emerald-400 shrink-0" />
                          <span className="truncate">{listing.location || 'Location not set'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/[0.05] pt-4">
                        <div>
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-wide">Starting from</p>
                          <p className="text-xl font-black text-white">
                            {lowestPrice > 0 ? (
                              `₹${lowestPrice.toLocaleString()}`
                            ) : (
                              <span className="text-white/20 text-sm font-bold">
                                No price set
                              </span>
                            )}
                          </p>
                          {listing.variants?.length > 0 && (
                            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wide mt-0.5">
                              {listing.variants.length} room type
                              {listing.variants.length > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate('/partner/property/' + listing._id)}
                            className="h-9 px-4 bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-colors active:scale-95 border border-white/[0.05]"
                          >
                            Edit <ChevronRight size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(listing._id)}
                            disabled={deleting === listing._id}
                            className="h-9 w-9 bg-white/[0.02] text-rose-400 border border-white/[0.05] hover:bg-rose-500 hover:text-white rounded-lg flex items-center justify-center transition-all disabled:opacity-50 active:scale-95"
                          >
                            {deleting === listing._id ? (
                              <Activity size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </div>
                      </div>

                      {!listing.approved && (
                        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wide px-3 py-2 rounded-lg">
                          <AlertCircle size={12} strokeWidth={2.5} className="shrink-0" />
                          Awaiting admin approval.
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={confirmModal.onConfirm}
          title="Delete Property"
          message="Are you sure you want to delete this property? This action cannot be undone and all associated room variants will be removed."
          confirmText="Delete Portfolio Item"
          confirmVariant="rose"
        />
      </div>
    </div>
  );
}
