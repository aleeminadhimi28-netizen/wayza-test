import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Mail,
  IndianRupee,
  Calendar,
  Clock,
  User,
  Phone,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
} from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../../ToastContext';
import { motion } from 'framer-motion';

export default function AdminPackageRequests() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchRequests = () => {
    setLoading(true);
    api
      .adminGetPackageRequests()
      .then((res) => {
        if (res.ok && Array.isArray(res.data)) {
          setRequests(res.data);
        }
        setLoading(false);
      })
      .catch(() => {
        showToast('Failed to fetch package requests', 'error');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await api.adminUpdatePackageRequest(id, { status: newStatus });
      if (res.ok) {
        showToast('Request status updated', 'success');
        setRequests((prev) =>
          prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
        );
      } else {
        showToast(res.message || 'Failed to update status', 'error');
      }
    } catch {
      showToast('Error updating status', 'error');
    }
    setUpdatingId(null);
  };

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      !search ||
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.phone?.includes(search) ||
      r.vibe?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const contactedCount = requests.filter((r) => r.status === 'contacted').length;
  const fulfilledCount = requests.filter((r) => r.status === 'fulfilled').length;

  if (loading)
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-2 border-white/10 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-2">
            <Sparkles size={12} />
            Wayzza Concierge Leads
          </div>
          <h1
            className="text-2xl font-black uppercase tracking-tight"
            style={{ color: 'var(--dash-text-1)' }}
          >
            Custom Package Requests
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--dash-text-2)' }}>
            Review, manage, and fulfill client budget package submissions.
          </p>
        </div>

        {/* Stats summary */}
        <div className="flex gap-3">
          <div
            className="px-4 py-2.5 rounded-xl text-center"
            style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-card-border)' }}
          >
            <div className="text-[10px] font-black uppercase text-amber-400">Pending</div>
            <div className="text-xl font-black text-amber-400">{pendingCount}</div>
          </div>
          <div
            className="px-4 py-2.5 rounded-xl text-center"
            style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-card-border)' }}
          >
            <div className="text-[10px] font-black uppercase text-blue-400">Contacted</div>
            <div className="text-xl font-black text-blue-400">{contactedCount}</div>
          </div>
          <div
            className="px-4 py-2.5 rounded-xl text-center"
            style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-card-border)' }}
          >
            <div className="text-[10px] font-black uppercase text-emerald-400">Fulfilled</div>
            <div className="text-xl font-black text-emerald-400">{fulfilledCount}</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div
          className="flex gap-1.5 p-1 rounded-xl"
          style={{
            background: 'rgba(128,128,128,0.1)',
            border: '1px solid var(--dash-card-border)',
          }}
        >
          {[
            { id: 'all', label: 'All Requests' },
            { id: 'pending', label: `Pending (${pendingCount})` },
            { id: 'contacted', label: 'Contacted' },
            { id: 'fulfilled', label: 'Fulfilled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                statusFilter === tab.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'hover:opacity-100 opacity-60'
              }`}
              style={
                statusFilter === tab.id
                  ? {}
                  : { color: 'var(--dash-text-1)' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-bold rounded-xl outline-none"
            style={{
              background: 'rgba(128,128,128,0.06)',
              border: '1px solid var(--dash-card-border)',
              color: 'var(--dash-text-1)',
            }}
          />
        </div>
      </div>

      {/* Leads Cards List */}
      {filteredRequests.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-card-border)' }}
        >
          <AlertCircle size={32} className="mx-auto text-slate-500 mb-3" />
          <p className="font-bold text-sm" style={{ color: 'var(--dash-text-2)' }}>
            No package requests found matching your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRequests.map((item) => {
            const cleanPhone = (item.phone || '').replace(/[^0-9]/g, '');
            const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
            const waMsg = `Hi ${item.name}! I am contacting you from Wayzza Varkala regarding your custom package request (${item.duration}, Budget: ₹${item.budget?.toLocaleString('en-IN')}).`;

            return (
              <div
                key={item._id}
                className="rounded-2xl p-6 space-y-4 relative overflow-hidden transition-all hover:border-emerald-500/40"
                style={{
                  background: 'var(--dash-card)',
                  border: '1px solid var(--dash-card-border)',
                }}
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-base" style={{ color: 'var(--dash-text-1)' }}>
                        {item.name}
                      </h3>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          item.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : item.status === 'contacted'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : item.status === 'fulfilled'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-500/20 text-slate-400'
                        }`}
                      >
                        {item.status || 'pending'}
                      </span>
                    </div>
                    <p
                      className="text-xs mt-0.5 flex items-center gap-2"
                      style={{ color: 'var(--dash-text-2)' }}
                    >
                      <span>
                        <User size={12} className="inline mr-1" />
                        {item.email}
                      </span>
                    </p>
                  </div>

                  {/* Budget Highlight Badge */}
                  <div className="text-right shrink-0">
                    <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                      Target Budget
                    </div>
                    <div className="text-xl font-black text-emerald-400 flex items-center justify-end">
                      <IndianRupee size={16} />
                      <span>{item.budget ? item.budget.toLocaleString('en-IN') : '0'}</span>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div
                  className="grid grid-cols-2 gap-2 p-3.5 rounded-xl text-xs"
                  style={{
                    background: 'rgba(128,128,128,0.05)',
                    border: '1px solid var(--dash-divider)',
                  }}
                >
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block mb-0.5">
                      Destination & Duration
                    </span>
                    <span className="font-bold" style={{ color: 'var(--dash-text-1)' }}>
                      {item.destination || 'Varkala'} ({item.duration || '3N / 4D'})
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block mb-0.5">
                      Vibe & Stay Tier
                    </span>
                    <span className="font-bold" style={{ color: 'var(--dash-text-1)' }}>
                      {item.vibe || 'Relax'} • {item.stay || 'Standard'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block mb-0.5">
                      Travellers & Transfer
                    </span>
                    <span className="font-bold" style={{ color: 'var(--dash-text-1)' }}>
                      {item.guests || 1} Person(s) • {item.transport || 'None'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block mb-0.5">
                      Submitted Date
                    </span>
                    <span className="font-medium" style={{ color: 'var(--dash-text-2)' }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  {Array.isArray(item.addons) && item.addons.length > 0 && (
                    <div className="col-span-2 pt-1 border-t border-slate-700/40">
                      <span className="text-[10px] uppercase font-extrabold text-slate-400 block mb-0.5">
                        Add-on Experiences
                      </span>
                      <span className="font-medium text-emerald-400">{item.addons.join(', ')}</span>
                    </div>
                  )}

                  {item.notes && (
                    <div className="col-span-2 pt-1 border-t border-slate-700/40">
                      <span className="text-[10px] uppercase font-extrabold text-slate-400 block mb-0.5">
                        Client Special Notes
                      </span>
                      <p className="italic text-slate-300">{item.notes}</p>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">
                      Status:
                    </label>
                    <select
                      value={item.status || 'pending'}
                      disabled={updatingId === item._id}
                      onChange={(e) => handleStatusChange(item._id, e.target.value)}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none cursor-pointer"
                      style={{
                        background: 'rgba(128,128,128,0.1)',
                        border: '1px solid var(--dash-card-border)',
                        color: 'var(--dash-text-1)',
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="fulfilled">Fulfilled</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Outreach Buttons */}
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/${waNumber}?text=${encodeURIComponent(waMsg)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-emerald-500/30"
                    >
                      <MessageSquare size={14} /> WhatsApp
                    </a>

                    <a
                      href={`mailto:${item.email}?subject=${encodeURIComponent(`Wayzza Varkala Custom Package Offer (${item.duration})`)}&body=${encodeURIComponent(waMsg)}`}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-blue-500/30"
                    >
                      <Mail size={14} /> Email
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
