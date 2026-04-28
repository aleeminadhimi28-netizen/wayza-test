import { motion } from 'framer-motion';
import { MessageSquare, AlertCircle, CheckCircle, Mail, Trash2, Send, X } from 'lucide-react';
import { useState } from 'react';
import { api } from '../../utils/api.js';

export default function AdminSupport({ tickets, setTickets, loadTickets, loadingData }) {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  async function handleReplyTicket() {
    if (!replyText.trim() || !selectedTicket) return;
    setSendingReply(true);
    try {
      await api.replyToTicket(selectedTicket._id, { reply: replyText.trim() });
      setReplyText('');
      await loadTickets();
      const updated = tickets.find((t) => t._id === selectedTicket._id);
      if (updated)
        setSelectedTicket({
          ...updated,
          replies: [
            ...(updated.replies || []),
            { message: replyText.trim(), from: 'admin', createdAt: new Date() },
          ],
        });
    } catch (_) {
      // Silently handle reply sending errors
    }
    setSendingReply(false);
  }

  async function handleCloseTicket(id) {
    try {
      await api.replyToTicket(id, { status: 'closed' });
      await loadTickets();
      if (selectedTicket?._id === id) setSelectedTicket((prev) => ({ ...prev, status: 'closed' }));
    } catch (_) {
      // Silently handle ticket close errors
    }
  }

  async function handleDeleteTicket(id) {
    if (!window.confirm('Delete this support ticket?')) return;
    try {
      await api.deleteTicket(id);
      setTickets((prev) => prev.filter((t) => t._id !== id));
      if (selectedTicket?._id === id) setSelectedTicket(null);
    } catch (_) {
      // Silently handle ticket delete errors
    }
  }

  return (
    <motion.div
      key="support"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          {
            label: 'Open Tickets',
            value: tickets.filter((t) => t.status === 'open').length,
            bg: 'bg-amber-50',
            color: 'text-amber-600',
            icon: AlertCircle,
          },
          {
            label: 'Closed Tickets',
            value: tickets.filter((t) => t.status === 'closed').length,
            bg: 'bg-emerald-50',
            color: 'text-emerald-600',
            icon: CheckCircle,
          },
          {
            label: 'Total Tickets',
            value: tickets.length,
            bg: 'bg-blue-50',
            color: 'text-blue-600',
            icon: MessageSquare,
          },
        ].map((c, i) => (
          <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
            <div
              className={`w-10 h-10 rounded-xl ${c.bg} ${c.color} flex items-center justify-center mb-3`}
            >
              <c.icon size={18} />
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-0.5">{c.label}</p>
            <p className="text-xl font-bold text-slate-900">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-[500px]">
        {/* TICKET LIST */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">All Tickets</h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {tickets.length === 0 ? (
              <div className="py-16 text-center">
                <MessageSquare size={28} className="text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No support tickets</p>
              </div>
            ) : (
              tickets.map((t) => (
                <button
                  key={t._id}
                  onClick={() => setSelectedTicket(t)}
                  className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${selectedTicket?._id === t._id ? 'bg-emerald-50/50 border-l-2 border-emerald-500' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-slate-900 truncate">{t.subject}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{t.email}</p>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase ${t.status === 'open' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.message}</p>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* TICKET DETAIL */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {!selectedTicket ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <Mail size={32} className="text-slate-200" />
              <p className="text-sm text-slate-500">Select a ticket to view details</p>
            </div>
          ) : (
            <>
              {/* Ticket header */}
              <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-bold text-base text-slate-900">{selectedTicket.subject}</h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-slate-500">{selectedTicket.email}</span>
                    <span className="text-xs text-slate-400">Â·</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase ${selectedTicket.status === 'open' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}
                    >
                      {selectedTicket.status}
                    </span>
                    <span className="text-xs text-slate-400">Â·</span>
                    <span className="text-xs text-slate-400 capitalize">
                      {selectedTicket.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {selectedTicket.status === 'open' && (
                    <button
                      onClick={() => handleCloseTicket(selectedTicket._id)}
                      className="h-8 px-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg font-semibold text-xs hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle size={12} /> Close
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteTicket(selectedTicket._id)}
                    className="w-8 h-8 bg-rose-50 text-rose-500 border border-rose-100 rounded-lg flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
                {/* Original message */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                    {(selectedTicket.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-md p-4 shadow-sm max-w-[80%]">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {selectedTicket.message}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2">
                      {new Date(selectedTicket.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Replies */}
                {(selectedTicket.replies || []).map((r, i) => (
                  <div key={i} className={`flex gap-3 ${r.from === 'admin' ? 'justify-end' : ''}`}>
                    {r.from !== 'admin' && (
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                        U
                      </div>
                    )}
                    <div
                      className={`rounded-2xl p-4 max-w-[80%] shadow-sm ${
                        r.from === 'admin'
                          ? 'bg-slate-900 text-white rounded-br-md'
                          : 'bg-white border border-slate-200 rounded-tl-md text-slate-700'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{r.message}</p>
                      <p
                        className={`text-[11px] mt-2 ${r.from === 'admin' ? 'text-white/40' : 'text-slate-400'}`}
                      >
                        {r.from === 'admin' ? 'Admin' : selectedTicket.email} Â·{' '}
                        {new Date(r.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {r.from === 'admin' && (
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        A
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Reply input */}
              {selectedTicket.status === 'open' && (
                <div className="p-4 border-t border-slate-100 bg-white">
                  <div className="flex gap-3 items-center">
                    <input
                      placeholder="Type your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleReplyTicket()}
                      className="flex-1 h-10 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:bg-white focus:border-emerald-500 transition-all outline-none"
                    />
                    <button
                      onClick={handleReplyTicket}
                      disabled={!replyText.trim() || sendingReply}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${!replyText.trim() ? 'bg-slate-100 text-slate-300' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'}`}
                    >
                      {sendingReply ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
    </motion.div>
  );
}
