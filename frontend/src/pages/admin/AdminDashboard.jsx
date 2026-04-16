import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Users, Briefcase, Home, CalendarCheck, TrendingUp, LogOut, LayoutDashboard,
    Trash2, Search, CheckCircle, Clock, Bell, VolumeX, Volume2,
    MessageSquare, Banknote, X, Settings, Tag, Activity
} from "lucide-react";

import { api } from "../../utils/api.js";
import { useToast } from "../../ToastContext.jsx";

// Sub-components
import AdminOverview from "./AdminOverview.jsx";
import AdminSupport from "./AdminSupport.jsx";
import AdminWithdrawals from "./AdminWithdrawals.jsx";
import AdminSettings from "./AdminSettings.jsx";
import AdminCoupons from "./AdminCoupons.jsx";
import AdminLogs from "./AdminLogs.jsx";

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [dataList, setDataList] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Support state
    const [tickets, setTickets] = useState([]);

    // Withdrawal state
    const [withdrawals, setWithdrawals] = useState([]);

    const { showToast } = useToast();

    useEffect(() => {
        api.adminStats()
            .then(d => {
                if (d.error) { setErrorMsg("Unauthorized. Admin privileges required."); return; }
                if (d) setStats(d);
            })
            .catch(() => setErrorMsg("Failed to load dashboard data. Is the backend running?"));
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
            p.then(d => {
                if (d.ok) {
                    setDataList(d.data || []);
                } else {
                    showToast(`Failed to load ${activeTab}: ${d.message || 'Unknown error'}`, "error");
                }
                setLoadingData(false);
            })
                .catch(err => {
                    console.error(`Fetch error for ${activeTab}:`, err);
                    showToast(`Unable to reach backend for ${activeTab}. It might still be deploying.`, "error");
                    setLoadingData(false);
                });
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

    async function handleApprovePartner(email) {
        if (!window.confirm("Approve this partner and activate their account?")) return;
        try {
            const d = await api.adminApprovePartner(email);
            if (d.ok) setDataList(prev => prev.map(item => item.email === email ? { ...item, onboarded: true } : item));
            showToast("Partner approved successfully!", "success");
        } catch (err) { console.error(err); }
    }

    async function handleMuteUser(email, muted) {
        if (!window.confirm(`${muted ? "Mute" : "Unmute"} this user?`)) return;
        try {
            const d = await api.adminMuteUser(email, muted);
            if (d.ok) setDataList(prev => prev.map(item => item.email === email ? { ...item, muted } : item));
        } catch (err) { console.error(err); }
    }

    async function handleUpdatePayout(id, status) {
        if (!window.confirm(`Mark this booking as ${status}?`)) return;
        try {
            const d = await api.adminUpdatePayoutStatus(id, status);
            if (d.ok) setDataList(prev => prev.map(item => item._id === id ? { ...item, payoutStatus: status } : item));
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
        { id: 'withdrawals', icon: Banknote, label: 'Finance' },
        { id: 'support', icon: MessageSquare, label: 'Support' },
        { id: 'coupons', icon: Tag, label: 'Promotions' },
        { id: 'logs', icon: Activity, label: 'Activity Logs' },
        { id: 'settings', icon: Settings, label: 'Settings' }
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
                            {(activeTab !== "overview" && activeTab !== "support" && activeTab !== "withdrawals" && activeTab !== "settings") && (
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
                        {activeTab === "overview" && (
                            <AdminOverview stats={stats} setActiveTab={setActiveTab} />
                        )}

                        {activeTab === "support" && (
                            <AdminSupport tickets={tickets} setTickets={setTickets} loadTickets={loadTickets} loadingData={loadingData} />
                        )}

                        {activeTab === "withdrawals" && (
                            <AdminWithdrawals withdrawals={withdrawals} setWithdrawals={setWithdrawals} stats={stats} loadingData={loadingData} />
                        )}

                        {activeTab === "settings" && (
                            <AdminSettings />
                        )}

                        {activeTab === "coupons" && (
                            <AdminCoupons />
                        )}

                        {activeTab === "logs" && (
                            <AdminLogs />
                        )}

                        {/* DATA TABLE TABS (users, partners, listings, bookings) */}
                        {["users", "partners", "listings", "bookings"].includes(activeTab) && (
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
                                                                {activeTab === "listings" && !item.approved && (
                                                                    <button onClick={() => handleApproveProperty(item._id)} className="h-8 px-4 bg-emerald-600 text-white rounded-lg font-semibold text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm">
                                                                        <CheckCircle size={13} /> Approve
                                                                    </button>
                                                                )}
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
                                                                {activeTab === "partners" && !item.onboarded && (
                                                                    <button onClick={() => handleApprovePartner(item.email)} className="h-8 px-4 bg-emerald-600 text-white rounded-lg font-semibold text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm">
                                                                        <CheckCircle size={13} /> Approve
                                                                    </button>
                                                                )}
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
                </div>
            </main>
        </div>
    );
}