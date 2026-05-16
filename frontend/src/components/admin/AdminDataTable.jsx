import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, Clock, Trash2, Volume2, VolumeX, X, Plus } from 'lucide-react';
import ConfirmModal from '../ui/ConfirmModal.jsx';

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
    confirmVariant: 'indigo',
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
  const [partnerForm, setPartnerForm] = useState({
    email: '',
    password: '',
    businessName: '',
    phone: '',
  });
  const [isCreatingPartner, setIsCreatingPartner] = useState(false);

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
                          {item.category === 'activity' ? 'Experience' : 'Property'}
                        </span>
                      </div>
                      <p className="text-xs text-white/30 font-medium mt-0.5">
                        {item.ownerEmail} · {item.location || 'No location'} · ₹
                        {item.price?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        triggerConfirm({
                          title: 'Approve Property',
                          message: `Are you sure you want to approve "${item.title}"?`,
                          confirmText: 'Approve Now',
                          confirmVariant: 'indigo',
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
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-xl overflow-hidden">
        <div className="p-6 border-b border-white/[0.05] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">
              {activeTab === 'listings' ? 'All Inventory' : activeTab}
            </h3>
            <p className="text-xs text-white/30 font-medium mt-0.5">
              {filteredData.length} records found
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {activeTab === 'partners' && (
              <button
                onClick={() => setCreatePartnerModal(true)}
                className="h-10 px-4 bg-indigo-600 text-white rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-600/10 whitespace-nowrap"
              >
                <Plus size={14} strokeWidth={2.5} /> Onboard Partner
              </button>
            )}
            <div className="relative w-full sm:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"
                size={14}
              />
              <input
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full bg-white/[0.03] border border-white/[0.08] rounded-lg pl-9 pr-4 text-xs font-medium text-white placeholder:text-white/10 focus:bg-white/[0.05] focus:border-white/[0.15] transition-colors outline-none"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.05] bg-white/[0.01]">
                <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                  Details
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                  Info
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
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
                      className="hover:bg-white/[0.01] transition-colors group"
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
                              <p className="font-bold text-sm text-white truncate max-w-[200px]">
                                {item.title || item.businessName || item.email}
                              </p>
                              {item.muted && (
                                <span className="text-[10px] font-black text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded tracking-wide">
                                  MUTED
                                </span>
                              )}
                              {activeTab === 'listings' && (
                                <span className="text-[10px] bg-white/[0.05] text-white/40 px-1.5 py-0.5 rounded uppercase font-black tracking-wide">
                                  {item.category === 'activity' ? 'Exp.' : 'Prop.'}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-white/30 font-medium mt-0.5">
                              {item.ownerEmail ||
                                item.email ||
                                `#${item._id?.slice(-8)?.toUpperCase()}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border w-fit ${item.status === 'paid' || item.approved || item.onboarded ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : activeTab === 'partners' && !item.onboarded && !item.onboardingCompleted ? 'bg-white/[0.05] text-white/40 border-white/[0.05]' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}
                          >
                            {item.status === 'paid' || item.approved || item.onboarded ? (
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
                          {activeTab === 'bookings' && item.status === 'paid' && (
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
                              <span className="text-[10px] text-white/20 font-bold uppercase tracking-wide">
                                No MSME
                              </span>
                            )}
                            {item.gstNumber ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded px-2 py-0.5 uppercase tracking-wide w-fit">
                                GST: {item.gstNumber}
                              </span>
                            ) : (
                              <span className="text-[10px] text-white/20 font-bold uppercase tracking-wide">
                                No GST
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-white/70">
                            {activeTab === 'bookings'
                              ? item.guestEmail
                              : item.price
                                ? `₹${item.price.toLocaleString()}`
                                : item.role || item.checkIn || '—'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-100 lg:opacity-40 lg:group-hover:opacity-100 transition-all">
                          {activeTab === 'bookings' &&
                            item.status === 'paid' &&
                            item.payoutStatus !== 'paid_out' && (
                              <button
                                onClick={() =>
                                  triggerConfirm({
                                    title: 'Settle Payout',
                                    message: `Mark payout for booking #${item._id?.slice(-8)?.toUpperCase()} as settled?`,
                                    confirmText: 'Mark as Settled',
                                    confirmVariant: 'indigo',
                                    onConfirm: () => handleUpdatePayout(item._id, 'paid_out'),
                                  })
                                }
                                className="h-8 px-3 bg-emerald-500 hover:bg-emerald-600 text-[#050a08] rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                              >
                                <CheckCircle size={12} strokeWidth={2.5} /> Settle
                              </button>
                            )}
                          {activeTab === 'listings' && !item.approved && (
                            <button
                              onClick={() =>
                                triggerConfirm({
                                  title: 'Approve Listing',
                                  message: `Approve "${item.title}" and make it visible to guests?`,
                                  confirmText: 'Approve Now',
                                  confirmVariant: 'indigo',
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
                                  confirmVariant: item.muted ? 'indigo' : 'rose',
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
                            item.onboardingCompleted && (
                              <button
                                onClick={() =>
                                  triggerConfirm({
                                    title: 'Approve Partner',
                                    message: `Approve ${item.businessName || item.email} as an active partner?`,
                                    confirmText: 'Approve Partner',
                                    confirmVariant: 'indigo',
                                    onConfirm: () => handleApprovePartner(item.email),
                                  })
                                }
                                className="h-8 px-3 bg-emerald-500 hover:bg-emerald-600 text-[#050a08] rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                              >
                                <CheckCircle size={12} strokeWidth={2.5} /> Approve
                              </button>
                            )}
                          {activeTab === 'partners' &&
                            !item.onboarded &&
                            !item.onboardingCompleted && (
                              <span className="text-[10px] font-bold text-white/20 uppercase tracking-wide flex items-center gap-1 mr-2 px-2">
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
                            className="w-8 h-8 bg-white/[0.05] text-rose-400 border border-white/[0.05] rounded-lg flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
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
        <div className="fixed inset-0 bg-[#06070f]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#06070f] border border-white/[0.08] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-white/[0.05] flex justify-between items-center bg-white/[0.02]">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                  Onboard Partner
                </h3>
                <p className="text-xs text-white/30 font-medium mt-0.5">
                  Create a new partner account directly
                </p>
              </div>
              <button
                onClick={() => setCreatePartnerModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.05] text-white/40 hover:bg-white/[0.1] hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={submitCreatePartner} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1.5">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={partnerForm.businessName}
                  onChange={(e) => setPartnerForm({ ...partnerForm, businessName: e.target.value })}
                  className="w-full h-11 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 text-sm font-medium text-white placeholder:text-white/10 focus:bg-white/[0.05] focus:border-white/[0.15] transition-all outline-none"
                  placeholder="e.g. Sunset Villas"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={partnerForm.email}
                  onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                  className="w-full h-11 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 text-sm font-medium text-white placeholder:text-white/10 focus:bg-white/[0.05] focus:border-white/[0.15] transition-all outline-none"
                  placeholder="partner@example.com"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={partnerForm.phone}
                  onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                  className="w-full h-11 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 text-sm font-medium text-white placeholder:text-white/10 focus:bg-white/[0.05] focus:border-white/[0.15] transition-all outline-none"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1.5">
                  Temporary Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={partnerForm.password}
                  onChange={(e) => setPartnerForm({ ...partnerForm, password: e.target.value })}
                  className="w-full h-11 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 text-sm font-medium text-white placeholder:text-white/10 focus:bg-white/[0.05] focus:border-white/[0.15] transition-all outline-none"
                  placeholder="Minimum 6 characters"
                />
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-wide mt-1.5">
                  Provide this password to the partner securely.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreatePartnerModal(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider text-white/40 hover:bg-white/[0.02] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingPartner}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/10 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCreatingPartner && (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  )}
                  {isCreatingPartner ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
