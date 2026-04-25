import { useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  CheckCircle,
  Clock,
  ArrowDownCircle,
  Building2,
  CreditCard,
  ShieldCheck,
  Send,
  AlertCircle,
  TrendingUp,
  RefreshCcw,
  Landmark,
  Zap,
  Info,
} from 'lucide-react';
import { api } from '../../utils/api.js';

export default function PartnerWallet() {
  const { user } = useAuth();

  const [earnings, setEarnings] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bank form state
  const [form, setForm] = useState({
    accountName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    upiId: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  // Withdrawal state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    Promise.all([api.getPartnerEarnings(), api.getPartnerWallet(), api.getWithdrawalRequests()])
      .then(([e, w, r]) => {
        if (e.ok) setEarnings(e);
        if (w.ok && w.wallet) {
          setWallet(w.wallet);
          setForm({
            accountName: w.wallet.accountName || '',
            accountNumber: w.wallet.accountNumber || '',
            ifscCode: w.wallet.ifscCode || '',
            bankName: w.wallet.bankName || '',
            upiId: w.wallet.upiId || '',
          });
        }
        if (r.ok) setRequests(r.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user?.email]);

  async function handleSaveBank(e) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      const d = await api.savePartnerWallet(form);
      if (d.ok) {
        setWallet(form);
        setSaveMsg({ type: 'success', text: 'Bank details saved successfully.' });
      } else {
        setSaveMsg({ type: 'error', text: 'Failed to save. Please try again.' });
      }
    } catch {
      setSaveMsg({ type: 'error', text: 'Network error. Please try again.' });
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(null), 4000);
  }

  async function handleWithdraw(e) {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return;
    if (!wallet?.accountNumber) {
      setWithdrawMsg({ type: 'error', text: 'Please save your bank details first.' });
      return;
    }
    setWithdrawing(true);
    setWithdrawMsg(null);
    try {
      const d = await api.requestWithdrawal(Number(withdrawAmount));
      if (d.ok) {
        setWithdrawMsg({
          type: 'success',
          text: `₹${Number(withdrawAmount).toLocaleString()} withdrawal request submitted!`,
        });
        setWithdrawAmount('');
        // Refresh requests
        const r = await api.getWithdrawalRequests();
        if (r.ok) setRequests(r.data || []);
      } else {
        setWithdrawMsg({ type: 'error', text: d.message || 'Insufficient available balance.' });
      }
    } catch {
      setWithdrawMsg({ type: 'error', text: 'Network error. Please try again.' });
    }
    setWithdrawing(false);
    setTimeout(() => setWithdrawMsg(null), 5000);
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );

  const available = earnings?.availableBalance || 0;
  const pending = earnings?.pendingBalance || 0;
  const alreadyPaid = earnings?.alreadyPaid || 0;
  const total = earnings?.totalRevenue || 0;

  const balanceCards = [
    {
      label: 'Available to Withdraw',
      value: available,
      icon: Wallet,
      bg: 'from-emerald-500 to-teal-600',
      desc: 'Ready to request',
    },
    {
      label: 'Pending Settlement',
      value: pending,
      icon: Clock,
      bg: 'from-amber-500 to-orange-500',
      desc: 'Awaiting check-in',
    },
    {
      label: 'Already Paid',
      value: alreadyPaid,
      icon: CheckCircle,
      bg: 'from-blue-500 to-indigo-600',
      desc: 'Transferred to bank',
    },
    {
      label: 'Total Earned',
      value: total,
      icon: TrendingUp,
      bg: 'from-slate-700 to-slate-900',
      desc: 'All time gross',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 font-sans pb-16"
    >
      {/* ─── HEADER ─── */}
      <div>
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide mb-1">
          <Wallet size={14} /> Partner Wallet
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Wallet & Payouts</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your bank details and request withdrawals.
        </p>
      </div>

      {/* ─── BALANCE CARDS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {balanceCards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`bg-gradient-to-br ${c.bg} rounded-2xl p-6 text-white shadow-lg relative overflow-hidden`}
          >
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
            <div className="relative z-10">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <c.icon size={20} />
              </div>
              <p className="text-white/70 text-xs font-semibold mb-1">{c.label}</p>
              <p className="text-2xl font-bold">₹{Math.round(c.value).toLocaleString()}</p>
              <p className="text-white/50 text-[10px] font-medium uppercase tracking-widest mt-1">
                {c.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── MAIN GRID ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* ─── WITHDRAW ─── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <ArrowDownCircle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Request Withdrawal</h2>
              <p className="text-xs text-slate-500">Transfer available balance to your bank</p>
            </div>
          </div>

          {/* Available balance pill */}
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-4 mb-6">
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                Available Balance
              </p>
              <p className="text-2xl font-bold text-emerald-700 mt-0.5">
                ₹{Math.round(available).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Zap size={22} className="text-emerald-600" />
            </div>
          </div>

          {!wallet?.accountNumber && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-5 text-xs text-amber-700 font-medium">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              Please add your bank details below before requesting a withdrawal.
            </div>
          )}

          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                Withdrawal Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  max={Math.round(available)}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder={`Max ₹${Math.round(available).toLocaleString()}`}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 text-sm font-semibold focus:bg-white focus:border-emerald-500 transition-all outline-none text-slate-900"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setWithdrawAmount(Math.round((available * pct) / 100))}
                    className="flex-1 h-8 text-xs font-bold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-500 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {withdrawMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-center gap-2 text-xs font-semibold px-4 py-3 rounded-xl ${withdrawMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}
                >
                  {withdrawMsg.type === 'success' ? (
                    <CheckCircle size={14} />
                  ) : (
                    <AlertCircle size={14} />
                  )}
                  {withdrawMsg.text}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={withdrawing || !withdrawAmount || available <= 0}
              className="w-full h-12 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {withdrawing ? <RefreshCcw size={16} className="animate-spin" /> : <Send size={16} />}
              {withdrawing ? 'Submitting...' : 'Request Withdrawal'}
            </button>
          </form>
        </div>

        {/* ─── BANK DETAILS ─── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Landmark size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Bank Details</h2>
              <p className="text-xs text-slate-500">Your payout destination account</p>
            </div>
            {wallet?.accountNumber && (
              <span className="ml-auto flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                <ShieldCheck size={10} /> Verified
              </span>
            )}
          </div>

          <form onSubmit={handleSaveBank} className="space-y-4">
            {[
              {
                label: 'Account Holder Name',
                key: 'accountName',
                placeholder: 'e.g. John Doe',
                icon: CreditCard,
              },
              {
                label: 'Account Number',
                key: 'accountNumber',
                placeholder: 'e.g. 123456789012',
                icon: Building2,
              },
              { label: 'IFSC Code', key: 'ifscCode', placeholder: 'e.g. SBIN0001234', icon: Info },
              {
                label: 'Bank Name',
                key: 'bankName',
                placeholder: 'e.g. State Bank of India',
                icon: Landmark,
              },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                  {f.label}
                </label>
                <div className="relative">
                  <f.icon
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={form[f.key]}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 text-sm font-medium focus:bg-white focus:border-emerald-500 transition-all outline-none"
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                UPI ID <span className="text-slate-400 normal-case font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={form.upiId}
                onChange={(e) => setForm((p) => ({ ...p, upiId: e.target.value }))}
                placeholder="e.g. yourname@upi"
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:bg-white focus:border-emerald-500 transition-all outline-none"
              />
            </div>

            <AnimatePresence>
              {saveMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-center gap-2 text-xs font-semibold px-4 py-3 rounded-xl ${saveMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}
                >
                  {saveMsg.type === 'success' ? (
                    <CheckCircle size={14} />
                  ) : (
                    <AlertCircle size={14} />
                  )}
                  {saveMsg.text}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={saving}
              className="w-full h-12 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 active:scale-95"
            >
              {saving ? (
                <RefreshCcw size={16} className="animate-spin" />
              ) : (
                <ShieldCheck size={16} />
              )}
              {saving ? 'Saving...' : 'Save Bank Details'}
            </button>
          </form>
        </div>
      </div>

      {/* ─── WITHDRAWAL HISTORY ─── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Withdrawal History</h3>
            <p className="text-xs text-slate-500">All your past payout requests</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 flex items-center gap-1.5">
            <ShieldCheck size={10} /> Merchant Protected
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Date
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Amount
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Reference
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {requests.map((r, i) => (
                <motion.tr
                  key={r._id || i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">
                    {new Date(r.requestedAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 font-bold text-sm text-slate-900">
                    ₹{Number(r.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                        r.status === 'completed' || r.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : r.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-100'
                            : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}
                    >
                      {r.status === 'completed' || r.status === 'paid' ? (
                        <CheckCircle size={10} />
                      ) : (
                        <Clock size={10} />
                      )}
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-xs font-bold text-slate-400 font-mono">
                    #{(r._id || '').slice(-8).toUpperCase()}
                  </td>
                </motion.tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <Wallet size={32} className="text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-900 mb-1">
                      No withdrawal requests yet
                    </p>
                    <p className="text-xs text-slate-500">
                      Your payout history will appear here once you submit a request.
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
