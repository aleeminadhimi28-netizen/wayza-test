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
  Moon,
  Sun,
  Menu,
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications.jsx';
import { NotificationDropdown } from '../components/ui/NotificationDropdown.jsx';

const NAV = [
  { to: '/partner', label: 'Dashboard', icon: LayoutDashboard, end: true, detail: 'Overview' },
  { to: '/partner/properties', label: 'My Stays', icon: Home, detail: 'Property Control' },
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
  const [isDarkMode, setIsDarkMode] = useState(false);
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

  useEffect(() => {
    const saved = localStorage.getItem('wayzza-theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('wayzza-dark');
      setIsDarkMode(true);
    } else {
      setIsDarkMode(document.documentElement.classList.contains('wayzza-dark'));
    }
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains('wayzza-dark')) {
      root.classList.remove('wayzza-dark');
      setIsDarkMode(false);
      localStorage.setItem('wayzza-theme', 'light');
    } else {
      root.classList.add('wayzza-dark');
      setIsDarkMode(true);
      localStorage.setItem('wayzza-theme', 'dark');
    }
  };

  function handleLogout() {
    logout();
    navigate('/');
  }

  const unreadCount = notifs.filter((n) => !n.read).length;
  const currentPage = NAV.find((n) => n.to === location.pathname);

  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-hidden">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`bg-slate-900 flex flex-col transition-all duration-300 ease-in-out shrink-0 h-screen z-50 shadow-xl
          fixed md:relative
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Branding */}
        <div
          className={`h-20 flex items-center px-4 border-b border-slate-800 ${collapsed ? 'justify-center' : 'justify-between'}`}
        >
          {!collapsed && (
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate('/partner')}
            >
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0">
                W
              </div>
              <span className="font-bold text-lg text-white">
                Wayzza<span className="text-emerald-500">Pro</span>
              </span>
            </div>
          )}
          {collapsed && (
            <div
              className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-lg cursor-pointer shrink-0"
              onClick={() => setCollapsed(false)}
            >
              W
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex items-center justify-center shrink-0"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Theme toggle */}
        <div
          className={`px-4 py-4 border-b border-slate-800 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}
        >
          {!collapsed && (
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">
              Appearance
            </span>
          )}
          <button
            onClick={toggleTheme}
            className={`w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center transition-all ${isDarkMode ? 'text-amber-400' : 'text-slate-400 hover:text-white'}`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto no-scrollbar">
          {!collapsed && (
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-4 ml-3">
              Menu
            </span>
          )}
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={item.label}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-xl transition-all relative group
                ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && !collapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full" />
                  )}
                  <item.icon size={20} className={collapsed ? 'mx-auto shrink-0' : 'shrink-0'} />
                  {!collapsed && <span className="text-sm truncate">{item.label}</span>}
                  {collapsed && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-md">
                      {item.label}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Partner info & logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-3">
          {!collapsed && (
            <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-sm shrink-0">
                {(user?.email || 'P').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {user?.email?.split('@')?.[0]}
                </div>
                <div className="text-[11px] text-emerald-500 flex items-center gap-1 font-medium mt-0.5">
                  <ShieldCheck size={12} /> Verified Partner
                </div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full h-10 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 border border-slate-700 text-slate-300 hover:bg-rose-500 hover:text-white hover:border-rose-500 ${collapsed ? 'justify-center px-0' : 'justify-center px-4'}`}
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut size={16} />
            {!collapsed && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 md:h-20 px-4 md:px-8 flex items-center justify-between shrink-0 shadow-sm z-40">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            {/* Desktop expand when collapsed */}
            {collapsed && (
              <button
                onClick={() => setCollapsed(false)}
                className="hidden md:flex w-10 h-10 rounded-xl bg-slate-100 text-slate-600 items-center justify-center hover:bg-slate-200 transition-colors"
                aria-label="Expand sidebar"
              >
                <ChevronRight size={20} />
              </button>
            )}
            <div className="flex flex-col">
              <h1 className="text-base md:text-xl font-bold text-slate-900 leading-tight">
                {currentPage?.label || 'Dashboard'}
              </h1>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Activity size={11} className="text-emerald-500" />
                <span className="text-[11px] font-medium">System Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => navigate('/')}
              className="h-9 md:h-10 px-3 md:px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors"
            >
              <Globe size={16} />
              <span className="hidden sm:inline">Public Site</span>
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={openNotifs}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors relative"
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
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
              className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-emerald-200 transition-colors border border-emerald-200 shrink-0"
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
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          <Outlet />
          <div className="mt-12 py-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <Navigation size={14} /> Wayzza Partner Suite
            </div>
            <div>&copy; {new Date().getFullYear()} Wayzza Inc.</div>
          </div>
        </main>
      </div>
    </div>
  );
}
