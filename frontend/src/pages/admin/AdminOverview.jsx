import { motion } from 'framer-motion';
import {
  Users,
  Briefcase,
  Clock,
  TrendingUp,
  CalendarCheck,
  CheckCircle,
  ArrowUpRight,
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
      bg: 'bg-blue-50',
      color: 'text-blue-600',
      trend: 'All time',
      up: true,
    },
    {
      title: 'Partners',
      value: stats.totalPartners,
      icon: Briefcase,
      bg: 'bg-violet-50',
      color: 'text-violet-600',
      trend: 'Active',
      up: true,
    },
    {
      title: 'Pending Approval',
      value: stats.pendingListings || 0,
      icon: Clock,
      bg: 'bg-amber-50',
      color: 'text-amber-600',
      trend: 'Needs review',
      up: false,
    },
    {
      title: 'Platform Revenue',
      value: `₹${(stats.platformCommission || 0).toLocaleString()}`,
      icon: TrendingUp,
      bg: 'bg-emerald-50',
      color: 'text-emerald-600',
      trend: `${stats.totalBookings || 0} bookings`,
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpiCards.map((card, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={`w-11 h-11 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}
              >
                <card.icon size={20} />
              </div>
              <span
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${card.up ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}
              >
                {card.up && <ArrowUpRight size={11} strokeWidth={3} />}
                {card.trend}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-1">{card.title}</p>
            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* CHART + ACTIVITY */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* REVENUE CHART */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Revenue Overview</h3>
              <p className="text-xs text-slate-500">Monthly platform earnings</p>
            </div>
          </div>
          <div className="h-[350px]">
            {!stats.monthlyRevenue || stats.monthlyRevenue.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/50 rounded-xl border border-slate-100">
                <TrendingUp size={32} className="text-slate-200 mb-3" />
                <p className="text-sm font-bold text-slate-500">No revenue data yet</p>
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                  />
                  <RechartsTooltip
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
                  />
                  <Area
                    type="monotone"
                    dataKey="rev"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorEmerald)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
            <span
              className="text-xs font-semibold text-emerald-600 cursor-pointer"
              onClick={() => setActiveTab('bookings')}
            >
              View All
            </span>
          </div>
          <div className="space-y-2 flex-1 overflow-y-auto">
            {stats.recentBookings?.slice(0, 8).map((b, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all"
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${b.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}
                >
                  {b.status === 'paid' ? <CheckCircle size={16} /> : <Clock size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 truncate">{b.title}</p>
                  <p className="text-xs text-slate-400 truncate">{b.guestEmail?.split('@')?.[0]}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-slate-900">
                    ₹{b.totalPrice?.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400 capitalize">{b.status}</p>
                </div>
              </div>
            ))}
            {(!stats.recentBookings || stats.recentBookings.length === 0) && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarCheck size={28} className="text-slate-200 mb-2" />
                <p className="text-sm font-semibold text-slate-500">No recent bookings</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
