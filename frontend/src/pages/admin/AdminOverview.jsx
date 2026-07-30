import { motion } from 'framer-motion';
import {
  Users,
  Briefcase,
  Clock,
  TrendingUp,
  CalendarCheck,
  CheckCircle,
  ArrowUpRight,
  Tag,
  Banknote,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AdminOverview({ stats, setActiveTab }) {
  const kpiCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      bg: 'bg-emerald-500/10',
      color: 'text-emerald-400',
      trend: 'All time',
      up: true,
    },
    {
      title: 'Partners',
      value: stats.totalPartners,
      icon: Briefcase,
      bg: 'bg-teal-500/10',
      color: 'text-teal-400',
      trend: 'Active',
      up: true,
    },
    {
      title: 'Pending Approval',
      value: stats.pendingListings || 0,
      icon: Clock,
      bg: 'bg-amber-500/10',
      color: 'text-amber-400',
      trend: 'Needs review',
      up: false,
    },
    {
      title: 'Platform Revenue',
      value: `₹${(stats.platformCommission || 0).toLocaleString()}`,
      icon: TrendingUp,
      bg: 'bg-emerald-500/10',
      color: 'text-emerald-400',
      trend: 'Fee + Comm',
      up: true,
    },
    {
      title: 'TCS Collected',
      value: `₹${(stats.totalTcs || 0).toLocaleString()}`,
      icon: Tag,
      bg: 'bg-rose-500/10',
      color: 'text-rose-400',
      trend: '1% Deducted',
      up: true,
    },
    {
      title: 'Admin Wallet',
      value: `₹${(stats.totalPlatformShare || 0).toLocaleString()}`,
      icon: Banknote,
      bg: 'bg-cyan-500/10',
      color: 'text-cyan-400',
      trend: 'Total Share',
      up: true,
    },
  ];

  return (
    <motion.div
      key="ov"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 dash-fade-1">
        {kpiCards.map((card, i) => (
          <div
            key={i}
            className="dash-kpi-card p-5 rounded-xl transition-all hover:border-[var(--dash-accent-border)] hover:shadow-lg"
            style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-card-border)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10.5px] font-medium" style={{ color: 'var(--dash-text-3)' }}>
                {card.title}
              </p>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${card.bg}`}>
                <card.icon size={14} className={card.color} />
              </div>
            </div>
            <div className="h-px mb-2.5" style={{ background: 'var(--dash-divider)' }} />
            <p
              className="text-[24px] font-semibold tracking-tight leading-none mb-2"
              style={{ color: 'var(--dash-text-1)' }}
            >
              {card.value}
            </p>
            <p
              className="text-[10px] font-medium"
              style={{ color: card.up ? 'var(--dash-accent)' : 'var(--dash-warning)' }}
            >
              {card.up ? '↑ ' : ''}
              {card.trend}
            </p>
          </div>
        ))}
      </div>

      {/* QUICK ACTION SHORTCUTS */}
      <div
        className="p-4 rounded-xl flex flex-wrap items-center justify-between gap-3"
        style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-card-border)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--dash-accent)' }} />
          <span
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: 'var(--dash-text-2)' }}
          >
            Quick Actions:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('listings')}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all"
            style={{
              background: 'var(--dash-accent-dim)',
              color: 'var(--dash-accent)',
              border: '1px solid var(--dash-accent-border)',
            }}
          >
            <CheckCircle size={12} /> Review Inventory ({stats.pendingListings || 0})
          </button>
          <button
            onClick={() => setActiveTab('partners')}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all"
            style={{
              background: 'rgba(128,128,128,0.06)',
              color: 'var(--dash-text-2)',
              border: '1px solid var(--dash-card-border)',
            }}
          >
            <Briefcase size={12} /> Manage Partners
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all"
            style={{
              background: 'rgba(128,128,128,0.06)',
              color: 'var(--dash-text-2)',
              border: '1px solid var(--dash-card-border)',
            }}
          >
            <Banknote size={12} /> Payout Operations
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all"
            style={{
              background: 'rgba(128,128,128,0.06)',
              color: 'var(--dash-text-2)',
              border: '1px solid var(--dash-card-border)',
            }}
          >
            <Tag size={12} /> Promotions
          </button>
        </div>
      </div>

      {/* CHART + ACTIVITY */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 dash-fade-2">
        {/* REVENUE CHART */}
        <div
          className="xl:col-span-2 dash-chart-card p-6 rounded-xl"
          style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-card-border)' }}
        >
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-[13px] font-semibold" style={{ color: 'var(--dash-text-1)' }}>
                Revenue Overview
              </h3>
              <p
                className="text-[10.5px] font-medium mt-0.5"
                style={{ color: 'var(--dash-text-3)' }}
              >
                Monthly platform earnings
              </p>
            </div>
          </div>
          <div className="h-[300px]">
            {!stats.monthlyRevenue || stats.monthlyRevenue.length === 0 ? (
              <div
                className="w-full h-full flex flex-col items-center justify-center rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--dash-divider)',
                }}
              >
                <TrendingUp
                  size={28}
                  style={{ color: 'var(--dash-text-3)', marginBottom: '8px' }}
                />
                <p
                  className="text-[11px] font-medium uppercase tracking-widest"
                  style={{ color: 'var(--dash-text-3)' }}
                >
                  No revenue data yet
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--dash-divider)"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--dash-text-3)', fontSize: 10, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--dash-text-3)', fontSize: 10, fontWeight: 500 }}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      background: 'var(--dash-sidebar)',
                      border: '1px solid var(--dash-card-border)',
                      borderRadius: '8px',
                      fontSize: '11px',
                      padding: '10px 14px',
                      color: 'var(--dash-text-1)',
                    }}
                    itemStyle={{ color: 'var(--dash-accent)', fontWeight: 600 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rev"
                    stroke="#10b981"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#colorEmerald)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div
          className="p-6 rounded-xl flex flex-col"
          style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-card-border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-semibold" style={{ color: 'var(--dash-text-1)' }}>
              Recent Activity
            </h3>
            <span
              className="text-[10.5px] font-semibold cursor-pointer transition-opacity hover:opacity-70"
              style={{ color: 'var(--dash-accent)' }}
              onClick={() => setActiveTab('bookings')}
            >
              View all
            </span>
          </div>
          <div className="space-y-0.5 flex-1 overflow-y-auto">
            {stats.recentBookings?.slice(0, 8).map((b, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 py-2.5"
                style={{ borderBottom: '1px solid var(--dash-divider)' }}
              >
                <div
                  className="w-[6px] h-[6px] rounded-full shrink-0 dash-dot-paid"
                  style={{
                    background: b.status === 'paid' ? 'var(--dash-accent)' : 'var(--dash-warning)',
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[11.5px] font-medium truncate"
                    style={{ color: 'var(--dash-text-1)' }}
                  >
                    {b.title}
                  </p>
                  <p
                    className="text-[10px] truncate mt-0.5"
                    style={{ color: 'var(--dash-text-3)' }}
                  >
                    {b.guestEmail?.split('@')?.[0]}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className="text-[11.5px] font-semibold"
                    style={{ color: 'var(--dash-text-1)' }}
                  >
                    ₹{b.totalPrice?.toLocaleString()}
                  </p>
                  <p
                    className="text-[9.5px] capitalize mt-0.5"
                    style={{ color: 'var(--dash-text-3)' }}
                  >
                    {b.status}
                  </p>
                </div>
              </div>
            ))}
            {(!stats.recentBookings || stats.recentBookings.length === 0) && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarCheck
                  size={22}
                  style={{ color: 'var(--dash-text-3)', marginBottom: '8px' }}
                />
                <p
                  className="text-[11px] font-medium uppercase tracking-widest"
                  style={{ color: 'var(--dash-text-3)' }}
                >
                  No recent bookings
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
