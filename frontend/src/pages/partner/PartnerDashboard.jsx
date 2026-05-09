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
} from 'lucide-react';
import VerificationSpinner from '../../components/VerificationSpinner.jsx';

import { api } from '../../utils/api.js';

export default function PartnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Cinematic delay for system handshaking
    setTimeout(() => {
      Promise.all([
        api.getPartnerBookings(),
        api.getPartnerEarnings(),
        api.getPartnerMonthlyRevenue(),
      ])
        .then(([b, e, m]) => {
          setBookings(Array.isArray(b) ? b : []);
          if (e.ok) setEarnings(e);
          if (m.ok) setMonthly(m.data || []);
        })
        .catch((err) => console.error('Failed to load partner dashboard data:', err))
        .finally(() => setLoading(false));
    }, 800);
  }, []);

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

  const kpis = [
    {
      label: 'Available Balance',
      value: '₹' + (earnings?.availableBalance || 0).toLocaleString(),
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      trend: 'Ready to transfer',
      up: true,
    },
    {
      label: 'Pending Settlement',
      value: '₹' + (earnings?.pendingBalance || 0).toLocaleString(),
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      trend: 'Upcoming stays',
      up: true,
    },
    {
      label: 'Already Paid',
      value: '₹' + (earnings?.alreadyPaid || 0).toLocaleString(),
      icon: CheckCircle,
      bg: 'bg-blue-50',
      color: 'text-blue-600',
      trend: 'Settled',
      up: true,
    },
    {
      label: 'Total Bookings',
      value: total,
      icon: Users,
      color: 'text-slate-900',
      bg: 'bg-slate-50',
      trend: 'All time',
      up: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-20"
    >
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide">
            <Sparkles size={14} /> Partner Dashboard
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user?.email?.split('@')[0]}
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
            <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer hover:bg-slate-100 transition-colors">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}>
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
              <button className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs transition-colors">
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
                        <p className="text-xs text-slate-500">{b.guestEmail?.split('@')[0]}</p>
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
                      ₹{Math.round(b.netEarnings || b.totalPrice * 0.9).toLocaleString()}
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
      </div>
    </motion.div>
  );
}
