import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, Clock, Trash2, Volume2, VolumeX, X } from 'lucide-react';
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

  return (
    <motion.div
      key="list"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* PENDING APPROVAL SECTION for listings tab */}
      {activeTab === 'listings' && dataList.some((item) => !item.approved) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-amber-900">Pending Inventory Approvals</h3>
              <p className="text-xs text-amber-700">
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
                  className="flex items-center justify-between bg-white rounded-xl p-4 border border-amber-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center font-bold text-sm border border-amber-100">
                      {(item.title || 'P').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-slate-900">{item.title}</p>
                        <span className="text-[11px] bg-amber-200/50 text-amber-800 px-2 py-0.5 rounded-full uppercase font-bold">
                          {item.category === 'activity' ? 'Experience' : 'Property'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
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
                          confirmVariant: 'emerald',
                          onConfirm: () => handleApproveProperty(item._id),
                        })
                      }
                      className="h-8 px-4 bg-emerald-600 text-white rounded-lg font-semibold text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle size={13} /> Approve
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
                      className="h-8 px-4 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg font-semibold text-xs hover:bg-rose-500 hover:text-white transition-all flex items-center gap-1.5"
                    >
                      <X size={13} /> Reject
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* DATA TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 capitalize">
              {activeTab === 'listings' ? 'All Inventory' : activeTab}
            </h3>
            <p className="text-sm text-slate-500">{filteredData.length} records found</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 text-sm font-medium focus:bg-white focus:border-emerald-500 transition-all outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Details
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Info
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loadingData
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-6 py-4">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : filteredData.map((item, i) => (
                    <tr
                      key={`${item._id || item.email}-${i}`}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${item.muted ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}
                          >
                            {(item.email || item.title || 'W').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm text-slate-900 truncate max-w-[200px]">
                                {item.title || item.businessName || item.email}
                              </p>
                              {item.muted && (
                                <span className="text-[11px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">
                                  MUTED
                                </span>
                              )}
                              {activeTab === 'listings' && (
                                <span className="text-[11px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase font-bold">
                                  {item.category === 'activity' ? 'Exp.' : 'Prop.'}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400">
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
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${item.status === 'paid' || item.approved || item.onboarded ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : activeTab === 'partners' && !item.onboarded && !item.onboardingCompleted ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-amber-50 text-amber-700 border-amber-100'}`}
                          >
                            {item.status === 'paid' || item.approved || item.onboarded ? (
                              <>
                                <CheckCircle size={11} /> Active
                              </>
                            ) : activeTab === 'partners' &&
                              !item.onboarded &&
                              !item.onboardingCompleted ? (
                              <>
                                <Clock size={11} /> Incomplete
                              </>
                            ) : (
                              <>
                                <Clock size={11} /> Pending
                              </>
                            )}
                          </span>
                          {activeTab === 'bookings' && item.status === 'paid' && (
                            <span
                              className={`text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${item.payoutStatus === 'paid_out' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}
                            >
                              Payout: {item.payoutStatus === 'paid_out' ? 'Settled' : 'Pending'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-700">
                          {activeTab === 'bookings'
                            ? item.guestEmail
                            : item.price
                              ? `₹${item.price.toLocaleString()}`
                              : item.role || item.checkIn || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-100 lg:opacity-60 lg:group-hover:opacity-100 transition-all">
                          {activeTab === 'bookings' &&
                            item.status === 'paid' &&
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
                                className="h-8 px-4 bg-emerald-600 text-white rounded-lg font-semibold text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
                              >
                                <CheckCircle size={13} /> Settle Payout
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
                              className="h-8 px-4 bg-emerald-600 text-white rounded-lg font-semibold text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                              <CheckCircle size={13} /> Approve
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
                              className={`h-8 px-3 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all border ${
                                item.muted
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white'
                                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-500 hover:text-white'
                              }`}
                            >
                              {item.muted ? (
                                <>
                                  <Volume2 size={13} /> Unmute
                                </>
                              ) : (
                                <>
                                  <VolumeX size={13} /> Mute
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
                                    confirmVariant: 'emerald',
                                    onConfirm: () => handleApprovePartner(item.email),
                                  })
                                }
                                className="h-8 px-4 bg-emerald-600 text-white rounded-lg font-semibold text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
                              >
                                <CheckCircle size={13} /> Approve
                              </button>
                            )}
                          {activeTab === 'partners' &&
                            !item.onboarded &&
                            !item.onboardingCompleted && (
                              <span className="text-xs font-medium text-slate-400 flex items-center gap-1 mr-2 px-2">
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
                            className="w-8 h-8 bg-rose-50 text-rose-500 border border-rose-100 rounded-lg flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className="py-20 text-center">
              <Search size={28} className="text-slate-200 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">No records found</h3>
              <p className="text-sm text-slate-500">Try adjusting your search query.</p>
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
    </motion.div>
  );
}
