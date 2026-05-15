import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Home,
  CalendarCheck,
  Calendar,
  Wallet,
  TrendingUp,
  Star,
  MessageSquare,
  LogOut,
  Globe,
  ChevronLeft,
  ChevronRight,
  Activity,
  ShieldCheck,
  Navigation,
  Banknote,
  Bell,
  Menu,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications.jsx';
import { NotificationDropdown } from '../components/ui/NotificationDropdown.jsx';

const NAV = [
  { to: '/partner', label: 'Dashboard', icon: LayoutDashboard, end: true, detail: 'Overview' },
  { to: '/partner/properties', label: 'My Stays', icon: Home, detail: 'Property Control' },
  { to: '/partner/pricing', label: 'Pricing', icon: DollarSign, detail: 'Dynamic Pricing' },
  { to: '/partner/bookings', label: 'Reservations', icon: CalendarCheck, detail: 'Guest Logs' },
  { to: '/partner/calendar', label: 'Live Calendar', icon: Calendar, detail: 'Timeline' },
  { to: '/partner/earnings', label: 'Earnings', icon: Wallet, detail: 'Revenue' },
  { to: '/partner/wallet', label: 'Wallet', icon: Banknote, detail: 'Payouts' },
  { to: '/partner/analytics', label: 'Analytics', icon: TrendingUp, detail: 'Growth Insights' },
  { to: '/partner/reviews', label: 'Reviews', icon: Star, detail: 'Guest Feedback' },
  { to: '/partner/chat', label: 'Concierge Chat', icon: MessageSquare, detail: 'Guest Comms' },
];

export default function PartnerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { notifs, showNotifs, setShowNotifs, openNotifs } = useNotifications(user);
  const notifRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close notif dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowNotifs]);

  function handleLogout() {
    logout();
    navigate('/');
  }

  const unreadCount = notifs.filter((n) => !n.read).length;
  const currentPage = NAV.find((n) => n.to === location.pathname);

  return (
    <div className="flex h-screen bg-[#050a08] font-sans text-white selection:bg-emerald-900/50 selection:text-emerald-200 overflow-hidden">
      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[30%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-emerald-700/5 blur-[100px] rounded-full" />
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`bg-black/40 flex flex-col transition-all duration-300 ease-in-out shrink-0 h-screen z-50 border-r border-white/[0.05] backdrop-blur-xl
          fixed md:relative
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Branding */}
        <div
          className={`h-20 flex items-center px-6 border-b border-white/[0.05] ${collapsed ? 'justify-center' : 'justify-between'}`}
        >
          {!collapsed && (
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate('/partner')}
            >
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-[#050a08] font-bold text-lg shrink-0 shadow-lg shadow-emerald-500/20">
                W
              </div>
              <span className="font-black text-white uppercase tracking-tight">
                Wayzza<span className="text-emerald-400">Pro</span>
              </span>
            </div>
          )}
          {collapsed && (
            <div
              className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-[#050a08] font-bold text-lg cursor-pointer shrink-0 shadow-lg shadow-emerald-500/20"
              onClick={() => setCollapsed(false)}
            >
              W
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white/40 hover:text-white transition-colors flex items-center justify-center shrink-0"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto no-scrollbar relative z-10">
          {!collapsed && (
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] block mb-4 ml-3">
              Management
            </span>
          )}
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={item.label}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-xl transition-all relative group border
                ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 font-bold border-emerald-500/10'
                    : 'text-white/40 hover:text-white hover:bg-white/[0.02] border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={16} className={collapsed ? 'mx-auto shrink-0' : 'shrink-0'} />
                  {!collapsed && <span className="text-[11px] font-bold uppercase tracking-wider truncate">{item.label}</span>}
                  {collapsed && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-[#050a08] border border-white/[0.1] text-white text-[10px] font-bold uppercase tracking-wide rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                      {item.label}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Partner info & logout */}
        <div className="p-4 border-t border-white/[0.05] bg-black/20 space-y-3 relative z-10">
          {!collapsed && (
            <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/[0.05]">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-sm shrink-0">
                {(user?.email || 'P').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">
                  {user?.email?.split('@')?.[0]}
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold uppercase tracking-wide mt-0.5">
                  <ShieldCheck size={10} /> Verified
                </div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full h-11 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center gap-2 border border-white/[0.05] text-white/40 hover:bg-rose-500 hover:text-white hover:border-rose-500 ${collapsed ? 'justify-center px-0' : 'justify-center px-4'}`}
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut size={14} />
            {!collapsed && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        {/* Header */}
        <header className="bg-[#050a08]/80 backdrop-blur-xl border-b border-white/[0.05] h-20 px-8 flex items-center justify-between shrink-0 z-40">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/60 flex items-center justify-center hover:bg-white/[0.05] transition-colors"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            {/* Desktop expand when collapsed */}
            {collapsed && (
              <button
                onClick={() => setCollapsed(false)}
                className="hidden md:flex w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/60 items-center justify-center hover:bg-white/[0.05] transition-colors"
                aria-label="Expand sidebar"
              >
                <ChevronRight size={18} />
              </button>
            )}
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-white uppercase tracking-tight">
                {currentPage?.label || 'Dashboard'}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-sm shadow-emerald-400/60" />
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Network Secure</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="h-10 px-4 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] text-white rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 transition-colors shadow-sm"
            >
              <Globe size={14} />
              <span className="hidden sm:inline">Public Site</span>
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={openNotifs}
                className="w-10 h-10 rounded-full bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] text-white/60 flex items-center justify-center transition-colors relative"
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                )}
              </button>

              <NotificationDropdown
                showNotifs={showNotifs}
                setShowNotifs={setShowNotifs}
                notifs={notifs}
              />
            </div>

            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-emerald-500/20 transition-colors shrink-0"
              onClick={() => navigate('/profile')}
              title="Account Profile"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/profile')}
            >
              {(user?.email || 'P').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
          <div className="mt-12 py-6 border-t border-white/[0.05] flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2">
              <Sparkles size={12} className="text-emerald-400" /> Wayzza Partner Suite
            </div>
            <div>&copy; {new Date().getFullYear()} Wayzza Inc.</div>
          </div>
        </main>
      </div>
    </div>
  );
}
