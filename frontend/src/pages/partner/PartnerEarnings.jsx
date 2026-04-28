import { useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext.jsx';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  Wallet,
  TrendingUp,
  CreditCard,
  Shield,
  BarChart3,
  Download,
  CheckCircle,
  Clock,
} from 'lucide-react';

import { api } from '../../utils/api.js';

export default function PartnerEarnings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;

    Promise.all([
      api.getPartnerEarnings(),
      api.getPartnerMonthlyRevenue(),
      api.getPartnerBookings(),
    ])
      .then(([e, m, b]) => {
        if (e.ok) setEarnings(e);
        if (m.ok) setMonthly(m.data || []);
        setBookings(Array.isArray(b) ? b : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user?.email]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );

  const kpis = [
    {
      label: 'Available to Withdraw',
      value: 'â‚¹' + (earnings?.availableBalance || 0).toLocaleString(),
      icon: CheckCircle,
      bg: 'bg-emerald-50',
      color: 'text-emerald-600',
    },
    {
      label: 'Pending Settlement',
      value: 'â‚¹' + (earnings?.pendingBalance || 0).toLocaleString(),
      icon: Clock,
      bg: 'bg-amber-50',
      color: 'text-amber-600',
    },
    {
      label: 'Already Paid',
      value: 'â‚¹' + (earnings?.alreadyPaid || 0).toLocaleString(),
      icon: Shield,
      bg: 'bg-blue-50',
      color: 'text-blue-600',
    },
    {
      label: 'Total Revenue',
      value: 'â‚¹' + (earnings?.totalRevenue || 0).toLocaleString(),
      icon: TrendingUp,
      bg: 'bg-slate-50',
      color: 'text-slate-600',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 font-sans pb-12"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide mb-1">
            <TrendingUp size={14} /> Earnings
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Revenue Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Track your property earnings and payouts.</p>
        </div>
        <button className="h-10 px-5 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
          <Download size={15} /> Export Report
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all"
          >
            <div
              className={`w-11 h-11 rounded-xl ${c.bg} ${c.color} flex items-center justify-center mb-4`}
            >
              <c.icon size={20} />
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-1">{c.label}</p>
            <p className="text-2xl font-bold text-slate-900">{c.value}</p>
          </motion.div>
        ))}
      </div>

      {/* REVENUE CHART */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Monthly Revenue</h3>
            <p className="text-xs text-slate-500">Earnings breakdown by month</p>
          </div>
        </div>

        {monthly.length > 0 ? (
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
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
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="revenue" radius={[8, 8, 0, 0]} barSize={40}>
                  {monthly.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === monthly.length - 1 ? '#10b981' : '#e2e8f0'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-20 text-center">
            <BarChart3 size={28} className="text-slate-200 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-slate-900 mb-1">No revenue data yet</h4>
            <p className="text-sm text-slate-500">
              Revenue data will appear once bookings are confirmed and processed.
            </p>
          </div>
        )}
      </div>

      {/* TRANSACTION TABLE: MONTHLY BREAKDOWN */}
      {monthly.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/20">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Monthly Performance</h3>
              <p className="text-xs text-slate-500">Consolidated monthly revenue logs.</p>
            </div>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Statement Period
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Gross Revenue
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Net Payout (90%)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {monthly.map((m, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-sm text-slate-900">{m.month}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    â‚¹{(m.revenue || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-sm text-emerald-600">
                    â‚¹{Math.round((m.revenue || 0) * 0.9).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* INDIVIDUAL BOOKINGS: MONEY MANAGEMENT LOG */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Settlement Ledger</h3>
            <p className="text-xs text-slate-500">Detailed breakdown of individual stay payouts.</p>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 uppercase tracking-widest leading-none flex items-center gap-1.5 shadow-sm">
            <CheckCircle size={10} /> Merchant Sync Active
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Booking Reference
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Stay Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Settlement Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Your Share
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bookings
                .filter((b) => b.status === 'paid' || b.status === 'confirmed')
                .map((b, i) => (
                  <tr key={b._id || i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-sm text-slate-900 truncate max-w-[200px]">
                        {b.title}
                      </p>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                        #{b._id.slice(-8).toUpperCase()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-600">
                        {b.checkIn} â†’ {b.checkOut}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${
                          b.payoutStatus === 'paid_out'
                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                            : new Date(b.checkIn) <= new Date()
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}
                      >
                        {b.payoutStatus === 'paid_out'
                          ? 'Settled'
                          : new Date(b.checkIn) <= new Date()
                            ? 'Cleared for Payout'
                            : 'Pending Stay'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-bold text-sm text-slate-900">
                        â‚¹{Math.round(b.netEarnings || b.totalPrice * 0.9).toLocaleString()}
                      </p>
                    </td>
                  </tr>
                ))}
              {bookings.length === 0 && (
                <tr className="py-20 text-center">
                  <td colSpan={4} className="py-20 text-center">
                    <BarChart3 size={32} className="text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-500">
                      No transactions recorded yet.
                    </p>
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
