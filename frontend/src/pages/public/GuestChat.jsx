import { useEffect, useRef, useState, useCallback } from 'react';
import { WayzzaLayout } from '../../WayzzaUI.jsx';
import { useAuth } from '../../AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

import { api } from '../../utils/api.js';
import SEO from '../../components/SEO.jsx';
import {
  initiateSocketConnection,
  disconnectSocket,
  subscribeToMessages,
  joinBookingRoom,
  leaveBookingRoom,
} from '../../utils/socket.js';

export default function GuestChat() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  // Keep a ref to the currently selected booking ID so the socket callback
  // can always read the latest value without becoming stale.
  const selectedIdRef = useRef(null);
  useEffect(() => {
    selectedIdRef.current = selected?._id ?? null;
  }, [selected]);

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
    // Clear input immediately for better UX
    setText('');
    setSending(true);

    // Optimistic message — use a temp ID prefixed so we can identify it later
    const tempId = `temp_${Date.now()}`;
    const tempMsg = {
      _id: tempId,
      bookingId: selected._id,
      senderEmail: user.email,
      message: messageText,
      createdAt: new Date().toISOString(),
      _isTemp: true,
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await api.sendChat(selected._id, messageText);
      if (res.ok && res.data) {
        // Replace temp message with the real server message
        setMessages((prev) =>
          prev.map((m) => (m._id === tempId ? { ...res.data, _isTemp: false } : m))
        );
      } else if (!res.ok) {
        // Remove the failed optimistic message
        setMessages((prev) => prev.filter((m) => m._id !== tempId));
        setText(messageText); // restore text so user can retry
      }
    } catch (_) {
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setText(messageText);
    }
    setSending(false);
  }

  // Load bookings once on mount
  useEffect(() => {
    if (!user?.email) return;
    api
      .getMyBookings()
      .then((res) => {
        const paid = Array.isArray(res.data) ? res.data.filter((b) => b.status === 'paid') : [];
        setBookings(paid);
        if (paid.length > 0) setSelected(paid[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user?.email]);

  // FIX #84: Socket connect/disconnect is scoped to the room-level effect so it
  // reconnects properly on remount (React Strict Mode / HMR) and only disconnects
  // when the chat page itself is fully unmounted — not on every room switch.
  useEffect(() => {
    if (!selected) return;

    // Connect socket (idempotent — safe to call if already connected)
    initiateSocketConnection();

    loadMessages();
    joinBookingRoom(selected._id);

    // FIX #83: Filter incoming messages by the currently active booking so
    // messages from other rooms don't bleed into the current conversation.
    const unsubscribe = subscribeToMessages((err, msg) => {
      if (err) return;
      // Ignore messages not for the currently selected booking
      if (msg.bookingId !== selectedIdRef.current) return;
      setMessages((prev) => {
        // Dedup: check both real IDs AND replace any matching temp message
        const existsReal = prev.find((m) => !m._isTemp && m._id === msg._id);
        if (existsReal) return prev;
        // Replace a temp message that was for this exact text if server echoes back
        const tempIdx = prev.findIndex((m) => m._isTemp && m.message === msg.message);
        if (tempIdx !== -1) {
          const updated = [...prev];
          updated[tempIdx] = { ...msg, _isTemp: false };
          return updated;
        }
        return [...prev, msg];
      });
    });

    return () => {
      leaveBookingRoom(selected._id);
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [selected, loadMessages]);

  // Disconnect socket when the entire chat page unmounts
  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  if (loading)
    return (
      <WayzzaLayout noPadding>
        <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4 font-sans text-slate-400">
          <div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest">Connecting to messages...</p>
        </div>
      </WayzzaLayout>
    );

  return (
    <WayzzaLayout noPadding>
      <SEO title="Concierge Command" noindex={true} />
      <div className="bg-white min-h-screen font-sans selection:bg-emerald-50 selection:text-emerald-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 md:py-16">
          <header className="mb-12">
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
                Messages
              </h1>
              <p className="text-slate-500 font-medium">Direct communication with your hosts.</p>
            </div>
          </header>

          {/* FIX #87: Proper empty state when user has no confirmed bookings */}
          {bookings.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center space-y-6">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                <MessageSquare size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">No active chats</h3>
                <p className="text-slate-500 text-sm">
                  Once you have a confirmed booking, you can chat with your host here.
                </p>
              </div>
              <button
                onClick={() => (window.location.href = '/listings')}
                className="h-12 px-8 bg-slate-900 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 mt-4"
              >
                Explore Properties <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row h-[700px] bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-2xl relative">
              {/* CHAT SIDEBAR */}
              <aside className="w-full lg:w-[350px] border-r border-slate-100 flex flex-col bg-slate-50/30">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Conversations
                  </h3>
                  <Sparkles size={16} className="text-emerald-500" />
                </div>
                <div className="flex-1 overflow-y-auto py-2">
                  {bookings.map((b) => (
                    <button
                      key={b._id}
                      onClick={() => setSelected(b)}
                      className={`w-full text-left px-6 py-6 transition-all relative border-b border-slate-50 ${selected?._id === b._id ? 'bg-white' : 'hover:bg-white/50'}`}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">
                          Booking #{b._id?.slice(-6)?.toUpperCase()}
                        </span>
                        <h4
                          className={`font-bold text-base tracking-tight truncate ${selected?._id === b._id ? 'text-slate-900' : 'text-slate-400'}`}
                        >
                          {b.title}
                        </h4>
                      </div>
                      {selected?._id === b._id && (
                        <div className="absolute left-0 inset-y-0 w-1 bg-emerald-500" />
                      )}
                    </button>
                  ))}
                </div>
              </aside>

              {/* CHAT INTERFACE */}
              <main className="flex-1 flex flex-col relative bg-white">
                {/* CHAT HEADER */}
                <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white text-base font-bold">
                      {(selected?.title || 'B').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-bold text-lg text-slate-900 leading-tight uppercase tracking-tight">
                        {selected?.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active Host Chat
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                    <ShieldCheck size={14} /> Secured
                  </div>
                </header>

                {/* CHAT MESSAGES */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-50/10">
                  <AnimatePresence>
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center text-slate-300">
                        <MessageSquare size={48} className="mb-4 opacity-50" />
                        <p className="text-xs font-bold uppercase tracking-widest">
                          Start the conversation below
                        </p>
                      </div>
                    ) : (
                      messages.map((m, i) => {
                        const isMe = m.senderEmail === user?.email;
                        return (
                          <motion.div
                            key={m._id || i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: m._isTemp ? 0.6 : 1, y: 0 }}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`p-4 md:p-6 rounded-[24px] text-sm font-medium max-w-[85%] relative shadow-sm ${isMe ? 'bg-slate-900 text-white rounded-br-none' : 'bg-white text-slate-600 rounded-bl-none border border-slate-100'}`}
                            >
                              {m.message}
                              <div
                                className={`text-[11px] font-bold uppercase tracking-widest mt-2 opacity-40 ${isMe ? 'text-right' : 'text-left'}`}
                              >
                                {m._isTemp
                                  ? 'Sending…'
                                  : new Date(m.createdAt).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                  <div ref={bottomRef} />
                </div>

                {/* CHAT INPUT — FIX #85: Enter key sends message */}
                <footer className="p-6 bg-white border-t border-slate-100">
                  <div className="flex gap-3 items-center bg-slate-50 border border-slate-100 p-2 rounded-2xl focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/5 transition-all">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Write your message… (Enter to send, Shift+Enter for new line)"
                      className="flex-1 bg-transparent border-none outline-none resize-none px-4 py-2 text-sm font-medium text-slate-900 h-10"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          send();
                        }
                      }}
                    />
                    <button
                      onClick={send}
                      disabled={!text.trim() || sending}
                      className="w-10 h-10 flex items-center justify-center bg-slate-900 hover:bg-emerald-600 text-white rounded-xl transition-all active:scale-95 disabled:opacity-20 flex-shrink-0"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </footer>
              </main>
            </div>
          )}
        </div>
      </div>
    </WayzzaLayout>
  );
}
