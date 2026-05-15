import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck,
  Search,
  CheckCircle,
  Clock,
  Download,
  XCircle,
  Scan,
  Camera,
  Navigation,
  ArrowRight,
  Shield,
  Zap,
  Sparkles,
  X,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

import { api } from '../../utils/api.js';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import { useToast } from '../../ToastContext.jsx';

const STATUS_CONFIG = {
  paid: {
    label: 'Confirmed',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
    icon: CheckCircle,
  },
  arrived: {
    label: 'In-Stay',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dot: 'bg-blue-400',
    icon: Navigation,
  },
  departed: {
    label: 'Completed',
    color: 'bg-white/[0.05] text-white/40 border-white/[0.05]',
    dot: 'bg-white/20',
    icon: Shield,
  },
  pending: {
    label: 'Pending',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400',
    icon: Clock,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    dot: 'bg-rose-400',
    icon: XCircle,
  },
};

export default function PartnerBookings() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const { showToast } = useToast();

  // Scanner State
  const [scannerActive, setScannerActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState(null); // { id, data, type: 'check-in' | 'check-out' }
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, onConfirm: () => {} });

  const refresh = useCallback(() => {
    setLoading(true);
    api
      .getPartnerBookings()
      .then((data) => {
        setBookings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    refresh();
  }, [user?.email, refresh]);

  const visible = bookings.filter((b) => {
    const matchStatus = filter === 'all' || b.status === filter;
    const matchSearch =
      !search ||
      b.guestEmail?.toLowerCase().includes(search.toLowerCase()) ||
      b.title?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    all: bookings.length,
    paid: bookings.filter((b) => b.status === 'paid').length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  const totalRevenue = visible
    .filter((b) => b.status === 'paid' || b.status === 'arrived' || b.status === 'departed')
    .reduce((s, b) => s + (b.totalPrice || 0), 0);

  const startScanner = async () => {
    setScannerActive(true);
    setScanning(true);
    setScanResult(null);
    setManualCode('');

    setTimeout(() => {
      const html5QrCode = new Html5Qrcode('scanner-region');
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      html5QrCode
        .start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (decodedText.startsWith('wayzza-verify://')) {
              const id = decodedText.replace('wayzza-verify://', '');
              html5QrCode.stop().then(() => {
                setScanning(false);
                processScannedId(id);
              });
            }
          },
          () => {} // Error silencer
        )
        .catch((err) => {
          console.error('Scanner failed', err);
          setScanning(false);
        });

      // Cleanup on window close or modal close
      window.stopScanner = () => html5QrCode.stop().catch(() => {});
    }, 500);
  };

  const processScannedId = (id) => {
    const booking = bookings.find((b) => b._id === id);
    if (!booking) {
      showToast('Booking not found in your manifest.', 'error');
      setScannerActive(false);
      return;
    }
    setScanResult(booking);
  };

  const handleManualSubmit = () => {
    if (!manualCode) return;
    // For manual we search all bookings for a matching passcode
    const booking = bookings.find((b) => b.checkInPasscode === manualCode);
    if (!booking) {
      showToast('Invalid passcode.', 'warning');
      return;
    }
    setScanResult(booking);
  };

  const confirmAction = async () => {
    if (!scanResult) return;
    try {
      // Check-in only via scan
      const res = await api.checkIn(scanResult._id, { passcode: scanResult.checkInPasscode });

      if (res.ok) {
        setScannerActive(false);
        refresh();
      } else {
        showToast(res.message || 'Failed to update stay status.', 'error');
      }
    } catch {
      showToast('Connection error.', 'error');
    }
  };

  const handleManualCheckOut = (id) => {
    setConfirmModal({
      isOpen: true,
      onConfirm: () => executeCheckOut(id),
    });
  };

  async function executeCheckOut(id) {
    try {
      const res = await api.checkOut(id);
      if (res.ok) {
        refresh();
      } else {
        showToast(res.message || 'Failed to complete stay.', 'error');
      }
    } catch {
      showToast('Connection error.', 'error');
    }
  }

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-[#050a08]">
        <div className="w-10 h-10 border-2 border-white/10 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-sm font-bold text-white/30 uppercase tracking-widest">
          Loading reservations...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#050a08] font-sans text-white selection:bg-emerald-900/50 selection:text-emerald-200 pb-20">
      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[30%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-emerald-700/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-10 space-y-8">
        {/* CSS for Scanline Animation */}
        <style>{`
          @keyframes scanline {
            0% { transform: translateY(-100%); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(100%); opacity: 0; }
          }
          .animate-scanline {
            animation: scanline 2s linear infinite;
          }
        `}</style>

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.03] border border-white/[0.08] p-8 rounded-3xl backdrop-blur-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-[0.4em]">
              <Sparkles size={12} /> Reservations
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              Booking <span className="text-emerald-400">Register</span>
            </h1>
            <p className="text-white/30 text-sm font-medium">
              {bookings.length} total {bookings.length === 1 ? 'reservation' : 'reservations'}{' '}
              across your properties.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={startScanner}
              className="h-11 px-6 bg-emerald-500 text-[#050a08] hover:bg-emerald-600 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/10 active:scale-95"
            >
              <Scan size={16} strokeWidth={2.5} /> Verify Guest
            </button>
            <button className="h-11 px-6 bg-white/[0.05] text-white hover:bg-white/[0.08] rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 border border-white/[0.05] transition-all">
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* FILTERS + SEARCH */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {[
              { key: 'all', label: 'All' },
              { key: 'paid', label: 'Confirmed' },
              { key: 'pending', label: 'Pending' },
              { key: 'cancelled', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 border ${
                  filter === tab.key
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-lg shadow-emerald-500/5'
                    : 'bg-white/[0.03] text-white/40 border-white/[0.05] hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {tab.label}
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-black ${filter === tab.key ? 'bg-emerald-400 text-[#050a08]' : 'bg-white/[0.05] text-white/40'}`}
                >
                  {counts[tab.key]}
                </span>
              </button>
            ))}
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guest or property..."
              className="h-11 w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-4 text-xs font-medium text-white placeholder:text-white/10 outline-none focus:bg-white/[0.05] focus:border-white/[0.15] transition-all"
            />
          </div>
        </div>

        {/* TABLE / EMPTY */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl overflow-hidden backdrop-blur-xl">
          {visible.length === 0 ? (
            <div className="py-24 text-center flex flex-col items-center gap-4">
              <div className="w-14 h-14 bg-white/[0.02] rounded-2xl flex items-center justify-center text-white/10">
                <CalendarCheck size={28} />
              </div>
              <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest">
                No reservations found
              </h3>
              <p className="text-white/20 text-xs font-medium max-w-xs">
                {search || filter !== 'all'
                  ? 'Try adjusting your search or filter.'
                  : 'Your bookings will appear here once guests start reserving your properties.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.05] bg-white/[0.01]">
                    <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                      Property
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                      Guest
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                      Dates
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  <AnimatePresence>
                    {visible.map((b, i) => {
                      const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                      const StatusIcon = cfg.icon;
                      return (
                        <motion.tr
                          key={b._id || i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="hover:bg-white/[0.01] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white/[0.05] text-white rounded-xl flex items-center justify-center font-bold text-sm border border-white/[0.05]">
                                {(b.title || 'W').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-white text-sm truncate max-w-[160px]">
                                  {b.title || 'Untitled'}
                                </p>
                                <p className="text-[10px] text-white/20 font-bold uppercase tracking-wide mt-0.5">
                                  #{b._id?.slice(-6).toUpperCase()}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-white/[0.02] rounded-lg flex items-center justify-center font-bold text-[10px] text-white/40 border border-white/[0.05]">
                                {(b.guestEmail || 'G').charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs font-bold text-white/70 truncate max-w-[120px]">
                                {b.guestEmail?.split('@')?.[0]}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-xs font-bold text-white/70 space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-white/20 font-black uppercase tracking-wide">
                                  In:
                                </span>
                                <span>{b.checkIn}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-white/20 font-black uppercase tracking-wide">
                                  Out:
                                </span>
                                <span>{b.checkOut}</span>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border ${cfg.color}`}
                            >
                              <StatusIcon size={10} strokeWidth={2.5} />
                              {cfg.label}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-sm font-bold text-white">
                                ₹{(b.totalPrice || 0).toLocaleString()}
                              </span>
                              {b.status === 'arrived' && (
                                <button
                                  onClick={() => handleManualCheckOut(b._id)}
                                  className="text-[10px] font-black text-emerald-400 hover:text-white uppercase tracking-wider flex items-center gap-1 mt-1 transition-colors"
                                >
                                  <Shield size={10} /> Complete Stay
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>

              {/* Footer */}
              <div className="px-6 py-4 bg-white/[0.01] border-t border-white/[0.05] flex flex-col sm:flex-row justify-between items-center gap-3">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-wide">
                  Showing {visible.length} of {bookings.length} reservations
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-wide">
                    Confirmed Revenue:
                  </span>
                  <span className="text-lg font-black text-emerald-400">
                    ₹{totalRevenue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* VERIFICATION MODAL */}
        <AnimatePresence>
          {scannerActive && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050a08]/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#050a08] border border-white/[0.08] rounded-2xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-700" />

                <button
                  onClick={() => {
                    window.stopScanner?.();
                    setScannerActive(false);
                  }}
                  className="absolute top-6 right-6 text-white/40 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] p-1.5 rounded-lg transition-all"
                >
                  <X size={16} />
                </button>

                <div className="space-y-6">
                  <div className="text-center space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">
                      Verification Hub
                    </p>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">
                      Check-in QR Code
                    </h3>
                  </div>

                  {!scanResult ? (
                    <div className="space-y-6">
                      {/* SCANNER VIEW */}
                      <div className="relative aspect-square bg-black/40 rounded-2xl overflow-hidden border border-white/[0.05]">
                        <div id="scanner-region" className="w-full h-full" />
                        {scanning && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-none">
                            <div className="w-48 h-48 border-2 border-emerald-500/20 rounded-2xl animate-pulse flex items-center justify-center">
                              <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-scanline" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest mt-6 text-white/40">
                              Scanning for passport...
                            </p>
                          </div>
                        )}
                        {!scanning && !manualCode && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/80 p-8 text-center gap-4">
                            <Camera size={32} className="text-white/20" />
                            <p className="text-xs font-bold text-white/70">
                              Camera access required
                            </p>
                            <button
                              onClick={startScanner}
                              className="px-4 py-2 bg-emerald-500 text-[#050a08] rounded-lg text-[10px] font-black uppercase tracking-wide"
                            >
                              Enable Camera
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-white/[0.05]"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px]">
                          <span className="px-4 bg-[#050a08] text-white/20 font-black uppercase tracking-widest">
                            Or Manual
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <input
                          value={manualCode}
                          onChange={(e) => setManualCode(e.target.value)}
                          placeholder="ENTER 6-DIGIT PASSCODE"
                          className="h-12 flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 font-black text-center text-white placeholder:text-white/10 tracking-[0.3em] outline-none focus:border-white/[0.2] transition-all"
                        />
                        <button
                          onClick={handleManualSubmit}
                          className="w-12 h-12 bg-white text-[#050a08] rounded-xl flex items-center justify-center hover:bg-emerald-400 transition-all active:scale-95 shadow-md"
                        >
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl text-center space-y-4">
                        <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center shadow-sm mx-auto text-[#050a08]">
                          <CheckCircle size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                            Identity Confirmed
                          </p>
                          <h4 className="text-lg font-black text-white mt-1 uppercase tracking-tight">
                            {scanResult.guestEmail.split('@')[0]}
                          </h4>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
                          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                            Protocol
                          </span>
                          <span className="text-xs font-bold text-white uppercase">
                            Check-In Verification
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
                          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                            Property
                          </span>
                          <span className="text-xs font-bold text-white uppercase truncate max-w-[120px]">
                            {scanResult.title}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={confirmAction}
                        disabled={scanResult.status !== 'paid'}
                        className="w-full h-14 bg-emerald-500 text-[#050a08] rounded-xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Zap size={14} fill="currentColor" />
                        Confirm Arrival
                      </button>

                      <button
                        onClick={() => setScanResult(null)}
                        className="w-full text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors"
                      >
                        Wrong Booking? Back to Scan
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={confirmModal.onConfirm}
          title="Complete Stay"
          message="Mark this booking as completed? This will verify the guest has departed and update the reservation status."
          confirmText="Complete Stay"
          confirmVariant="emerald"
        />
      </div>
    </div>
  );
}
