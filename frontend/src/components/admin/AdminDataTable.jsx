import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  CheckCircle,
  Clock,
  Trash2,
  Volume2,
  VolumeX,
  X,
  Plus,
  FileText,
  ExternalLink,
  Star,
  XCircle,
  Download,
} from 'lucide-react';
import ConfirmModal from '../ui/ConfirmModal.jsx';
import { fixImg } from '../../utils/image.js';

export default function AdminDataTable({
  activeTab,
  loadingData,
  searchQuery,
  setSearchQuery,
  filteredData,
  dataList,
  handlers,
}) {
  const {
    handleApproveProperty,
    handleRejectProperty,
    handleToggleFeatured,
    handleUpdatePayout,
    handleMuteUser,
    handleApprovePartner,
    handleDeleteItem,
    handleCreatePartner,
  } = handlers;

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    confirmVariant: 'emerald',
    onConfirm: null,
    isLoading: false,
  });

  const closeConfirm = () =>
    setConfirmState((prev) => ({ ...prev, isOpen: false, isLoading: false }));

  const triggerConfirm = (config) => {
    setConfirmState({
      ...config,
      isOpen: true,
      isLoading: false,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmState.onConfirm) return;
    setConfirmState((prev) => ({ ...prev, isLoading: true }));
    try {
      await confirmState.onConfirm();
      closeConfirm();
    } catch (err) {
      console.error('Action failed:', err);
      setConfirmState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const [createPartnerModal, setCreatePartnerModal] = useState(false);
  const [viewPartnerModal, setViewPartnerModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [partnerForm, setPartnerForm] = useState({
    email: '',
    password: '',
    businessName: '',
    phone: '',
  });
  const [isCreatingPartner, setIsCreatingPartner] = useState(false);

  const openPartnerDetails = (partner) => {
    setSelectedPartner(partner);
    setViewPartnerModal(true);
  };

  const handleExportCSV = () => {
    if (!filteredData || filteredData.length === 0) return;

    let headers = [];
    let rows = [];

    if (activeTab === 'users') {
      headers = ['Email', 'Role', 'Phone', 'Muted', 'Created At'];
      rows = filteredData.map((u) => [
        `"${u.email || ''}"`,
        `"${u.role || 'user'}"`,
        `"${u.phone || ''}"`,
        u.muted ? 'Yes' : 'No',
        `"${u.createdAt ? new Date(u.createdAt).toISOString() : ''}"`,
      ]);
    } else if (activeTab === 'partners') {
      headers = ['Business Name', 'Email', 'Phone', 'Onboarded', 'GST', 'MSME', 'Created At'];
      rows = filteredData.map((p) => [
        `"${(p.businessName || '').replace(/"/g, '""')}"`,
        `"${p.email || ''}"`,
        `"${p.phone || ''}"`,
        p.onboarded ? 'Yes' : 'No',
        `"${p.gstNumber || ''}"`,
        `"${p.msmeNumber || ''}"`,
        `"${p.createdAt ? new Date(p.createdAt).toISOString() : ''}"`,
      ]);
    } else if (activeTab === 'listings') {
      headers = ['Title', 'Category', 'Owner Email', 'Price', 'Approved', 'Featured', 'Location'];
      rows = filteredData.map((l) => [
        `"${(l.title || '').replace(/"/g, '""')}"`,
        `"${l.category || ''}"`,
        `"${l.ownerEmail || ''}"`,
        l.price || 0,
        l.approved ? 'Yes' : 'No',
        l.featured ? 'Yes' : 'No',
        `"${(l.location || '').replace(/"/g, '""')}"`,
      ]);
    } else if (activeTab === 'bookings') {
      headers = [
        'Booking ID',
        'Property Title',
        'Guest Email',
        'Owner Email',
        'Check-In',
        'Check-Out',
        'Status',
        'Total Price (INR)',
        'Commission',
        'Payout Status',
      ];
      rows = filteredData.map((b) => [
        `"${b._id || ''}"`,
        `"${(b.title || '').replace(/"/g, '""')}"`,
        `"${b.guestEmail || ''}"`,
        `"${b.ownerEmail || ''}"`,
        `"${b.checkIn || ''}"`,
        `"${b.checkOut || ''}"`,
        `"${b.status || ''}"`,
        b.totalPrice || 0,
        b.commissionAmount || 0,
        `"${b.payoutStatus || 'pending'}"`,
      ]);
    } else {
      headers = Object.keys(filteredData[0] || {});
      rows = filteredData.map((item) =>
        headers.map((h) => `"${String(item[h] || '').replace(/"/g, '""')}"`)
      );
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `wayzza-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const submitCreatePartner = async (e) => {
    e.preventDefault();
    setIsCreatingPartner(true);
    const success = await handleCreatePartner(partnerForm);
    setIsCreatingPartner(false);
    if (success) {
      setCreatePartnerModal(false);
      setPartnerForm({ email: '', password: '', businessName: '', phone: '' });
    }
  };

  return (
    <motion.div
      key="list"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* PENDING APPROVAL SECTION for listings tab */}
      {activeTab === 'listings' && dataList.some((item) => !item.approved) && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="font-black text-sm text-white uppercase tracking-tight">
                Pending Inventory Approvals
              </h3>
              <p className="text-xs text-white/40 font-medium">
                {dataList.filter((i) => !i.approved).length} listings waiting for review
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {dataList
              .filter((item) => !item.approved)
              .map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between bg-white/[0.02] rounded-xl p-4 border border-white/[0.05] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/[0.05] text-white/70 rounded-xl flex items-center justify-center font-bold text-sm border border-white/[0.05]">
                      {(item.title || 'P').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-white">{item.title}</p>
                        <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded uppercase font-black tracking-wide">
                          {item.category === 'bike' || item.category === 'car'
                            ? 'Vehicle'
                            : item.category === 'activity'
                              ? 'Experience'
                              : 'Property'}
                        </span>
                      </div>
                      <p className="text-xs text-white/30 font-medium mt-0.5">
                        {item.ownerEmail} · {item.location || 'No location'} · ₹
                        {item.price?.toLocaleString()}
                      </p>
                      {(item.category === 'bike' || item.category === 'car') && (
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          {item.licensePlate && (
                            <span className="bg-white/10 text-white/80 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">
                              Plate: <strong className="text-white">{item.licensePlate}</strong>
                            </span>
                          )}
                          {item.rcDoc && (
                            <a
                              href={fixImg(item.rcDoc)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded flex items-center gap-1 transition-colors text-[10px] font-black uppercase tracking-wider"
                            >
                              <FileText size={11} /> RC Doc <ExternalLink size={10} />
                            </a>
                          )}
                          {item.insuranceDoc && (
                            <a
                              href={fixImg(item.insuranceDoc)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded flex items-center gap-1 transition-colors text-[10px] font-black uppercase tracking-wider"
                            >
                              <FileText size={11} /> Insurance <ExternalLink size={10} />
                            </a>
                          )}
                          {item.pucDoc && (
                            <a
                              href={fixImg(item.pucDoc)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded flex items-center gap-1 transition-colors text-[10px] font-black uppercase tracking-wider"
                            >
                              <FileText size={11} /> PUC Doc <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        triggerConfirm({
                          title: 'Approve Property',
                          message: `Are you sure you want to approve "${item.title}"?`,
                          confirmText: 'Approve Now',
                          confirmVariant: 'emerald',
                          onConfirm: () => handleApproveProperty(item._id),
                        })
                      }
                      className="h-9 px-4 bg-emerald-500 hover:bg-emerald-600 text-[#050a08] rounded-lg font-bold text-[11px] uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
                    >
                      <CheckCircle size={13} strokeWidth={2.5} /> Approve
                    </button>
                    <button
                      onClick={() =>
                        triggerConfirm({
                          title: 'Reject Property',
                          message: `Are you sure you want to reject "${item.title}"? This will delete the listing permanently.`,
                          confirmText: 'Reject & Delete',
                          confirmVariant: 'rose',
                          onConfirm: () => handleRejectProperty(item._id),
                        })
                      }
                      className="h-9 px-4 bg-white/[0.05] border border-white/[0.08] text-white hover:bg-rose-500 hover:border-rose-500 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all flex items-center gap-1.5"
                    >
                      <X size={13} strokeWidth={2.5} /> Reject
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* DATA TABLE */}
      <div
        className="rounded-2xl overflow-hidden dash-transition"
        style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-card-border)' }}
      >
        <div
          className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          style={{ borderBottom: '1px solid var(--dash-divider)' }}
        >
          <div>
            <h3
              className="text-lg font-black uppercase tracking-tight"
              style={{ color: 'var(--dash-text-1)' }}
            >
              {activeTab === 'listings' ? 'All Inventory' : activeTab}
            </h3>
            <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--dash-text-3)' }}>
              {filteredData.length} records found
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {activeTab === 'partners' && (
              <button
                onClick={() => setCreatePartnerModal(true)}
                className="h-10 px-4 bg-emerald-600 text-[#050a08] rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-emerald-500 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/10 whitespace-nowrap"
              >
                <Plus size={14} strokeWidth={2.5} /> Onboard Partner
              </button>
            )}
            <div className="relative w-full sm:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--dash-text-3)' }}
                size={14}
              />
              <input
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-lg pl-9 pr-4 text-xs font-medium transition-colors outline-none"
                style={{
                  background: 'rgba(128,128,128,0.06)',
                  border: '1px solid var(--dash-divider)',
                  color: 'var(--dash-text-1)',
                }}
              />
            </div>
            <button
              onClick={handleExportCSV}
              disabled={filteredData.length === 0}
              title="Export data to CSV file"
              className="h-10 px-3 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg font-bold text-[11px] uppercase tracking-wider transition-colors flex items-center gap-1.5 whitespace-nowrap"
              style={{
                background: 'rgba(128,128,128,0.06)',
                border: '1px solid var(--dash-divider)',
                color: 'var(--dash-text-2)',
              }}
            >
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--dash-divider)',
                  background: 'rgba(128,128,128,0.02)',
                }}
              >
                <th
                  className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em]"
                  style={{ color: 'var(--dash-text-3)' }}
                >
                  Details
                </th>
                <th
                  className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em]"
                  style={{ color: 'var(--dash-text-3)' }}
                >
                  Status
                </th>
                <th
                  className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em]"
                  style={{ color: 'var(--dash-text-3)' }}
                >
                  Info
                </th>
                <th
                  className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em]"
                  style={{ color: 'var(--dash-text-3)' }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ borderTop: '1px solid var(--dash-divider)' }}>
              {loadingData
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-6 py-4">
                        <div className="h-4 bg-white/[0.02] rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : filteredData.map((item, i) => (
                    <tr
                      key={`${item._id || item.email}-${i}`}
                      className="transition-colors group hover:bg-[var(--dash-accent-dim)]"
                      style={{ borderBottom: '1px solid var(--dash-divider)' }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${item.muted ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}
                          >
                            {(item.email || item.title || 'W').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p
                                className="font-bold text-sm truncate max-w-[200px]"
                                style={{ color: 'var(--dash-text-1)' }}
                              >
                                {item.title || item.businessName || item.email}
                              </p>
                              {item.muted && (
                                <span className="text-[10px] font-black text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded tracking-wide">
                                  MUTED
                                </span>
                              )}
                              {activeTab === 'listings' && (
                                <span
                                  className="text-[10px] px-1.5 py-0.5 rounded uppercase font-black tracking-wide"
                                  style={{
                                    background: 'rgba(128,128,128,0.1)',
                                    color: 'var(--dash-text-2)',
                                  }}
                                >
                                  {item.category === 'bike' || item.category === 'car'
                                    ? 'Veh.'
                                    : item.category === 'activity'
                                      ? 'Exp.'
                                      : 'Prop.'}
                                </span>
                              )}
                            </div>
                            <p
                              className="text-xs font-medium mt-0.5"
                              style={{ color: 'var(--dash-text-3)' }}
                            >
                              {item.ownerEmail ||
                                item.email ||
                                `#${item._id?.slice(-8)?.toUpperCase()}`}
                            </p>
                            {activeTab === 'bookings' && (
                              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mt-1 font-mono">
                                Stay: {item.checkIn} → {item.checkOut} ({item.nights}{' '}
                                {item.nights === 1 ? 'night' : 'nights'})
                              </p>
                            )}
                            {activeTab === 'listings' &&
                              (item.category === 'bike' || item.category === 'car') &&
                              (item.rcDoc || item.insuranceDoc || item.pucDoc) && (
                                <div className="flex gap-2 mt-1">
                                  {item.rcDoc && (
                                    <a
                                      href={fixImg(item.rcDoc)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] text-emerald-500 hover:underline"
                                    >
                                      RC
                                    </a>
                                  )}
                                  {item.insuranceDoc && (
                                    <a
                                      href={fixImg(item.insuranceDoc)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] text-emerald-500 hover:underline"
                                    >
                                      Ins
                                    </a>
                                  )}
                                  {item.pucDoc && (
                                    <a
                                      href={fixImg(item.pucDoc)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] text-emerald-500 hover:underline"
                                    >
                                      PUC
                                    </a>
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex flex-col gap-1">
                          {activeTab === 'bookings' ? (
                            (() => {
                              const isVehicle = item.category === 'bike' || item.category === 'car';
                              const isActivity =
                                item.category === 'activity' || item.category === 'experience';

                              let colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                              let statusLabel = 'Pending';
                              if (item.status === 'paid') {
                                colorClass =
                                  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                                statusLabel = 'Confirmed';
                              } else if (item.status === 'arrived') {
                                colorClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                                statusLabel = isVehicle
                                  ? 'Picked Up'
                                  : isActivity
                                    ? 'Ongoing'
                                    : 'In-Stay';
                              } else if (item.status === 'departed') {
                                colorClass = 'bg-gray-500/10 text-gray-400 border-gray-500/20';
                                statusLabel = 'Completed';
                              } else if (item.status === 'cancelled') {
                                colorClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                                statusLabel = 'Cancelled';
                              }
                              return (
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border w-fit ${colorClass}`}
                                >
                                  {statusLabel}
                                </span>
                              );
                            })()
                          ) : activeTab === 'users' ? (
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border w-fit ${item.muted ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}
                            >
                              {item.muted ? (
                                <>
                                  <XCircle size={10} strokeWidth={2.5} /> Suspended
                                </>
                              ) : (
                                <>
                                  <CheckCircle size={10} strokeWidth={2.5} /> Active
                                </>
                              )}
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border w-fit ${item.approved || item.onboarded ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : activeTab === 'partners' && !item.onboarded && !item.onboardingCompleted ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}
                            >
                              {item.approved || item.onboarded ? (
                                <>
                                  <CheckCircle size={10} strokeWidth={2.5} /> Active
                                </>
                              ) : activeTab === 'partners' &&
                                !item.onboarded &&
                                !item.onboardingCompleted ? (
                                <>
                                  <Clock size={10} strokeWidth={2.5} /> Incomplete
                                </>
                              ) : (
                                <>
                                  <Clock size={10} strokeWidth={2.5} /> Pending
                                </>
                              )}
                            </span>
                          )}
                          {activeTab === 'bookings' &&
                            ['paid', 'arrived', 'departed'].includes(item.status) && (
                              <span
                                className={`text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded w-fit ${item.payoutStatus === 'paid_out' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}
                              >
                                Payout: {item.payoutStatus === 'paid_out' ? 'Settled' : 'Pending'}
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {activeTab === 'partners' ? (
                          <div className="flex flex-col gap-1">
                            {item.msmeNumber ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded px-2 py-0.5 uppercase tracking-wide w-fit">
                                MSME: {item.msmeNumber}
                              </span>
                            ) : (
                              <span
                                className="text-[10px] font-bold uppercase tracking-wide"
                                style={{ color: 'var(--dash-text-3)' }}
                              >
                                No MSME
                              </span>
                            )}
                            {item.gstNumber ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded px-2 py-0.5 uppercase tracking-wide w-fit">
                                GST: {item.gstNumber}
                              </span>
                            ) : (
                              <span
                                className="text-[10px] font-bold uppercase tracking-wide"
                                style={{ color: 'var(--dash-text-3)' }}
                              >
                                No GST
                              </span>
                            )}
                          </div>
                        ) : activeTab === 'bookings' ? (
                          <div className="flex flex-col gap-1">
                            <span
                              className="text-xs font-bold"
                              style={{ color: 'var(--dash-text-2)' }}
                            >
                              Guest: {item.guestEmail}
                            </span>
                            <div
                              className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider mt-0.5"
                              style={{ color: 'var(--dash-text-3)' }}
                            >
                              <span>Paid: ₹{(item.totalPrice || 0).toLocaleString()}</span>
                              <span
                                className="w-1 h-1 rounded-full"
                                style={{ background: 'var(--dash-divider)' }}
                              />
                              <span>Comm: ₹{(item.commissionAmount || 0).toLocaleString()}</span>
                              <span
                                className="w-1 h-1 rounded-full"
                                style={{ background: 'var(--dash-divider)' }}
                              />
                              <span className="text-emerald-500">
                                Net: ₹{(item.netEarnings || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span
                            className="text-sm font-bold"
                            style={{ color: 'var(--dash-text-2)' }}
                          >
                            {item.price
                              ? `₹${item.price.toLocaleString()}${
                                  activeTab === 'listings' && item.viewCount
                                    ? ` · 👁 ${item.viewCount.toLocaleString()} views`
                                    : ''
                                }`
                              : item.role || item.checkIn || '—'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-100 lg:opacity-40 lg:group-hover:opacity-100 transition-all">
                          {activeTab === 'bookings' &&
                            ['paid', 'arrived', 'departed'].includes(item.status) &&
                            item.payoutStatus !== 'paid_out' && (
                              <button
                                onClick={() =>
                                  triggerConfirm({
                                    title: 'Settle Payout',
                                    message: `Mark payout for booking #${item._id?.slice(-8)?.toUpperCase()} as settled?`,
                                    confirmText: 'Mark as Settled',
                                    confirmVariant: 'emerald',
                                    onConfirm: () => handleUpdatePayout(item._id, 'paid_out'),
                                  })
                                }
                                className="h-8 px-3 bg-emerald-500 hover:bg-emerald-600 text-[#050a08] rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                              >
                                <CheckCircle size={12} strokeWidth={2.5} /> Settle
                              </button>
                            )}
                          {activeTab === 'listings' && item.approved && (
                            <button
                              onClick={() => handleToggleFeatured(item._id, !item.featured)}
                              title={item.featured ? 'Unpin from featured' : 'Pin as featured'}
                              className={`h-8 px-3 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all border ${
                                item.featured
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500 hover:text-[#050a08]'
                                  : 'hover:bg-amber-500/20 hover:text-amber-400'
                              }`}
                              style={
                                item.featured
                                  ? {}
                                  : {
                                      background: 'rgba(128,128,128,0.06)',
                                      border: '1px solid var(--dash-divider)',
                                      color: 'var(--dash-text-2)',
                                    }
                              }
                            >
                              <Star size={11} className={item.featured ? 'fill-amber-400' : ''} />
                              {item.featured ? 'Featured' : 'Feature'}
                            </button>
                          )}
                          {activeTab === 'listings' && !item.approved && (
                            <button
                              onClick={() =>
                                triggerConfirm({
                                  title: 'Approve Listing',
                                  message: `Approve "${item.title}" and make it visible to guests?`,
                                  confirmText: 'Approve Now',
                                  confirmVariant: 'emerald',
                                  onConfirm: () => handleApproveProperty(item._id),
                                })
                              }
                              className="h-8 px-3 bg-emerald-500 hover:bg-emerald-600 text-[#050a08] rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                            >
                              <CheckCircle size={12} strokeWidth={2.5} /> Approve
                            </button>
                          )}
                          {activeTab === 'users' && (
                            <button
                              onClick={() =>
                                triggerConfirm({
                                  title: item.muted ? 'Unmute User' : 'Mute User',
                                  message: `Are you sure you want to ${item.muted ? 'unmute' : 'mute'} ${item.email}?`,
                                  confirmText: item.muted ? 'Unmute' : 'Mute User',
                                  confirmVariant: item.muted ? 'emerald' : 'rose',
                                  onConfirm: () => handleMuteUser(item.email, !item.muted),
                                })
                              }
                              className={`h-8 px-3 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all border ${
                                item.muted
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-[#050a08]'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500 hover:text-[#050a08]'
                              }`}
                            >
                              {item.muted ? (
                                <>
                                  <Volume2 size={12} /> Unmute
                                </>
                              ) : (
                                <>
                                  <VolumeX size={12} /> Mute
                                </>
                              )}
                            </button>
                          )}
                          {activeTab === 'partners' &&
                            !item.onboarded &&
                            (item.onboardingCompleted || item.businessName) && (
                              <button
                                onClick={() =>
                                  triggerConfirm({
                                    title: 'Approve Partner',
                                    message: `Approve ${item.businessName || item.email} as an active partner?`,
                                    confirmText: 'Approve Partner',
                                    confirmVariant: 'emerald',
                                    onConfirm: () => handleApprovePartner(item.email),
                                  })
                                }
                                className="h-8 px-3 bg-emerald-500 hover:bg-emerald-600 text-[#050a08] rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                              >
                                <CheckCircle size={12} strokeWidth={2.5} /> Approve
                              </button>
                            )}
                          {activeTab === 'partners' && (
                            <button
                              onClick={() => openPartnerDetails(item)}
                              className="h-8 px-3 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all hover:opacity-80"
                              style={{
                                background: 'rgba(128,128,128,0.06)',
                                border: '1px solid var(--dash-divider)',
                                color: 'var(--dash-text-1)',
                              }}
                            >
                              <FileText size={12} /> View Details
                            </button>
                          )}
                          {activeTab === 'partners' &&
                            !item.onboarded &&
                            !item.onboardingCompleted &&
                            !item.businessName && (
                              <span
                                className="text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 mr-2 px-2"
                                style={{ color: 'var(--dash-text-3)' }}
                              >
                                Awaiting Details
                              </span>
                            )}
                          <button
                            onClick={() =>
                              triggerConfirm({
                                title: `Delete ${activeTab.slice(0, -1)}`,
                                message: `Are you sure you want to delete this ${activeTab.slice(0, -1)}? This action cannot be undone.`,
                                confirmText: 'Delete Permanently',
                                confirmVariant: 'rose',
                                onConfirm: () =>
                                  handleDeleteItem(activeTab, item.email || item._id),
                              })
                            }
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                            style={{
                              background: 'rgba(248,113,113,0.08)',
                              border: '1px solid rgba(248,113,113,0.2)',
                              color: 'var(--dash-danger)',
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className="py-20 text-center">
              <Search size={24} className="text-white/10 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest mb-1">
                No records found
              </h3>
              <p className="text-xs text-white/20 font-medium">Try adjusting your search query.</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={handleConfirmAction}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        confirmVariant={confirmState.confirmVariant}
        isLoading={confirmState.isLoading}
      />

      {/* Onboard Partner Modal */}
      {createPartnerModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden dash-transition"
            style={{
              background: 'var(--dash-sidebar)',
              border: '1px solid var(--dash-card-border)',
            }}
          >
            <div
              className="p-6 flex justify-between items-center shrink-0"
              style={{ borderBottom: '1px solid var(--dash-divider)' }}
            >
              <div>
                <h3
                  className="text-lg font-black uppercase tracking-tight"
                  style={{ color: 'var(--dash-text-1)' }}
                >
                  Onboard Partner
                </h3>
                <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--dash-text-3)' }}>
                  Create a new partner account directly
                </p>
              </div>
              <button
                onClick={() => setCreatePartnerModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                style={{ background: 'rgba(128,128,128,0.06)', color: 'var(--dash-text-2)' }}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={submitCreatePartner} className="p-6 space-y-4">
              <div>
                <label
                  className="block text-[10px] font-black uppercase tracking-[0.2em] mb-1.5"
                  style={{ color: 'var(--dash-text-2)' }}
                >
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={partnerForm.businessName}
                  onChange={(e) => setPartnerForm({ ...partnerForm, businessName: e.target.value })}
                  className="w-full h-11 rounded-xl px-4 text-sm font-medium transition-all outline-none"
                  style={{
                    background: 'rgba(128,128,128,0.06)',
                    border: '1px solid var(--dash-divider)',
                    color: 'var(--dash-text-1)',
                  }}
                  placeholder="e.g. Sunset Villas"
                />
              </div>
              <div>
                <label
                  className="block text-[10px] font-black uppercase tracking-[0.2em] mb-1.5"
                  style={{ color: 'var(--dash-text-2)' }}
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={partnerForm.email}
                  onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                  className="w-full h-11 rounded-xl px-4 text-sm font-medium transition-all outline-none"
                  style={{
                    background: 'rgba(128,128,128,0.06)',
                    border: '1px solid var(--dash-divider)',
                    color: 'var(--dash-text-1)',
                  }}
                  placeholder="partner@example.com"
                />
              </div>
              <div>
                <label
                  className="block text-[10px] font-black uppercase tracking-[0.2em] mb-1.5"
                  style={{ color: 'var(--dash-text-2)' }}
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={partnerForm.phone}
                  onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                  className="w-full h-11 rounded-xl px-4 text-sm font-medium transition-all outline-none"
                  style={{
                    background: 'rgba(128,128,128,0.06)',
                    border: '1px solid var(--dash-divider)',
                    color: 'var(--dash-text-1)',
                  }}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label
                  className="block text-[10px] font-black uppercase tracking-[0.2em] mb-1.5"
                  style={{ color: 'var(--dash-text-2)' }}
                >
                  Temporary Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={partnerForm.password}
                  onChange={(e) => setPartnerForm({ ...partnerForm, password: e.target.value })}
                  className="w-full h-11 rounded-xl px-4 text-sm font-medium transition-all outline-none"
                  style={{
                    background: 'rgba(128,128,128,0.06)',
                    border: '1px solid var(--dash-divider)',
                    color: 'var(--dash-text-1)',
                  }}
                  placeholder="Minimum 6 characters"
                />
                <p
                  className="text-[10px] font-bold uppercase tracking-wide mt-1.5"
                  style={{ color: 'var(--dash-text-3)' }}
                >
                  Provide this password to the partner securely.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreatePartnerModal(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-colors"
                  style={{ color: 'var(--dash-text-2)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingPartner}
                  className="px-5 py-2.5 bg-emerald-600 text-[#050a08] rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/10 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCreatingPartner && (
                    <div className="w-4 h-4 border-2 border-[#050a08]/20 border-t-[#050a08] rounded-full animate-spin" />
                  )}
                  {isCreatingPartner ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Partner Details Modal */}
      {viewPartnerModal && selectedPartner && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] dash-transition"
            style={{
              background: 'var(--dash-sidebar)',
              border: '1px solid var(--dash-card-border)',
            }}
          >
            <div
              className="p-6 flex justify-between items-center shrink-0"
              style={{ borderBottom: '1px solid var(--dash-divider)' }}
            >
              <div>
                <h3
                  className="text-lg font-black uppercase tracking-tight"
                  style={{ color: 'var(--dash-text-1)' }}
                >
                  Partner Details
                </h3>
                <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--dash-text-3)' }}>
                  Review submitted information for{' '}
                  {selectedPartner.businessName || selectedPartner.email}
                </p>
              </div>
              <button
                onClick={() => setViewPartnerModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                style={{ background: 'rgba(128,128,128,0.06)', color: 'var(--dash-text-2)' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: 'rgba(128,128,128,0.04)',
                    border: '1px solid var(--dash-divider)',
                  }}
                >
                  <p
                    className="text-[10px] font-black uppercase tracking-widest mb-1"
                    style={{ color: 'var(--dash-text-3)' }}
                  >
                    Business Name
                  </p>
                  <p className="text-sm font-bold" style={{ color: 'var(--dash-text-1)' }}>
                    {selectedPartner.businessName || '—'}
                  </p>
                </div>
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: 'rgba(128,128,128,0.04)',
                    border: '1px solid var(--dash-divider)',
                  }}
                >
                  <p
                    className="text-[10px] font-black uppercase tracking-widest mb-1"
                    style={{ color: 'var(--dash-text-3)' }}
                  >
                    Email / Phone
                  </p>
                  <p className="text-sm font-bold" style={{ color: 'var(--dash-text-1)' }}>
                    {selectedPartner.email}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--dash-text-2)' }}>
                    {selectedPartner.phone || 'No phone'}
                  </p>
                </div>
              </div>

              <div>
                <h4
                  className="text-xs font-black uppercase tracking-widest pb-2 mb-3"
                  style={{
                    color: 'var(--dash-text-2)',
                    borderBottom: '1px solid var(--dash-divider)',
                  }}
                >
                  Legal & Compliance
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className="rounded-xl p-4"
                    style={{
                      background: 'rgba(128,128,128,0.04)',
                      border: '1px solid var(--dash-divider)',
                    }}
                  >
                    <p
                      className="text-[10px] font-black uppercase tracking-widest mb-1"
                      style={{ color: 'var(--dash-text-3)' }}
                    >
                      MSME Number
                    </p>
                    <p
                      className="text-sm font-bold font-mono"
                      style={{ color: 'var(--dash-text-1)' }}
                    >
                      {selectedPartner.msmeNumber || '—'}
                    </p>
                  </div>
                  <div
                    className="rounded-xl p-4"
                    style={{
                      background: 'rgba(128,128,128,0.04)',
                      border: '1px solid var(--dash-divider)',
                    }}
                  >
                    <p
                      className="text-[10px] font-black uppercase tracking-widest mb-1"
                      style={{ color: 'var(--dash-text-3)' }}
                    >
                      GST Number
                    </p>
                    <p
                      className="text-sm font-bold font-mono"
                      style={{ color: 'var(--dash-text-1)' }}
                    >
                      {selectedPartner.gstNumber || '—'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4
                  className="text-xs font-black uppercase tracking-widest pb-2 mb-3"
                  style={{
                    color: 'var(--dash-text-2)',
                    borderBottom: '1px solid var(--dash-divider)',
                  }}
                >
                  Bank Details
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div
                    className="rounded-xl p-4"
                    style={{
                      background: 'rgba(128,128,128,0.04)',
                      border: '1px solid var(--dash-divider)',
                    }}
                  >
                    <p
                      className="text-[10px] font-black uppercase tracking-widest mb-1"
                      style={{ color: 'var(--dash-text-3)' }}
                    >
                      Bank Name
                    </p>
                    <p
                      className="text-sm font-bold truncate"
                      style={{ color: 'var(--dash-text-1)' }}
                      title={selectedPartner.bankName}
                    >
                      {selectedPartner.bankName || '—'}
                    </p>
                  </div>
                  <div
                    className="rounded-xl p-4"
                    style={{
                      background: 'rgba(128,128,128,0.04)',
                      border: '1px solid var(--dash-divider)',
                    }}
                  >
                    <p
                      className="text-[10px] font-black uppercase tracking-widest mb-1"
                      style={{ color: 'var(--dash-text-3)' }}
                    >
                      Account Number
                    </p>
                    <p
                      className="text-sm font-bold font-mono"
                      style={{ color: 'var(--dash-text-1)' }}
                    >
                      {selectedPartner.accountNumber || '—'}
                    </p>
                  </div>
                  <div
                    className="rounded-xl p-4 sm:col-span-1 col-span-2"
                    style={{
                      background: 'rgba(128,128,128,0.04)',
                      border: '1px solid var(--dash-divider)',
                    }}
                  >
                    <p
                      className="text-[10px] font-black uppercase tracking-widest mb-1"
                      style={{ color: 'var(--dash-text-3)' }}
                    >
                      IFSC Code
                    </p>
                    <p
                      className="text-sm font-bold font-mono"
                      style={{ color: 'var(--dash-text-1)' }}
                    >
                      {selectedPartner.ifscCode || '—'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4
                  className="text-xs font-black uppercase tracking-widest pb-2 mb-3"
                  style={{
                    color: 'var(--dash-text-2)',
                    borderBottom: '1px solid var(--dash-divider)',
                  }}
                >
                  Location
                </h4>
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: 'rgba(128,128,128,0.04)',
                    border: '1px solid var(--dash-divider)',
                  }}
                >
                  <p
                    className="text-[10px] font-black uppercase tracking-widest mb-1"
                    style={{ color: 'var(--dash-text-3)' }}
                  >
                    Full Address
                  </p>
                  <p
                    className="text-sm font-medium whitespace-pre-wrap"
                    style={{ color: 'var(--dash-text-2)' }}
                  >
                    {selectedPartner.address || 'No address provided'}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="p-4 flex justify-end gap-3 shrink-0"
              style={{ borderTop: '1px solid var(--dash-divider)' }}
            >
              <button
                onClick={() => setViewPartnerModal(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-colors"
                style={{ color: 'var(--dash-text-2)' }}
              >
                Close Details
              </button>
              {!selectedPartner.onboarded &&
                (selectedPartner.onboardingCompleted || selectedPartner.businessName) && (
                  <button
                    onClick={() => {
                      setViewPartnerModal(false);
                      triggerConfirm({
                        title: 'Approve Partner',
                        message: `Approve ${selectedPartner.businessName || selectedPartner.email} as an active partner?`,
                        confirmText: 'Approve Partner',
                        confirmVariant: 'emerald',
                        onConfirm: () => handleApprovePartner(selectedPartner.email),
                      });
                    }}
                    className="px-5 py-2.5 bg-emerald-600 text-[#050a08] rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/10 flex items-center gap-1.5"
                  >
                    <CheckCircle size={14} strokeWidth={2.5} /> Approve Partner
                  </button>
                )}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
