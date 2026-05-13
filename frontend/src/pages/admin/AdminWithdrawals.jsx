import { useState, Fragment } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Banknote, XCircle } from 'lucide-react';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import { api } from '../../utils/api.js';

export default function AdminWithdrawals({ withdrawals, setWithdrawals, stats, loadingData }) {
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    onConfirm: null,
    isLoading: false,
  });

  const closeConfirm = () =>
    setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));

  const handleConfirmAction = async () => {
    if (!confirmModal.onConfirm) return;
    setConfirmModal((prev) => ({ ...prev, isLoading: true }));
    try {
      await confirmModal.onConfirm();
      closeConfirm();
    } catch (err) {
      console.error('Action failed:', err);
      setConfirmModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending').length;

  async function handleWithdrawal(id, status, reason = null) {
    if (status === 'completed') {
      setConfirmModal({
        isOpen: true,
        onConfirm: () => executeWithdrawal(id, status, reason),
      });
      return;
    }
    await executeWithdrawal(id, status, reason);
  }

  async function executeWithdrawal(id, status, reason = null) {
    try {
      const d = await api.adminUpdateWithdrawal(id, status, reason);
      if (d.ok) {
        setWithdrawals((prev) => prev.map((w) => (w._id === id ? { ...w, status, reason } : w)));
        if (status === 'rejected') {
          setRejectingId(null);
          setRejectReason('');
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <motion.div
      key="withdrawals"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Finance Center</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Track platform earnings and partner payout requests.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right border-r border-slate-100 pr-6 hidden md:block">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Platform Revenue
              </p>
              <p className="text-xl font-bold text-emerald-600">
                ₹{(stats.platformCommission || 0).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {pendingWithdrawals > 0 && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 px-4 py-2 rounded-2xl animate-pulse">
                  <Clock size={12} /> {pendingWithdrawals} New Requests
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Partner
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Amount
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Date
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {withdrawals.map((w, i) => (
                <Fragment key={w._id || i}>
                  <tr className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-sm text-slate-900">{w.email}</p>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        #{(w._id || '').slice(-8).toUpperCase()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-lg text-slate-900">
                        ₹{Number(w.amount).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(w.requestedAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${
                          w.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : w.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-100'
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}
                      >
                        {w.status === 'completed' ? (
                          <CheckCircle size={10} />
                        ) : w.status === 'rejected' ? (
                          <XCircle size={10} />
                        ) : (
                          <Clock size={10} />
                        )}
                        {w.status}
                      </span>
                      {w.reason && (
                        <p className="text-[11px] text-slate-400 mt-1 max-w-[180px] truncate">
                          {w.reason}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {w.status === 'pending' && rejectingId !== w._id && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleWithdrawal(w._id, 'completed')}
                            className="h-8 px-4 bg-emerald-600 text-white rounded-lg font-semibold text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <CheckCircle size={13} /> Approve
                          </button>
                          <button
                            onClick={() => {
                              setRejectingId(w._id);
                              setRejectReason('');
                            }}
                            className="h-8 px-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg font-semibold text-xs hover:bg-rose-500 hover:text-white transition-colors flex items-center gap-1.5"
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                  {rejectingId === w._id && (
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <td colSpan="5" className="px-6 py-4">
                        <div className="flex gap-3">
                          <textarea
                            autoFocus
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Reason for rejection (optional)..."
                            className="flex-1 h-12 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-500 resize-none"
                          />
                          <div className="flex flex-col gap-2 shrink-0">
                            <button
                              onClick={() => handleWithdrawal(w._id, 'rejected', rejectReason)}
                              className="px-4 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-lg hover:bg-rose-700"
                            >
                              Confirm Reject
                            </button>
                            <button
                              onClick={() => setRejectingId(null)}
                              className="px-4 py-1.5 bg-white border border-slate-200 text-slate-500 font-bold text-xs rounded-lg hover:bg-slate-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {withdrawals.length === 0 && !loadingData && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Banknote size={32} className="text-slate-200 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      No withdrawal requests
                    </h3>
                    <p className="text-sm text-slate-500">
                      Partner withdrawal requests will appear here.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirm}
        onConfirm={handleConfirmAction}
        title="Approve Withdrawal"
        message="Are you sure you want to approve this withdrawal request? This will mark it as completed and notify the partner."
        confirmText="Approve & Send"
        confirmVariant="emerald"
        isLoading={confirmModal.isLoading}
      />
    </motion.div>
  );
}
