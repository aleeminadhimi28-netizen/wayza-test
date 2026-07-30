import { useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Shield, Sparkles, Send, ChevronDown, ChevronUp, RefreshCcw, CheckCircle } from 'lucide-react';

import { api } from '../../utils/api.js';

export default function PartnerReviews() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reply state — keyed by review _id
  const [replyOpen, setReplyOpen] = useState({});   // { [reviewId]: bool }
  const [replyText, setReplyText] = useState({});   // { [reviewId]: string }
  const [replyState, setReplyState] = useState({}); // { [reviewId]: 'idle'|'loading'|'done'|'error' }

  useEffect(() => {
    if (!user?.email) return;

    api
      .getOwnerListings(user.email)
      .then(async (rows) => {
        const list = Array.isArray(rows) ? rows : [];
        setListings(list);

        const results = await Promise.allSettled(
          list.map((l) =>
            api
              .getReviews(l._id)
              .then((d) => (d.data || []).map((rv) => ({ ...rv, listingTitle: l.title })))
          )
        );

        const all = results.filter((r) => r.status === 'fulfilled').flatMap((r) => r.value);

        setReviews(all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user?.email]);

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;

  async function submitReply(reviewId) {
    const text = (replyText[reviewId] || '').trim();
    if (!text) return;
    setReplyState((p) => ({ ...p, [reviewId]: 'loading' }));
    try {
      const res = await api.replyToReview(reviewId, text);
      if (res.ok) {
        // Optimistic update — store reply locally
        setReviews((prev) =>
          prev.map((r) =>
            r._id === reviewId
              ? { ...r, partnerReply: text, repliedAt: new Date().toISOString() }
              : r
          )
        );
        setReplyState((p) => ({ ...p, [reviewId]: 'done' }));
        setReplyOpen((p) => ({ ...p, [reviewId]: false }));
        setReplyText((p) => ({ ...p, [reviewId]: '' }));
      } else {
        setReplyState((p) => ({ ...p, [reviewId]: 'error' }));
      }
    } catch {
      setReplyState((p) => ({ ...p, [reviewId]: 'error' }));
    }
    // Reset error state after 3s
    setTimeout(() => setReplyState((p) => ({ ...p, [reviewId]: 'idle' })), 3000);
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'var(--dash-divider)', borderTopColor: 'var(--dash-accent-500)' }}
        />
      </div>
    );

  return (
    <div
      className="font-sans pb-16 dash-transition"
      style={{ background: 'var(--dash-bg)', color: 'var(--dash-text-1)' }}
    >
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 py-6 space-y-6">
        {/* HEADER */}
        <div className="dash-fade-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-1"
              style={{ color: 'var(--dash-accent)' }}
            >
              Feedback
            </p>
            <h1
              className="text-[20px] font-semibold leading-snug"
              style={{ color: 'var(--dash-text-1)' }}
            >
              Guest Feedback
            </h1>
            <p className="text-[11px] mt-1" style={{ color: 'var(--dash-text-3)' }}>
              Read and respond to reviews from your property guests.
            </p>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 dash-fade-2">
          {[
            { label: 'Total Reviews', value: reviews.length },
            { label: 'Average Rating', value: avg ? `${avg} ★` : '—' },
            { label: '5-Star Reviews', value: fiveStarCount },
            { label: 'Properties', value: listings.length },
          ].map((c) => (
            <div
              key={c.label}
              className="dash-kpi-card p-5 rounded-xl"
              style={{
                background: 'var(--dash-card)',
                border: '1px solid var(--dash-card-border)',
              }}
            >
              <p className="text-[10.5px] font-medium mb-2" style={{ color: 'var(--dash-text-3)' }}>
                {c.label}
              </p>
              <div className="h-px mb-2.5" style={{ background: 'var(--dash-divider)' }} />
              <p
                className="text-[22px] font-semibold tracking-tight leading-none mb-1.5"
                style={{ color: 'var(--dash-text-1)' }}
              >
                {c.value}
              </p>
            </div>
          ))}
        </div>

        {/* REVIEWS LIST */}
        <div
          className="rounded-xl overflow-hidden dash-fade-3"
          style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-card-border)' }}
        >
          <div className="p-5" style={{ borderBottom: '1px solid var(--dash-divider)' }}>
            <h3 className="text-[13px] font-semibold" style={{ color: 'var(--dash-text-1)' }}>
              All Reviews
            </h3>
            <p className="text-[10.5px] mt-0.5" style={{ color: 'var(--dash-text-3)' }}>
              {reviews.length} reviews across {listings.length} properties
            </p>
          </div>

          {reviews.length === 0 ? (
            <div className="py-16 text-center">
              <Star size={28} style={{ color: 'var(--dash-text-3)', margin: '0 auto 8px' }} />
              <h4
                className="text-xs font-semibold uppercase tracking-wider mb-1"
                style={{ color: 'var(--dash-text-3)' }}
              >
                No reviews yet
              </h4>
              <p className="text-xs font-medium max-w-xs mx-auto" style={{ color: 'var(--dash-text-3)' }}>
                Guest reviews will appear here once visitors share their experience.
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--dash-divider)' }}>
              {reviews.map((r, i) => {
                const isOpen = !!replyOpen[r._id];
                const state = replyState[r._id] || 'idle';
                const hasReply = !!r.partnerReply;

                return (
                  <motion.div
                    key={r._id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="p-6 transition-colors"
                    style={{ background: 'transparent' }}
                  >
                    {/* ── Review row ── */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                          style={{
                            background: 'var(--dash-accent-dim)',
                            color: 'var(--dash-accent)',
                            border: '1px solid var(--dash-accent-border)',
                          }}
                        >
                          {(r.guestEmail || 'G').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h4 className="font-bold text-sm" style={{ color: 'var(--dash-text-1)' }}>
                              {r.guestEmail?.split('@')?.[0]}
                            </h4>
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide"
                              style={{
                                background: 'var(--dash-accent-dim)',
                                color: 'var(--dash-accent)',
                              }}
                            >
                              {r.listingTitle}
                            </span>
                          </div>
                          <div className="flex gap-0.5 mt-1.5">
                            {[...Array(5)].map((_, si) => (
                              <Star
                                key={si}
                                size={14}
                                className={si < r.rating ? 'fill-amber-400 text-amber-400' : ''}
                                style={si < r.rating ? {} : { color: 'var(--dash-divider)' }}
                              />
                            ))}
                          </div>
                          <p
                            className="text-sm mt-3 leading-relaxed font-medium"
                            style={{ color: 'var(--dash-text-2)' }}
                          >
                            {r.comment || 'No comment provided.'}
                          </p>

                          {/* ── Existing reply ── */}
                          {hasReply && (
                            <div
                              className="mt-4 rounded-xl p-4 border-l-2 space-y-1"
                              style={{
                                background: 'var(--dash-accent-dim)',
                                borderColor: 'var(--dash-accent)',
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <Shield size={12} style={{ color: 'var(--dash-accent)' }} />
                                <span
                                  className="text-[10px] font-black uppercase tracking-widest"
                                  style={{ color: 'var(--dash-accent)' }}
                                >
                                  Owner Response
                                </span>
                              </div>
                              <p
                                className="text-xs leading-relaxed font-medium"
                                style={{ color: 'var(--dash-text-2)' }}
                              >
                                {r.partnerReply}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ── Date + reply toggle ── */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <p
                          className="text-[10px] font-black uppercase tracking-wide"
                          style={{ color: 'var(--dash-text-3)' }}
                        >
                          {r.createdAt
                            ? new Date(r.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : '—'}
                        </p>
                        <button
                          onClick={() =>
                            setReplyOpen((p) => ({ ...p, [r._id]: !p[r._id] }))
                          }
                          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all"
                          style={{
                            background: isOpen ? 'var(--dash-accent-dim)' : 'var(--dash-card-border)',
                            color: isOpen ? 'var(--dash-accent)' : 'var(--dash-text-3)',
                          }}
                        >
                          <MessageSquare size={11} />
                          {hasReply ? 'Edit reply' : 'Reply'}
                          {isOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                        </button>
                      </div>
                    </div>

                    {/* ── Reply compose box ── */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 ml-15 pl-0 md:pl-[60px]">
                            <div className="space-y-2">
                              <label
                                className="text-[10px] font-semibold uppercase tracking-widest"
                                style={{ color: 'var(--dash-text-3)' }}
                              >
                                Your public response
                              </label>
                              <textarea
                                rows={3}
                                maxLength={1000}
                                placeholder="Write a professional, helpful response visible to all guests..."
                                value={replyText[r._id] || (hasReply ? r.partnerReply : '')}
                                onChange={(e) =>
                                  setReplyText((p) => ({ ...p, [r._id]: e.target.value }))
                                }
                                className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all"
                                style={{
                                  background: 'var(--dash-bg)',
                                  border: '1px solid var(--dash-card-border)',
                                  color: 'var(--dash-text-1)',
                                }}
                              />
                              <div className="flex items-center justify-between">
                                <span
                                  className="text-[10px]"
                                  style={{ color: 'var(--dash-text-3)' }}
                                >
                                  {(replyText[r._id] || '').length}/1000
                                </span>
                                <button
                                  onClick={() => submitReply(r._id)}
                                  disabled={state === 'loading' || !(replyText[r._id] || '').trim()}
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                                  style={{
                                    background:
                                      state === 'done'
                                        ? 'rgba(16,185,129,0.15)'
                                        : state === 'error'
                                          ? 'rgba(248,113,113,0.15)'
                                          : 'var(--dash-accent-500)',
                                    color:
                                      state === 'done'
                                        ? 'var(--dash-accent)'
                                        : state === 'error'
                                          ? 'var(--dash-danger)'
                                          : '#050a08',
                                  }}
                                >
                                  {state === 'loading' ? (
                                    <RefreshCcw size={13} className="animate-spin" />
                                  ) : state === 'done' ? (
                                    <CheckCircle size={13} />
                                  ) : (
                                    <Send size={13} />
                                  )}
                                  {state === 'loading'
                                    ? 'Saving…'
                                    : state === 'done'
                                      ? 'Saved!'
                                      : state === 'error'
                                        ? 'Failed — retry'
                                        : hasReply
                                          ? 'Update Reply'
                                          : 'Post Reply'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
