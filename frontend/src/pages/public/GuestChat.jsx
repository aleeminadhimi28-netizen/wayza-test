import { useEffect, useRef, useState } from "react";
import { WayzaLayout } from "../../WayzaUI.jsx";
import { useAuth } from "../../AuthContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, Info, ShieldCheck, Zap, User, Clock, ArrowRight, Home, Sparkles } from "lucide-react";

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

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

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
        <WayzaLayout>
            <div className="max-w-6xl mx-auto py-32 px-6 flex flex-col items-center justify-center space-y-8">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin" />
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest leading-none">Connecting to concierge...</p>
            </div>
        </WayzaLayout>
    );

    return (
        <WayzaLayout noPadding>
            <div className="bg-slate-50 min-h-screen font-sans">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">

                    <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 text-emerald-600 font-bold text-[11px] uppercase tracking-[0.4em] italic mb-2 leading-none">
                                <MessageSquare size={18} strokeWidth={2.5} /> Guest Correspondence
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tighter leading-[0.8] uppercase">Communication <br /><span className="text-emerald-500 italic font-serif lowercase">Registry.</span></h1>
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] italic border-l-2 border-emerald-500/20 pl-4">"Direct communication with your global property hosts."</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white border border-slate-200 px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-sm">
                            <ShieldCheck size={16} className="text-emerald-500" /> Secure Connection
                        </div>
                    </header>

                    {bookings.length === 0 ? (
                        <div className="bg-white border border-slate-100 rounded-[48px] p-24 text-center space-y-8 shadow-sm">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <MessageSquare size={40} className="text-slate-200" />
                            </div>
                            <div className="space-y-4 max-w-sm mx-auto">
                                <h3 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">No Active Chats.</h3>
                                <p className="text-slate-400 font-medium italic">Start a conversation with your host once your booking is confirmed.</p>
                            </div>
                            <button onClick={() => window.location.href = '/listings'} className="h-16 px-10 bg-slate-900 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95 flex items-center gap-3 mx-auto">
                                Explore Properties <ArrowRight size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row h-[750px] bg-white rounded-[48px] border border-slate-200 overflow-hidden shadow-2xl relative">

                            {/* CHAT SIDEBAR */}
                            <aside className="w-full lg:w-[350px] border-r border-slate-100 flex flex-col bg-slate-50/50">
                                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-400 italic">Correspondence Feed</h3>
                                    <Sparkles size={16} className="text-emerald-500 animate-pulse" />
                                </div>
                                <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
                                    {bookings.map(b => (
                                        <button
                                            key={b._id} onClick={() => setSelected(b)}
                                            className={`w-full text-left px-8 py-8 transition-all relative group ${selected?._id === b._id ? "bg-white" : "hover:bg-white/50"}`}
                                        >
                                            <div className="flex flex-col gap-2">
                                                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">{new Date(b.createdAt).toLocaleDateString("en-IN", { month: 'short', day: 'numeric' })}</span>
                                                <h4 className={`font-bold text-lg tracking-tight uppercase truncate transition-colors ${selected?._id === b._id ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"}`}>{b.title}</h4>
                                            </div>
                                            {selected?._id === b._id && <motion.div layoutId="activeChat" className="absolute left-0 inset-y-6 w-1.5 bg-emerald-500 rounded-r-full" />}
                                        </button>
                                    ))}
                                </div>
                            </aside>

                            {/* CHAT INTERFACE */}
                            <main className="flex-1 flex flex-col relative bg-white">
                                {/* CHAT HEADER */}
                                <header className="p-8 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                                            {selected?.title?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="font-bold text-xl tracking-tight text-slate-900 uppercase leading-none mb-1.5">{selected?.title}</h3>
                                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500 italic">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                                Concierge Synchronized
                                            </div>
                                        </div>
                                    </div>
                                    <button className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-white transition-all"><Info size={20} /></button>
                                </header>

                                {/* CHAT MESSAGES */}
                                <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/30 scrollbar-hide">
                                    <AnimatePresence>
                                        {messages.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 mt-20">
                                                <MessageSquare size={48} className="mb-4 text-slate-300" />
                                                <p className="text-[10px] font-bold uppercase tracking-widest italic">Start the conversation below</p>
                                            </div>
                                        ) : messages.map((m, i) => {
                                            const isMe = m.senderEmail === user?.email;
                                            return (
                                                <motion.div
                                                    key={m._id || i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                                >
                                                    <div className={`p-6 md:p-8 rounded-3xl text-base font-medium max-w-[80%] relative shadow-sm ${isMe ? "bg-slate-900 text-white rounded-br-sm" : "bg-white text-slate-600 rounded-bl-sm border border-slate-100"}`}>
                                                        {m.message}
                                                        <div className={`text-[9px] font-bold uppercase tracking-widest mt-4 opacity-40 ${isMe ? "text-right" : "text-left"}`}>
                                                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Sent
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                    <div ref={bottomRef} />
                                </div>

                                {/* CHAT INPUT */}
                                <footer className="p-8 bg-white border-t border-slate-100">
                                    <div className="flex gap-4 items-center bg-slate-50 border border-slate-100 p-3 rounded-2xl focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
                                        <textarea
                                            value={text} onChange={e => setText(e.target.value)}
                                            placeholder="Write your message..."
                                            className="flex-1 bg-transparent border-none outline-none resize-none px-4 py-2 text-sm font-medium text-slate-900 h-10 scrollbar-hide"
                                            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                                        />
                                        <button
                                            onClick={send} disabled={!text.trim() || sending}
                                            className="w-12 h-12 flex items-center justify-center bg-slate-900 hover:bg-emerald-600 text-white rounded-xl shadow-xl transition-all active:scale-95 disabled:opacity-20 flex-shrink-0"
                                        >
                                            <Send size={18} />
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
