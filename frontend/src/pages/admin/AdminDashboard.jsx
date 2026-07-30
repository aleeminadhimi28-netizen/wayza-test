import { useEffect, useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  Users,
  Briefcase,
  Home,
  CalendarCheck,
  LogOut,
  LayoutDashboard,
  Bell,
  MessageSquare,
  Banknote,
  Settings,
  Tag,
  Activity,
  Menu,
  Shield,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';

import { api } from '../../utils/api.js';
import { useToast } from '../../ToastContext.jsx';
import { useAuth } from '../../AuthContext.jsx';

// Sub-components
import AdminOverview from './AdminOverview.jsx';
import AdminSupport from './AdminSupport.jsx';
import AdminWithdrawals from './AdminWithdrawals.jsx';
import AdminSettings from './AdminSettings.jsx';
import AdminCoupons from './AdminCoupons.jsx';
import AdminLogs from './AdminLogs.jsx';
import AdminPackageRequests from './AdminPackageRequests.jsx';
import AdminDataTable from '../../components/admin/AdminDataTable.jsx';

const TAB_GROUPS = [
  {
    label: 'Overview',
    tabs: [{ id: 'overview', icon: LayoutDashboard, label: 'Overview' }],
  },
  {
    label: 'Data',
    tabs: [
      { id: 'users', icon: Users, label: 'Users' },
      { id: 'partners', icon: Briefcase, label: 'Partners' },
      { id: 'listings', icon: Home, label: 'Inventory' },
      { id: 'bookings', icon: CalendarCheck, label: 'Bookings' },
    ],
  },
  {
    label: 'Operations',
    tabs: [
      { id: 'package-requests', icon: Sparkles, label: 'Package Leads' },
      { id: 'withdrawals', icon: Banknote, label: 'Finance' },
      { id: 'support', icon: MessageSquare, label: 'Support' },
      { id: 'coupons', icon: Tag, label: 'Promotions' },
    ],
  },

  {
    label: 'System',
    tabs: [
      { id: 'logs', icon: Activity, label: 'Activity Logs' },
      { id: 'settings', icon: Settings, label: 'Settings' },
    ],
  },
];

const TABS = TAB_GROUPS.flatMap((g) => g.tabs);

export default function AdminDashboard() {
  const { showToast } = useToast();
  const { logout, user } = useAuth();

  const adminInitials = user?.email ? user.email.split('@')[0].slice(0, 2).toUpperCase() : 'AD';

  // Day / Night theme — persisted to localStorage
  const [theme, setTheme] = useState(() => localStorage.getItem('wayzzaTheme') || 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('wayzza-light', theme === 'light');
    localStorage.setItem('wayzzaTheme', theme);
  }, [theme]);
  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  const [stats, setStats] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tickets, setTickets] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);
  const [tick, setTick] = useState(0);

  // FIX #78: derive timeStr inside a useMemo keyed on tick so string updates
  // every second without leaking a stale Date object into other renders
  const timeStr = useMemo(() => {
    return new Date().toLocaleTimeString('en-GB', { hour12: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  // Clock interval — separated so it only runs once
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const loadTickets = useCallback(async () => {
    setLoadingData(true);
    try {
      const d = await api.getSupportTickets();
      if (d.ok) setTickets(d.data || []);
    } catch (err) {
      console.error('Failed to load support tickets:', err);
      showToast('Failed to load support tickets.', 'error');
    }
    setLoadingData(false);
  }, [showToast]);

  const loadWithdrawals = useCallback(async () => {
    setLoadingData(true);
    try {
      const [wRes, bRes] = await Promise.all([api.adminGetWithdrawals(), api.adminBookings()]);
      if (wRes.ok) setWithdrawals(wRes.data || []);
      if (bRes.ok) setAdminBookings(bRes.data || []);
    } catch (err) {
      console.error('Failed to load withdrawals or bookings:', err);
      showToast('Failed to load financial details.', 'error');
    }
    setLoadingData(false);
  }, [showToast]);

  const loadTableData = useCallback(async () => {
    if (
      [
        'overview',
        'support',
        'withdrawals',
        'settings',
        'coupons',
        'logs',
        'package-requests',
      ].includes(activeTab)
    )
      return;

    setLoadingData(true);
    try {
      let promise;
      switch (activeTab) {
        case 'users':
          promise = api.adminUsers();
          break;
        case 'partners':
          promise = api.adminPartners();
          break;
        case 'listings':
          promise = api.adminListings();
          break;
        case 'bookings':
          promise = api.adminBookings();
          break;
        default:
          break;
      }

      if (promise) {
        const d = await promise;
        if (d.ok) {
          setDataList(d.data || []);
        } else {
          showToast(`Failed to load ${activeTab}: ${d.message || 'Unknown error'}`, 'error');
        }
      }
    } catch (err) {
      console.error(`Fetch error for ${activeTab}:`, err);
      showToast(`Unable to reach backend for ${activeTab}.`, 'error');
    } finally {
      setLoadingData(false);
    }
  }, [activeTab, showToast]);

  const handleDeleteItem = useCallback(
    async (type, idOrEmail) => {
      try {
        const apiMap = {
          users: api.adminDeleteUser,
          partners: api.adminDeletePartner,
          listings: api.adminDeleteListing,
        };

        const res = await apiMap[type]?.(idOrEmail);

        if (res?.ok) {
          if (type === 'users' || type === 'partners')
            setDataList((prev) => prev.filter((item) => item.email !== idOrEmail));
          else setDataList((prev) => prev.filter((item) => item._id !== idOrEmail));
          showToast(`Successfully deleted ${type.slice(0, -1)}.`, 'success');
        }
      } catch (err) {
        console.error(err);
        showToast('Action failed. Please try again.', 'error');
      }
    },
    [showToast]
  );

  const handleApproveProperty = useCallback(
    async (id) => {
      try {
        const d = await api.adminApproveListing(id, true);
        if (d.ok) {
          setDataList((prev) =>
            prev.map((item) => (item._id === id ? { ...item, approved: true } : item))
          );
          showToast('Property approved successfully.', 'success');
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to approve property.', 'error');
      }
    },
    [showToast]
  );

  const handleRejectProperty = useCallback(
    async (id) => {
      try {
        const d = await api.adminRejectListing(id);
        if (d.ok) {
          setDataList((prev) =>
            prev.map((item) =>
              item._id === id ? { ...item, approved: false, rejected: true } : item
            )
          );
          showToast('Listing rejected. Partner has been flagged.', 'info');
        } else {
          showToast(d.message || 'Failed to reject listing.', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to reject listing.', 'error');
      }
    },
    [showToast]
  );

  const handleToggleFeatured = useCallback(
    async (id, featured) => {
      try {
        const d = await api.adminToggleFeatured(id, featured);
        if (d.ok) {
          setDataList((prev) =>
            prev.map((item) => (item._id === id ? { ...item, featured } : item))
          );
          showToast(
            featured ? '⭐ Listing pinned as Featured' : 'Removed from Featured',
            'success'
          );
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to update featured status.', 'error');
      }
    },
    [showToast]
  );

  const handleApprovePartner = useCallback(
    async (email) => {
      if (!email) return;
      try {
        const d = await api.adminApprovePartner(email);
        if (d.ok) {
          setDataList((prev) =>
            prev.map((item) => (item.email === email ? { ...item, onboarded: true } : item))
          );
          showToast('Partner approved successfully!', 'success');
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to approve partner.', 'error');
      }
    },
    [showToast]
  );

  const handleMuteUser = useCallback(
    async (email, muted) => {
      try {
        const d = await api.adminMuteUser(email, muted);
        if (d.ok) {
          setDataList((prev) =>
            prev.map((item) => (item.email === email ? { ...item, muted } : item))
          );
          showToast(muted ? 'User muted.' : 'User unmuted.', 'success');
        }
      } catch (err) {
        console.error(err);
        showToast('Action failed.', 'error');
      }
    },
    [showToast]
  );

  const handleUpdatePayout = useCallback(
    async (id, status) => {
      try {
        const d = await api.adminUpdatePayoutStatus(id, status);
        if (d.ok) {
          setDataList((prev) =>
            prev.map((item) => (item._id === id ? { ...item, payoutStatus: status } : item))
          );
          showToast('Payout status updated.', 'success');
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to update payout.', 'error');
      }
    },
    [showToast]
  );

  const handleCreatePartner = useCallback(
    async (partnerData) => {
      try {
        const d = await api.adminCreatePartner(partnerData);
        if (d.ok) {
          setDataList((prev) => [d.data, ...prev]);
          showToast('Partner created and onboarded successfully.', 'success');
          return true;
        } else {
          showToast(`Failed: ${d.message}`, 'error');
          return false;
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to create partner.', 'error');
        return false;
      }
    },
    [showToast]
  );

  const handleLogout = useCallback(() => {
    logout();
    window.location.href = '/admin-login';
  }, [logout]);

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return dataList.filter((item) => {
      const searchFields = [
        item.email,
        item.title,
        item.businessName,
        item.guestEmail,
        item.guestName,
        item.phone,
      ]
        .filter(Boolean)
        .map((f) => String(f).toLowerCase());
      return searchFields.some((f) => f.includes(query));
    });
  }, [dataList, searchQuery]);

  const pendingWithdrawals = useMemo(
    () => withdrawals.filter((w) => w.status === 'pending').length,
    [withdrawals]
  );

  const openTickets = useMemo(() => tickets.filter((t) => t.status === 'open').length, [tickets]);

  useEffect(() => {
    const fetchStats = () => {
      api
        .adminStats()
        .then((d) => {
          if (d.error) {
            setErrorMsg('Unauthorized. Admin privileges required.');
            return;
          }
          if (d) setStats(d);
        })
        .catch(() => setErrorMsg('Failed to load dashboard data. Is the backend running?'));
    };

    fetchStats(); // Initial load
    const refreshId = setInterval(fetchStats, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(refreshId);
  }, []);

  // FIX #49: Load tickets and withdrawals on mount so sidebar badge counts
  // are populated immediately without requiring the user to visit those tabs first
  useEffect(() => {
    loadTickets();
    loadWithdrawals();
  }, [loadTickets, loadWithdrawals]);

  useEffect(() => {
    if (activeTab === 'support') loadTickets();
    else if (activeTab === 'withdrawals') loadWithdrawals();
    else loadTableData();
  }, [activeTab, loadTickets, loadWithdrawals, loadTableData]);

  if (errorMsg)
    return (
      <div
        className="min-h-screen flex items-center justify-center font-sans p-6"
        style={{ background: 'var(--dash-bg)', color: 'var(--dash-text-1)' }}
      >
        <div
          className="flex flex-col items-center gap-6 max-w-sm text-center p-10 rounded-2xl"
          style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-card-border)' }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(248,113,113,0.10)', color: 'var(--dash-danger)' }}
          >
            <Shield size={28} />
          </div>
          <div>
            <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--dash-text-1)' }}>
              Access Denied
            </h1>
            <p className="text-sm" style={{ color: 'var(--dash-text-2)' }}>
              {errorMsg}
            </p>
          </div>
          <button
            onClick={() => (window.location.href = '/admin-login')}
            className="h-10 px-6 rounded-lg font-semibold text-[12px] transition-colors"
            style={{ background: 'var(--dash-accent-500)', color: '#fff' }}
          >
            Sign In Again
          </button>
        </div>
      </div>
    );

  if (!stats)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--dash-bg)', color: 'var(--dash-text-1)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-9 h-9 border-2 border-t-emerald-500 rounded-full animate-spin"
            style={{ borderColor: 'var(--dash-divider)', borderTopColor: 'var(--dash-accent-500)' }}
          />
          <p
            className="text-[11px] font-medium uppercase tracking-widest"
            style={{ color: 'var(--dash-text-3)' }}
          >
            Loading Control Panel...
          </p>
        </div>
      </div>
    );

  return (
    <div
      className="min-h-screen font-sans flex overflow-hidden dash-transition"
      style={{ background: 'var(--dash-bg)', color: 'var(--dash-text-1)' }}
    >
      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 xl:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`h-screen flex flex-col shrink-0 fixed xl:relative z-50 transition-transform duration-300 dash-transition ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}`}
        style={{
          width: '220px',
          background: 'var(--dash-sidebar)',
          borderRight: '1px solid var(--dash-divider)',
        }}
      >
        {/* Branding */}
        <div
          className="dash-logo-wrap flex items-center gap-2.5 px-4 cursor-pointer shrink-0"
          style={{ height: '56px', borderBottom: '1px solid var(--dash-divider)' }}
          onClick={() => setActiveTab('overview')}
        >
          <div
            className="dash-logo-mark w-7 h-7 rounded-[7px] flex items-center justify-center font-bold shrink-0"
            style={{
              background: 'var(--dash-accent-500)',
              color: '#050a08',
              boxShadow: '0 0 12px rgba(16,185,129,0.22)',
            }}
          >
            <Shield size={13} />
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-[13px] font-bold leading-none"
              style={{ color: 'var(--dash-text-1)' }}
            >
              Wayzza
            </div>
            <div
              className="text-[9px] font-semibold uppercase tracking-[0.14em] mt-0.5"
              style={{ color: 'var(--dash-accent)' }}
            >
              Control
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto no-scrollbar">
          {TAB_GROUPS.map((group) => (
            <div key={group.label} className="mb-4">
              {group.label !== 'Overview' && (
                <p
                  className="text-[9px] font-bold uppercase tracking-[0.14em] px-2 mb-1"
                  style={{ color: 'var(--dash-text-3)' }}
                >
                  {group.label}
                </p>
              )}
              {group.tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchQuery('');
                    setMobileMenuOpen(false);
                  }}
                  className={`dash-nav-item${activeTab === tab.id ? ' dash-active' : ''} w-full flex items-center gap-2.5 h-[33px] px-2.5 rounded-[7px] mb-0.5 text-left`}
                  style={{
                    background: activeTab === tab.id ? 'var(--dash-accent-dim)' : 'transparent',
                  }}
                >
                  <tab.icon
                    size={14}
                    className="dash-nav-icon shrink-0"
                    style={{
                      color: activeTab === tab.id ? 'var(--dash-accent)' : 'var(--dash-text-3)',
                    }}
                  />
                  <span
                    className="text-[12px] truncate"
                    style={{
                      color: activeTab === tab.id ? 'var(--dash-text-1)' : 'var(--dash-text-2)',
                      fontWeight: activeTab === tab.id ? 600 : 500,
                    }}
                  >
                    {tab.label}
                  </span>
                  {tab.id === 'support' && openTickets > 0 && (
                    <span
                      className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] dash-badge-pop"
                      style={{ background: 'rgba(248,113,113,0.12)', color: 'var(--dash-danger)' }}
                    >
                      {openTickets}
                    </span>
                  )}
                  {tab.id === 'withdrawals' && pendingWithdrawals > 0 && (
                    <span
                      className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] dash-badge-pop"
                      style={{ background: 'rgba(251,191,36,0.12)', color: 'var(--dash-warning)' }}
                    >
                      {pendingWithdrawals}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div
          className="px-2 pb-3 pt-2 shrink-0"
          style={{ borderTop: '1px solid var(--dash-divider)' }}
        >
          {/* Secure badge */}
          <div
            className="flex items-center gap-2 px-2 py-2 rounded-[7px] mb-1"
            style={{
              background: 'rgba(16,185,129,0.05)',
              border: '1px solid rgba(16,185,129,0.10)',
            }}
          >
            <div
              className="w-[5px] h-[5px] rounded-full dash-status-dot"
              style={{ background: 'var(--dash-accent)' }}
            />
            <span className="text-[10px] font-medium" style={{ color: 'var(--dash-text-3)' }}>
              NODE_OK · TLS 1.3
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-[7px] text-[11px] font-medium transition-all"
            style={{ color: 'var(--dash-text-3)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(248,113,113,0.08)';
              e.currentTarget.style.color = 'var(--dash-danger)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--dash-text-3)';
            }}
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 h-screen overflow-y-auto relative z-10">
        {/* HEADER */}
        <header
          className="sticky top-0 z-50 backdrop-blur-xl px-6 py-0 flex items-center justify-between dash-transition"
          style={{
            height: '56px',
            background: 'var(--dash-topbar)',
            borderBottom: '1px solid var(--dash-divider)',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="xl:hidden w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: 'rgba(128,128,128,0.06)',
                border: '1px solid var(--dash-divider)',
                color: 'var(--dash-text-2)',
              }}
            >
              <Menu size={16} />
            </button>
            <div>
              <h2
                className="text-[14px] font-semibold leading-none"
                style={{ color: 'var(--dash-text-1)' }}
              >
                {activeTab === 'overview'
                  ? 'Dashboard Overview'
                  : activeTab === 'support'
                    ? 'Customer Support'
                    : activeTab === 'withdrawals'
                      ? 'Financial Operations'
                      : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management`}
              </h2>
              <div className="flex items-center gap-1.5 mt-1">
                <div
                  className="w-[5px] h-[5px] rounded-full dash-status-dot"
                  style={{ background: 'var(--dash-accent)' }}
                />
                <span className="text-[10px] font-medium" style={{ color: 'var(--dash-text-3)' }}>
                  Secure Console · {timeStr}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
            <button
              onClick={() => setActiveTab('support')}
              title="View support tickets"
              className="dash-avatar w-8 h-8 rounded-lg flex items-center justify-center transition-colors relative"
              style={{
                background: 'rgba(128,128,128,0.06)',
                border: '1px solid var(--dash-divider)',
                color: 'var(--dash-text-2)',
              }}
            >
              <Bell size={14} />
              {openTickets > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 w-[5px] h-[5px] rounded-full"
                  style={{ background: 'var(--dash-danger)' }}
                />
              )}
            </button>
            <div
              title={user?.email || 'Admin'}
              className="dash-avatar w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold cursor-default"
              style={{
                background: 'var(--dash-accent-dim)',
                border: '1px solid var(--dash-accent-border)',
                color: 'var(--dash-accent)',
              }}
            >
              {adminInitials}
            </div>
          </div>
        </header>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* FIX #53: Added key={activeTab} so AnimatePresence can detect tab changes and animate */}
            {activeTab === 'overview' && (
              <AdminOverview key="overview" stats={stats} setActiveTab={setActiveTab} />
            )}

            {activeTab === 'support' && (
              <AdminSupport
                key="support"
                tickets={tickets}
                setTickets={setTickets}
                loadTickets={loadTickets}
                loadingData={loadingData}
              />
            )}

            {activeTab === 'withdrawals' && (
              <AdminWithdrawals
                key="withdrawals"
                withdrawals={withdrawals}
                setWithdrawals={setWithdrawals}
                bookings={adminBookings}
                stats={stats}
                loadingData={loadingData}
              />
            )}

            {activeTab === 'package-requests' && <AdminPackageRequests key="package-requests" />}

            {activeTab === 'settings' && <AdminSettings key="settings" />}

            {activeTab === 'coupons' && <AdminCoupons key="coupons" />}

            {activeTab === 'logs' && <AdminLogs key="logs" />}

            {/* DATA TABLE TABS (users, partners, listings, bookings) */}
            {['users', 'partners', 'listings', 'bookings'].includes(activeTab) && (
              <AdminDataTable
                key={activeTab}
                activeTab={activeTab}
                loadingData={loadingData}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filteredData={filteredData}
                dataList={dataList}
                handlers={{
                  handleApproveProperty,
                  handleRejectProperty,
                  handleToggleFeatured,
                  handleUpdatePayout,
                  handleMuteUser,
                  handleApprovePartner,
                  handleDeleteItem,
                  handleCreatePartner,
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
