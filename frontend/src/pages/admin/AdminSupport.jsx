import { motion } from 'framer-motion';
import { MessageSquare, AlertCircle, CheckCircle, Mail, Trash2, Send } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import { api } from '../../utils/api.js';

export default function AdminSupport({ tickets, setTickets, loadTickets }) {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    onConfirm: null,
    isLoading: false,
  });

  const closeConfirm = () =>
    setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));

  const handleConfirmAction = async () => {
    if (!confirmModal.onConfirm) return;
    setConfirmModal((prev) => ({ ...prev, isLoading: true }));
    try {
      await confirmModal.onConfirm();
      closeConfirm();
    } catch (err) {
      console.error('Action failed:', err);
      setConfirmModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  async function handleReplyTicket() {
    if (!replyText.trim() || !selectedTicket) return;
    const msg = replyText.trim();
    setSendingReply(true);
    try {
      await api.replyToTicket(selectedTicket._id, { reply: msg });
      setReplyText('');
      await loadTickets();
      setSelectedTicket((prev) =>
        prev
          ? {
              ...prev,
              replies: [
                ...(prev.replies || []),
                { message: msg, from: 'admin', createdAt: new Date() },
              ],
            }
          : null
      );
    } catch (err) {
      console.error('Failed to send reply:', err);
    }
    setSendingReply(false);
  }

  async function handleCloseTicket(id) {
    try {
      await api.replyToTicket(id, { status: 'closed' });
      await loadTickets();
      if (selectedTicket?._id === id) setSelectedTicket((prev) => ({ ...prev, status: 'closed' }));
    } catch (err) {
      console.error('Failed to close ticket:', err);
    }
  }

  const handleDeleteTicket = (id) => {
    setConfirmModal({ isOpen: true, onConfirm: () => executeDeleteTicket(id), isLoading: false });
  };

  async function executeDeleteTicket(id) {
    try {
      await api.deleteTicket(id);
      setTickets((prev) => prev.filter((t) => t._id !== id));
      if (selectedTicket?._id === id) setSelectedTicket(null);
    } catch (err) {
      console.error('Failed to delete ticket:', err);
    }
  }

  const statCards = [
    {
      label: 'Open Tickets',
      value: tickets.filter((t) => t.status === 'open').length,
      icon: AlertCircle,
      accent: 'amber',
    },
    {
      label: 'Closed Tickets',
      value: tickets.filter((t) => t.status === 'closed').length,
      icon: CheckCircle,
      accent: 'emerald',
    },
    { label: 'Total Tickets', value: tickets.length, icon: MessageSquare, accent: 'blue' },
  ];

  const accentMap = {
    amber: 'bg-amber-500/15 border-amber-500/25 text-amber-400',
    emerald: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400',
    blue: 'bg-blue-500/15 border-blue-500/25 text-blue-400',
  };

  return (
    <motion.div
      key="support"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {statCards.map((c, i) => (
          <div
            key={i}
            className="rounded-2xl p-5"
            style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-card-border)' }}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border ${accentMap[c.accent]}`}
            >
              <c.icon size={18} />
            </div>
            <p
              className="text-xs font-black uppercase tracking-[0.18em] mb-1"
              style={{ color: 'var(--dash-text-3)' }}
            >
              {c.label}
            </p>
            <p className="text-2xl font-black" style={{ color: 'var(--dash-text-1)' }}>
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-[500px]">
        {/* Ticket list */}
        <div
          className="rounded-2xl overflow-hidden flex flex-col"
          style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-card-border)' }}
        >
          <div
            className="px-5 py-4 shrink-0"
            style={{ borderBottom: '1px solid var(--dash-divider)' }}
          >
            <h3
              className="font-black text-sm uppercase tracking-wide"
              style={{ color: 'var(--dash-text-1)' }}
            >
              All Tickets
            </h3>
          </div>
          <div
            className="flex-1 overflow-y-auto divide-y"
            style={{ borderColor: 'var(--dash-divider)' }}
          >
            {tickets.length === 0 ? (
              <div className="py-16 text-center">
                <MessageSquare
                  size={28}
                  className="mx-auto mb-2"
                  style={{ color: 'var(--dash-text-3)' }}
                />
                <p className="text-sm" style={{ color: 'var(--dash-text-2)' }}>
                  No support tickets
                </p>
              </div>
            ) : (
              tickets.map((t) => (
                <button
                  key={t._id}
                  onClick={() => setSelectedTicket(t)}
                  className={`w-full text-left p-4 transition-colors ${
                    selectedTicket?._id === t._id ? 'border-l-2 border-emerald-500' : ''
                  }`}
                  style={{
                    background:
                      selectedTicket?._id === t._id ? 'rgba(16,185,129,0.05)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedTicket?._id !== t._id)
                      e.currentTarget.style.background = 'rgba(128,128,128,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    if (selectedTicket?._id !== t._id)
                      e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p
                        className="font-bold text-sm truncate"
                        style={{ color: 'var(--dash-text-1)' }}
                      >
                        {t.subject}
                      </p>
                      <p
                        className="text-xs truncate mt-0.5"
                        style={{ color: 'var(--dash-text-3)' }}
                      >
                        {t.email}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${
                        t.status === 'open'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/25'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p
                    className="text-xs mt-1.5 line-clamp-2"
                    style={{ color: 'var(--dash-text-2)' }}
                  >
                    {t.message}
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--dash-text-3)' }}>
                    {new Date(t.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Ticket detail */}
        <div
          className="xl:col-span-2 rounded-2xl overflow-hidden flex flex-col"
          style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-card-border)' }}
        >
          {!selectedTicket ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <Mail size={32} style={{ color: 'var(--dash-text-3)' }} />
              <p className="text-sm" style={{ color: 'var(--dash-text-2)' }}>
                Select a ticket to view details
              </p>
            </div>
          ) : (
            <>
              {/* Ticket header */}
              <div
                className="p-5 flex items-start justify-between gap-4 shrink-0"
                style={{ borderBottom: '1px solid var(--dash-divider)' }}
              >
                <div className="min-w-0">
                  <h3 className="font-black text-base" style={{ color: 'var(--dash-text-1)' }}>
                    {selectedTicket.subject}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs" style={{ color: 'var(--dash-text-2)' }}>
                      {selectedTicket.email}
                    </span>
                    <span style={{ color: 'var(--dash-text-3)' }}>·</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${
                        selectedTicket.status === 'open'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/25'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                      }`}
                    >
                      {selectedTicket.status}
                    </span>
                    <span style={{ color: 'var(--dash-text-3)' }}>·</span>
                    <span className="text-xs capitalize" style={{ color: 'var(--dash-text-2)' }}>
                      {selectedTicket.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {selectedTicket.status === 'open' && (
                    <button
                      onClick={() => handleCloseTicket(selectedTicket._id)}
                      className="h-8 px-3 bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 rounded-lg font-bold text-xs hover:bg-emerald-600 hover:text-[#050a08] transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle size={12} /> Close
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteTicket(selectedTicket._id)}
                    className="w-8 h-8 bg-rose-500/15 text-rose-400 border border-rose-500/25 rounded-lg flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto p-5 space-y-4"
                style={{ background: 'rgba(0,0,0,0.15)' }}
              >
                {/* Original message */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/25 flex items-center justify-center font-black text-xs shrink-0">
                    {(selectedTicket.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div
                    className="rounded-2xl rounded-tl-sm p-4 max-w-[80%]"
                    style={{
                      background: 'var(--dash-card)',
                      border: '1px solid var(--dash-card-border)',
                    }}
                  >
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--dash-text-1)' }}>
                      {selectedTicket.message}
                    </p>
                    <p className="text-[11px] mt-2" style={{ color: 'var(--dash-text-3)' }}>
                      {new Date(selectedTicket.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Replies */}
                {(selectedTicket.replies || []).map((r, i) => (
                  <div key={i} className={`flex gap-3 ${r.from === 'admin' ? 'justify-end' : ''}`}>
                    {r.from !== 'admin' && (
                      <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/25 flex items-center justify-center font-black text-xs shrink-0">
                        U
                      </div>
                    )}
                    <div
                      className={`rounded-2xl p-4 max-w-[80%] ${
                        r.from === 'admin'
                          ? 'bg-emerald-600 text-[#050a08] rounded-br-sm'
                          : 'rounded-tl-sm'
                      }`}
                      style={
                        r.from !== 'admin'
                          ? {
                              background: 'var(--dash-card)',
                              border: '1px solid var(--dash-card-border)',
                            }
                          : {}
                      }
                    >
                      <p
                        className={`text-sm leading-relaxed ${r.from === 'admin' ? 'text-[#050a08] font-semibold' : ''}`}
                        style={r.from !== 'admin' ? { color: 'var(--dash-text-1)' } : {}}
                      >
                        {r.message}
                      </p>
                      <p
                        className={`text-[11px] mt-2 ${r.from === 'admin' ? 'text-[#050a08]/50' : ''}`}
                        style={r.from !== 'admin' ? { color: 'var(--dash-text-3)' } : {}}
                      >
                        {r.from === 'admin' ? 'Admin' : selectedTicket.email} ·{' '}
                        {new Date(r.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {r.from === 'admin' && (
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-[#050a08] flex items-center justify-center font-black text-xs shrink-0">
                        A
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Reply input */}
              {selectedTicket.status === 'open' && (
                <div
                  className="p-4 shrink-0"
                  style={{ borderTop: '1px solid var(--dash-divider)' }}
                >
                  <div className="flex gap-3 items-end">
                    <textarea
                      placeholder="Type your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleReplyTicket();
                        }
                      }}
                      rows={2}
                      className="flex-1 min-h-[40px] max-h-32 rounded-xl px-4 py-2.5 text-sm font-medium outline-none resize-y transition-all"
                      style={{
                        background: 'rgba(128,128,128,0.06)',
                        border: '1px solid var(--dash-divider)',
                        color: 'var(--dash-text-1)',
                      }}
                    />
                    <button
                      onClick={handleReplyTicket}
                      disabled={!replyText.trim() || sendingReply}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                        !replyText.trim()
                          ? 'opacity-40 cursor-not-allowed'
                          : 'bg-emerald-600 text-[#050a08] hover:bg-emerald-500'
                      }`}
                      style={
                        !replyText.trim()
                          ? { background: 'rgba(128,128,128,0.08)', color: 'var(--dash-text-3)' }
                          : {}
                      }
                    >
                      {sendingReply ? (
                        <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirm}
        onConfirm={handleConfirmAction}
        title="Delete Support Ticket"
        message="Are you sure you want to delete this support ticket? This action cannot be undone."
        confirmText="Delete Ticket"
        confirmVariant="rose"
        isLoading={confirmModal.isLoading}
      />
    </motion.div>
  );
}
