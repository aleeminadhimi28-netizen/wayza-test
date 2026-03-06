import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext.jsx";
import { motion } from "framer-motion";
import {
  Star, MessageSquare, Shield, Quote
} from "lucide-react";

import { api } from "../../utils/api.js";

export default function PartnerReviews() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;

    api.getOwnerListings(user.email)
      .then(async rows => {
        const list = Array.isArray(rows) ? rows : [];
        setListings(list);

        const all = await Promise.all(
          list.map(l =>
            api.getReviews(l._id)
              .then(d => (d.data || []).map(rv => ({ ...rv, listingTitle: l.title })))
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-slate-100 border-t-amber-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 font-sans pb-12">

      {/* HEADER */}
      <div>
        <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wide mb-1">
          <Star size={14} /> Guest Reviews
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Guest Feedback</h1>
        <p className="text-sm text-slate-500 mt-1">Read and manage reviews from your property guests.</p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: "Total Reviews", value: reviews.length, icon: MessageSquare, bg: "bg-blue-50", color: "text-blue-600" },
          { label: "Average Rating", value: avg || "0.0", icon: Star, bg: "bg-amber-50", color: "text-amber-600" },
          { label: "Properties", value: listings.length, icon: Shield, bg: "bg-emerald-50", color: "text-emerald-600" },
        ].map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all"
          >
            <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.color} flex items-center justify-center mb-3`}>
              <c.icon size={18} />
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-0.5">{c.label}</p>
            <p className="text-xl font-bold text-slate-900">{c.value}</p>
          </motion.div>
        ))}
      </div>

      {/* REVIEWS LIST */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">All Reviews</h3>
          <p className="text-xs text-slate-500">{reviews.length} reviews across {listings.length} properties</p>
        </div>

        {reviews.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-300 mx-auto mb-4">
              <Star size={28} />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-1">No reviews yet</h4>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">Guest reviews will appear here once visitors share their experience.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reviews.map((r, i) => (
              <motion.div
                key={r._id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="p-6 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {(r.guestEmail || "G").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="font-bold text-sm text-slate-900">{r.guestEmail?.split("@")[0]}</h4>
                        <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">{r.listingTitle}</span>
                      </div>
                      <div className="flex gap-0.5 mt-1.5">
                        {[...Array(5)].map((_, si) => (
                          <Star key={si} size={14} className={si < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                        ))}
                      </div>
                      <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                        {r.comment || "No comment provided."}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-slate-500">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
