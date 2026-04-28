import { useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck,
  Search,
  CheckCircle,
  Clock,
  Download,
  XCircle,
  ChevronDown,
  Scan,
  Camera,
  Edit3,
  Navigation,
  ArrowRight,
  Shield,
  Zap,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

import { api } from '../../utils/api.js';

const STATUS_CONFIG = {
  paid: {
    label: 'Confirmed',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    dot: 'bg-emerald-500',
    icon: CheckCircle,
  },
  arrived: {
    label: 'In-Stay',
    color: 'bg-blue-50 text-blue-700 border-blue-100',
    dot: 'bg-blue-500',
    icon: Navigation,
  },
  departed: {
    label: 'Completed',
    color: 'bg-slate-50 text-slate-700 border-slate-100',
    dot: 'bg-slate-500',
    icon: Shield,
  },
  pending: {
    label: 'Pending',
    color: 'bg-amber-50 text-amber-700 border-amber-100',
    dot: 'bg-amber-400',
    icon: Clock,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-rose-50 text-rose-600 border-rose-100',
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

  // Scanner State
  const [scannerActive, setScannerActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState(null); // { id, data, type: 'check-in' | 'check-out' }

  useEffect(() => {
    if (!user?.email) return;
    refresh();
  }, [user?.email]);

  const refresh = () => {
    setLoading(true);
    api
      .getPartnerBookings()
      .then((data) => {
        setBookings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

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
      alert('Booking not found in your manifest.');
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
      alert('Invalid passcode.');
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
        alert(res.message || 'Failed to update stay status.');
      }
    } catch {
      alert('Connection error.');
    }
  };

  const handleManualCheckOut = async (id) => {
    if (!window.confirm('Complete this stay and mark the guest as departed?')) return;
    try {
      const res = await api.checkOut(id);
      if (res.ok) {
        refresh();
      } else {
        alert(res.message || 'Failed to complete stay.');
      }
    } catch {
      alert('Connection error.');
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading reservations...</p>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 font-sans pb-20"
    >
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide">
            <CalendarCheck size={14} /> Reservations
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            Booking <span className="text-emerald-500">Register</span>
          </h1>
          <p className="text-slate-500 text-sm">
            {bookings.length} total {bookings.length === 1 ? 'reservation' : 'reservations'} across
            your properties.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={startScanner}
            className="h-11 px-6 bg-emerald-600 text-white hover:bg-slate-900 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Scan size={18} /> Verify Guest
          </button>
          <button className="h-11 px-6 bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-2xl font-bold text-sm flex items-center gap-2 border border-slate-100 transition-all">
            <Download size={15} /> Export CSV
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
              className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all flex items-center gap-2 border ${
                filter === tab.key
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-500 border-slate-200 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {tab.label}
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-bold ${filter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}
              >
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guest or property..."
            className="h-10 w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
          />
        </div>
      </div>

      {/* TABLE / EMPTY */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {visible.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center gap-4">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
              <CalendarCheck size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No reservations found</h3>
            <p className="text-slate-500 text-sm max-w-xs">
              {search || filter !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Your bookings will appear here once guests start reserving your properties.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Property
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Guest
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Dates
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
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
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center font-bold text-sm border border-emerald-100">
                              {(b.title || 'W').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-sm truncate max-w-[160px]">
                                {b.title || 'Untitled'}
                              </p>
                              <p className="text-xs text-slate-400">
                                #{b._id?.slice(-6).toUpperCase()}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-xs text-slate-600">
                              {(b.guestEmail || 'G').charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-slate-700 truncate max-w-[120px]">
                              {b.guestEmail?.split('@')[0]}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-700 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-slate-400">In:</span>
                              <span>{b.checkIn}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-slate-400">Out:</span>
                              <span>{b.checkOut}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${cfg.color}`}
                          >
                            <StatusIcon size={12} />
                            {cfg.label}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-base font-bold text-slate-900">
                              ₹{(b.totalPrice || 0).toLocaleString()}
                            </span>
                            {b.status === 'arrived' && (
                              <button
                                onClick={() => handleManualCheckOut(b._id)}
                                className="text-[11px] font-bold text-emerald-600 hover:text-slate-900 uppercase tracking-widest flex items-center gap-1 mt-1"
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
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className="text-xs font-semibold text-slate-500">
                Showing {visible.length} of {bookings.length} reservations
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Confirmed Revenue:</span>
                <span className="text-lg font-bold text-slate-900">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[40px] p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />

              <button
                onClick={() => {
                  window.stopScanner?.();
                  setScannerActive(false);
                }}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-all"
              >
                <XCircle size={20} />
              </button>

              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-600">
                    Verification Hub
                  </p>
                  <h3 className="text-2xl font-black text-slate-900 uppercase">Check-in QR Code</h3>
                </div>

                {!scanResult ? (
                  <div className="space-y-6">
                    {/* SCANNER VIEW */}
                    <div className="relative aspect-square bg-slate-900 rounded-[32px] overflow-hidden shadow-inner border-4 border-slate-100">
                      <div id="scanner-region" className="w-full h-full" />
                      {scanning && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-none">
                          <div className="w-48 h-48 border-2 border-emerald-500/50 rounded-3xl animate-pulse flex items-center justify-center">
                            <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-scanline" />
                          </div>
                          <p className="text-[11px] font-bold uppercase tracking-widest mt-6 opacity-60">
                            Scanning for passport...
                          </p>
                        </div>
                      )}
                      {!scanning && !manualCode && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900/80 p-8 text-center gap-4">
                          <Camera size={40} className="text-slate-500" />
                          <p className="text-sm font-bold">Camera access required</p>
                          <button
                            onClick={startScanner}
                            className="px-6 py-2 bg-emerald-600 rounded-xl text-xs font-bold uppercase"
                          >
                            Enable Camera
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-100"></div>
                      </div>
                      <div className="relative flex justify-center text-[11px]">
                        <span className="px-4 bg-white text-slate-400 font-black uppercase tracking-widest">
                          Or Manual
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="ENTER 6-DIGIT PASSCODE"
                        className="h-14 flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 font-black text-center tracking-[0.3em] outline-none focus:border-emerald-500 transition-all"
                      />
                      <button
                        onClick={handleManualSubmit}
                        className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-600 transition-all active:scale-95 shadow-md"
                      >
                        <ArrowRight size={20} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[32px] text-center space-y-4">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mx-auto">
                        <CheckCircle size={32} className="text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-emerald-800 uppercase tracking-widest">
                          Identity Confirmed
                        </p>
                        <h4 className="text-xl font-bold text-slate-900 mt-1 uppercase">
                          {scanResult.guestEmail.split('@')[0]}
                        </h4>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                          Protocol
                        </span>
                        <span className="text-xs font-bold text-slate-900 uppercase">
                          Check-In Verification
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                          Property
                        </span>
                        <span className="text-xs font-bold text-slate-900 uppercase truncate max-w-[120px]">
                          {scanResult.title}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={confirmAction}
                      disabled={scanResult.status !== 'paid'}
                      className="w-full h-16 bg-slate-900 text-white rounded-[24px] font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-900/10 active:scale-[0.98] disabled:opacity-50"
                    >
                      <Zap size={18} fill="currentColor" />
                      Confirm Arrival
                    </button>

                    <button
                      onClick={() => setScanResult(null)}
                      className="w-full text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
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
    </motion.div>
  );
}
