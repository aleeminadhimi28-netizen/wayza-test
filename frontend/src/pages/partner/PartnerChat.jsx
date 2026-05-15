import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../AuthContext.jsx';
import { motion } from 'framer-motion';
import { Send, MessageSquare, CheckCircle, Search, Sparkles } from 'lucide-react';
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
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const filteredBookings = bookings.filter(
    (b) =>
      !search ||
      b.guestEmail?.toLowerCase().includes(search.toLowerCase()) ||
      b.title?.toLowerCase().includes(search.toLowerCase())
  );

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
        const tempMsg = {
          _id: Date.now().toString(),
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
      <div className="flex items-center justify-center min-h-[400px] bg-[#050a08]">
        <div className="w-10 h-10 border-2 border-white/10 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#050a08] font-sans text-white selection:bg-emerald-900/50 selection:text-emerald-200 pb-20">
      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-700/5 blur-[100px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: 'linear-gradient(rgba(52,211,153,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.6) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-10 flex flex-col h-[calc(100vh-40px)] min-h-[600px]">
        {/* HEADER */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-[0.4em] mb-1">
            <Sparkles size={12} /> Guest Concierge
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Guest Messages</h1>
          <p className="text-sm text-white/30 font-medium mt-1">
            Direct communication channel with your confirmed guests.
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-12 text-center flex-1 flex flex-col items-center justify-center backdrop-blur-xl">
            <div className="w-14 h-14 bg-white/[0.05] border border-white/[0.1] rounded-2xl flex items-center justify-center text-white/20 mb-4">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">No active chats</h3>
            <p className="text-sm text-white/30 font-medium max-w-xs">
              Messaging is available for guests with confirmed bookings.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex bg-white/[0.03] rounded-2xl border border-white/[0.08] overflow-hidden backdrop-blur-xl min-h-0">
            {/* CONTACT LIST */}
            <aside className="w-80 border-r border-white/[0.05] flex flex-col shrink-0 hidden lg:flex bg-white/[0.01]">
              <div className="p-4 border-b border-white/[0.05]">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search guests..."
                    className="w-full h-10 bg-white/[0.03] border border-white/[0.08] rounded-lg pl-9 pr-3 text-xs font-medium text-white placeholder:text-white/10 focus:bg-white/[0.05] focus:border-white/[0.15] transition-colors outline-none"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-1">
                {filteredBookings.map((b) => (
                  <button
                    key={b._id}
                    onClick={() => setSelected(b)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all ${selected?._id === b._id ? 'bg-emerald-500/10 border-r-2 border-emerald-500' : 'hover:bg-white/[0.01]'}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${selected?._id === b._id ? 'bg-emerald-500 text-[#050a08]' : 'bg-white/[0.05] text-white/40 border border-white/[0.05]'}`}
                    >
                      {(b.guestEmail || 'G').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4
                        className={`font-bold text-sm truncate ${selected?._id === b._id ? 'text-white' : 'text-white/70'}`}
                      >
                        {b.guestEmail?.split('@')?.[0]}
                      </h4>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-wide truncate">{b.title}</p>
                    </div>
                    {selected?._id === b._id && (
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0 animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </aside>

            {/* CHAT AREA */}
            <main className="flex-1 flex flex-col min-h-0 bg-white/[0.005]">
              {/* Chat header */}
              <header className="px-6 py-4 border-b border-white/[0.05] flex items-center gap-4 shrink-0 bg-white/[0.02]">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                    {(selected?.guestEmail || 'G').charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#050a08] rounded-full animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {selected?.guestEmail?.split('@')?.[0]}
                  </h3>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">{selected?.title} · Connected</p>
                </div>
              </header>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-white/20">
                      <MessageSquare size={20} />
                    </div>
                    <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Start conversation</p>
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
                          className={`px-4 py-3 rounded-2xl text-sm max-w-[75%] font-medium ${
                            isMe
                              ? 'bg-emerald-500 text-[#050a08] rounded-br-md'
                              : 'bg-white/[0.05] border border-white/[0.08] text-white rounded-bl-md shadow-sm'
                          }`}
                        >
                          <p>{m.message}</p>
                          <div
                            className={`flex items-center gap-2 mt-2 text-[10px] font-bold uppercase tracking-wide ${isMe ? 'text-[#050a08]/50' : 'text-white/30'}`}
                          >
                            <span>
                              {new Date(m.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                              })}
                            </span>
                            {isMe && <CheckCircle size={10} className="text-[#050a08]/50" />}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <footer className="p-4 bg-white/[0.02] border-t border-white/[0.05] shrink-0">
                <div className="flex gap-3 items-center bg-white/[0.03] border border-white/[0.08] px-4 py-2.5 rounded-xl focus-within:bg-white/[0.05] focus-within:border-white/[0.15] transition-all">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={onKey}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-white placeholder:text-white/10 font-medium"
                  />
                  <button
                    onClick={send}
                    disabled={!text.trim() || sending}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${sending || !text.trim() ? 'bg-white/5 text-white/20' : 'bg-emerald-500 hover:bg-emerald-600 text-[#050a08] shadow-lg shadow-emerald-500/10'}`}
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-[#050a08]/30 border-t-[#050a08] rounded-full animate-spin" />
                    ) : (
                      <Send size={14} strokeWidth={2.5} />
                    )}
                  </button>
                </div>
              </footer>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
