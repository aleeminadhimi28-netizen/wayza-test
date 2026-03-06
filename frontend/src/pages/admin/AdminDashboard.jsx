import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Briefcase, Home, CalendarCheck, TrendingUp, LogOut, LayoutDashboard,
    Trash2, Search, CheckCircle, Clock, Bell, ArrowUpRight, VolumeX, Volume2,
    MessageSquare, Send, X, ChevronDown, AlertCircle, Mail, Banknote, XCircle
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

import { api } from "../../utils/api.js";

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [dataList, setDataList] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Support state
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [sendingReply, setSendingReply] = useState(false);

    // Withdrawal state
    const [withdrawals, setWithdrawals] = useState([]);

    useEffect(() => {
        api.adminStats()
            .then(d => {
                if (d.error) { setErrorMsg("Unauthorized. Admin privileges required."); return; }
                if (d) setStats(d);
            })
            .catch(() => setErrorMsg("Failed to load dashboard data."));
    }, []);

    useEffect(() => {
        if (activeTab === "overview") return;
        if (activeTab === "support") { loadTickets(); return; }
        if (activeTab === "withdrawals") { loadWithdrawals(); return; }
        setLoadingData(true);

        let p;
        if (activeTab === 'users') p = api.adminUsers();
        else if (activeTab === 'partners') p = api.adminPartners();
        else if (activeTab === 'listings') p = api.adminListings();
        else if (activeTab === 'bookings') p = api.adminBookings();

        if (p) {
            p.then(d => { if (d.ok) setDataList(d.data || []); setLoadingData(false); })
                .catch(() => setLoadingData(false));
        }
    }, [activeTab]);

    async function loadTickets() {
        setLoadingData(true);
        try {
            const d = await api.getSupportTickets();
            if (d.ok) setTickets(d.data || []);
        } catch (_) { }
        setLoadingData(false);
    }

    async function loadWithdrawals() {
        setLoadingData(true);
        try {
            const d = await api.adminGetWithdrawals();
            if (d.ok) setWithdrawals(d.data || []);
        } catch (_) { }
        setLoadingData(false);
    }

    function handleLogout() { localStorage.clear(); window.location.href = "/admin-login"; }

    async function handleDeleteItem(type, idOrEmail) {
        if (!window.confirm(`Delete this ${type.slice(0, -1)}? This cannot be undone.`)) return;
        try {
            let res;
            if (type === "users") res = await api.adminDeleteUser(idOrEmail);
            else if (type === "partners") res = await api.adminDeletePartner(idOrEmail);
            else if (type === "listings") res = await api.adminDeleteListing(idOrEmail);

            if (res?.ok) {
                if (type === "users" || type === "partners") setDataList(prev => prev.filter(item => item.email !== idOrEmail));
                else setDataList(prev => prev.filter(item => item._id !== idOrEmail));
            }
        } catch (err) { console.error(err); }
    }

    async function handleApproveProperty(id) {
        try {
            const d = await api.adminApproveListing(id, true);
            if (d.ok) setDataList(prev => prev.map(item => item._id === id ? { ...item, approved: true } : item));
        } catch (err) { console.error(err); }
    }

    async function handleRejectProperty(id) {
        if (!window.confirm("Reject and delete this property?")) return;
        await handleDeleteItem("listings", id);
    }

    async function handleMuteUser(email, muted) {
        if (!window.confirm(`${muted ? "Mute" : "Unmute"} this user?`)) return;
        try {
            const d = await api.adminMuteUser(email, muted);
            if (d.ok) setDataList(prev => prev.map(item => item.email === email ? { ...item, muted } : item));
        } catch (err) { console.error(err); }
    }

    async function handleReplyTicket() {
        if (!replyText.trim() || !selectedTicket) return;
        setSendingReply(true);
        try {
            await api.replyToTicket(selectedTicket._id, { reply: replyText.trim() });
            setReplyText("");
            await loadTickets();
            const updated = tickets.find(t => t._id === selectedTicket._id);
            if (updated) setSelectedTicket({ ...updated, replies: [...(updated.replies || []), { message: replyText.trim(), from: "admin", createdAt: new Date() }] });
        } catch (_) { }
        setSendingReply(false);
    }

    async function handleCloseTicket(id) {
        try {
            await api.replyToTicket(id, { status: "closed" });
            await loadTickets();
            if (selectedTicket?._id === id) setSelectedTicket(prev => ({ ...prev, status: "closed" }));
        } catch (_) { }
    }

    async function handleDeleteTicket(id) {
        if (!window.confirm("Delete this support ticket?")) return;
        try {
            await api.deleteTicket(id);
            setTickets(prev => prev.filter(t => t._id !== id));
            if (selectedTicket?._id === id) setSelectedTicket(null);
        } catch (_) { }
    }

    async function handleUpdatePayout(id, status) {
        if (!window.confirm(`Mark this booking as ${status}?`)) return;
        try {
            const d = await api.adminUpdatePayoutStatus(id, status);
            if (d.ok) setDataList(prev => prev.map(item => item._id === id ? { ...item, payoutStatus: status } : item));
        } catch (err) { console.error(err); }
    }

    async function handleWithdrawal(id, status) {
        const reason = status === "rejected" ? window.prompt("Reason for rejection (optional):") : null;
        if (status === "rejected" && reason === null) return; // User cancelled prompt
        if (!window.confirm(`${status === "completed" ? "Approve" : "Reject"} this withdrawal?`)) return;
        try {
            const d = await api.adminUpdateWithdrawal(id, status, reason);
            if (d.ok) setWithdrawals(prev => prev.map(w => w._id === id ? { ...w, status, reason } : w));
        } catch (err) { console.error(err); }
    }

    if (errorMsg) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-6">
            <div className="flex flex-col items-center gap-6 max-w-sm text-center p-10 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                    <Users size={28} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 mb-1">Access Denied</h1>
                    <p className="text-sm text-slate-500">{errorMsg}</p>
                </div>
                <button onClick={() => window.location.href = "/admin-login"} className="h-10 px-6 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-colors">
                    Sign In Again
                </button>
            </div>
        </div>
    );

    if (!stats) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
                <p className="text-sm font-semibold text-slate-500">Loading dashboard...</p>
            </div>
        </div>
    );

    const kpiCards = [
        { title: "Total Users", value: stats.totalUsers, icon: Users, bg: "bg-blue-50", color: "text-blue-600", trend: "+12%", up: true },
        { title: "Partners", value: stats.totalPartners, icon: Briefcase, bg: "bg-violet-50", color: "text-violet-600", trend: "+5%", up: true },
        { title: "Pending Approval", value: stats.pendingListings || 0, icon: Clock, bg: "bg-amber-50", color: "text-amber-600", trend: "Review", up: false },
        { title: "Platform Revenue", value: `₹${(stats.platformCommission || 0).toLocaleString()}`, icon: TrendingUp, bg: "bg-emerald-50", color: "text-emerald-600", trend: "+24%", up: true }
    ];

    const filteredData = dataList.filter(item => {
        const query = searchQuery.toLowerCase();
        return (item.email || item.title || item.businessName || "").toLowerCase().includes(query);
    });

    const TABS = [
        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
        { id: 'users', icon: Users, label: 'Users' },
        { id: 'partners', icon: Briefcase, label: 'Partners' },
        { id: 'listings', icon: Home, label: 'Properties' },
        { id: 'bookings', icon: CalendarCheck, label: 'Bookings' },
        { id: 'withdrawals', icon: Banknote, label: 'Payouts' },
        { id: 'support', icon: MessageSquare, label: 'Support' }
    ];

    const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;

    const openTickets = tickets.filter(t => t.status === "open").length;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex overflow-hidden">

            {/* SIDEBAR */}
            <aside className="w-64 h-screen bg-slate-900 flex flex-col shrink-0 hidden xl:flex">
                <div className="p-6 mb-2">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("overview")}>
                        <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">W</div>
                        <div>
                            <span className="font-bold text-white text-lg">Wayza <span className="text-emerald-400">Admin</span></span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-3 space-y-1">
                    <p className="px-3 mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Navigation</p>
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setSearchQuery(""); }}
                            className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl font-semibold text-sm transition-all ${activeTab === tab.id
                                ? "bg-white/10 text-white"
                                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}
                        >
                            <tab.icon size={17} className={activeTab === tab.id ? "text-emerald-400" : ""} />
                            {tab.label}
                            {tab.id === "support" && openTickets > 0 && (
                                <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">{openTickets}</span>
                            )}
                            {tab.id === "withdrawals" && pendingWithdrawals > 0 && (
                                <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">{pendingWithdrawals}</span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 mt-auto space-y-3">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-xs font-semibold text-white">System Online</span>
                        </div>
                        <p className="text-xs text-slate-500">All services operational</p>
                    </div>
                    <button onClick={handleLogout} className="w-full h-10 flex items-center justify-center gap-2 bg-rose-500/10 rounded-xl font-semibold text-sm text-rose-400 hover:bg-rose-500 hover:text-white transition-all">
                        <LogOut size={15} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 h-screen overflow-y-auto">

                {/* HEADER */}
                <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 capitalize">
                                {activeTab === "overview" ? "Dashboard Overview" : activeTab === "support" ? "Customer Support" : `${activeTab} Management`}
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">Wayza Admin Panel</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {(activeTab !== "overview" && activeTab !== "support") && (
                                <div className="relative hidden md:block w-72">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                    <input
                                        placeholder="Search..."
                                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-10 w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 text-sm font-medium focus:bg-white focus:border-emerald-500 transition-all outline-none"
                                    />
                                </div>
                            )}
                            <button className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all relative">
                                <Bell size={16} />
                                {openTickets > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />}
                            </button>
                            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-md">AD</div>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {activeTab === "overview" ? (
                            <motion.div key="ov" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">

                                {/* KPI CARDS */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                                    {kpiCards.map((card, i) => (
                                        <div key={i} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`w-11 h-11 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>
                                                    <card.icon size={20} />
                                                </div>
                                                <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${card.up ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                    {card.up && <ArrowUpRight size={11} strokeWidth={3} />}
                                                    {card.trend}
                                                </span>
                                            </div>
                                            <p className="text-xs font-semibold text-slate-500 mb-1">{card.title}</p>
                                            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* CHART + ACTIVITY */}
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                    {/* REVENUE CHART */}
                                    <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">Revenue Overview</h3>
                                                <p className="text-xs text-slate-500">Monthly platform earnings</p>
                                            </div>
                                        </div>
                                        <div className="h-[350px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={stats.monthlyRevenue || [{ name: 'JAN', rev: 400 }, { name: 'FEB', rev: 800 }, { name: 'MAR', rev: 1200 }]}>
                                                    <defs>
                                                        <linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                                                    <RechartsTooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '12px', padding: '12px 16px', color: '#fff' }} itemStyle={{ color: '#10b981' }} />
                                                    <Area type="monotone" dataKey="rev" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEmerald)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* RECENT ACTIVITY */}
                                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
                                            <span className="text-xs font-semibold text-emerald-600 cursor-pointer" onClick={() => setActiveTab("bookings")}>View All</span>
                                        </div>
                                        <div className="space-y-2 flex-1 overflow-y-auto">
                                            {stats.recentBookings?.slice(0, 8).map((b, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all">
                                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${b.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                        {b.status === 'paid' ? <CheckCircle size={16} /> : <Clock size={16} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm text-slate-900 truncate">{b.title}</p>
                                                        <p className="text-xs text-slate-400 truncate">{b.guestEmail?.split('@')[0]}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-sm text-slate-900">₹{b.totalPrice?.toLocaleString()}</p>
                                                        <p className="text-xs text-slate-400 capitalize">{b.status}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!stats.recentBookings || stats.recentBookings.length === 0) && (
                                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                                    <CalendarCheck size={28} className="text-slate-200 mb-2" />
                                                    <p className="text-sm font-semibold text-slate-500">No recent bookings</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                        ) : activeTab === "support" ? (
                            /* ===== SUPPORT TAB ===== */
                            <motion.div key="support" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                    {[
                                        { label: "Open Tickets", value: tickets.filter(t => t.status === "open").length, bg: "bg-amber-50", color: "text-amber-600", icon: AlertCircle },
                                        { label: "Closed Tickets", value: tickets.filter(t => t.status === "closed").length, bg: "bg-emerald-50", color: "text-emerald-600", icon: CheckCircle },
                                        { label: "Total Tickets", value: tickets.length, bg: "bg-blue-50", color: "text-blue-600", icon: MessageSquare },
                                    ].map((c, i) => (
                                        <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                                            <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.color} flex items-center justify-center mb-3`}>
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
                                            ) : tickets.map(t => (
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
                                                        <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${t.status === 'open' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                            {t.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.message}</p>
                                                    <p className="text-[10px] text-slate-400 mt-1.5">{new Date(t.createdAt).toLocaleDateString()}</p>
                                                </button>
                                            ))}
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
                                                            <span className="text-xs text-slate-400">·</span>
                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${selectedTicket.status === 'open' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                                {selectedTicket.status}
                                                            </span>
                                                            <span className="text-xs text-slate-400">·</span>
                                                            <span className="text-xs text-slate-400 capitalize">{selectedTicket.category}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {selectedTicket.status === "open" && (
                                                            <button onClick={() => handleCloseTicket(selectedTicket._id)} className="h-8 px-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg font-semibold text-xs hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1.5">
                                                                <CheckCircle size={12} /> Close
                                                            </button>
                                                        )}
                                                        <button onClick={() => handleDeleteTicket(selectedTicket._id)} className="w-8 h-8 bg-rose-50 text-rose-500 border border-rose-100 rounded-lg flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Messages */}
                                                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
                                                    {/* Original message */}
                                                    <div className="flex gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                                                            {(selectedTicket.email || "U").charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-md p-4 shadow-sm max-w-[80%]">
                                                            <p className="text-sm text-slate-700 leading-relaxed">{selectedTicket.message}</p>
                                                            <p className="text-[10px] text-slate-400 mt-2">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                                                        </div>
                                                    </div>

                                                    {/* Replies */}
                                                    {(selectedTicket.replies || []).map((r, i) => (
                                                        <div key={i} className={`flex gap-3 ${r.from === 'admin' ? 'justify-end' : ''}`}>
                                                            {r.from !== 'admin' && (
                                                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">U</div>
                                                            )}
                                                            <div className={`rounded-2xl p-4 max-w-[80%] shadow-sm ${r.from === 'admin'
                                                                ? 'bg-slate-900 text-white rounded-br-md'
                                                                : 'bg-white border border-slate-200 rounded-tl-md text-slate-700'}`}>
                                                                <p className="text-sm leading-relaxed">{r.message}</p>
                                                                <p className={`text-[10px] mt-2 ${r.from === 'admin' ? 'text-white/40' : 'text-slate-400'}`}>
                                                                    {r.from === 'admin' ? 'Admin' : selectedTicket.email} · {new Date(r.createdAt).toLocaleString()}
                                                                </p>
                                                            </div>
                                                            {r.from === 'admin' && (
                                                                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">A</div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Reply input */}
                                                {selectedTicket.status === "open" && (
                                                    <div className="p-4 border-t border-slate-100 bg-white">
                                                        <div className="flex gap-3 items-center">
                                                            <input
                                                                placeholder="Type your reply..."
                                                                value={replyText}
                                                                onChange={e => setReplyText(e.target.value)}
                                                                onKeyDown={e => e.key === 'Enter' && handleReplyTicket()}
                                                                className="flex-1 h-10 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:bg-white focus:border-emerald-500 transition-all outline-none"
                                                            />
                                                            <button
                                                                onClick={handleReplyTicket}
                                                                disabled={!replyText.trim() || sendingReply}
                                                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${!replyText.trim() ? 'bg-slate-100 text-slate-300' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'}`}
                                                            >
                                                                {sendingReply ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                        ) : (
                            /* ===== DATA TABLE TABS ===== */
                            <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                                {/* PENDING APPROVAL SECTION for listings tab */}
                                {activeTab === "listings" && dataList.some(item => !item.approved) && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
                                                <Clock size={18} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-sm text-amber-900">Pending Property Approvals</h3>
                                                <p className="text-xs text-amber-700">{dataList.filter(i => !i.approved).length} properties waiting for review</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {dataList.filter(item => !item.approved).map(item => (
                                                <div key={item._id} className="flex items-center justify-between bg-white rounded-xl p-4 border border-amber-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center font-bold text-sm border border-amber-100">
                                                            {(item.title || "P").charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-sm text-slate-900">{item.title}</p>
                                                            <p className="text-xs text-slate-400">{item.ownerEmail} · {item.location || "No location"} · ₹{item.price?.toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => handleApproveProperty(item._id)} className="h-8 px-4 bg-emerald-600 text-white rounded-lg font-semibold text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm">
                                                            <CheckCircle size={13} /> Approve
                                                        </button>
                                                        <button onClick={() => handleRejectProperty(item._id)} className="h-8 px-4 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg font-semibold text-xs hover:bg-rose-500 hover:text-white transition-all flex items-center gap-1.5">
                                                            <X size={13} /> Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* DATA TABLE */}
                                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 capitalize">{activeTab === "listings" ? "All Properties" : activeTab}</h3>
                                            <p className="text-sm text-slate-500">{filteredData.length} records found</p>
                                        </div>
                                        <div className="relative w-full sm:w-72">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                            <input
                                                placeholder={`Search ${activeTab}...`}
                                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                                className="h-10 w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 text-sm font-medium focus:bg-white focus:border-emerald-500 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">Details</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">Status</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">Info</th>
                                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wide">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {filteredData.map((item, i) => (
                                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${item.muted ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                                                    {(item.email || item.title || "W").charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="font-semibold text-sm text-slate-900 truncate max-w-[200px]">{item.title || item.businessName || item.email}</p>
                                                                        {item.muted && <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">MUTED</span>}
                                                                    </div>
                                                                    <p className="text-xs text-slate-400">{item.ownerEmail || item.email || `#${item._id?.slice(-8).toUpperCase()}`}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-medium">
                                                            <div className="flex flex-col gap-1">
                                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${(item.status === 'paid' || item.approved || item.onboarded) ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>
                                                                    {(item.status === 'paid' || item.approved || item.onboarded) ? <><CheckCircle size={11} /> Active</> : <><Clock size={11} /> Pending</>}
                                                                </span>
                                                                {activeTab === "bookings" && item.status === "paid" && (
                                                                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${item.payoutStatus === "paid_out" ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"}`}>
                                                                        Payout: {item.payoutStatus === "paid_out" ? "Settled" : "Pending"}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm font-medium text-slate-700">
                                                                {activeTab === "bookings" ? item.guestEmail : item.price ? `₹${item.price.toLocaleString()}` : item.role || item.checkIn || '—'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                                {activeTab === "bookings" && item.status === "paid" && item.payoutStatus !== "paid_out" && (
                                                                    <button onClick={() => handleUpdatePayout(item._id, "paid_out")} className="h-8 px-4 bg-emerald-600 text-white rounded-lg font-semibold text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm">
                                                                        <CheckCircle size={13} /> Settle Payout
                                                                    </button>
                                                                )}
                                                                {/* Approve button for unapproved listings */}
                                                                {activeTab === "listings" && !item.approved && (
                                                                    <button onClick={() => handleApproveProperty(item._id)} className="h-8 px-4 bg-emerald-600 text-white rounded-lg font-semibold text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm">
                                                                        <CheckCircle size={13} /> Approve
                                                                    </button>
                                                                )}
                                                                {/* Mute/Unmute for users */}
                                                                {activeTab === "users" && (
                                                                    <button
                                                                        onClick={() => handleMuteUser(item.email, !item.muted)}
                                                                        className={`h-8 px-3 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all border ${item.muted
                                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white'
                                                                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-500 hover:text-white'}`}
                                                                    >
                                                                        {item.muted ? <><Volume2 size={13} /> Unmute</> : <><VolumeX size={13} /> Mute</>}
                                                                    </button>
                                                                )}
                                                                {/* Delete */}
                                                                <button onClick={() => handleDeleteItem(activeTab, item.email || item._id)} className="w-8 h-8 bg-rose-50 text-rose-500 border border-rose-100 rounded-lg flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {filteredData.length === 0 && (
                                            <div className="py-20 text-center">
                                                <Search size={28} className="text-slate-200 mx-auto mb-3" />
                                                <h3 className="text-lg font-bold text-slate-900 mb-1">No records found</h3>
                                                <p className="text-sm text-slate-500">Try adjusting your search query.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ===== WITHDRAWALS TAB ===== */}
                    <AnimatePresence mode="wait">
                        {activeTab === "withdrawals" && (
                            <motion.div key="withdrawals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">Partner Withdrawal Requests</h3>
                                            <p className="text-xs text-slate-500 mt-0.5">Review and process payout transfers to partners.</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {pendingWithdrawals > 0 && (
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl">
                                                    <Clock size={12} /> {pendingWithdrawals} Pending
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">Partner</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">Amount</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">Date</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">Status</th>
                                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wide">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {withdrawals.map((w, i) => (
                                                    <tr key={w._id || i} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <p className="font-semibold text-sm text-slate-900">{w.email}</p>
                                                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">#{(w._id || "").slice(-8).toUpperCase()}</p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="font-bold text-lg text-slate-900">₹{Number(w.amount).toLocaleString()}</p>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-slate-600">
                                                            {new Date(w.requestedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${w.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                                    : w.status === "rejected" ? "bg-rose-50 text-rose-700 border-rose-100"
                                                                        : "bg-amber-50 text-amber-700 border-amber-100"
                                                                }`}>
                                                                {w.status === "completed" ? <CheckCircle size={10} /> : w.status === "rejected" ? <XCircle size={10} /> : <Clock size={10} />}
                                                                {w.status}
                                                            </span>
                                                            {w.reason && <p className="text-[10px] text-slate-400 mt-1 max-w-[180px] truncate">{w.reason}</p>}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {w.status === "pending" && (
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        onClick={() => handleWithdrawal(w._id, "completed")}
                                                                        className="h-8 px-4 bg-emerald-600 text-white rounded-lg font-semibold text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
                                                                    >
                                                                        <CheckCircle size={13} /> Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleWithdrawal(w._id, "rejected")}
                                                                        className="h-8 px-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg font-semibold text-xs hover:bg-rose-500 hover:text-white transition-colors flex items-center gap-1.5"
                                                                    >
                                                                        <XCircle size={13} /> Reject
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {withdrawals.length === 0 && !loadingData && (
                                                    <tr>
                                                        <td colSpan={5} className="py-20 text-center">
                                                            <Banknote size={32} className="text-slate-200 mx-auto mb-3" />
                                                            <h3 className="text-lg font-bold text-slate-900 mb-1">No withdrawal requests</h3>
                                                            <p className="text-sm text-slate-500">Partner withdrawal requests will appear here.</p>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}