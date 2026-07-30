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
  ShieldCheck,
  Banknote,
  Bell,
  Menu,
  DollarSign,
  Sparkles,
  Car,
  Sun,
  Moon,
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications.jsx';
import { NotificationDropdown } from '../components/ui/NotificationDropdown.jsx';
import { api } from '../utils/api.js';

// Nav grouped by section — labels shown when sidebar is expanded
const NAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      { to: '/partner', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/partner/properties', label: 'My Stays', icon: Home },
      { to: '/partner/pricing', label: 'Pricing', icon: DollarSign },
      { to: '/partner/bookings', label: 'Reservations', icon: CalendarCheck },
      { to: '/partner/calendar', label: 'Calendar', icon: Calendar },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/partner/earnings', label: 'Earnings', icon: Wallet },
      { to: '/partner/wallet', label: 'Wallet', icon: Banknote },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/partner/analytics', label: 'Analytics', icon: TrendingUp },
      { to: '/partner/reviews', label: 'Reviews', icon: Star },
      { to: '/partner/chat', label: 'Chat', icon: MessageSquare },
    ],
  },
];

export default function PartnerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { notifs, showNotifs, setShowNotifs, openNotifs } = useNotifications(user);
  const notifRef = useRef(null);

  // Day / Night theme — persisted to localStorage
  const [theme, setTheme] = useState(() => localStorage.getItem('wayzzaTheme') || 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('wayzza-light', theme === 'light');
    localStorage.setItem('wayzzaTheme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  const [mainSector, setMainSector] = useState(() => {
    return sessionStorage.getItem('partner_main_sector') || 'stays';
  });

  useEffect(() => {
    if (user?.role === 'partner') {
      api
        .partnerStatus()
        .then((res) => {
          if (res.mainSector) {
            setMainSector(res.mainSector);
            sessionStorage.setItem('partner_main_sector', res.mainSector);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch partner status in layout:', err);
        });
    }
  }, [user]);

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

  // Remap "My Stays" → "My Inventory" for vehicle partners
  const navGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      if (item.to === '/partner/properties' && mainSector === 'vehicles') {
        return { ...item, label: 'My Inventory', icon: Car };
      }
      return item;
    }),
  }));

  const allNavItems = navGroups.flatMap((g) => g.items);
  const unreadCount = notifs.filter((n) => !n.read).length;
  const currentPage = allNavItems.find((n) => n.to === location.pathname);

  return (
    <div
      className="flex h-screen font-sans text-white selection:bg-emerald-900/50 selection:text-emerald-200 overflow-hidden dash-transition"
      style={{ background: 'var(--dash-bg)' }}
    >
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
        className={`flex flex-col transition-all duration-300 ease-in-out shrink-0 h-screen z-50 fixed md:relative dash-transition
          ${collapsed ? 'w-[56px]' : 'w-[220px]'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{ background: 'var(--dash-sidebar)', borderRight: '1px solid var(--dash-divider)' }}
      >
        {/* ── Branding ── */}
        <div
          className="dash-logo-wrap flex items-center gap-2.5 px-4 cursor-pointer shrink-0"
          style={{
            height: '56px',
            borderBottom: '1px solid var(--dash-divider)',
            justifyContent: collapsed ? 'center' : 'space-between',
          }}
          onClick={() => !collapsed && navigate('/partner')}
        >
          {/* Logo mark */}
          <div
            className="dash-logo-mark w-7 h-7 rounded-[7px] flex items-center justify-center font-bold text-sm shrink-0 cursor-pointer"
            style={{
              background: 'var(--dash-accent-500)',
              color: '#050a08',
              boxShadow: '0 0 12px rgba(16,185,129,0.22)',
            }}
            onClick={(e) => {
              e.stopPropagation();
              collapsed && setCollapsed(false);
              !collapsed && navigate('/partner');
            }}
          >
            W
          </div>
          {/* Wordmark */}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div
                className="text-[13px] font-bold leading-none truncate"
                style={{ color: 'var(--dash-text-1)' }}
              >
                Wayzza<span style={{ color: 'var(--dash-accent)' }}>Pro</span>
              </div>
              <div
                className="text-[9px] font-semibold uppercase tracking-[0.12em] mt-0.5"
                style={{ color: 'var(--dash-accent)' }}
              >
                Partner Suite
              </div>
            </div>
          )}
          {/* Collapse toggle */}
          {!collapsed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCollapsed(true);
              }}
              className="w-6 h-6 rounded-md flex items-center justify-center transition-colors shrink-0"
              style={{ background: 'rgba(128,128,128,0.08)', color: 'var(--dash-text-3)' }}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={13} />
            </button>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto no-scrollbar">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              {/* Section label */}
              {!collapsed && (
                <p
                  className="text-[9px] font-bold uppercase tracking-[0.14em] px-2 mb-1"
                  style={{ color: 'var(--dash-text-3)' }}
                >
                  {group.label}
                </p>
              )}
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  title={item.label}
                  className={({ isActive }) =>
                    `dash-nav-item${isActive ? ' dash-active' : ''} flex items-center gap-2.5 h-[33px] px-2.5 rounded-[7px] mb-0.5 group`
                  }
                  style={({ isActive }) => ({
                    background: isActive ? 'var(--dash-accent-dim)' : 'transparent',
                    paddingLeft: collapsed ? undefined : '10px',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        size={15}
                        className={`dash-nav-icon shrink-0 ${collapsed ? 'mx-auto' : ''}`}
                        style={{
                          color: isActive ? 'var(--dash-accent)' : 'var(--dash-text-3)',
                          opacity: isActive ? 1 : undefined,
                        }}
                      />
                      {!collapsed && (
                        <span
                          className="text-[12px] font-medium truncate"
                          style={{
                            color: isActive ? 'var(--dash-text-1)' : 'var(--dash-text-2)',
                            fontWeight: isActive ? 600 : 500,
                          }}
                        >
                          {item.label}
                        </span>
                      )}
                      {/* Collapsed tooltip */}
                      {collapsed && (
                        <div
                          className="absolute left-full ml-3 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap z-50 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
                          style={{
                            background: 'var(--dash-sidebar)',
                            border: '1px solid var(--dash-divider)',
                            color: 'var(--dash-text-1)',
                          }}
                        >
                          {item.label}
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* ── Footer: user + logout ── */}
        <div
          className="px-2 pb-3 pt-2 shrink-0"
          style={{ borderTop: '1px solid var(--dash-divider)' }}
        >
          {/* User row */}
          {!collapsed && (
            <div
              className="flex items-center gap-2.5 px-2 py-2 rounded-[7px] mb-1 cursor-default"
              style={{ transition: 'background 0.12s' }}
            >
              <div
                className="w-[27px] h-[27px] rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                style={{
                  background: 'var(--dash-accent-dim)',
                  border: '1px solid var(--dash-accent-border)',
                  color: 'var(--dash-accent)',
                }}
              >
                {(user?.email || 'P').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div
                  className="text-[11.5px] font-medium truncate"
                  style={{ color: 'var(--dash-text-1)' }}
                >
                  {user?.email?.split('@')?.[0]}
                </div>
                <div
                  className="text-[9px] font-semibold uppercase tracking-[0.08em] flex items-center gap-1 mt-0.5"
                  style={{ color: 'var(--dash-accent)' }}
                >
                  <ShieldCheck size={9} /> Verified
                </div>
              </div>
            </div>
          )}
          {/* Sign out */}
          <button
            onClick={handleLogout}
            className={`w-full rounded-[7px] flex items-center gap-2 text-[11px] font-medium transition-all ${collapsed ? 'justify-center py-2' : 'justify-center py-2 px-3'}`}
            style={{ color: 'var(--dash-text-3)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(248,113,113,0.08)';
              e.currentTarget.style.color = 'var(--dash-danger)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--dash-text-3)';
            }}
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut size={13} />
            {!collapsed && 'Sign out'}
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        {/* ── Header ── */}
        <header
          className="backdrop-blur-xl h-14 px-6 flex items-center justify-between shrink-0 z-40 dash-transition"
          style={{
            background: 'var(--dash-topbar)',
            borderBottom: '1px solid var(--dash-divider)',
          }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: 'rgba(128,128,128,0.06)',
                border: '1px solid var(--dash-divider)',
                color: 'var(--dash-text-2)',
              }}
              aria-label="Open menu"
            >
              <Menu size={16} />
            </button>
            {/* Desktop expand when collapsed */}
            {collapsed && (
              <button
                onClick={() => setCollapsed(false)}
                className="hidden md:flex w-9 h-9 rounded-lg items-center justify-center transition-colors"
                style={{
                  background: 'rgba(128,128,128,0.06)',
                  border: '1px solid var(--dash-divider)',
                  color: 'var(--dash-text-2)',
                }}
                aria-label="Expand sidebar"
              >
                <ChevronRight size={16} />
              </button>
            )}
            <div className="flex flex-col">
              <h1
                className="text-[14px] font-semibold leading-none"
                style={{ color: 'var(--dash-text-1)' }}
              >
                {currentPage?.label || 'Dashboard'}
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <div
                  className="w-[5px] h-[5px] rounded-full dash-status-dot"
                  style={{ background: 'var(--dash-accent)' }}
                />
                <span className="text-[10px] font-medium" style={{ color: 'var(--dash-text-3)' }}>
                  Network Secure
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Public site */}
            <button
              onClick={() => navigate('/')}
              className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-[11px] font-medium transition-colors"
              style={{
                background: 'rgba(128,128,128,0.06)',
                border: '1px solid var(--dash-divider)',
                color: 'var(--dash-text-2)',
              }}
            >
              <Globe size={13} />
              <span className="hidden sm:inline">Public Site</span>
            </button>

            {/* Day / Night toggle */}
            <button
              onClick={toggleTheme}
              className="dash-theme-btn w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'rgba(128,128,128,0.06)',
                border: '1px solid var(--dash-divider)',
                color: 'var(--dash-text-2)',
              }}
              title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={openNotifs}
                className="dash-avatar w-8 h-8 rounded-lg flex items-center justify-center transition-colors relative"
                style={{
                  background: 'rgba(128,128,128,0.06)',
                  border: '1px solid var(--dash-divider)',
                  color: 'var(--dash-text-2)',
                }}
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
              >
                <Bell size={14} />
                {unreadCount > 0 && (
                  <span
                    className="absolute top-1.5 right-1.5 w-[5px] h-[5px] rounded-full"
                    style={{ background: 'var(--dash-danger)' }}
                  />
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
              className="dash-avatar w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold cursor-pointer transition-colors shrink-0"
              style={{
                background: 'var(--dash-accent-dim)',
                border: '1px solid var(--dash-accent-border)',
                color: 'var(--dash-accent)',
              }}
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

        {/* ── Page Content ── */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
          <div
            className="mt-10 py-5 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] font-medium tracking-[0.15em] uppercase"
            style={{ borderTop: '1px solid var(--dash-divider)', color: 'var(--dash-text-3)' }}
          >
            <div className="flex items-center gap-1.5">
              <Sparkles size={11} style={{ color: 'var(--dash-accent)' }} />
              Wayzza Partner Suite
            </div>
            <div>&copy; {new Date().getFullYear()} Wayzza Inc.</div>
          </div>
        </main>
      </div>
    </div>
  );
}
