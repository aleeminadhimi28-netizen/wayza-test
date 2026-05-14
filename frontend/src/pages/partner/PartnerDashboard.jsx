import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext.jsx';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Users,
  Home,
  Activity,
  Search,
  Plus,
  DollarSign,
  Star,
  Calendar,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Sparkles,
  AlertCircle,
  X,
  TrendingUp,
  Lock,
  Save,
} from 'lucide-react';
import VerificationSpinner from '../../components/VerificationSpinner.jsx';

import { api } from '../../utils/api.js';

export default function PartnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [dismissedAlert, setDismissedAlert] = useState(false);
  const [priceEdits, setPriceEdits] = useState({});
  const [chartFilter, setChartFilter] = useState('6m');

  useEffect(() => {
    if (!user?.email) return;
    window.scrollTo(0, 0);

    Promise.all([
      api.getPartnerBookings(),
      api.getPartnerEarnings(),
      api.getPartnerMonthlyRevenue(),
      api.getOwnerListings(user.email),
    ])
      .then(([b, e, m, l]) => {
        setBookings(Array.isArray(b) ? b : []);
        if (e.ok) setEarnings(e);
        if (m.ok) setMonthly(m.data || []);
        const listingArr = Array.isArray(l) ? l : [];
        setListings(listingArr);
        // Initialise price editor state from fetched listings
        const initEdits = {};
        listingArr.forEach((lst) => {
          initEdits[lst._id] = {
            value: lst.price || 0,
            saving: false,
            error: null,
            success: false,
          };
        });
        setPriceEdits(initEdits);
      })
      .catch((err) => console.error('Failed to load partner dashboard data:', err))
      .finally(() => setLoading(false));
  }, [user?.email]);

  const total = bookings.length;
  const pending = bookings.filter((b) => b.status === 'pending').length;
  const activeCount = bookings.filter((b) => b.status === 'paid').length;

  const visible = bookings.filter((b) => {
    const matchStatus = filter === 'all' || b.status === filter;
    const matchSearch =
      !search ||
      b.guestEmail?.toLowerCase().includes(search.toLowerCase()) ||
      b.title?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (loading)
    return (
      <VerificationSpinner
        message="Synchronizing Partner Network..."
        subtext="Accessing Management Suite"
      />
    );

  // ─── TREND ADJUSTER: update a single listing price ───────────────────────
  const setPriceField = (id, value) =>
    setPriceEdits((prev) => ({ ...prev, [id]: { ...prev[id], value, error: null, success: false } }));

  const updatePrice = async (listing) => {
    const edit = priceEdits[listing._id];
    if (!edit) return;
    const newPrice = Number(edit.value);
    const floor = listing.baseFloorPrice || 0;

    if (newPrice < floor) {
      setPriceEdits((prev) => ({
        ...prev,
        [listing._id]: { ...prev[listing._id], error: `Cannot go below floor price ₹${floor.toLocaleString()}` },
      }));
      return;
    }

    setPriceEdits((prev) => ({ ...prev, [listing._id]: { ...prev[listing._id], saving: true, error: null } }));
    try {
      const res = await api.updateListing(listing._id, { price: newPrice });
      if (res.ok) {
        setListings((prev) => prev.map((l) => l._id === listing._id ? { ...l, price: newPrice } : l));
        setPriceEdits((prev) => ({ ...prev, [listing._id]: { value: newPrice, saving: false, error: null, success: true } }));
        setTimeout(() => setPriceEdits((prev) => ({ ...prev, [listing._id]: { ...prev[listing._id], success: false } })), 3000);
      } else {
        setPriceEdits((prev) => ({ ...prev, [listing._id]: { ...prev[listing._id], saving: false, error: res.message || 'Update failed' } }));
      }
    } catch {
      setPriceEdits((prev) => ({ ...prev, [listing._id]: { ...prev[listing._id], saving: false, error: 'Connection error. Please try again.' } }));
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  // ─── CHART FILTER & REAL KPI TRENDS ─────────────────────────────────────
  const filteredMonthly = (() => {
    if (chartFilter === '6m') return monthly.slice(-6);
    if (chartFilter === '1y') return monthly.slice(-12);
    return monthly;
  })();

  // Month-over-month revenue trend
  const currRev = monthly.length >= 1 ? monthly[monthly.length - 1]?.revenue || 0 : 0;
  const prevRev = monthly.length >= 2 ? monthly[monthly.length - 2]?.revenue || 0 : 0;
  const revTrendPct = prevRev > 0
    ? ((currRev - prevRev) / prevRev * 100).toFixed(1)
    : null;
  const revTrendLabel = revTrendPct !== null
    ? `${revTrendPct > 0 ? '+' : ''}${revTrendPct}% vs last month`
    : 'No prior data';
  const revTrendUp = revTrendPct === null || Number(revTrendPct) >= 0;

  // Booking count trend
  const currBookings = bookings.filter((b) => {
    const d = new Date(b.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const prevBookings = bookings.filter((b) => {
    const d = new Date(b.createdAt);
    const prev = new Date();
    prev.setMonth(prev.getMonth() - 1);
    return d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear();
  }).length;
  const bookingTrendPct = prevBookings > 0
    ? ((currBookings - prevBookings) / prevBookings * 100).toFixed(1)
    : null;
  const bookingTrendLabel = bookingTrendPct !== null
    ? `${bookingTrendPct > 0 ? '+' : ''}${bookingTrendPct}% vs last month`
    : currBookings > 0 ? `${currBookings} this month` : 'No data yet';
  // ─────────────────────────────────────────────────────────────────────────

  const kpis = [
    {
      label: 'Available Balance',
      value: '₹' + (earnings?.availableBalance || 0).toLocaleString(),
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      trend: revTrendLabel,
      up: revTrendUp,
    },
    {
      label: 'Pending Settlement',
      value: '₹' + (earnings?.pendingBalance || 0).toLocaleString(),
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      trend: 'Awaiting stays',
      up: true,
    },
    {
      label: 'Already Paid',
      value: '₹' + (earnings?.alreadyPaid || 0).toLocaleString(),
      icon: CheckCircle,
      bg: 'bg-blue-50',
      color: 'text-blue-600',
      trend: 'Fully settled',
      up: true,
    },
    {
      label: 'Total Bookings',
      value: total,
      icon: Users,
      color: 'text-slate-900',
      bg: 'bg-slate-50',
      trend: bookingTrendLabel,
      up: bookingTrendPct === null || Number(bookingTrendPct) >= 0,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-20"
    >
      {/* ─── PENDING APPROVAL ALERT ─── */}
      {!dismissedAlert && listings.some((l) => !l.approved) && (
        <div className="flex items-start gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4">
          <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
            <AlertCircle size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-amber-900 text-sm">
              {listings.filter((l) => !l.approved).length} listing{listings.filter((l) => !l.approved).length > 1 ? 's' : ''} pending admin approval
            </p>
            <p className="text-amber-700 text-xs mt-0.5">
              Properties must be approved before guests can book them.
              {listings.filter((l) => !l.approved).slice(0, 2).map((l) => (
                <a
                  key={l._id}
                  href={`/partner/property/${l._id}`}
                  className="ml-1 underline font-semibold hover:text-amber-900"
                >
                  {l.title}
                </a>
              ))}
            </p>
          </div>
          <button
            onClick={() => setDismissedAlert(true)}
            className="text-amber-400 hover:text-amber-700 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide">
            <Sparkles size={14} /> Partner Dashboard
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user?.email?.split('@')?.[0]}
          </h1>
          <p className="text-slate-500 text-sm">
            Here's what's happening with your properties today.
          </p>
        </div>

        <button
          onClick={() => navigate('/partner/create')}
          className="h-11 px-6 bg-slate-900 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors shadow-md active:scale-95 whitespace-nowrap"
        >
          <Plus size={16} />
          <span>Add Property</span>
        </button>
      </div>

      {/* ─── KPI GRID ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:border-emerald-300 transition-colors flex flex-col justify-between h-36"
          >
            <div className="flex justify-between items-start">
              <div
                className={`w-10 h-10 rounded-xl ${c.bg} ${c.color} flex items-center justify-center`}
              >
                <c.icon size={20} />
              </div>
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${c.up ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}
              >
                {c.up ? (
                  <ArrowUpRight size={12} strokeWidth={3} />
                ) : (
                  <Clock size={12} strokeWidth={3} />
                )}
                {c.trend}
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{c.value}</p>
              <h3 className="text-slate-500 font-medium text-xs mt-0.5">{c.label}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ─── REVENUE CHART ─── */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Revenue Overview</h3>
              <p className="text-sm text-slate-500">Your total earnings over time</p>
            </div>
            <select
              value={chartFilter}
              onChange={(e) => setChartFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option value="6m">Last 6 Months</option>
              <option value="1y">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredMonthly}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    padding: '12px',
                  }}
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ─── SIDEBAR WIDGETS ─── */}
        <div className="space-y-6">
          {/* Promo Widget */}
          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 blur-2xl group-hover:bg-emerald-500/40 transition-colors duration-1000" />
            <div className="relative z-10 space-y-4">
              <div className="hidden sm:block">
                <h3 className="text-xl font-bold mb-1">Increase Visibility</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Join the Premium Partner Program to boost your search rankings by up to 45% and
                  access exclusive insights.
                </p>
              </div>
              <button
                onClick={() => navigate('/partner/support')}
                className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-slate-900">Quick Links</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: 'Properties',
                  icon: Home,
                  color: 'bg-blue-50 text-blue-600',
                  path: '/partner/properties',
                },
                {
                  label: 'Earnings',
                  icon: DollarSign,
                  color: 'bg-emerald-50 text-emerald-600',
                  path: '/partner/earnings',
                },
                {
                  label: 'Reviews',
                  icon: Star,
                  color: 'bg-amber-50 text-amber-600',
                  path: '/partner/reviews',
                },
                {
                  label: 'Calendar',
                  icon: Calendar,
                  color: 'bg-purple-50 text-purple-600',
                  path: '/partner/calendar',
                },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={() => navigate(a.path)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-200 transition-all text-left"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${a.color} shadow-sm`}
                  >
                    <a.icon size={16} />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── TREND PRICE ADJUSTER ─── */}
      {listings.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide mb-1">
                <TrendingUp size={14} /> Trend Adjuster
              </div>
              <h3 className="text-lg font-bold text-slate-900">Price Manager</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Adjust your listing prices based on demand trends. Cannot go below the floor price set at creation.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {listings.map((lst) => {
              const edit = priceEdits[lst._id] || { value: lst.price || 0, saving: false, error: null, success: false };
              const floor = lst.baseFloorPrice || 0;
              const sliderMax = Math.max(floor * 3, (lst.price || 0) * 3, 5000);
              const pct = sliderMax > floor ? Math.min(100, ((Number(edit.value) - floor) / (sliderMax - floor)) * 100) : 0;
              const isDirty = Number(edit.value) !== lst.price;
              const isBelowFloor = Number(edit.value) < floor;

              return (
                <div key={lst._id} className="p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">

                    {/* Property Info */}
                    <div className="flex items-center gap-4 min-w-0 md:w-64 shrink-0">
                      <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                        {(lst.title || 'P').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{lst.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Lock size={10} className="text-slate-400" />
                          <span className="text-[11px] text-slate-400 font-semibold">
                            Floor: ₹{floor.toLocaleString()}/night
                          </span>
                        </div>
                        <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                          lst.approved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${lst.approved ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                          {lst.approved ? 'Live' : 'Pending Approval'}
                        </span>
                      </div>
                    </div>

                    {/* Slider */}
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                        <span>₹{floor.toLocaleString()} <span className="text-slate-300 font-normal">(floor)</span></span>
                        <span>₹{sliderMax.toLocaleString()}</span>
                      </div>
                      <div className="relative h-2">
                        <div className="absolute inset-0 rounded-full bg-slate-100" />
                        <div
                          className={`absolute left-0 top-0 h-full rounded-full transition-all ${
                            isBelowFloor ? 'bg-rose-400' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.max(0, pct)}%` }}
                        />
                        <input
                          type="range"
                          min={floor}
                          max={sliderMax}
                          step={50}
                          value={Number(edit.value)}
                          onChange={(e) => setPriceField(lst._id, e.target.value)}
                          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                        />
                      </div>
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className={isBelowFloor ? 'text-rose-500' : 'text-slate-400'}>
                          {isBelowFloor ? '⚠ Below floor price' : isDirty ? '● Price changed' : 'Current price'}
                        </span>
                        <span className={isDirty ? 'text-emerald-600' : 'text-slate-400'}>
                          {isDirty ? `Was ₹${(lst.price || 0).toLocaleString()}` : `₹${(lst.price || 0).toLocaleString()}/night`}
                        </span>
                      </div>
                    </div>

                    {/* Input + Save */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                        <input
                          type="number"
                          min={floor}
                          step={100}
                          value={edit.value}
                          onChange={(e) => setPriceField(lst._id, e.target.value)}
                          className={`w-32 h-11 pl-7 pr-3 border rounded-xl text-sm font-bold outline-none transition-all ${
                            isBelowFloor
                              ? 'border-rose-300 bg-rose-50 text-rose-700 focus:ring-2 focus:ring-rose-200'
                              : isDirty
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 focus:ring-2 focus:ring-emerald-200'
                                : 'border-slate-200 bg-white text-slate-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                          }`}
                        />
                      </div>
                      <button
                        onClick={() => updatePrice(lst)}
                        disabled={edit.saving || !isDirty || isBelowFloor}
                        className="h-11 px-5 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl font-semibold text-xs flex items-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shadow-sm"
                      >
                        {edit.saving ? (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : edit.success ? (
                          <CheckCircle size={14} />
                        ) : (
                          <Save size={14} />
                        )}
                        {edit.saving ? 'Saving...' : edit.success ? 'Saved!' : 'Update'}
                      </button>
                    </div>
                  </div>

                  {edit.error && (
                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                      <AlertCircle size={13} /> {edit.error}
                    </div>
                  )}
                  {edit.success && (
                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                      <CheckCircle size={13} /> Price updated to ₹{Number(edit.value).toLocaleString()}/night. Guests will now see the new price.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── RECENT BOOKINGS ─── */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Bookings</h3>
            <p className="text-sm text-slate-500">Monitor your latest guest reservations.</p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 text-sm focus:bg-white focus:border-emerald-500 transition-colors outline-none"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-10 bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 text-sm font-medium outline-none focus:bg-white focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All status</option>
              <option value="paid">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Property & Guest</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.slice(0, 8).map((b, i) => (
                <motion.tr
                  key={b._id || i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold shadow-sm">
                        {(b.title || 'W').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm truncate max-w-[200px]">
                          {b.title || 'Untitled Property'}
                        </p>
                        <p className="text-xs text-slate-500">{b.guestEmail?.split('@')?.[0]}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="whitespace-nowrap">
                      {b.checkIn} <span className="text-slate-300 mx-1">→</span> {b.checkOut}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                          b.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : b.status === 'cancelled'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${b.status === 'paid' ? 'bg-emerald-500' : b.status === 'cancelled' ? 'bg-rose-500' : 'bg-amber-500'}`}
                        />
                        {b.status === 'paid'
                          ? 'Confirmed'
                          : b.status === 'cancelled'
                            ? 'Cancelled'
                            : 'Pending'}
                      </span>
                      {b.status === 'paid' && (
                        <span
                          className={`text-[11px] font-bold uppercase ${b.payoutStatus === 'paid_out' ? 'text-blue-500' : 'text-amber-500'}`}
                        >
                          Payout: {b.payoutStatus === 'paid_out' ? 'Settled' : 'Pending'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-bold text-slate-900">
                      ₹{Math.round(b.netEarnings || 0).toLocaleString()}
                    </p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      Partner Share
                    </p>
                  </td>
                </motion.tr>
              ))}

              {visible.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <Activity size={32} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-semibold text-slate-900">No bookings found</p>
                    <p className="text-xs text-slate-500 mt-1">Try adjusting your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* View All Link */}
        {bookings.length > 8 && (
          <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center">
            <p className="text-xs text-slate-500">
              Showing 8 of <span className="font-bold text-slate-700">{bookings.length}</span> bookings
            </p>
            <button
              onClick={() => navigate('/partner/bookings')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-colors"
            >
              View all bookings <ArrowUpRight size={13} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
