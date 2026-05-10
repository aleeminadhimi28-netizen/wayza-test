import { useEffect, useState, useCallback } from 'react';
import { WayzzaLayout, WayzzaHotelItem, WayzzaSkeleton } from '../../WayzzaUI.jsx';
import { useAuth } from '../../AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Search, ArrowRight } from 'lucide-react';

import { api } from '../../utils/api.js';

export default function Wishlist() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fixImg = (img) => api.fixImg(img);

  const load = useCallback(async () => {
    try {
      const data = await api.getWishlist();
      const saved = Array.isArray(data.data) ? data.data : [];

      const detailed = await Promise.all(
        saved.map(async (s) => {
          const listing = await api.getListing(s.listingId);
          return listing?.data ? { ...listing.data, savedId: s._id } : null;
        })
      );
      setRows(detailed.filter(Boolean));
    } catch (err) {
      console.error('Wishlist load error:', err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.email) load();
    else if (!loading) {
      navigate('/login');
    }
  }, [user?.email, loading, load, navigate]);

  async function toggle(listingId) {
    await api.toggleWishlist({ listingId });
    setRows((r) => r.filter((x) => x._id !== listingId));
  }

  return (
    <WayzzaLayout noPadding>
      <div className="bg-slate-50 min-h-screen font-sans">
        {/* REFINED HEADER */}
        <header className="bg-white pt-24 pb-20 px-6 md:px-12 border-b border-slate-200">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 text-emerald-600 font-bold text-[11px] uppercase tracking-[0.4em] leading-none"
              >
                <Heart size={18} className="fill-emerald-600" /> Selection Repository
              </motion.div>
              <h1 className="text-6xl md:text-9xl font-bold text-slate-900 tracking-tighter leading-[0.8] uppercase">
                Curated <br />
                <span className="text-emerald-500 lowercase">Collection.</span>
              </h1>
              <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.3em] border-l-2 border-emerald-500/20 pl-4">
                "Your personal gallery of global masterpieces and unique sanctuaries."
              </p>
            </div>

            <div className="flex items-center gap-4 bg-emerald-50 text-emerald-600 px-10 py-6 rounded-[32px] font-bold text-[11px] uppercase tracking-[0.3em] border border-emerald-100 shadow-sm transition-all hover:shadow-lg">
              <Heart size={20} className="fill-emerald-600" /> {rows.length} Registry Count
            </div>
          </div>
        </header>

        {/* CONTENT GRID */}
        <main className="max-w-7xl mx-auto px-6 py-24">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <WayzzaSkeleton key={i} className="h-[480px] rounded-[40px]" />
                ))}
              </motion.div>
            ) : rows.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-40 text-center space-y-10 group bg-white rounded-[60px] border border-slate-200 shadow-sm px-10"
              >
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto transition-transform group-hover:scale-110 duration-700">
                    <Heart size={48} className="text-slate-200" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-4 border-white"
                  >
                    0
                  </motion.div>
                </div>

                <div className="space-y-6 max-w-lg mx-auto">
                  <h3 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tighter leading-none uppercase">
                    Registry is <span className="text-emerald-500 lowercase">Void.</span>
                  </h3>
                  <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.4em] border-t border-slate-100 pt-6">
                    "Identify your next sanctuary and synchronize it with your registry."
                  </p>
                </div>

                <Link
                  to="/listings"
                  className="h-20 px-12 bg-slate-900 text-white rounded-[24px] font-bold uppercase text-[11px] tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10 inline-flex items-center gap-4 active:scale-95"
                >
                  Explore Properties <ArrowRight size={18} />
                </Link>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                {rows.map((l, i) => (
                  <motion.div
                    key={l._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <WayzzaHotelItem
                      hotel={{
                        id: l._id,
                        name: l.title,
                        location: l.location || 'Coastline',
                        price: l.price,
                        image: fixImg(l.image),
                      }}
                      isSaved={true}
                      onToggleWishlist={() => toggle(l._id)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </main>

        {/* REDIRECT CTA */}
        {!loading && rows.length > 0 && (
          <div className="max-w-7xl mx-auto px-6 pb-40">
            <div className="bg-slate-900 rounded-[60px] p-20 text-center relative overflow-hidden group shadow-2xl">
              <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="relative z-10 space-y-10">
                <Sparkles className="text-emerald-500 mx-auto w-12 h-12" />
                <h3 className="text-4xl md:text-6xl font-bold text-white tracking-tight uppercase leading-none">
                  Find More Masterpieces.
                </h3>
                <p className="text-white/40 font-bold uppercase text-[11px] tracking-[0.4em]">
                  Expand your horizons and add to your unique collection
                </p>
                <Link
                  to="/listings"
                  className="h-20 px-16 bg-white text-slate-900 rounded-[28px] font-bold uppercase text-[11px] tracking-widest transition-all hover:bg-emerald-500 hover:text-white shadow-3xl inline-flex items-center gap-4 active:scale-95"
                >
                  Browse Portfolio <Search size={18} />
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="py-20 text-center opacity-20 pointer-events-none select-none">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.5em]">
            Wayzza Selection Console v4.2
          </p>
        </div>
      </div>
    </WayzzaLayout>
  );
}
