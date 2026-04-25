import { useEffect, useState } from 'react';
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
} from 'lucide-react';

import { api } from '../../utils/api.js';

export default function PartnerListings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    load();
  }, [user?.email]);

  async function load() {
    if (!user?.email) return;
    try {
      const data = await api.getOwnerListings(user.email);
      setListings(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this property? This cannot be undone.'))
      return;
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

  const fixImg = (img) => {
    if (!img)
      return 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80';
    if (img.startsWith('http')) return img;
    const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${BASE}/uploads/${img}`;
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading your properties...</p>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 font-sans pb-20"
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide">
            <Building size={14} /> My Properties
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            Property <span className="text-emerald-500">Portfolio</span>
          </h1>
          <p className="text-slate-500 text-sm">
            You are managing{' '}
            <span className="font-semibold text-slate-700">
              {listings.length} {listings.length === 1 ? 'property' : 'properties'}
            </span>{' '}
            on Wayzza.
          </p>
        </div>
        <button
          onClick={() => navigate('/partner/create')}
          className="h-11 px-6 bg-slate-900 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors shadow-md active:scale-95 whitespace-nowrap"
        >
          <Plus size={16} />
          <span>Add New Property</span>
        </button>
      </div>

      {/* EMPTY STATE */}
      {listings.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-3xl py-24 text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
            <Home size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">No properties yet</h2>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Add your first property to start receiving bookings on Wayzza.
            </p>
          </div>
          <button
            onClick={() => navigate('/partner/create')}
            className="h-11 px-6 bg-slate-900 text-white rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-emerald-600 transition-colors shadow-md active:scale-95"
          >
            <Plus size={16} />
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
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300 flex flex-col"
                >
                  {/* Image */}
                  <div
                    className="relative h-52 overflow-hidden cursor-pointer"
                    onClick={() => navigate('/partner/property/' + listing._id)}
                  >
                    <img
                      src={fixImg(listing.image)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      alt={listing.title}
                    />

                    {/* overlay on hover */}
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300">
                      <div className="bg-white text-slate-900 px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-2xl">
                        <Edit3 size={14} /> Manage Variants
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <div className="bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-lg text-white font-bold text-xs uppercase tracking-wide">
                        {listing.category || 'hotel'}
                      </div>
                      <div
                        className={`backdrop-blur-sm px-3 py-1 rounded-lg text-white font-bold text-xs flex items-center gap-1.5 ${listing.approved ? 'bg-emerald-500/90' : 'bg-amber-500/90'}`}
                      >
                        {listing.approved ? <ShieldCheck size={12} /> : <Clock size={12} />}
                        {listing.approved ? 'Verified' : 'Pending'}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                        {listing.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                        <MapPin size={13} className="text-emerald-500 shrink-0" />
                        <span className="truncate">{listing.location || 'Location not set'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-xs text-slate-400">Starting from</p>
                        <p className="text-xl font-bold text-slate-900">
                          {lowestPrice > 0 ? (
                            `₹${lowestPrice.toLocaleString()}`
                          ) : (
                            <span className="text-slate-400 text-sm font-semibold">
                              No price set
                            </span>
                          )}
                        </p>
                        {listing.variants?.length > 0 && (
                          <p className="text-xs text-emerald-600 font-medium mt-0.5">
                            {listing.variants.length} room type
                            {listing.variants.length > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate('/partner/property/' + listing._id)}
                          className="h-9 px-4 bg-slate-900 text-white rounded-lg font-semibold text-sm flex items-center gap-1.5 hover:bg-emerald-600 transition-colors active:scale-95"
                        >
                          Edit <ChevronRight size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(listing._id)}
                          disabled={deleting === listing._id}
                          className="h-9 w-9 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 active:scale-95"
                        >
                          {deleting === listing._id ? (
                            <Activity size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    {!listing.approved && (
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-700 text-xs font-semibold px-3 py-2 rounded-lg">
                        <AlertCircle size={13} className="shrink-0" />
                        Awaiting admin approval before visibility.
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
