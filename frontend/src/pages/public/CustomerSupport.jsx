import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquarePlus,
  Send,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Headphones,
  Tag,
  ChevronRight,
  Loader2,
  AlertCircle,
  Plus,
  MessageCircle,
  User,
  Shield,
  Inbox,
  Search,
  Filter,
} from 'lucide-react';
import { WayzzaLayout } from '../../WayzzaUI.jsx';
import { useAuth } from '../../AuthContext.jsx';
import { useToast } from '../../ToastContext.jsx';

import { api } from '../../utils/api.js';

const CATEGORIES = [
  { value: 'general', label: 'General Inquiry', icon: '💬' },
  { value: 'booking', label: 'Booking Issue', icon: '📋' },
  { value: 'payment', label: 'Payment Problem', icon: '💳' },
  { value: 'account', label: 'Account Help', icon: '👤' },
  { value: 'property', label: 'Property Report', icon: '🏠' },
  { value: 'bug', label: 'Bug / Technical', icon: '🐛' },
];

const STATUS_MAP = {
  open: { label: 'Open', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Clock },
  closed: {
    label: 'Closed',
    color: 'bg-slate-100 text-slate-500 border-slate-200',
    icon: CheckCircle,
  },
};

export default function CustomerSupport() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  const [view, setView] = useState('list'); // list | new | detail
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState(''); // This seems unused in original but keeping for safety
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // New ticket form
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [submitting, setSubmitting] = useState(false);

  // Reply
  const [reply, setReply] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadTickets();
  }, []);
  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [selected, selected?.replies]);

  async function loadTickets() {
    try {
      setLoading(true);
      const data = await api.getSupportTickets();
      if (data.ok) setTickets(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function submitTicket(e) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      return showToast('Please fill in subject and message.', 'warning');
    }
    setSubmitting(true);
    try {
      const data = await api.createSupportTicket({ subject, message, category });
      if (data.ok) {
        showToast('Ticket submitted! Our team will respond shortly.', 'success');
        setSubject('');
        setMessage('');
        setCategory('general');
        setView('list');
        loadTickets();
      } else {
        showToast(data.message || 'Failed to submit ticket.', 'error');
      }
    } catch {
      showToast('Network error.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function sendReply() {
    if (!reply.trim() || !selected) return;
    setSendingReply(true);
    try {
      const data = await api.replyToSupportTicket(selected._id, { reply });
      if (data.ok) {
        setReply('');
        // Reload tickets and re-select
        const tData = await api.getSupportTickets();
        if (tData.ok) {
          setTickets(tData.data);
          const updated = tData.data.find((t) => t._id === selected._id);
          if (updated) setSelected(updated);
        }
        showToast('Reply sent!', 'success');
      }
    } catch {
      showToast('Network error.', 'error');
    } finally {
      setSendingReply(false);
    }
  }

  function openTicket(ticket) {
    setSelected(ticket);
    setView('detail');
    setReply('');
  }

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (searchQuery && !t.subject.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const openCount = tickets.filter((t) => t.status === 'open').length;
  const closedCount = tickets.filter((t) => t.status === 'closed').length;

  return (
    <WayzzaLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-sans">
        {/* HERO */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white py-10 md:py-16 overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'radial-gradient(circle at 30% 40%, rgba(16,185,129,0.3) 0%, transparent 60%), radial-gradient(circle at 70% 80%, rgba(6,182,212,0.2) 0%, transparent 50%)',
            }}
          />
          <div className="max-w-5xl mx-auto px-6 relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-xl md:rounded-2xl flex items-center justify-center">
                <Headphones size={20} className="text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Customer Support</h1>
                <p className="text-slate-400 font-bold uppercase text-[9px] md:text-xs tracking-widest mt-0.5">
                  We're here to help — get support from the Wayzza team
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 -mt-6">
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-8">
            {[
              {
                label: 'Open Tickets',
                value: openCount,
                color: 'text-emerald-600',
                bgColor: 'bg-emerald-50 border-emerald-100',
                icon: Clock,
              },
              {
                label: 'Resolved',
                value: closedCount,
                color: 'text-slate-400',
                bgColor: 'bg-white border-slate-100',
                icon: CheckCircle,
              },
              {
                label: 'Total',
                value: tickets.length,
                color: 'text-slate-900',
                bgColor: 'bg-white border-slate-100',
                icon: Inbox,
              },
            ].map((kpi, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`${kpi.bgColor} border rounded-2xl p-4 md:p-5 flex items-center gap-4 shadow-sm`}
              >
                <div
                  className={`w-10 h-10 ${kpi.bgColor} rounded-xl flex items-center justify-center border border-inherit`}
                >
                  <kpi.icon size={18} className={kpi.color} />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">{kpi.value}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ===== LIST VIEW ===== */}
            {view === 'list' && (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Toolbar */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                    <div className="relative flex-1">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={15}
                      />
                      <input
                        type="text"
                        placeholder="Search tickets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-10 w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm font-medium text-slate-700 appearance-none cursor-pointer focus:border-emerald-500 outline-none"
                    >
                      <option value="all">All</option>
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setView('new')}
                    className="h-10 px-5 bg-slate-900 text-white rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-emerald-600 transition-colors active:scale-95 whitespace-nowrap"
                  >
                    <Plus size={15} /> New Ticket
                  </button>
                </div>

                {/* Ticket List */}
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 size={28} className="text-emerald-500 animate-spin" />
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Inbox size={28} className="text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No tickets found</h3>
                    <p className="text-sm text-slate-500 mt-1 mb-6">
                      {tickets.length === 0
                        ? "You haven't submitted any support tickets yet."
                        : 'No tickets match your filters.'}
                    </p>
                    {tickets.length === 0 && (
                      <button
                        onClick={() => setView('new')}
                        className="h-10 px-6 bg-emerald-600 text-white rounded-xl font-semibold text-sm inline-flex items-center gap-2 hover:bg-emerald-700 transition-colors"
                      >
                        <MessageSquarePlus size={15} /> Create Your First Ticket
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTickets.map((ticket, i) => {
                      const st = STATUS_MAP[ticket.status] || STATUS_MAP.open;
                      const lastReply = ticket.replies?.[ticket.replies.length - 1];
                      const hasAdminReply = ticket.replies?.some((r) => r.from === 'admin');
                      return (
                        <motion.button
                          key={ticket._id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          onClick={() => openTicket(ticket)}
                          className="w-full bg-white border border-slate-200 rounded-2xl p-4 md:p-5 text-left hover:border-emerald-300 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${st.color}`}
                                >
                                  {st.label}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-semibold">
                                  {CATEGORIES.find((c) => c.value === ticket.category)?.icon}{' '}
                                  {ticket.category}
                                </span>
                                {hasAdminReply && (
                                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-semibold flex items-center gap-1">
                                    <Shield size={9} /> Admin replied
                                  </span>
                                )}
                              </div>
                              <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors truncate">
                                {ticket.subject}
                              </h3>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                                {lastReply
                                  ? `${lastReply.from === 'admin' ? 'Support' : 'You'}: ${lastReply.message}`
                                  : ticket.message}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <span className="text-[10px] font-medium text-slate-400">
                                {new Date(ticket.updatedAt || ticket.createdAt).toLocaleDateString(
                                  'en-IN',
                                  { day: 'numeric', month: 'short' }
                                )}
                              </span>
                              {ticket.replies?.length > 0 && (
                                <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                                  <MessageCircle size={10} /> {ticket.replies.length}
                                </span>
                              )}
                              <ChevronRight
                                size={14}
                                className="text-slate-300 group-hover:text-emerald-500 transition-colors"
                              />
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ===== NEW TICKET VIEW ===== */}
            {view === 'new' && (
              <motion.div
                key="new"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button
                  onClick={() => setView('list')}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors mb-6"
                >
                  <ArrowLeft size={15} /> Back to Tickets
                </button>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <MessageSquarePlus size={18} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Submit a New Ticket</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Fill in the details below and our team will get back to you
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={submitTicket} className="p-6 space-y-5">
                    {/* Category */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700">Category</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => setCategory(cat.value)}
                            className={`p-3 md:p-4 rounded-xl border text-sm font-medium text-left transition-all ${
                              category === cat.value
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <span className="text-xl block mb-1">{cat.icon}</span>
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-tight">{cat.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700">
                        Subject <span className="text-rose-400">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Brief summary of your issue"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="h-11 w-full bg-slate-50 border border-slate-200 rounded-lg px-4 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                      />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700">
                        Message <span className="text-rose-400">*</span>
                      </label>
                      <textarea
                        required
                        rows={5}
                        placeholder="Describe your issue in detail. Include booking IDs or screenshots if relevant."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <AlertCircle size={15} className="text-blue-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-blue-700 font-medium">
                        Our support team typically responds within 24 hours. For urgent matters,
                        please include your booking ID or account email.
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setView('list')}
                        className="text-sm font-semibold text-slate-500 hover:text-rose-500 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className={`h-11 px-8 bg-slate-900 text-white rounded-xl font-semibold text-sm flex items-center gap-2 transition-all active:scale-95 ${submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-600'}`}
                      >
                        {submitting ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <>
                            <Send size={14} /> Submit Ticket
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* ===== TICKET DETAIL VIEW ===== */}
            {view === 'detail' && selected && (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button
                  onClick={() => {
                    setView('list');
                    setSelected(null);
                  }}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors mb-6"
                >
                  <ArrowLeft size={15} /> Back to Tickets
                </button>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  {/* Ticket Header */}
                  <div className="p-6 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {(() => {
                            const st = STATUS_MAP[selected.status] || STATUS_MAP.open;
                            return (
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${st.color}`}
                              >
                                {st.label}
                              </span>
                            );
                          })()}
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-semibold">
                            {CATEGORIES.find((c) => c.value === selected.category)?.icon}{' '}
                            {selected.category}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">{selected.subject}</h2>
                        <p className="text-xs text-slate-400 mt-1">
                          Created{' '}
                          {new Date(selected.createdAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Conversation */}
                  <div className="p-6 space-y-4 max-h-[450px] overflow-y-auto bg-slate-50/50">
                    {/* Original message */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">
                        {(user?.email?.[0] || 'U').toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-700">You</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(selected.createdAt).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl rounded-tl-sm p-4 text-sm text-slate-700 leading-relaxed">
                          {selected.message}
                        </div>
                      </div>
                    </div>

                    {/* Replies */}
                    {selected.replies?.map((r, i) => {
                      const isAdmin = r.from === 'admin';
                      return (
                        <div key={i} className={`flex gap-3 ${isAdmin ? '' : 'flex-row'}`}>
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${isAdmin ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}
                          >
                            {isAdmin ? (
                              <Shield size={14} />
                            ) : (
                              (user?.email?.[0] || 'U').toUpperCase()
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`text-xs font-bold ${isAdmin ? 'text-emerald-700' : 'text-slate-700'}`}
                              >
                                {isAdmin ? 'Wayzza Support' : 'You'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(r.createdAt).toLocaleString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <div
                              className={`rounded-xl p-4 text-sm leading-relaxed ${
                                isAdmin
                                  ? 'bg-emerald-50 border border-emerald-100 text-emerald-900 rounded-tl-sm'
                                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                              }`}
                            >
                              {r.message}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Reply Box */}
                  {selected.status !== 'closed' ? (
                    <div className="p-4 border-t border-slate-200 bg-white">
                      <div className="flex items-end gap-3">
                        <textarea
                          rows={2}
                          placeholder="Type your reply..."
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendReply();
                            }
                          }}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all resize-none"
                        />
                        <button
                          onClick={sendReply}
                          disabled={!reply.trim() || sendingReply}
                          className="h-11 w-11 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                        >
                          {sendingReply ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Send size={16} />
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2">
                        Press Enter to send, Shift+Enter for new line
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 border-t border-slate-200 bg-slate-50 text-center">
                      <p className="text-sm text-slate-500 font-medium flex items-center justify-center gap-2">
                        <CheckCircle size={14} /> This ticket has been closed. Create a new ticket
                        for further assistance.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-20" />
      </div>
    </WayzzaLayout>
  );
}
