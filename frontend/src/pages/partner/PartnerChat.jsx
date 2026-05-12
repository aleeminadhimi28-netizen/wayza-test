import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../AuthContext.jsx';
import { motion } from 'framer-motion';
import { Send, MessageSquare, CheckCircle, Search } from 'lucide-react';

import { api } from '../../utils/api.js';
import {
  initiateSocketConnection,
  disconnectSocket,
  subscribeToMessages,
  joinBookingRoom,
  leaveBookingRoom,
} from '../../utils/socket.js';

export default function PartnerChat() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const loadMessages = useCallback(async () => {
    if (!selected) return;
    try {
      const data = await api.getChat(selected._id);
      if (data.ok) setMessages(data.data || []);
    } catch (_) {}
  }, [selected]);

  async function send() {
    if (!text.trim() || !selected) return;
    const messageText = text.trim();
    setSending(true);
    try {
      const res = await api.sendChat(selected._id, messageText);
      if (res.ok) {
        // Manually add message to state for immediate feedback
        // The socket listener's deduplication logic will prevent duplicates
        const tempMsg = {
          _id: Date.now().toString(), // Temporary ID for list key
          bookingId: selected._id,
          senderEmail: user.email,
          message: messageText,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempMsg]);
        setText('');
      }
    } catch (_) {}
    setSending(false);
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  useEffect(() => {
    initiateSocketConnection();
    subscribeToMessages((err, msg) => {
      if (err) return;
      setMessages((prev) => {
        const exists = prev.find((m) => m._id === msg._id);
        if (exists) return prev;
        return [...prev, msg];
      });
    });

    return () => disconnectSocket();
  }, []);

  useEffect(() => {
    if (!user?.email) return;

    api
      .getPartnerBookings()
      .then((rows) => {
        const paid = Array.isArray(rows) ? rows.filter((b) => b.status === 'paid') : [];
        setBookings(paid);
        if (paid.length > 0) setSelected(paid[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user?.email]);

  useEffect(() => {
    if (!selected) return;
    loadMessages();
    joinBookingRoom(selected._id);

    return () => {
      leaveBookingRoom(selected._id);
    };
  }, [selected?._id, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);



  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-[calc(100vh-140px)] min-h-[600px] font-sans pb-4 px-2"
    >
      {/* HEADER */}
      <div className="mb-6 pl-1">
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide mb-1">
          <MessageSquare size={14} /> Guest Concierge
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Guest Messages</h1>
        <p className="text-sm text-slate-500 mt-1">
          Direct communication channel with your confirmed guests.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex-1 flex flex-col items-center justify-center shadow-sm">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
            <MessageSquare size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No active chats</h3>
          <p className="text-sm text-slate-500 max-w-xs">
            Messaging is available for guests with confirmed bookings.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm min-h-0">
          {/* CONTACT LIST */}
          <aside className="w-80 border-r border-slate-100 flex flex-col shrink-0 hidden lg:flex">
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  placeholder="Search guests..."
                  className="w-full h-9 bg-slate-50 rounded-lg pl-8 pr-3 text-sm outline-none border border-transparent focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-1">
              {bookings.map((b) => (
                <button
                  key={b._id}
                  onClick={() => setSelected(b)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all ${selected?._id === b._id ? 'bg-emerald-50 border-r-2 border-emerald-500' : 'hover:bg-slate-50'}`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${selected?._id === b._id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                  >
                    {(b.guestEmail || 'G').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4
                      className={`font-semibold text-sm truncate ${selected?._id === b._id ? 'text-slate-900' : 'text-slate-600'}`}
                    >
                      {b.guestEmail?.split('@')[0]}
                    </h4>
                    <p className="text-xs text-slate-400 truncate">{b.title}</p>
                  </div>
                  {selected?._id === b._id && (
                    <div className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </aside>

          {/* CHAT AREA */}
          <main className="flex-1 flex flex-col min-h-0">
            {/* Chat header */}
            <header className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 shrink-0 bg-white">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                  {(selected?.guestEmail || 'G').charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  {selected?.guestEmail?.split('@')[0]}
                </h3>
                <p className="text-xs text-slate-500">{selected?.title} · Online</p>
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-300">
                    <MessageSquare size={22} />
                  </div>
                  <p className="text-sm text-slate-500">Start a conversation with your guest.</p>
                </div>
              ) : (
                messages.map((m, i) => {
                  const isMe = m.senderEmail === user?.email;
                  return (
                    <motion.div
                      key={m._id || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`px-4 py-3 rounded-2xl text-sm max-w-[75%] ${
                          isMe
                            ? 'bg-slate-900 text-white rounded-br-md'
                            : 'bg-white border border-slate-200 text-slate-700 rounded-bl-md shadow-sm'
                        }`}
                      >
                        <p>{m.message}</p>
                        <div
                          className={`flex items-center gap-2 mt-2 text-xs ${isMe ? 'text-white/40' : 'text-slate-400'}`}
                        >
                          <span>
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </span>
                          {isMe && <CheckCircle size={11} className="text-emerald-400" />}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <footer className="p-4 bg-white border-t border-slate-100 shrink-0">
              <div className="flex gap-3 items-center bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl focus-within:bg-white focus-within:border-emerald-500 transition-all">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Type a message..."
                  rows={1}
                  className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-slate-900 placeholder:text-slate-400"
                />
                <button
                  onClick={send}
                  disabled={!text.trim() || sending}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${sending || !text.trim() ? 'bg-slate-100 text-slate-300' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'}`}
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </footer>
          </main>
        </div>
      )}
    </motion.div>
  );
}
