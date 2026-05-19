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
  Sparkles,
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
      <div className="flex items-center justify-center min-h-[400px] bg-[#050a08]">
        <div className="w-10 h-10 border-2 border-white/10 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );

  const kpis = [
    {
      label: 'Total Revenue',
      value: `₹${(earnings?.totalRevenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      bg: 'bg-blue-500/10',
      color: 'text-blue-400',
    },
    {
      label: 'Available to Withdraw',
      value: `₹${(earnings?.availableBalance || 0).toLocaleString()}`,
      icon: CheckCircle,
      bg: 'bg-emerald-500/10',
      color: 'text-emerald-400',
    },
    {
      label: 'Pending Settlement',
      value: `₹${(earnings?.pendingBalance || 0).toLocaleString()}`,
      icon: Clock,
      bg: 'bg-amber-500/10',
      color: 'text-amber-400',
    },
    {
      label: 'Already Paid',
      value: `₹${(earnings?.alreadyPaid || 0).toLocaleString()}`,
      icon: Shield,
      bg: 'bg-white/10',
      color: 'text-white',
    },
  ];

  const insights = [
    {
      label: 'Conversion Rate',
      value: `${conversionRate}%`,
      desc: 'Bookings confirmed vs total',
      icon: Target,
      bg: 'bg-violet-500/10',
      color: 'text-violet-400',
      trend: conversionRate >= 70 ? 'Excellent' : conversionRate >= 40 ? 'Good' : 'Low',
      trendUp: conversionRate >= 50,
    },
    {
      label: 'Avg. Booking Value',
      value: `₹${avgBookingValue.toLocaleString()}`,
      desc: 'Average revenue per booking',
      icon: Award,
      bg: 'bg-rose-500/10',
      color: 'text-rose-400',
      trend: avgBookingValue > 5000 ? 'Premium' : 'Standard',
      trendUp: true,
    },
    {
      label: 'Best Month',
      value: bestMonth?.month || '—',
      desc: `₹${(bestMonth?.revenue || 0).toLocaleString()} peak`,
      icon: Star,
      bg: 'bg-amber-500/10',
      color: 'text-amber-400',
      trend: 'Peak',
      trendUp: true,
    },
    {
      label: 'MoM Growth',
      value: momGrowth !== null ? `${momGrowth > 0 ? '+' : ''}${momGrowth}%` : '—',
      desc: 'Month over month revenue change',
      icon: momGrowth !== null && momGrowth >= 0 ? TrendingUp : TrendingDown,
      bg: momGrowth !== null && momGrowth >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10',
      color: momGrowth !== null && momGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400',
      trend: momGrowth !== null && momGrowth >= 0 ? 'Growing' : 'Dipping',
      trendUp: momGrowth !== null && momGrowth >= 0,
    },
  ];

  const tooltipStyle = {
    background: '#050a08',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '11px',
    padding: '12px',
    fontFamily: 'sans-serif',
  };

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
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white/[0.03] border border-white/[0.08] p-8 rounded-3xl backdrop-blur-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-[0.4em]">
              <Sparkles size={12} /> Analytics
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">
              Business <span className="text-emerald-400">Insights</span>
            </h1>
            <p className="text-white/30 text-sm font-medium">
              Performance metrics and revenue analytics for your properties.
            </p>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {kpis.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white/[0.03] border border-white/[0.08] p-6 rounded-2xl backdrop-blur-xl hover:bg-white/[0.05] transition-colors"
            >
              <div
                className={`w-11 h-11 rounded-xl ${c.bg} ${c.color} flex items-center justify-center mb-4`}
              >
                <c.icon size={20} />
              </div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">
                {c.label}
              </p>
              <p className="text-2xl font-black text-white tracking-tight">{c.value}</p>
            </motion.div>
          ))}
        </div>

        {/* ADVANCED INSIGHTS */}
        <div>
          <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <Zap size={12} className="text-emerald-400" /> Advanced Insights
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {insights.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className="bg-white/[0.03] border border-white/[0.08] p-5 rounded-2xl backdrop-blur-xl hover:bg-white/[0.05] transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${c.bg} ${c.color} flex items-center justify-center mb-3`}
                >
                  <c.icon size={18} />
                </div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-0.5">
                  {c.label}
                </p>
                <p className="text-xl font-black text-white">{c.value}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span
                    className={`text-[11px] font-bold ${c.trendUp ? 'text-emerald-400' : 'text-rose-400'}`}
                  >
                    {c.trendUp ? '▲' : '▼'} {c.trend}
                  </span>
                  <span className="text-[11px] text-white/20">{c.desc}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* REVENUE + FORECAST LINE CHART */}
          <div className="xl:col-span-2 bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">
                    Revenue Trend
                  </h3>
                  <p className="text-xs text-white/30 font-medium">With 1-month forecast</p>
                </div>
              </div>
              {momGrowth !== null && (
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${momGrowth >= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}
                >
                  {momGrowth >= 0 ? '▲' : '▼'} {Math.abs(momGrowth)}% MoM
                </span>
              )}
            </div>
            {chartData.length > 0 ? (
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
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
                      tickFormatter={(val) => `₹${val}`}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                      formatter={(value, name, props) => [
                        `₹${value.toLocaleString()}`,
                        props.payload.forecast ? 'Forecast' : 'Revenue',
                      ]}
                    />
                    <ReferenceLine
                      x="Forecast"
                      stroke="rgba(255,255,255,0.1)"
                      strokeDasharray="6 3"
                      label={{
                        value: 'Projected',
                        fontSize: 10,
                        fill: 'rgba(255,255,255,0.3)',
                        position: 'top',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        return payload.forecast ? (
                          <circle
                            key={`dot-${cx}`}
                            cx={cx}
                            cy={cy}
                            r={6}
                            fill="#050a08"
                            stroke="#10b981"
                            strokeWidth={2}
                            strokeDasharray="4 2"
                          />
                        ) : (
                          <circle
                            key={`dot-${cx}`}
                            cx={cx}
                            cy={cy}
                            r={4}
                            fill="#050a08"
                            stroke="#10b981"
                            strokeWidth={2}
                          />
                        );
                      }}
                      activeDot={{ r: 6, fill: '#10b981', stroke: '#050a08', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-16 text-center">
                <BarChart3 size={28} className="text-white/10 mx-auto mb-2" />
                <p className="text-sm font-bold text-white/30 uppercase tracking-widest">
                  No data yet
                </p>
              </div>
            )}
          </div>

          {/* PIE CHART */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-violet-500/10 text-violet-400 rounded-xl flex items-center justify-center">
                <PieIcon size={18} />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                Booking Status
              </h3>
            </div>
            {pieData.every((d) => d.value === 0) ? (
              <div className="py-16 text-center">
                <Database size={28} className="text-white/10 mx-auto mb-2" />
                <p className="text-sm font-bold text-white/30 uppercase tracking-widest">
                  No bookings yet
                </p>
              </div>
            ) : (
              <div className="h-[280px] relative">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      Conversion
                    </p>
                    <p className="text-2xl font-black text-white">{conversionRate}%</p>
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
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2 flex-wrap">
                  {pieData.map((d, i) => (
                    <div key={`legend-${i}`} className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="text-[11px] font-bold text-white/40">
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
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center">
                <BarChart3 size={18} />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                Monthly Bookings
              </h3>
            </div>
            {occupancy.length > 0 ? (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={occupancy}>
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
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    />
                    <Bar dataKey="bookings" radius={[6, 6, 0, 0]} barSize={36}>
                      {occupancy.map((_, index) => (
                        <Cell
                          key={`bar-${index}`}
                          fill={
                            index === occupancy.length - 1 ? '#3b82f6' : 'rgba(255,255,255,0.08)'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-sm font-bold text-white/30 uppercase tracking-widest">
                  No data yet
                </p>
              </div>
            )}
          </div>

          {/* RECENT BOOKINGS */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center">
                <Activity size={18} />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                Recent Bookings
              </h3>
            </div>
            <div className="space-y-2">
              {bookings.slice(0, 6).map((b) => (
                <div
                  key={b._id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors"
                >
                  <div className="w-9 h-9 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center font-bold text-sm border border-emerald-500/20">
                    {(b.guestEmail || 'G').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white truncate">
                      {b.guestEmail?.split('@')?.[0]}
                    </p>
                    <p className="text-xs text-white/30 font-medium">{b.checkIn}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border ${b.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : b.status === 'cancelled' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}
                  >
                    {b.status === 'paid' ? 'Confirmed' : b.status}
                  </span>
                  <span className="text-sm font-black text-white">
                    ₹{(b.netEarnings || b.totalPrice || 0).toLocaleString()}
                  </span>
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="py-10 text-center">
                  <Activity size={24} className="text-white/10 mx-auto mb-3" />
                  <p className="text-xs font-bold text-white/30 uppercase tracking-widest">
                    No bookings recorded
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
