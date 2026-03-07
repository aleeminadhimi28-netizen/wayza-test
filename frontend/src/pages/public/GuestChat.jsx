import { useEffect, useRef, useState } from "react";
import { WayzaLayout } from "../../WayzaUI.jsx";
import { useAuth } from "../../AuthContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, Info, ShieldCheck, User, Clock, ArrowRight, Home, Sparkles } from "lucide-react";

import { api } from "../../utils/api.js";

export default function GuestChat() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [selected, setSelected] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);
    const pollRef = useRef(null);

    useEffect(() => {
        if (!user?.email) return;
        api.getMyBookings()
            .then(res => {
                const paid = Array.isArray(res.data) ? res.data.filter(b => b.status === "paid") : [];
                setBookings(paid);
                if (paid.length > 0) setSelected(paid[0]);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [user?.email]);

    useEffect(() => {
        if (!selected) return;
        loadMessages();
        pollRef.current = setInterval(loadMessages, 5000);
        return () => clearInterval(pollRef.current);
    }, [selected?._id]);

    async function loadMessages() {
        if (!selected) return;
        try {
            const data = await api.getChat(selected._id);
            if (data.ok) setMessages(data.data || []);
        } catch (_) { }
    }

    useEffect(() => {
        if (messages.length > 0) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages.length]);

    async function send() {
        if (!text.trim() || !selected) return;
        setSending(true);
        try {
            await api.sendChat(selected._id, text.trim());
            setText("");
            await loadMessages();
        } catch (_) { }
        setSending(false);
    }

    if (loading) return (
        <WayzaLayout noPadding>
            <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4 font-sans text-slate-400">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
                <p className="text-xs font-bold uppercase tracking-widest">Connecting to messages...</p>
            </div>
        </WayzaLayout>
    );

    return (
        <WayzaLayout noPadding>
            <div className="bg-white min-h-screen font-sans selection:bg-emerald-50 selection:text-emerald-900">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 md:py-16">

                    <header className="mb-12">
                        <div className="space-y-2 text-center md:text-left">
                            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Messages</h1>
                            <p className="text-slate-500 font-medium">Direct communication with your hosts.</p>
                        </div>
                    </header>

                    {bookings.length === 0 ? (
                        <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center space-y-6">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                                <MessageSquare size={32} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-slate-900">No active chats</h3>
                                <p className="text-slate-500 text-sm">Once you have a confirmed booking, you can chat with your host here.</p>
                            </div>
                            <button onClick={() => window.location.href = '/listings'} className="h-12 px-8 bg-slate-900 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 mt-4">
                                Explore Properties <ArrowRight size={14} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row h-[700px] bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-2xl relative">

                            {/* CHAT SIDEBAR */}
                            <aside className="w-full lg:w-[350px] border-r border-slate-100 flex flex-col bg-slate-50/30">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Conversations</h3>
                                    <Sparkles size={16} className="text-emerald-500" />
                                </div>
                                <div className="flex-1 overflow-y-auto py-2">
                                    {bookings.map(b => (
                                        <button
                                            key={b._id} onClick={() => setSelected(b)}
                                            className={`w-full text-left px-6 py-6 transition-all relative border-b border-slate-50 ${selected?._id === b._id ? "bg-white" : "hover:bg-white/50"}`}
                                        >
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Booking #{b._id?.slice(-6).toUpperCase()}</span>
                                                <h4 className={`font-bold text-base tracking-tight truncate ${selected?._id === b._id ? "text-slate-900" : "text-slate-400"}`}>{b.title}</h4>
                                            </div>
                                            {selected?._id === b._id && <div className="absolute left-0 inset-y-0 w-1 bg-emerald-500" />}
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
                                            {selected?.title?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="font-bold text-lg text-slate-900 leading-tight uppercase tracking-tight">{selected?.title}</h3>
                                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
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
                                                <p className="text-xs font-bold uppercase tracking-widest">Start the conversation below</p>
                                            </div>
                                        ) : messages.map((m, i) => {
                                            const isMe = m.senderEmail === user?.email;
                                            return (
                                                <motion.div
                                                    key={m._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                                >
                                                    <div className={`p-4 md:p-6 rounded-[24px] text-sm font-medium max-w-[85%] relative shadow-sm ${isMe ? "bg-slate-900 text-white rounded-br-none" : "bg-white text-slate-600 rounded-bl-none border border-slate-100"}`}>
                                                        {m.message}
                                                        <div className={`text-[9px] font-bold uppercase tracking-widest mt-2 opacity-40 ${isMe ? "text-right" : "text-left"}`}>
                                                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                    <div ref={bottomRef} />
                                </div>

                                {/* CHAT INPUT */}
                                <footer className="p-6 bg-white border-t border-slate-100">
                                    <div className="flex gap-3 items-center bg-slate-50 border border-slate-100 p-2 rounded-2xl focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/5 transition-all">
                                        <textarea
                                            value={text} onChange={e => setText(e.target.value)}
                                            placeholder="Write your message..."
                                            className="flex-1 bg-transparent border-none outline-none resize-none px-4 py-2 text-sm font-medium text-slate-900 h-10"
                                            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                                        />
                                        <button
                                            onClick={send} disabled={!text.trim() || sending}
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
        </WayzaLayout>
    );
}
