import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  const [partnerProfile, setPartnerProfile] = useState(null);
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
      api.getPartnerProfile(),
    ])
      .then(([b, e, m, l, profile]) => {
        setBookings(Array.isArray(b) ? b : []);
        if (e.ok) setEarnings(e);
        if (m.ok) setMonthly(m.data || []);
        const listingArr = Array.isArray(l) ? l : [];
        setListings(listingArr);
        if (profile?.ok) setPartnerProfile(profile.data);

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

  const setPriceField = (id, value) =>
    setPriceEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], value, error: null, success: false },
    }));

  const updatePrice = async (listing) => {
    const edit = priceEdits[listing._id];
    if (!edit) return;
    const newPrice = Number(edit.value);
    const floor = listing.baseFloorPrice || 0;

    if (newPrice < floor) {
      setPriceEdits((prev) => ({
        ...prev,
        [listing._id]: {
          ...prev[listing._id],
          error: `Cannot go below floor price ₹${floor.toLocaleString()}`,
        },
      }));
      return;
    }

    setPriceEdits((prev) => ({
      ...prev,
      [listing._id]: { ...prev[listing._id], saving: true, error: null },
    }));
    try {
      const res = await api.updateListing(listing._id, { price: newPrice });
      if (res.ok) {
        setListings((prev) =>
          prev.map((l) => (l._id === listing._id ? { ...l, price: newPrice } : l))
        );
        setPriceEdits((prev) => ({
          ...prev,
          [listing._id]: { value: newPrice, saving: false, error: null, success: true },
        }));
        setTimeout(
          () =>
            setPriceEdits((prev) => ({
              ...prev,
              [listing._id]: { ...prev[listing._id], success: false },
            })),
          3000
        );
      } else {
        setPriceEdits((prev) => ({
          ...prev,
          [listing._id]: {
            ...prev[listing._id],
            saving: false,
            error: res.message || 'Update failed',
          },
        }));
      }
    } catch {
      setPriceEdits((prev) => ({
        ...prev,
        [listing._id]: {
          ...prev[listing._id],
          saving: false,
          error: 'Connection error. Please try again.',
        },
      }));
    }
  };

  const filteredMonthly = (() => {
    if (chartFilter === '6m') return monthly.slice(-6);
    if (chartFilter === '1y') return monthly.slice(-12);
    return monthly;
  })();

  const currRev = monthly.length >= 1 ? monthly[monthly.length - 1]?.revenue || 0 : 0;
  const prevRev = monthly.length >= 2 ? monthly[monthly.length - 2]?.revenue || 0 : 0;
  const revTrendPct = prevRev > 0 ? (((currRev - prevRev) / prevRev) * 100).toFixed(1) : null;
  const revTrendLabel =
    revTrendPct !== null
      ? `${revTrendPct > 0 ? '+' : ''}${revTrendPct}% vs last month`
      : 'No prior data';
  const revTrendUp = revTrendPct === null || Number(revTrendPct) >= 0;

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
  const bookingTrendPct =
    prevBookings > 0 ? (((currBookings - prevBookings) / prevBookings) * 100).toFixed(1) : null;
  const bookingTrendLabel =
    bookingTrendPct !== null
      ? `${bookingTrendPct > 0 ? '+' : ''}${bookingTrendPct}% vs last month`
      : currBookings > 0
        ? `${currBookings} this month`
        : 'No data yet';

  const kpis = [
    {
      label: 'Available Balance',
      value: '₹' + (earnings?.availableBalance || 0).toLocaleString(),
      icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      trend: revTrendLabel,
      up: revTrendUp,
    },
    {
      label: 'Pending Settlement',
      value: '₹' + (earnings?.pendingBalance || 0).toLocaleString(),
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      trend: 'Awaiting stays',
      up: true,
    },
    {
      label: 'Already Paid',
      value: '₹' + (earnings?.alreadyPaid || 0).toLocaleString(),
      icon: CheckCircle,
      bg: 'bg-blue-500/10',
      color: 'text-blue-400',
      trend: 'Fully settled',
      up: true,
    },
    {
      label: 'Total Bookings',
      value: total,
      icon: Users,
      color: 'text-white',
      bg: 'bg-white/10',
      trend: bookingTrendLabel,
      up: bookingTrendPct === null || Number(bookingTrendPct) >= 0,
    },
  ];

  return (
    <div className="min-h-screen bg-[#050a08] font-sans text-white selection:bg-emerald-900/50 selection:text-emerald-200 pb-20">
      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-700/5 blur-[100px] rounded-full" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(52,211,153,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-10 space-y-8">
        {/* ─── PENDING APPROVAL ALERT ─── */}
        {!dismissedAlert && listings.some((l) => !l.approved) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl px-6 py-4 backdrop-blur-sm"
          >
            <div className="w-9 h-9 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <AlertCircle size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-amber-200 text-sm">
                {listings.filter((l) => !l.approved).length} listing
                {listings.filter((l) => !l.approved).length > 1 ? 's' : ''} pending admin approval
              </p>
              <p className="text-white/40 text-xs mt-0.5">
                Properties must be approved before guests can book them.
                {listings
                  .filter((l) => !l.approved)
                  .slice(0, 2)
                  .map((l) => (
                    <a
                      key={l._id}
                      href={`/partner/property/${l._id}`}
                      className="ml-1 underline font-semibold hover:text-amber-400 transition-colors"
                    >
                      {l.title}
                    </a>
                  ))}
              </p>
            </div>
            <button
              onClick={() => setDismissedAlert(true)}
              className="text-white/20 hover:text-white/60 transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}

        {/* ─── HEADER ─── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white/[0.03] border border-white/[0.08] p-8 rounded-3xl backdrop-blur-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-[0.4em]">
              <Sparkles size={12} /> Partner Dashboard
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">
              Welcome back, {partnerProfile?.businessName || user?.email?.split('@')?.[0]}
            </h1>
            <p className="text-white/30 text-sm font-medium">
              Here's what's happening with your properties today.
            </p>
          </div>

          <button
            onClick={() => navigate('/partner/create')}
            className="h-12 px-6 bg-emerald-500 hover:bg-emerald-600 text-[#050a08] rounded-xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20"
          >
            <Plus size={16} strokeWidth={3} />
            <span>Add Property</span>
          </button>
        </div>

        {/* ─── KPI GRID ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {kpis.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/[0.03] border border-white/[0.08] p-6 rounded-2xl backdrop-blur-xl hover:bg-white/[0.05] transition-colors flex flex-col justify-between h-36"
            >
              <div className="flex justify-between items-start">
                <div
                  className={`w-10 h-10 rounded-xl ${c.bg} ${c.color} flex items-center justify-center`}
                >
                  <c.icon size={20} />
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${c.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}
                >
                  {c.up ? (
                    <ArrowUpRight size={10} strokeWidth={3} />
                  ) : (
                    <Clock size={10} strokeWidth={3} />
                  )}
                  {c.trend}
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-white tracking-tight">{c.value}</p>
                <h3 className="text-white/30 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">
                  {c.label}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* ─── REVENUE CHART ─── */}
          <div className="xl:col-span-2 bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                  Revenue Overview
                </h3>
                <p className="text-sm text-white/30 font-medium">Your total earnings over time</p>
              </div>
              <select
                value={chartFilter}
                onChange={(e) => setChartFilter(e.target.value)}
                className="bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs font-bold text-white outline-none cursor-pointer hover:bg-white/[0.08] transition-colors"
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
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#050a08',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                      padding: '12px',
                      fontFamily: 'sans-serif',
                    }}
                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
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
            <div className="bg-gradient-to-br from-emerald-900/50 to-[#050a08] border border-emerald-500/20 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-colors duration-1000" />
              <div className="relative z-10 space-y-4">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight mb-1">
                    Increase Visibility
                  </h3>
                  <p className="text-white/40 text-xs leading-relaxed font-medium">
                    Join the Premium Partner Program to boost your search rankings by up to 45% and
                    access exclusive insights.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/partner/support')}
                  className="w-full h-11 bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.1] rounded-xl font-bold text-[11px] uppercase tracking-wider transition-colors"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                  Quick Links
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: 'Properties',
                    icon: Home,
                    color: 'text-blue-400',
                    bg: 'bg-blue-500/10',
                    path: '/partner/properties',
                  },
                  {
                    label: 'Earnings',
                    icon: DollarSign,
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-500/10',
                    path: '/partner/earnings',
                  },
                  {
                    label: 'Reviews',
                    icon: Star,
                    color: 'text-amber-400',
                    bg: 'bg-amber-500/10',
                    path: '/partner/reviews',
                  },
                  {
                    label: 'Calendar',
                    icon: Calendar,
                    color: 'text-purple-400',
                    bg: 'bg-purple-500/10',
                    path: '/partner/calendar',
                  },
                ].map((a) => (
                  <button
                    key={a.label}
                    onClick={() => navigate(a.path)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-white/[0.1] transition-all text-left"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${a.bg} ${a.color}`}
                    >
                      <a.icon size={14} />
                    </div>
                    <span className="text-[11px] font-bold text-white/70 uppercase tracking-wide">
                      {a.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── TREND PRICE ADJUSTER ─── */}
        {listings.length > 0 && (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl backdrop-blur-xl overflow-hidden">
            <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-[0.3em] mb-1">
                  <TrendingUp size={12} /> Trend Adjuster
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                  Price Manager
                </h3>
                <p className="text-xs text-white/30 font-medium mt-0.5">
                  Adjust your listing prices based on demand trends. Cannot go below floor price.
                </p>
              </div>
            </div>

            <div className="divide-y divide-white/[0.03]">
              {listings.map((lst) => {
                const edit = priceEdits[lst._id] || {
                  value: lst.price || 0,
                  saving: false,
                  error: null,
                  success: false,
                };
                const floor = lst.baseFloorPrice || 0;
                const sliderMax = Math.max(floor * 3, (lst.price || 0) * 3, 5000);
                const pct =
                  sliderMax > floor
                    ? Math.min(100, ((Number(edit.value) - floor) / (sliderMax - floor)) * 100)
                    : 0;
                const isDirty = Number(edit.value) !== lst.price;
                const isBelowFloor = Number(edit.value) < floor;

                return (
                  <div key={lst._id} className="p-6 hover:bg-white/[0.01] transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      {/* Property Info */}
                      <div className="flex items-center gap-4 min-w-0 md:w-64 shrink-0">
                        <div className="w-12 h-12 bg-white/[0.05] border border-white/[0.1] text-white rounded-xl flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                          {(lst.title || 'P').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white text-sm truncate">{lst.title}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Lock size={10} className="text-white/20" />
                            <span className="text-[10px] text-white/20 font-bold uppercase tracking-wide">
                              Floor: ₹{floor.toLocaleString()}
                            </span>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${lst.approved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${lst.approved ? 'bg-emerald-400' : 'bg-amber-400'}`}
                            />
                            {lst.approved ? 'Live' : 'Pending'}
                          </span>
                        </div>
                      </div>

                      {/* Slider */}
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold text-white/20 uppercase tracking-wide">
                          <span>₹{floor.toLocaleString()}</span>
                          <span>₹{sliderMax.toLocaleString()}</span>
                        </div>
                        <div className="relative h-2">
                          <div className="absolute inset-0 rounded-full bg-white/[0.05]" />
                          <div
                            className={`absolute left-0 top-0 h-full rounded-full transition-all ${isBelowFloor ? 'bg-rose-500' : 'bg-emerald-500'}`}
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
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide">
                          <span className={isBelowFloor ? 'text-rose-400' : 'text-white/20'}>
                            {isBelowFloor
                              ? '⚠ Below floor price'
                              : isDirty
                                ? '● Price changed'
                                : 'Current price'}
                          </span>
                          <span className={isDirty ? 'text-emerald-400' : 'text-white/30'}>
                            {isDirty
                              ? `Was ₹${(lst.price || 0).toLocaleString()}`
                              : `₹${(lst.price || 0).toLocaleString()}/night`}
                          </span>
                        </div>
                      </div>

                      {/* Input + Save */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 font-bold text-sm">
                            ₹
                          </span>
                          <input
                            type="number"
                            min={floor}
                            step={100}
                            value={edit.value}
                            onChange={(e) => setPriceField(lst._id, e.target.value)}
                            className={`w-32 h-11 pl-7 pr-3 bg-white/[0.03] border rounded-xl text-sm font-bold outline-none transition-all ${isBelowFloor ? 'border-rose-500/50 focus:ring-1 focus:ring-rose-500' : isDirty ? 'border-emerald-500/50 focus:ring-1 focus:ring-emerald-500' : 'border-white/[0.08] focus:border-white/[0.2]'}`}
                          />
                        </div>
                        <button
                          onClick={() => updatePrice(lst)}
                          disabled={edit.saving || !isDirty || isBelowFloor}
                          className="h-11 px-5 bg-white text-[#050a08] hover:bg-emerald-400 disabled:bg-white/10 disabled:text-white/20 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 transition-all active:scale-[0.98] shadow-sm"
                        >
                          {edit.saving ? (
                            <span className="w-4 h-4 border-2 border-[#050a08]/30 border-t-[#050a08] rounded-full animate-spin" />
                          ) : edit.success ? (
                            <CheckCircle size={14} />
                          ) : (
                            <Save size={14} />
                          )}
                          {edit.saving ? 'Saving' : edit.success ? 'Saved' : 'Update'}
                        </button>
                      </div>
                    </div>

                    {edit.error && (
                      <div className="mt-3 flex items-center gap-2 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                        <AlertCircle size={13} /> {edit.error}
                      </div>
                    )}
                    {edit.success && (
                      <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                        <CheckCircle size={13} /> Price updated successfully.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── RECENT BOOKINGS ─── */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl backdrop-blur-xl overflow-hidden">
          <div className="p-6 border-b border-white/[0.05] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                Recent Bookings
              </h3>
              <p className="text-sm text-white/30 font-medium">
                Monitor your latest guest reservations.
              </p>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"
                  size={14}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search bookings..."
                  className="w-full h-10 bg-white/[0.03] border border-white/[0.08] rounded-lg pl-9 pr-4 text-xs font-medium text-white placeholder:text-white/10 focus:bg-white/[0.05] focus:border-white/[0.15] transition-colors outline-none"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="h-10 bg-white/[0.03] border border-white/[0.08] rounded-lg pl-3 pr-8 text-xs font-bold text-white outline-none cursor-pointer hover:bg-white/[0.05] transition-colors"
              >
                <option value="all">All Status</option>
                <option value="paid">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.01] border-b border-white/[0.05] text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                  <th className="px-6 py-4">Property & Guest</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {visible.slice(0, 8).map((b, i) => (
                  <motion.tr
                    key={b._id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-white/[0.01] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/[0.05] border border-white/[0.1] text-white rounded-lg flex items-center justify-center font-bold shadow-sm">
                          {(b.title || 'W').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm truncate max-w-[200px]">
                            {b.title || 'Untitled Property'}
                          </p>
                          <p className="text-xs text-white/30 font-medium">
                            {b.guestEmail?.split('@')?.[0]}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-white/50">
                      <div className="whitespace-nowrap uppercase tracking-wider">
                        {b.checkIn} <span className="text-white/20 mx-1">→</span> {b.checkOut}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wide w-fit ${b.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : b.status === 'cancelled' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${b.status === 'paid' ? 'bg-emerald-400' : b.status === 'cancelled' ? 'bg-rose-400' : 'bg-amber-400'}`}
                          />
                          {b.status === 'paid'
                            ? 'Confirmed'
                            : b.status === 'cancelled'
                              ? 'Cancelled'
                              : 'Pending'}
                        </span>
                        {b.status === 'paid' && (
                          <span
                            className={`text-[9px] font-black uppercase tracking-wider ${b.payoutStatus === 'paid_out' ? 'text-blue-400' : 'text-amber-400'}`}
                          >
                            Payout: {b.payoutStatus === 'paid_out' ? 'Settled' : 'Pending'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-black text-white text-sm">
                        ₹{Math.round(b.netEarnings || 0).toLocaleString()}
                      </p>
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                        Partner Share
                      </p>
                    </td>
                  </motion.tr>
                ))}

                {visible.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <Activity size={24} className="mx-auto text-white/10 mb-3" />
                      <p className="text-xs font-bold text-white/30 uppercase tracking-widest">
                        No bookings found
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* View All Link */}
          {bookings.length > 8 && (
            <div className="px-6 py-4 border-t border-white/[0.05] flex justify-between items-center">
              <p className="text-xs text-white/30 font-medium">
                Showing 8 of <span className="font-bold text-white/50">{bookings.length}</span>{' '}
                bookings
              </p>
              <button
                onClick={() => navigate('/partner/bookings')}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors uppercase tracking-wider"
              >
                View all bookings <ArrowUpRight size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
