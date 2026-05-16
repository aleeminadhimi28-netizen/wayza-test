import { useEffect, useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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

  const [stats, setStats] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tickets, setTickets] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [tick, setTick] = useState(0);

  // Live clock tick
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-GB', { hour12: false });

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
      const d = await api.adminGetWithdrawals();
      if (d.ok) setWithdrawals(d.data || []);
    } catch (err) {
      console.error('Failed to load withdrawals:', err);
      showToast('Failed to load withdrawal requests.', 'error');
    }
    setLoadingData(false);
  }, [showToast]);

  const loadTableData = useCallback(async () => {
    if (['overview', 'support', 'withdrawals', 'settings', 'coupons', 'logs'].includes(activeTab))
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

  useEffect(() => {
    if (activeTab === 'support') loadTickets();
    else if (activeTab === 'withdrawals') loadWithdrawals();
    else loadTableData();
  }, [activeTab, loadTickets, loadWithdrawals, loadTableData]);

  if (errorMsg)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#06070f] font-sans p-6 text-white">
        <div className="flex flex-col items-center gap-6 max-w-sm text-center p-10 bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-xl">
          <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center">
            <Shield size={28} />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight mb-1">Access Denied</h1>
            <p className="text-sm text-white/40 font-medium">{errorMsg}</p>
          </div>
          <button
            onClick={() => (window.location.href = '/admin-login')}
            className="h-11 px-6 bg-indigo-600 text-white rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-indigo-700 transition-colors"
          >
            Sign In Again
          </button>
        </div>
      </div>
    );

  if (!stats)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#06070f] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest">
            Loading Command Center...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#06070f] text-white font-sans flex overflow-hidden selection:bg-indigo-900/50 selection:text-indigo-200">
      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-[20%] w-[40%] h-[50%] bg-indigo-600/4 blur-[160px] rounded-full" />
        <div className="absolute bottom-0 right-[10%] w-[35%] h-[40%] bg-violet-600/3 blur-[140px] rounded-full" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.8) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 xl:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`w-64 h-screen bg-black/40 border-r border-white/[0.04] flex flex-col shrink-0 fixed xl:relative z-50 transition-transform duration-300 backdrop-blur-xl ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}`}
      >
        <div className="p-6 mb-2">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveTab('overview')}
          >
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/20">
              <Shield size={16} />
            </div>
            <div>
              <span className="font-black text-white text-base uppercase tracking-tight">
                Wayzza
              </span>
              <p className="text-indigo-400/40 text-[9px] font-bold uppercase tracking-[0.3em] mt-0.5">
                Control
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto space-y-4">
          {TAB_GROUPS.map((group) => (
            <div key={group.label}>
              {group.label !== 'Overview' && (
                <p className="px-3 mb-1.5 text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSearchQuery('');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl font-bold text-[11px] uppercase tracking-wide transition-all ${
                      activeTab === tab.id
                        ? 'bg-white/[0.05] text-white border border-white/[0.05]'
                        : 'text-white/40 hover:bg-white/[0.02] hover:text-white/70 border border-transparent'
                    }`}
                  >
                    <tab.icon
                      size={14}
                      className={activeTab === tab.id ? 'text-indigo-400' : 'text-white/20'}
                    />
                    {tab.label}
                    {tab.id === 'support' && openTickets > 0 && (
                      <span className="ml-auto bg-rose-500/20 text-rose-400 text-[10px] font-black px-1.5 py-0.5 rounded-md">
                        {openTickets}
                      </span>
                    )}
                    {tab.id === 'withdrawals' && pendingWithdrawals > 0 && (
                      <span className="ml-auto bg-amber-500/20 text-amber-400 text-[10px] font-black px-1.5 py-0.5 rounded-md">
                        {pendingWithdrawals}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 mt-auto space-y-3">
          <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-sm shadow-emerald-400/60" />
              <span className="text-[10px] font-black text-white uppercase tracking-wide">
                Secure Link
              </span>
            </div>
            <p className="text-[10px] text-white/20 font-mono tracking-tight">NODE_OK // TLS_1.3</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full h-11 flex items-center justify-center gap-2 bg-rose-500/10 border border-rose-500/10 rounded-xl font-bold text-[11px] uppercase tracking-wider text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 h-screen overflow-y-auto relative z-10">
        {/* HEADER */}
        <header className="sticky top-0 z-50 bg-[#06070f]/80 backdrop-blur-xl border-b border-white/[0.04] px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="xl:hidden w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/60 flex items-center justify-center hover:bg-white/[0.05] transition-colors"
              >
                <Menu size={18} />
              </button>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-white">
                  {activeTab === 'overview'
                    ? 'Dashboard Overview'
                    : activeTab === 'support'
                      ? 'Customer Support'
                      : activeTab === 'withdrawals'
                        ? 'Financial Operations'
                        : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management`}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-widest">
                    Secure Console
                  </span>
                  <span className="text-white/10 font-mono text-[10px]">|</span>
                  <span className="text-white/20 font-mono text-[10px]">{timeStr}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('support')}
                title="View support tickets"
                className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/40 flex items-center justify-center hover:bg-white/[0.05] hover:text-white transition-all relative"
              >
                <Bell size={15} />
                {openTickets > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                )}
              </button>
              <div
                title={user?.email || 'Admin'}
                className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-indigo-600/20 cursor-default"
              >
                {adminInitials}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <AdminOverview stats={stats} setActiveTab={setActiveTab} />
            )}

            {activeTab === 'support' && (
              <AdminSupport
                tickets={tickets}
                setTickets={setTickets}
                loadTickets={loadTickets}
                loadingData={loadingData}
              />
            )}

            {activeTab === 'withdrawals' && (
              <AdminWithdrawals
                withdrawals={withdrawals}
                setWithdrawals={setWithdrawals}
                stats={stats}
                loadingData={loadingData}
              />
            )}

            {activeTab === 'settings' && <AdminSettings />}

            {activeTab === 'coupons' && <AdminCoupons />}

            {activeTab === 'logs' && <AdminLogs />}

            {/* DATA TABLE TABS (users, partners, listings, bookings) */}
            {['users', 'partners', 'listings', 'bookings'].includes(activeTab) && (
              <AdminDataTable
                activeTab={activeTab}
                loadingData={loadingData}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filteredData={filteredData}
                dataList={dataList}
                handlers={{
                  handleApproveProperty,
                  handleRejectProperty,
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
