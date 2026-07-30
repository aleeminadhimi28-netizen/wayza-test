import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Tag, Trash2, Plus, Percent } from 'lucide-react';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import { api } from '../../utils/api.js';
import { useToast } from '../../ToastContext.jsx';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState('');
  const { showToast } = useToast();

  const [confirmState, setConfirmState] = useState({ isOpen: false, onConfirm: () => {} });

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api.adminGetCoupons();
      if (d.ok) setCoupons(d.data || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load coupons', 'error');
    }
    setLoading(false);
  }, [showToast]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCode || !newDiscount) return;
    const discountPercentage = parseFloat(newDiscount) / 100;
    if (discountPercentage <= 0 || discountPercentage >= 1) {
      showToast('Discount must be between 1 and 99', 'error');
      return;
    }
    try {
      const d = await api.adminCreateCoupon({ code: newCode.toUpperCase(), discountPercentage });
      if (d.ok) {
        showToast('Coupon created successfully', 'success');
        setNewCode('');
        setNewDiscount('');
        loadCoupons();
      } else {
        showToast(d.message || 'Failed to create coupon', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Server error', 'error');
    }
  };

  const handleDelete = (id) => {
    setConfirmState({ isOpen: true, onConfirm: () => executeDelete(id) });
  };

  const executeDelete = async (id) => {
    try {
      const d = await api.adminDeleteCoupon(id);
      if (d.ok) {
        showToast('Coupon revoked', 'success');
        loadCoupons();
      } else {
        showToast('Failed to delete', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-white/10 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div
        className="rounded-2xl p-7 overflow-hidden"
        style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-card-border)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-7">
          <div className="w-11 h-11 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 rounded-xl flex items-center justify-center">
            <Tag size={20} />
          </div>
          <div>
            <h2
              className="text-base font-black uppercase tracking-tight"
              style={{ color: 'var(--dash-text-1)' }}
            >
              Promotions Engine
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--dash-text-2)' }}>
              Create subsidized discount codes. The reduction is absorbed by the partner.
            </p>
          </div>
        </div>

        {/* Create form */}
        <form
          onSubmit={handleCreate}
          className="flex flex-col sm:flex-row gap-4 items-end rounded-2xl p-5 mb-8"
          style={{ background: 'rgba(128,128,128,0.05)', border: '1px solid var(--dash-divider)' }}
        >
          <div className="flex-1 w-full relative">
            <label
              className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2"
              style={{ color: 'var(--dash-text-2)' }}
            >
              Coupon Code
            </label>
            <div className="relative">
              <Tag
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                size={15}
                style={{ color: 'var(--dash-text-3)' }}
              />
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="E.G. WELCOME10"
                className="w-full h-11 rounded-xl pl-10 pr-4 text-sm font-black uppercase outline-none transition-all"
                style={{
                  background: 'rgba(128,128,128,0.06)',
                  border: '1px solid var(--dash-divider)',
                  color: 'var(--dash-text-1)',
                }}
                required
              />
            </div>
          </div>
          <div className="w-full sm:w-36 relative">
            <label
              className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2"
              style={{ color: 'var(--dash-text-2)' }}
            >
              Discount %
            </label>
            <div className="relative">
              <Percent
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                size={15}
                style={{ color: 'var(--dash-text-3)' }}
              />
              <input
                type="number"
                value={newDiscount}
                onChange={(e) => setNewDiscount(e.target.value)}
                placeholder="10"
                min="1"
                max="99"
                className="w-full h-11 rounded-xl pl-10 pr-4 text-sm font-bold outline-none transition-all"
                style={{
                  background: 'rgba(128,128,128,0.06)',
                  border: '1px solid var(--dash-divider)',
                  color: 'var(--dash-text-1)',
                }}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto h-11 px-6 bg-emerald-600 hover:bg-emerald-500 text-[#050a08] rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <Plus size={16} strokeWidth={2.5} /> Mint Code
          </button>
        </form>

        {/* Active coupons */}
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-[10.5px] font-black uppercase tracking-[0.25em]"
            style={{ color: 'var(--dash-text-2)' }}
          >
            Active Promotions
          </h3>
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
            style={{ background: 'rgba(128,128,128,0.08)', color: 'var(--dash-text-3)' }}
          >
            {coupons.length} active
          </span>
        </div>

        {coupons.length === 0 ? (
          <div
            className="text-center py-14 rounded-xl border-2 border-dashed"
            style={{ borderColor: 'var(--dash-divider)' }}
          >
            <Tag size={32} className="mx-auto mb-3" style={{ color: 'var(--dash-text-3)' }} />
            <p className="font-bold" style={{ color: 'var(--dash-text-2)' }}>
              No coupons minted yet.
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--dash-text-3)' }}>
              Create your first promotion above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((c) => (
              <div
                key={c._id}
                className="relative rounded-2xl p-5 transition-all hover:scale-[1.01]"
                style={{
                  background: 'rgba(128,128,128,0.04)',
                  border: '1px solid var(--dash-divider)',
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-lg font-black tracking-[0.12em] uppercase text-sm">
                    {c.code}
                  </div>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-rose-500/15 hover:text-rose-400"
                    style={{ color: 'var(--dash-text-3)' }}
                    title="Revoke code"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="flex items-end gap-1.5">
                  <span className="text-4xl font-black" style={{ color: 'var(--dash-text-1)' }}>
                    {Math.round(c.discountPercentage * 100)}%
                  </span>
                  <span className="text-sm font-bold pb-1" style={{ color: 'var(--dash-text-2)' }}>
                    OFF
                  </span>
                </div>
                <p className="text-[11px] mt-3 font-medium" style={{ color: 'var(--dash-text-3)' }}>
                  Created {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.onConfirm}
        title="Revoke Coupon"
        message="Are you sure you want to revoke this coupon code? It will no longer be usable by guests."
        confirmText="Revoke Now"
        confirmVariant="rose"
      />
    </motion.div>
  );
}
