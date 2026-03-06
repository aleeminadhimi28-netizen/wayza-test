import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "./PageTransition.jsx";
import { Bell, X } from "lucide-react";
import { api } from "../../utils/api.js";

export function Layout({ children, noPadding = false }) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const boxRef = useRef(null);

    // NOTIFICATIONS
    const [notifs, setNotifs] = useState([]);
    const [showNotifs, setShowNotifs] = useState(false);

    useEffect(() => {
        if (!user) return;
        async function fetchNotifs() {
            try {
                const res = await api.getNotifications();
                if (res.ok) setNotifs(res.data || []);
            } catch (_) { }
        }
        fetchNotifs();
        const int = setInterval(fetchNotifs, 10000);
        return () => clearInterval(int);
    }, [user]);

    async function openNotifs() {
        setShowNotifs(!showNotifs);
        if (!showNotifs && notifs.some(n => !n.read)) {
            await api.markNotificationsRead();
            setNotifs(prev => prev.map(n => ({ ...n, read: true })));
        }
    }

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        function handleClick(e) {
            if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const navLinks = [
        { name: "Stays", to: "/listings?category=hotel" },
        { name: "Bikes", to: "/listings?category=bike" },
        { name: "Cars", to: "/listings?category=car" },
        { name: "Experiences", to: "/listings?category=activity" },
    ];

    return (
        <div className="bg-white min-h-screen font-sans selection:bg-emerald-100 selection:text-emerald-900">
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm py-4 border-b border-slate-100' : 'bg-transparent py-7'}`}>
                <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
                    <Link to="/" className={`text-3xl font-bold transition-all duration-500 tracking-tight uppercase ${scrolled ? 'text-slate-900' : 'text-white'}`}>Wayza<span className="text-emerald-500">.</span></Link>
                    <div className={`hidden lg:flex gap-10 font-bold uppercase tracking-widest text-[10px] ${scrolled ? 'text-slate-500' : 'text-white/60'}`}>
                        {navLinks.map(link => (
                            <Link key={link.name} to={link.to} className="hover:text-emerald-500 transition-colors relative group">
                                {link.name}
                                <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-1 bg-emerald-500 rounded-full transition-all duration-300 group-hover:w-full`} />
                            </Link>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 md:gap-8">
                        {!user ? (
                            <div className="hidden sm:flex items-center gap-8">
                                <Link to="/login" className={`font-bold text-[10px] tracking-widest uppercase ${scrolled ? 'text-slate-900' : 'text-white'}`}>Sign In</Link>
                                <Link to="/signup" className="bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-bold text-[10px] tracking-widest uppercase">Join Now</Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                {/* NOTIFICATION BELL */}
                                <div className="relative">
                                    <button
                                        onClick={openNotifs}
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors relative ${scrolled ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                    >
                                        <Bell size={20} />
                                        {notifs.filter(n => !n.read).length > 0 && (
                                            <span className="absolute top-2.5 right-3 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse border-2 border-slate-900" />
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {showNotifs && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                className="absolute right-0 mt-6 w-80 bg-white rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden z-50 flex flex-col max-h-[400px]"
                                            >
                                                <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                                                    <span className="font-bold text-xs text-slate-900 uppercase tracking-widest">Notifications</span>
                                                    <button onClick={() => setShowNotifs(false)} className="text-slate-400 hover:text-slate-900"><X size={16} /></button>
                                                </div>
                                                <div className="overflow-y-auto p-4 flex-1">
                                                    {notifs.length === 0 ? (
                                                        <p className="text-center text-xs text-slate-400 py-6 italic">No new notifications</p>
                                                    ) : (
                                                        notifs.map(n => (
                                                            <div key={n._id} className={`p-4 rounded-2xl mb-2 flex flex-col gap-1.5 text-sm ${n.read ? "bg-white text-slate-500 border border-slate-50" : "bg-emerald-50 text-emerald-900 font-semibold border border-emerald-100/50"}`}>
                                                                <span className="leading-snug">{n.message}</span>
                                                                <span className="text-[9px] uppercase tracking-widest opacity-40">{new Date(n.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div ref={boxRef} className="relative">
                                    <button onClick={() => setOpen(!open)} className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xl hover:bg-emerald-600 transition-all active:scale-95 group overflow-hidden border border-white/10">
                                        {user.email.charAt(0).toUpperCase()}
                                    </button>
                                    <AnimatePresence>
                                        {open && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                                className="absolute right-0 mt-6 w-72 bg-white rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-slate-100 z-50 overflow-hidden"
                                            >
                                                <div className="p-8 border-b border-slate-50 bg-slate-50/50 text-slate-900 uppercase">
                                                    <p className="text-[9px] font-bold text-emerald-600 tracking-widest">Signed in as</p>
                                                    <p className="text-lg font-bold truncate mt-1">{user.email.split('@')[0]}</p>
                                                    <p className="text-[10px] font-medium text-slate-400 mt-0.5 truncate lowercase">{user.email}</p>
                                                </div>
                                                <div className="p-2 space-y-1">
                                                    {user.role === "partner" && <Link to="/partner" onClick={() => setOpen(false)} className="flex items-center px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 rounded-2xl">Provider Dashboard</Link>}
                                                    {user.role === "admin" && <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 rounded-2xl">Admin Dashboard</Link>}
                                                    <Link to="/my-bookings" onClick={() => setOpen(false)} className="flex items-center px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-900 hover:bg-slate-50 rounded-2xl">My Bookings</Link>
                                                    <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-900 hover:bg-slate-50 rounded-2xl">Account Profile</Link>
                                                    <button onClick={() => { logout(); setOpen(false); navigate("/"); }} className="w-full text-center py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white bg-slate-900 hover:bg-rose-500 transition-all">Log Out</button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}
                        <button onClick={() => setOpen(!open)} className={`lg:hidden p-2 rounded-xl ${scrolled ? 'bg-slate-100 text-slate-900' : 'bg-white/10 text-white'}`}>
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} /></svg>
                        </button>
                    </div>
                </div>
            </nav>

            <PageTransition>
                <main className={`${scrolled || noPadding ? 'pt-24' : 'pt-0'} transition-all duration-500`}>
                    {children}
                </main>
            </PageTransition>

            <footer className="bg-slate-950 text-white/40">
                <div className="max-w-7xl mx-auto px-8 py-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20">
                    <div className="space-y-10">
                        <Link to="/" className="text-4xl font-bold tracking-tight uppercase text-white">Wayza<span className="text-emerald-500">.</span></Link>
                        <p className="text-lg font-medium italic leading-relaxed text-white/30 truncate max-w-xs">"Connecting travelers with extraordinary stays."</p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold uppercase tracking-widest text-[11px] mb-10 text-center">Resources</h4>
                        <ul className="space-y-5 text-[15px] font-bold text-center">
                            <li><Link to="/support" className="text-emerald-400">Support</Link></li>
                            <li><Link to="/about">Our Story</Link></li>
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export const WayzaLayout = Layout;
