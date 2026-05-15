import { useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext.jsx';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Shield, Sparkles } from 'lucide-react';

import { api } from '../../utils/api.js';

export default function PartnerReviews() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;

    api
      .getOwnerListings(user.email)
      .then(async (rows) => {
        const list = Array.isArray(rows) ? rows : [];
        setListings(list);

        const all = await Promise.all(
          list.map((l) =>
            api
              .getReviews(l._id)
              .then((d) => (d.data || []).map((rv) => ({ ...rv, listingTitle: l.title })))
          )
        );

        setReviews(all.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user?.email]);

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

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

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-10 space-y-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.03] border border-white/[0.08] p-8 rounded-3xl backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-[0.4em] mb-1">
              <Sparkles size={12} /> Feedback
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              Guest Feedback
            </h1>
            <p className="text-sm text-white/30 font-medium mt-1">
              Read and manage reviews from your property guests.
            </p>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              label: 'Total Reviews',
              value: reviews.length,
              icon: MessageSquare,
              bg: 'bg-blue-500/10',
              color: 'text-blue-400',
              border: 'border-blue-500/20',
            },
            {
              label: 'Average Rating',
              value: avg || '0.0',
              icon: Star,
              bg: 'bg-amber-500/10',
              color: 'text-amber-400',
              border: 'border-amber-500/20',
            },
            {
              label: 'Properties',
              value: listings.length,
              icon: Shield,
              bg: 'bg-emerald-500/10',
              color: 'text-emerald-400',
              border: 'border-emerald-500/20',
            },
          ].map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl backdrop-blur-xl hover:bg-white/[0.04] transition-all"
            >
              <div
                className={`w-10 h-10 rounded-xl ${c.bg} ${c.color} border ${c.border} flex items-center justify-center mb-4`}
              >
                <c.icon size={18} strokeWidth={2.5} />
              </div>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-wide mb-0.5">
                {c.label}
              </p>
              <p className="text-2xl font-black text-white">{c.value}</p>
            </motion.div>
          ))}
        </div>

        {/* REVIEWS LIST */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl overflow-hidden backdrop-blur-xl">
          <div className="p-6 border-b border-white/[0.05] bg-white/[0.02]">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">
              All Reviews
            </h3>
            <p className="text-xs text-white/30 font-medium mt-0.5">
              {reviews.length} reviews across {listings.length} properties
            </p>
          </div>

          {reviews.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-14 h-14 bg-white/[0.02] rounded-2xl flex items-center justify-center text-white/10 mx-auto mb-4 border border-white/[0.05]">
                <Star size={28} />
              </div>
              <h4 className="text-sm font-bold text-white/30 uppercase tracking-widest mb-1">
                No reviews yet
              </h4>
              <p className="text-xs text-white/20 font-medium max-w-xs mx-auto">
                Guest reviews will appear here once visitors share their experience.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.02]">
              {reviews.map((r, i) => (
                <motion.div
                  key={r._id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-6 hover:bg-white/[0.01] transition-colors"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-11 h-11 rounded-xl bg-white/[0.05] text-white flex items-center justify-center font-bold text-sm border border-white/[0.05] shrink-0">
                        {(r.guestEmail || 'G').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h4 className="font-bold text-sm text-white">
                            {r.guestEmail?.split('@')?.[0]}
                          </h4>
                          <span className="text-[10px] font-bold text-white/40 bg-white/[0.05] px-2 py-0.5 rounded uppercase tracking-wide">
                            {r.listingTitle}
                          </span>
                        </div>
                        <div className="flex gap-0.5 mt-1.5">
                          {[...Array(5)].map((_, si) => (
                            <Star
                              key={si}
                              size={14}
                              className={
                                si < r.rating ? 'fill-amber-400 text-amber-400' : 'text-white/10'
                              }
                            />
                          ))}
                        </div>
                        <p className="text-sm text-white/70 mt-3 leading-relaxed font-medium">
                          {r.comment || 'No comment provided.'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-wide">
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
