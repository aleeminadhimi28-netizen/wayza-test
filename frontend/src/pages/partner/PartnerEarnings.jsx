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
import { TrendingUp, Shield, BarChart3, Download, CheckCircle, Clock } from 'lucide-react';
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
      <div className="flex items-center justify-center min-h-[400px] bg-[#050a08]">
        <div className="w-10 h-10 border-2 border-white/10 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );

  const kpis = [
    {
      label: 'Available to Withdraw',
      value: '₹' + (earnings?.availableBalance || 0).toLocaleString(),
      icon: CheckCircle,
      bg: 'bg-emerald-500/10',
      color: 'text-emerald-400',
    },
    {
      label: 'Pending Settlement',
      value: '₹' + (earnings?.pendingBalance || 0).toLocaleString(),
      icon: Clock,
      bg: 'bg-amber-500/10',
      color: 'text-amber-400',
    },
    {
      label: 'Already Paid',
      value: '₹' + (earnings?.alreadyPaid || 0).toLocaleString(),
      icon: Shield,
      bg: 'bg-blue-500/10',
      color: 'text-blue-400',
    },
    {
      label: 'Total Revenue',
      value: '₹' + (earnings?.totalRevenue || 0).toLocaleString(),
      icon: TrendingUp,
      bg: 'bg-white/10',
      color: 'text-white',
    },
  ];

  return (
    <div className="min-h-screen bg-[#050a08] font-sans text-white selection:bg-emerald-900/50 selection:text-emerald-200 pb-20">
      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-700/5 blur-[100px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: 'linear-gradient(rgba(52,211,153,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.6) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-10 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/[0.03] border border-white/[0.08] p-8 rounded-3xl backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-[0.4em] mb-1">
              <TrendingUp size={12} /> Earnings
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">Revenue Overview</h1>
            <p className="text-sm text-white/30 font-medium">Track your property earnings and payouts.</p>
          </div>
          <button
            onClick={() => {
              const rows = bookings
                .filter((b) => b.status === 'paid' || b.status === 'confirmed')
                .map((b) => ({
                  'Booking ID': b._id,
                  Property: b.title || '',
                  'Check In': b.checkIn || '',
                  'Check Out': b.checkOut || '',
                  Nights: b.nights || '',
                  'Total Paid (₹)': b.totalPrice || '',
                  'Your Earnings (₹)': b.netEarnings || '',
                  'Payout Status': b.payoutStatus || 'pending',
                }));
              if (!rows.length) return;
              const headers = Object.keys(rows[0]);
              const csv = [
                headers.join(','),
                ...rows.map((r) => headers.map((h) => `"${r[h]}"`).join(',')),
              ].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `wayzza-earnings-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="h-11 px-5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 hover:bg-white/[0.08] transition-colors shadow-sm"
          >
            <Download size={14} /> Export Report
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
              className="bg-white/[0.03] border border-white/[0.08] p-6 rounded-2xl backdrop-blur-xl hover:bg-white/[0.05] transition-colors"
            >
              <div className={`w-11 h-11 rounded-xl ${c.bg} ${c.color} flex items-center justify-center mb-4`}>
                <c.icon size={20} />
              </div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">{c.label}</p>
              <p className="text-2xl font-black text-white tracking-tight">{c.value}</p>
            </motion.div>
          ))}
        </div>

        {/* REVENUE CHART */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Monthly Revenue</h3>
              <p className="text-xs text-white/30 font-medium">Earnings breakdown by month</p>
            </div>
          </div>

          {monthly.length > 0 ? (
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
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
                    }}
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]} barSize={40}>
                    {monthly.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === monthly.length - 1 ? '#10b981' : 'rgba(255,255,255,0.1)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-20 text-center">
              <BarChart3 size={28} className="text-white/10 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-white/30 uppercase tracking-widest mb-1">No revenue data yet</h4>
              <p className="text-xs text-white/20 font-medium">
                Revenue data will appear once bookings are confirmed.
              </p>
            </div>
          )}
        </div>

        {/* TRANSACTION TABLE: MONTHLY BREAKDOWN */}
        {monthly.length > 0 && (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-xl overflow-hidden">
            <div className="p-6 border-b border-white/[0.05] flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Monthly Performance</h3>
                <p className="text-xs text-white/30 font-medium">Consolidated monthly revenue logs.</p>
              </div>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.05] bg-white/[0.01]">
                  <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                    Statement Period
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                    Gross Revenue
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                    Net Payout (90%)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {monthly.map((m, i) => (
                  <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 font-bold text-sm text-white">{m.month}</td>
                    <td className="px-6 py-4 text-xs font-bold text-white/70">
                      ₹{(m.revenue || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-sm text-emerald-400">
                      ₹
                      {Math.round(
                        (m.revenue || 0) *
                          (earnings?.totalRevenue > 0
                            ? earnings.ownerPayout / earnings.totalRevenue
                            : 0.9)
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* INDIVIDUAL BOOKINGS: MONEY MANAGEMENT LOG */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-xl overflow-hidden">
          <div className="p-6 border-b border-white/[0.05] flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Settlement Ledger</h3>
              <p className="text-xs text-white/30 font-medium">Detailed breakdown of individual stay payouts.</p>
            </div>
            <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 uppercase tracking-widest leading-none flex items-center gap-1.5 shadow-sm">
              <CheckCircle size={10} /> Merchant Sync Active
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.05] bg-white/[0.01]">
                  <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                    Booking Reference
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                    Stay Dates
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                    Settlement Status
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                    Your Share
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {bookings
                  .filter((b) => b.status === 'paid' || b.status === 'confirmed')
                  .map((b, i) => {
                    const base = b.baseAmount || Math.round(b.totalPrice / 1.12);
                    const platformFee = b.serviceFee || 99;
                    const commission = Math.round(base * 0.1);
                    const isSettled = b.payoutStatus === 'paid_out';

                    return (
                      <tr key={b._id || i} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="px-6 py-4">
                          <p className="font-bold text-white text-sm truncate max-w-[200px]">
                            {b.title}
                          </p>
                          <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-0.5">
                            #{b._id.slice(-8).toUpperCase()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-white/70 uppercase tracking-wide">
                              {b.checkIn} → {b.checkOut}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-white/20 font-bold uppercase">
                              <span>Paid: ₹{(b.totalPrice || 0).toLocaleString()}</span>
                              <span className="w-1 h-1 bg-white/10 rounded-full" />
                              <span>Tax: ₹{(b.gst || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                              isSettled
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                : new Date(b.checkIn) <= new Date()
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}
                          >
                            {isSettled
                              ? 'Settled'
                              : new Date(b.checkIn) <= new Date()
                                ? 'Cleared for Payout'
                                : 'Pending Stay'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <p className="font-black text-sm text-white">
                              ₹
                              {Math.round(
                                b.netEarnings || b.totalPrice - platformFee - commission
                              ).toLocaleString()}
                            </p>
                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tighter text-white/20 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span>Fee: -₹{platformFee}</span>
                              <span>Comm: -₹{commission}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                {bookings.filter((b) => b.status === 'paid' || b.status === 'confirmed').length ===
                  0 && (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <BarChart3 size={24} className="text-white/10 mx-auto mb-3" />
                      <p className="text-xs font-bold text-white/30 uppercase tracking-widest">
                        No transactions recorded yet.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
