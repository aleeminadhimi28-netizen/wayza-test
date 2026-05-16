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
      bg: 'bg-indigo-500/10',
      color: 'text-indigo-400',
      trend: 'All time',
      up: true,
    },
    {
      title: 'Partners',
      value: stats.totalPartners,
      icon: Briefcase,
      bg: 'bg-violet-500/10',
      color: 'text-violet-400',
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {kpiCards.map((card, i) => (
          <div
            key={i}
            className="bg-white/[0.03] border border-white/[0.08] p-6 rounded-2xl backdrop-blur-xl hover:bg-white/[0.05] transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={`w-11 h-11 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}
              >
                <card.icon size={20} />
              </div>
              <span
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide ${card.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}
              >
                {card.up && <ArrowUpRight size={10} strokeWidth={3} />}
                {card.trend}
              </span>
            </div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">
              {card.title}
            </p>
            <p className="text-2xl font-black text-white tracking-tight">{card.value}</p>
          </div>
        ))}
      </div>

      {/* CHART + ACTIVITY */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* REVENUE CHART */}
        <div className="xl:col-span-2 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                Revenue Overview
              </h3>
              <p className="text-xs text-white/30 font-medium mt-0.5">Monthly platform earnings</p>
            </div>
          </div>
          <div className="h-[350px]">
            {!stats.monthlyRevenue || stats.monthlyRevenue.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-white/[0.01] rounded-xl border border-white/[0.05]">
                <TrendingUp size={32} className="text-white/10 mb-3" />
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest">
                  No revenue data yet
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorIndigo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 'bold' }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 'bold' }}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      background: '#06070f',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      padding: '12px',
                      color: '#fff',
                    }}
                    itemStyle={{ color: '#6366f1', fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rev"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorIndigo)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 backdrop-blur-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-white uppercase tracking-tight">
              Recent Activity
            </h3>
            <span
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors uppercase tracking-wider"
              onClick={() => setActiveTab('bookings')}
            >
              View All
            </span>
          </div>
          <div className="space-y-2 flex-1 overflow-y-auto">
            {stats.recentBookings?.slice(0, 8).map((b, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors"
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${b.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}
                >
                  {b.status === 'paid' ? <CheckCircle size={14} /> : <Clock size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm truncate">{b.title}</p>
                  <p className="text-xs text-white/30 font-medium truncate">
                    {b.guestEmail?.split('@')?.[0]}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-sm text-white">₹{b.totalPrice?.toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-wide capitalize">
                    {b.status}
                  </p>
                </div>
              </div>
            ))}
            {(!stats.recentBookings || stats.recentBookings.length === 0) && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarCheck size={24} className="text-white/10 mb-2" />
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest">
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
