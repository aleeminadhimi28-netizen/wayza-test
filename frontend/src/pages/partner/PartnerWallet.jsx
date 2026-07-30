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
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) return;
    if (amount < 100) {
      setWithdrawMsg({ type: 'error', text: 'Minimum withdrawal amount is ₹100.' });
      return;
    }
    if (!wallet?.accountNumber) {
      setWithdrawMsg({ type: 'error', text: 'Please save your bank details first.' });
      return;
    }
    setWithdrawing(true);
    setWithdrawMsg(null);
    try {
      const d = await api.requestWithdrawal(amount);
      if (d.ok) {
        setWithdrawMsg({
          type: 'success',
          text: `₹${Number(withdrawAmount).toLocaleString()} withdrawal request submitted!`,
        });
        // FIX #68: optimistically reduce displayed available balance
        setEarnings((prev) =>
          prev
            ? {
                ...prev,
                availableBalance: Math.max(
                  0,
                  (prev.availableBalance || 0) - Number(withdrawAmount)
                ),
              }
            : prev
        );
        setWithdrawAmount('');
        // Refresh requests list
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
        <div
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'var(--dash-divider)', borderTopColor: 'var(--dash-accent-500)' }}
        />
      </div>
    );

  const available = earnings?.availableBalance || 0;
  const pending = earnings?.pendingBalance || 0;
  const alreadyPaid = earnings?.alreadyPaid || 0;
  const total = earnings?.ownerPayout || 0; // net earnings after commission & TCS (not gross)

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
      label: 'Total Net Earnings',
      value: total,
      icon: TrendingUp,
      bg: 'from-slate-700 to-slate-900',
      desc: 'After platform fees',
    },
  ];

  return (
    <div
      className="font-sans pb-16 dash-transition"
      style={{ background: 'var(--dash-bg)', color: 'var(--dash-text-1)' }}
    >
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 py-6 space-y-6">
        {/* ─── HEADER ─── */}
        <div className="dash-fade-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-1"
              style={{ color: 'var(--dash-accent)' }}
            >
              Partner Wallet
            </p>
            <h1
              className="text-[20px] font-semibold leading-snug"
              style={{ color: 'var(--dash-text-1)' }}
            >
              Wallet &amp; Payouts
            </h1>
            <p className="text-[11px] mt-1" style={{ color: 'var(--dash-text-3)' }}>
              Manage your bank details and request withdrawals.
            </p>
          </div>
        </div>

        {/* ─── BALANCE CARDS ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 dash-fade-2">
          {balanceCards.map((c) => (
            <div
              key={c.label}
              className="dash-kpi-card p-5 rounded-xl"
              style={{
                background: 'var(--dash-card)',
                border: '1px solid var(--dash-card-border)',
              }}
            >
              <p className="text-[10.5px] font-medium mb-2" style={{ color: 'var(--dash-text-3)' }}>
                {c.label}
              </p>
              <div className="h-px mb-2.5" style={{ background: 'var(--dash-divider)' }} />
              <p
                className="text-[22px] font-semibold tracking-tight leading-none mb-1.5"
                style={{ color: 'var(--dash-text-1)' }}
              >
                ₹{Math.round(c.value).toLocaleString()}
              </p>
              <p className="text-[10px] font-medium" style={{ color: 'var(--dash-accent)' }}>
                {c.desc}
              </p>
            </div>
          ))}
        </div>

        {/* ─── MAIN GRID ─── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 dash-fade-3">
          {/* ─── WITHDRAW ─── */}
          <div
            className="p-6 rounded-xl"
            style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-card-border)' }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--dash-accent-dim)', color: 'var(--dash-accent)' }}
              >
                <ArrowDownCircle size={18} />
              </div>
              <div>
                <h2 className="text-[13px] font-semibold" style={{ color: 'var(--dash-text-1)' }}>
                  Request Withdrawal
                </h2>
                <p className="text-[10.5px]" style={{ color: 'var(--dash-text-3)' }}>
                  Transfer available balance to your bank
                </p>
              </div>
            </div>

            {/* Available balance pill */}
            <div
              className="flex items-center justify-between rounded-xl px-4 py-3.5 mb-5"
              style={{
                background: 'var(--dash-accent-dim)',
                border: '1px solid var(--dash-accent-border)',
              }}
            >
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--dash-accent)' }}
                >
                  Available Balance
                </p>
                <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--dash-text-1)' }}>
                  ₹{Math.round(available).toLocaleString()}
                </p>
              </div>
              <Zap size={20} style={{ color: 'var(--dash-accent)' }} />
            </div>

            {!wallet?.accountNumber && (
              <div
                className="flex items-start gap-2 rounded-xl px-3.5 py-2.5 mb-4 text-[11px] font-medium"
                style={{
                  background: 'rgba(251,191,36,0.08)',
                  border: '1px solid rgba(251,191,36,0.18)',
                  color: 'var(--dash-warning)',
                }}
              >
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                Please add your bank details below before requesting a withdrawal.
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label
                  className="text-[11px] font-medium block mb-1.5"
                  style={{ color: 'var(--dash-text-2)' }}
                >
                  Withdrawal Amount (₹)
                </label>
                <div className="relative">
                  <span
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-sm"
                    style={{ color: 'var(--dash-text-3)' }}
                  >
                    ₹
                  </span>
                  <input
                    type="number"
                    min="100"
                    max={Math.round(available)}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder={`Max ₹${Math.round(available).toLocaleString()}`}
                    className="w-full h-10 rounded-lg pl-8 pr-4 text-sm font-semibold transition-all outline-none"
                    style={{
                      background: 'var(--dash-card)',
                      border: '1px solid var(--dash-card-border)',
                      color: 'var(--dash-text-1)',
                    }}
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setWithdrawAmount(Math.round((available * pct) / 100))}
                      className="flex-1 h-7 text-[11px] font-medium rounded-md transition-colors"
                      style={{
                        background: 'rgba(128,128,128,0.06)',
                        border: '1px solid var(--dash-card-border)',
                        color: 'var(--dash-text-2)',
                      }}
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
                    className={`flex items-center gap-2 text-xs font-semibold px-4 py-3 rounded-xl ${withdrawMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}
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
                className="w-full h-10 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-98"
                style={{ background: 'var(--dash-accent-500)', color: '#050a08' }}
              >
                {withdrawing ? (
                  <RefreshCcw size={15} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                {withdrawing ? 'Submitting...' : 'Request Withdrawal'}
              </button>
            </form>
          </div>

          {/* ─── BANK DETAILS ─── */}
          <div
            className="p-6 rounded-xl"
            style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-card-border)' }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--dash-accent-dim)', color: 'var(--dash-accent)' }}
              >
                <Landmark size={18} />
              </div>
              <div>
                <h2 className="text-[13px] font-semibold" style={{ color: 'var(--dash-text-1)' }}>
                  Bank Details
                </h2>
                <p className="text-[10.5px]" style={{ color: 'var(--dash-text-3)' }}>
                  Your payout destination account
                </p>
              </div>
              {wallet?.accountNumber && (
                <span
                  className="ml-auto flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-[4px]"
                  style={{ background: 'var(--dash-accent-dim)', color: 'var(--dash-accent)' }}
                >
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
                {
                  label: 'IFSC Code',
                  key: 'ifscCode',
                  placeholder: 'e.g. SBIN0001234',
                  icon: Info,
                },
                {
                  label: 'Bank Name',
                  key: 'bankName',
                  placeholder: 'e.g. State Bank of India',
                  icon: Landmark,
                },
              ].map((f) => (
                <div key={f.key}>
                  <label
                    className="text-[11px] font-medium block mb-1"
                    style={{ color: 'var(--dash-text-2)' }}
                  >
                    {f.label}
                  </label>
                  <div className="relative">
                    <f.icon
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--dash-text-3)' }}
                    />
                    <input
                      type="text"
                      value={form[f.key]}
                      onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full h-9 rounded-lg pl-8 pr-3 text-xs font-medium outline-none transition-all"
                      style={{
                        background: 'var(--dash-card)',
                        border: '1px solid var(--dash-card-border)',
                        color: 'var(--dash-text-1)',
                      }}
                    />
                  </div>
                </div>
              ))}

              <div>
                <label
                  className="text-[11px] font-medium block mb-1"
                  style={{ color: 'var(--dash-text-2)' }}
                >
                  UPI ID <span style={{ color: 'var(--dash-text-3)' }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.upiId}
                  onChange={(e) => setForm((p) => ({ ...p, upiId: e.target.value }))}
                  placeholder="e.g. yourname@upi"
                  className="w-full h-9 rounded-lg px-3 text-xs font-medium outline-none transition-all"
                  style={{
                    background: 'var(--dash-card)',
                    border: '1px solid var(--dash-card-border)',
                    color: 'var(--dash-text-1)',
                  }}
                />
              </div>

              <AnimatePresence>
                {saveMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg"
                    style={{
                      background:
                        saveMsg.type === 'success'
                          ? 'var(--dash-accent-dim)'
                          : 'rgba(248,113,113,0.10)',
                      color:
                        saveMsg.type === 'success' ? 'var(--dash-accent)' : 'var(--dash-danger)',
                    }}
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
                className="w-full h-10 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-98"
                style={{ background: 'var(--dash-text-1)', color: 'var(--dash-bg)' }}
              >
                {saving ? (
                  <RefreshCcw size={15} className="animate-spin" />
                ) : (
                  <ShieldCheck size={15} />
                )}
                {saving ? 'Saving...' : 'Save Bank Details'}
              </button>
            </form>
          </div>
        </div>

        {/* ─── WITHDRAWAL HISTORY ─── */}
        <div
          className="table-card rounded-xl overflow-hidden dash-fade-4"
          style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-card-border)' }}
        >
          <div
            className="p-5 flex items-center justify-between"
            style={{ borderBottom: '1px solid var(--dash-divider)' }}
          >
            <div>
              <h3 className="text-[13px] font-semibold" style={{ color: 'var(--dash-text-1)' }}>
                Withdrawal History
              </h3>
              <p className="text-[10.5px]" style={{ color: 'var(--dash-text-3)' }}>
                All your past payout requests
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--dash-divider)' }}>
                  <th
                    className="px-5 py-3 text-[9.5px] font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--dash-text-3)' }}
                  >
                    Date
                  </th>
                  <th
                    className="px-5 py-3 text-[9.5px] font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--dash-text-3)' }}
                  >
                    Amount
                  </th>
                  <th
                    className="px-5 py-3 text-[9.5px] font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--dash-text-3)' }}
                  >
                    Status
                  </th>
                  <th
                    className="px-5 py-3 text-right text-[9.5px] font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--dash-text-3)' }}
                  >
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r, i) => (
                  <tr key={r._id || i} style={{ borderBottom: '1px solid var(--dash-divider)' }}>
                    <td
                      className="px-5 py-3 text-xs font-medium"
                      style={{ color: 'var(--dash-text-2)' }}
                    >
                      {new Date(r.requestedAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td
                      className="px-5 py-3 text-xs font-semibold"
                      style={{ color: 'var(--dash-text-1)' }}
                    >
                      ₹{Number(r.amount).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
                        style={{
                          background:
                            r.status === 'completed' || r.status === 'paid'
                              ? 'var(--dash-accent-dim)'
                              : 'rgba(251,191,36,0.12)',
                          color:
                            r.status === 'completed' || r.status === 'paid'
                              ? 'var(--dash-accent)'
                              : 'var(--dash-warning)',
                        }}
                      >
                        {r.status === 'completed' || r.status === 'paid' ? (
                          <CheckCircle size={10} />
                        ) : (
                          <Clock size={10} />
                        )}
                        {r.status}
                      </span>
                    </td>
                    <td
                      className="px-5 py-3 text-right text-[11px] font-mono"
                      style={{ color: 'var(--dash-text-3)' }}
                    >
                      #{(r._id || '').slice(-8).toUpperCase()}
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <Wallet
                        size={28}
                        style={{ color: 'var(--dash-text-3)', margin: '0 auto 8px' }}
                      />
                      <p
                        className="text-xs font-semibold uppercase tracking-wider mb-1"
                        style={{ color: 'var(--dash-text-3)' }}
                      >
                        No withdrawal requests yet
                      </p>
                      <p className="text-[11px]" style={{ color: 'var(--dash-text-3)' }}>
                        Your payout history will appear here once you submit a request.
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
