import { useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext.jsx';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  Zap,
  CheckCircle,
  Shield,
  Database,
  Clock,
  TrendingDown,
  Star,
  Target,
  Award,
} from 'lucide-react';

import { api } from '../../utils/api.js';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

export default function PartnerAnalytics() {
  const { user } = useAuth();
  const [monthly, setMonthly] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;

    Promise.all([
      api.getPartnerMonthlyRevenue(),
      api.getPartnerEarnings(),
      api.getPartnerBookings(),
    ])
      .then(([m, e, b]) => {
        if (m.ok) setMonthly(m.data || []);
        if (e.ok) setEarnings(e);
        setBookings(Array.isArray(b) ? b : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user?.email]);

  // Status breakdown
  const statusMap = { paid: 0, pending: 0, cancelled: 0 };
  bookings.forEach((b) => {
    if (statusMap[b.status] !== undefined) statusMap[b.status]++;
  });
  const pieData = Object.entries(statusMap).map(([name, value]) => ({
    name: name === 'paid' ? 'Confirmed' : name === 'pending' ? 'Pending' : 'Cancelled',
    value,
  }));
  const occupancy = monthly.map((m) => ({ month: m.month, bookings: m.bookings || 0 }));

  // Derived insights
  const totalBookings = bookings.length;
  const paidBookings = bookings.filter((b) => b.status === 'paid').length;
  const conversionRate = totalBookings > 0 ? Math.round((paidBookings / totalBookings) * 100) : 0;
  const avgBookingValue =
    paidBookings > 0 ? Math.round((earnings?.totalRevenue || 0) / paidBookings) : 0;
  const bestMonth =
    monthly.length > 0
      ? monthly.reduce((a, b) => (b.revenue > a.revenue ? b : a), monthly[0])
      : null;

  // MoM growth
  let momGrowth = null;
  if (monthly.length >= 2) {
    const prev = monthly[monthly.length - 2].revenue || 0;
    const curr = monthly[monthly.length - 1].revenue || 0;
    momGrowth = prev > 0 ? Math.round(((curr - prev) / prev) * 100) : 0;
  }

  // Forecast: linear extrapolation of last 2 months
  const chartData = [...monthly];
  if (monthly.length >= 2) {
    const last = monthly[monthly.length - 1];
    const prev = monthly[monthly.length - 2];
    const delta = (last.revenue || 0) - (prev.revenue || 0);
    chartData.push({
      month: 'Forecast',
      revenue: Math.max(0, Math.round((last.revenue || 0) + delta)),
      forecast: true,
    });
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );

  const kpis = [
    {
      label: 'Total Revenue',
      value: `₹${(earnings?.totalRevenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      bg: 'bg-blue-50',
      color: 'text-blue-600',
    },
    {
      label: 'Available to Withdraw',
      value: `₹${(earnings?.availableBalance || 0).toLocaleString()}`,
      icon: CheckCircle,
      bg: 'bg-emerald-50',
      color: 'text-emerald-600',
    },
    {
      label: 'Pending Settlement',
      value: `₹${(earnings?.pendingBalance || 0).toLocaleString()}`,
      icon: Clock,
      bg: 'bg-amber-50',
      color: 'text-amber-600',
    },
    {
      label: 'Already Paid',
      value: `₹${(earnings?.alreadyPaid || 0).toLocaleString()}`,
      icon: Shield,
      bg: 'bg-slate-50',
      color: 'text-slate-600',
    },
  ];

  const insights = [
    {
      label: 'Conversion Rate',
      value: `${conversionRate}%`,
      desc: 'Bookings confirmed vs total',
      icon: Target,
      bg: 'bg-violet-50',
      color: 'text-violet-600',
      trend: conversionRate >= 70 ? 'Excellent' : conversionRate >= 40 ? 'Good' : 'Low',
      trendUp: conversionRate >= 50,
    },
    {
      label: 'Avg. Booking Value',
      value: `₹${avgBookingValue.toLocaleString()}`,
      desc: 'Average revenue per booking',
      icon: Award,
      bg: 'bg-rose-50',
      color: 'text-rose-600',
      trend: avgBookingValue > 5000 ? 'Premium' : 'Standard',
      trendUp: true,
    },
    {
      label: 'Best Month',
      value: bestMonth?.month || '—',
      desc: `₹${(bestMonth?.revenue || 0).toLocaleString()} peak`,
      icon: Star,
      bg: 'bg-amber-50',
      color: 'text-amber-600',
      trend: 'Peak',
      trendUp: true,
    },
    {
      label: 'MoM Growth',
      value: momGrowth !== null ? `${momGrowth > 0 ? '+' : ''}${momGrowth}%` : '—',
      desc: 'Month over month revenue change',
      icon: momGrowth !== null && momGrowth >= 0 ? TrendingUp : TrendingDown,
      bg: momGrowth !== null && momGrowth >= 0 ? 'bg-emerald-50' : 'bg-rose-50',
      color: momGrowth !== null && momGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600',
      trend: momGrowth !== null && momGrowth >= 0 ? 'Growing' : 'Dipping',
      trendUp: momGrowth !== null && momGrowth >= 0,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 font-sans pb-12"
    >
      {/* HEADER */}
      <div>
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide mb-1">
          <Activity size={14} /> Analytics
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Business Insights</h1>
        <p className="text-sm text-slate-500 mt-1">
          Performance metrics and revenue analytics for your properties.
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all"
          >
            <div
              className={`w-10 h-10 rounded-xl ${c.bg} ${c.color} flex items-center justify-center mb-3`}
            >
              <c.icon size={18} />
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-0.5">{c.label}</p>
            <p className="text-xl font-bold text-slate-900">{c.value}</p>
          </motion.div>
        ))}
      </div>

      {/* ADVANCED INSIGHTS */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Zap size={13} className="text-emerald-500" /> Advanced Insights
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {insights.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.07 }}
              className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all"
            >
              <div
                className={`w-10 h-10 rounded-xl ${c.bg} ${c.color} flex items-center justify-center mb-3`}
              >
                <c.icon size={18} />
              </div>
              <p className="text-xs font-semibold text-slate-500 mb-0.5">{c.label}</p>
              <p className="text-xl font-bold text-slate-900">{c.value}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span
                  className={`text-[11px] font-bold ${c.trendUp ? 'text-emerald-600' : 'text-rose-500'}`}
                >
                  {c.trendUp ? '▲' : '▼'} {c.trend}
                </span>
                <span className="text-[11px] text-slate-400">{c.desc}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* REVENUE + FORECAST LINE CHART */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Revenue Trend</h3>
                <p className="text-xs text-slate-400">With 1-month forecast</p>
              </div>
            </div>
            {momGrowth !== null && (
              <span
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${momGrowth >= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}
              >
                {momGrowth >= 0 ? '▲' : '▼'} {Math.abs(momGrowth)}% MoM
              </span>
            )}
          </div>
          {chartData.length > 0 ? (
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: 600,
                      fontSize: '12px',
                      padding: '12px 16px',
                      color: '#fff',
                    }}
                    itemStyle={{ color: '#10b981' }}
                    formatter={(value, name, props) => [
                      `₹${value.toLocaleString()}`,
                      props.payload.forecast ? 'Forecast' : 'Revenue',
                    ]}
                  />
                  <ReferenceLine
                    x="Forecast"
                    stroke="#e2e8f0"
                    strokeDasharray="6 3"
                    label={{ value: 'Projected', fontSize: 10, fill: '#94a3b8', position: 'top' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      return payload.forecast ? (
                        <circle
                          key={cx}
                          cx={cx}
                          cy={cy}
                          r={6}
                          fill="#f1f5f9"
                          stroke="#10b981"
                          strokeWidth={2}
                          strokeDasharray="4 2"
                        />
                      ) : (
                        <circle
                          key={cx}
                          cx={cx}
                          cy={cy}
                          r={5}
                          fill="#fff"
                          stroke="#10b981"
                          strokeWidth={3}
                        />
                      );
                    }}
                    activeDot={{ r: 7, fill: '#10b981', stroke: '#fff', strokeWidth: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-16 text-center">
              <BarChart3 size={28} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No data yet</p>
            </div>
          )}
        </div>

        {/* PIE CHART */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-violet-50 text-violet-600 rounded-lg flex items-center justify-center">
              <PieIcon size={18} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Booking Status</h3>
          </div>
          {pieData.every((d) => d.value === 0) ? (
            <div className="py-16 text-center">
              <Database size={28} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No bookings yet</p>
            </div>
          ) : (
            <div className="h-[300px] relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-xs font-semibold text-slate-500">Conversion</p>
                  <p className="text-2xl font-bold text-slate-900">{conversionRate}%</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    dataKey="value"
                    stroke="none"
                    paddingAngle={8}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: 600,
                      fontSize: '11px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2 flex-wrap">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-xs font-semibold text-slate-500">
                      {d.name} ({d.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* MONTHLY BOOKINGS BAR */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 size={18} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Monthly Bookings</h3>
          </div>
          {occupancy.length > 0 ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancy}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: 600,
                      fontSize: '12px',
                      padding: '12px',
                      color: '#fff',
                    }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="bookings" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={36}>
                    {occupancy.map((_, index) => (
                      <Cell
                        key={index}
                        fill={index === occupancy.length - 1 ? '#3b82f6' : '#e2e8f0'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-sm text-slate-500">No data yet</p>
            </div>
          )}
        </div>

        {/* RECENT BOOKINGS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
              <Activity size={18} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Recent Bookings</h3>
          </div>
          <div className="space-y-2">
            {bookings.slice(0, 6).map((b) => (
              <div
                key={b._id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-9 h-9 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center font-bold text-sm border border-emerald-100">
                  {(b.guestEmail || 'G').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 truncate">
                    {b.guestEmail?.split('@')[0]}
                  </p>
                  <p className="text-xs text-slate-400">{b.checkIn}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${b.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : b.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}
                >
                  {b.status === 'paid' ? 'Confirmed' : b.status}
                </span>
                <span className="text-sm font-bold text-slate-900">
                  ₹{(b.totalPrice || 0).toLocaleString()}
                </span>
              </div>
            ))}
            {bookings.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">No bookings recorded</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
