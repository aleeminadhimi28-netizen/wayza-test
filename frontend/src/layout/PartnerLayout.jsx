import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Home, CalendarCheck, Calendar, Wallet, TrendingUp, Star, MessageSquare, Plus,
  LogOut, Globe, ChevronLeft, ChevronRight, Activity, ShieldCheck, Zap, Layers, HardDrive, Sparkles, Navigation, Banknote, Bell, X
} from "lucide-react";
import { api } from "../utils/api.js";

const NAV = [
  { to: "/partner", label: "Dashboard", icon: LayoutDashboard, end: true, detail: "Overview" },
  { to: "/partner/properties", label: "My Stays", icon: Home, detail: "Property Control" },
  { to: "/partner/bookings", label: "Reservations", icon: CalendarCheck, detail: "Guest Logs" },
  { to: "/partner/calendar", label: "Live Calendar", icon: Calendar, detail: "Timeline" },
  { to: "/partner/earnings", label: "Earnings", icon: Wallet, detail: "Revenue" },
  { to: "/partner/wallet", label: "Wallet", icon: Banknote, detail: "Payouts" },
  { to: "/partner/analytics", label: "Analytics", icon: TrendingUp, detail: "Growth Insights" },
  { to: "/partner/reviews", label: "Reviews", icon: Star, detail: "Guest Feedback" },
  { to: "/partner/chat", label: "Concierge Chat", icon: MessageSquare, detail: "Guest Comms" },
];

export default function PartnerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // NOTIFICATIONS
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  import("react").then(({ useEffect }) => {
    useEffect(() => {
      async function fetchNotifs() {
        try {
          const res = await api.getNotifications();
          if (res.ok) setNotifs(res.data || []);
        } catch (_) { }
      }
      fetchNotifs();
      const int = setInterval(fetchNotifs, 10000);
      return () => clearInterval(int);
    }, []);
  });

  async function openNotifs() {
    setShowNotifs(!showNotifs);
    if (!showNotifs && notifs.some(n => !n.read)) {
      await api.markNotificationsRead();
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    }
  }

  function handleLogout() {
    logout();
    navigate("/");
  }


  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-hidden">

      {/* ===== SIDEBAR - PARTNER SUITE ===== */}
      <aside
        className={`bg-slate-900 flex flex-col transition-all duration-300 ease-in-out shrink-0 sticky top-0 h-screen z-50 shadow-xl ${collapsed ? "w-20" : "w-64"}`}
      >
        {/* Branding */}
        <div className={`h-20 flex items-center px-6 border-b border-slate-800 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/partner")}>
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                W
              </div>
              <span className="font-bold text-lg text-white">Wayza<span className="text-emerald-500">Pro</span></span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-lg cursor-pointer" onClick={() => setCollapsed(false)}>
              W
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex items-center justify-center shrink-0 ${collapsed ? "hidden" : "block"}`}
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto no-scrollbar">
          {!collapsed && <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-4 ml-3">Menu</span>}
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `flex items-center gap-3 p-3 rounded-xl transition-all relative group ${isActive ? 'bg-emerald-500/10 text-emerald-500 font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} className={collapsed ? "mx-auto shrink-0" : "shrink-0"} />
              {!collapsed && (
                <div className="flex flex-col items-start leading-none">
                  <span className="text-sm">{item.label}</span>
                </div>
              )}
              {location.pathname === item.to && !collapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* Partner Info & Sign Out */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-4">
          {!collapsed && (
            <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-sm shrink-0">
                {(user?.email || "P").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {user?.email?.split("@")[0]}
                </div>
                <div className="text-[10px] text-emerald-500 flex items-center gap-1 font-medium mt-0.5">
                  <ShieldCheck size={12} /> Verified Partner
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`w-full h-10 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 border border-slate-700 text-slate-300 hover:bg-rose-500 hover:text-white hover:border-rose-500 ${collapsed ? "justify-center px-0" : "justify-center px-4"}`}
            title={collapsed ? "Sign Out" : undefined}
          >
            <LogOut size={16} />
            {!collapsed && "Sign Out"}
          </button>
        </div>
      </aside>

      {/* ===== MAIN EXPANSE ===== */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">

        {/* Global Header */}
        <header className="bg-white border-b border-slate-200 h-20 px-8 flex items-center justify-between shrink-0 shadow-sm z-40">
          <div className="flex items-center gap-4">
            {collapsed && (
              <button onClick={() => setCollapsed(false)} className="md:hidden w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors">
                <ChevronRight size={20} />
              </button>
            )}
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-slate-900">
                {NAV.find(n => n.to === location.pathname)?.label || "Dashboard"}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5 text-slate-500">
                <Activity size={12} className="text-emerald-500" />
                <span className="text-xs font-medium">System Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors"
            >
              <Globe size={16} /> <span className="hidden sm:inline">Public Site</span>
            </button>

            {/* NOTIFICATION BELL */}
            <div className="relative">
              <button
                onClick={openNotifs}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors relative"
              >
                <Bell size={18} />
                {notifs.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {showNotifs && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 flex flex-col max-h-[400px]"
                  >
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <span className="font-bold text-sm text-slate-900 uppercase tracking-widest">Notifications</span>
                      <button onClick={() => setShowNotifs(false)} className="text-slate-400 hover:text-slate-900"><X size={16} /></button>
                    </div>
                    <div className="overflow-y-auto overflow-x-hidden p-2 flex-1">
                      {notifs.length === 0 ? (
                        <p className="text-center text-xs text-slate-400 py-6 italic">No new notifications</p>
                      ) : (
                        notifs.map(n => (
                          <div key={n._id} className={`p-3 rounded-xl mb-1 flex flex-col gap-1 text-sm ${n.read ? "bg-white text-slate-500" : "bg-emerald-50 text-emerald-900 font-semibold"}`}>
                            <span>{n.message}</span>
                            <span className="text-[9px] uppercase tracking-widest opacity-50">{new Date(n.createdAt).toLocaleDateString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div
              className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-emerald-200 transition-colors border border-emerald-200"
              onClick={() => navigate("/profile")}
              title="Account Profile"
            >
              {(user?.email || "P").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10 bg-slate-50">
          <Outlet />

          {/* Footer inside main content area */}
          <div className="mt-12 py-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <Navigation size={14} /> Wayza Partner Suite
            </div>
            <div>
              &copy; {new Date().getFullYear()} Wayza Inc.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
