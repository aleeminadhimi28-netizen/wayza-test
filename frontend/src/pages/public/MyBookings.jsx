import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { WayzzaLayout } from '../../WayzzaUI.jsx';
import { useAuth } from '../../AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck,
  MessageCircle,
  XCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Star,
  FileText,
  History,
  Navigation,
  Loader2,
} from 'lucide-react';

import { api } from '../../utils/api.js';
import { QRCodeCanvas } from 'qrcode.react';
import { Scan, QrCode } from 'lucide-react';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import { useToast } from '../../ToastContext.jsx';

const statusConfig = {
  paid: {
    label: 'Confirmed',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    icon: CheckCircle,
    border: 'border-emerald-100',
  },
  pending: {
    label: 'Pending',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    icon: Clock,
    border: 'border-amber-100',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    icon: XCircle,
    border: 'border-rose-100',
  },
  arrived: {
    label: 'Checked In',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    icon: CheckCircle,
    border: 'border-blue-100',
  },
  departed: {
    label: 'Completed',
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    icon: CheckCircle,
    border: 'border-slate-200',
  },
};

const tabs = [
  { key: 'all', label: 'All Bookings', icon: History },
  { key: 'paid', label: 'Confirmed', icon: CheckCircle },
  { key: 'pending', label: 'Pending', icon: Clock },
  // FIX #30: add arrived (Ongoing) and departed (Completed) filter tabs
  { key: 'arrived', label: 'Ongoing', icon: CheckCircle },
  { key: 'departed', label: 'Completed', icon: CheckCircle },
  { key: 'cancelled', label: 'Cancelled', icon: XCircle },
];

export default function MyBookings() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { showToast } = useToast();
  const [cancellingId, setCancellingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: 'Cancel Reservation',
    message: 'Are you sure you want to cancel this reservation?',
    confirmText: 'Confirm Cancellation',
    onConfirm: () => {},
  });

  const filtered = filterStatus === 'all' ? rows : rows.filter((b) => b.status === filterStatus);

  // Review State — track reviewed listing IDs to prevent duplicate reviews (#28)
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewedIds, setReviewedIds] = useState(new Set());
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Passport Modal
  const [passportModal, setPassportModal] = useState(null);

  const reviewModalVehicle = reviewModal?.category === 'bike' || reviewModal?.category === 'car';
  const reviewModalActivity =
    reviewModal?.category === 'activity' || reviewModal?.category === 'experience';

  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    api
      .getMyBookings()
      .then((data) => {
        setRows(Array.isArray(data.data) ? data.data : []);
        setError(false);
      })
      .catch(() => {
        setRows([]);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [user?.email]);

  const cancelBooking = (b) => {
    const isVehicle = b.category === 'bike' || b.category === 'car';
    const isActivity = b.category === 'activity' || b.category === 'experience';
    const typeLabel = isVehicle ? 'rental' : isActivity ? 'experience' : 'stay';
    setConfirmModal({
      isOpen: true,
      title: `Cancel ${isVehicle ? 'Rental' : isActivity ? 'Experience' : 'Reservation'}`,
      message: `Are you sure you want to cancel this ${typeLabel}? This action cannot be undone and your plans will be removed.`,
      confirmText: 'Confirm Cancellation',
      onConfirm: () => executeCancelBooking(b._id, typeLabel),
    });
  };

  async function executeCancelBooking(id, typeLabel) {
    setCancellingId(id);
    try {
      const data = await api.cancelBooking({ bookingId: id });
      if (!data.ok) {
        showToast(data.message || `Failed to cancel ${typeLabel}.`, 'error');
        return;
      }
      setRows((prev) => prev.map((b) => (b._id === id ? { ...b, status: 'cancelled' } : b)));
    } catch {
      showToast('Connection error. Please try again.', 'error');
    } finally {
      setCancellingId(null);
    }
  }

  async function submitReview() {
    if (!reviewModal) return;
    setSubmittingReview(true);
    try {
      const res = await api.postReview({
        listingId: reviewModal.listingId,
        rating,
        comment,
      });
      if (res.ok) {
        showToast('Thank you for your review!', 'success');
        // Mark this listing as reviewed so the button disappears (#28)
        setReviewedIds((prev) => new Set([...prev, reviewModal.listingId]));
        setReviewModal(null);
        setComment('');
        setRating(5);
      } else {
        showToast(res.message || 'Failed to submit review', 'error');
      }
    } catch (err) {
      showToast('Connection error. Please try again.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  }

  function downloadInvoice(b) {
    const isVehicle = b.category === 'bike' || b.category === 'car';
    const isActivity = b.category === 'activity' || b.category === 'experience';
    const gst =
      b.gst !== undefined
        ? b.gst
        : isVehicle
          ? 0
          : Math.round((b.pricePerNight || 0) * (b.nights || 1) * 0.12);
    const baseAmount = (b.pricePerNight || 0) * (b.nights || 1);
    const serviceFee = b.serviceFee !== undefined ? b.serviceFee : 99;
    const invoiceId = `WAY-${b._id?.slice(-8).toUpperCase() || 'XXXXXXXX'}`;
    const invoiceDate = new Date(b.paidAt || b.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const checkInLabel = isVehicle ? 'Rental Start' : isActivity ? 'Start Date' : 'Check-In';
    const checkOutLabel = isVehicle ? 'Rental End' : isActivity ? 'End Date' : 'Check-Out';
    const durationUnit =
      isVehicle || isActivity
        ? b.nights === 1
          ? 'Day'
          : 'Days'
        : b.nights === 1
          ? 'Night'
          : 'Nights';
    const invoiceSub = isVehicle
      ? 'Premium Rentals'
      : isActivity
        ? 'Premium Experiences'
        : 'Premium Stays';
    const descLabel = isVehicle ? 'Rental Fee' : isActivity ? 'Experience Fee' : 'Accommodation';
    const durationUnitLower =
      isVehicle || isActivity
        ? b.nights === 1
          ? 'day'
          : 'days'
        : b.nights === 1
          ? 'night'
          : 'nights';
    const footerThankYou = isVehicle
      ? 'Thank you for renting with Wayzza.'
      : isActivity
        ? 'Thank you for booking experiences with Wayzza.'
        : 'Thank you for staying with Wayzza.';

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${invoiceId}</title><style>
            *{margin:0;padding:0;box-sizing:border-box;font-family:system-ui,sans-serif;}
            body{background:#f8fafc;padding:40px;color:#0f172a;}
            .card{background:#fff;border-radius:20px;padding:48px;max-width:680px;margin:0 auto;box-shadow:0 4px 40px rgba(0,0,0,0.06);}
            .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:48px;padding-bottom:32px;border-bottom:2px solid #f1f5f9;}
            .brand{display:flex;align-items:center;gap:12px;}
            .brand-icon{width:48px;height:48px;background:linear-gradient(135deg,#064e3b,#10b981);border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:22px;}
            .brand-name{font-size:22px;font-weight:900;color:#0f172a;}
            .brand-sub{font-size:11px;color:#64748b;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;}
            .invoice-meta{text-align:right;}
            .invoice-id{font-size:13px;font-weight:800;color:#059669;letter-spacing:0.08em;}
            .invoice-date{font-size:11px;color:#94a3b8;margin-top:4px;}
            h2{font-size:28px;font-weight:900;margin-bottom:8px;}
            .subtitle{color:#64748b;font-size:13px;font-weight:500;margin-bottom:32px;}
            .details-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;background:#f8fafc;border-radius:16px;padding:24px;margin-bottom:32px;}
            .detail-item .label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;margin-bottom:4px;}
            .detail-item .value{font-size:14px;font-weight:700;color:#0f172a;}
            table{width:100%;border-collapse:collapse;margin-bottom:24px;}
            th{text-align:left;padding:12px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;border-bottom:2px solid #f1f5f9;}
            td{padding:14px 0;font-size:13px;border-bottom:1px solid #f8fafc;color:#374151;}
            td:last-child,th:last-child{text-align:right;}
            .total-row td{font-weight:900;font-size:16px;color:#059669;border-top:2px solid #f1f5f9;border-bottom:none;padding-top:18px;}
            .badge{display:inline-flex;align-items:center;gap:6px;background:#f0fdf4;color:#059669;border:1px solid #d1fae5;padding:6px 14px;border-radius:99px;font-size:11px;font-weight:700;letter-spacing:0.05em;}
            .footer{margin-top:40px;padding-top:24px;border-top:2px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center;}
            .footer-note{font-size:11px;color:#94a3b8;}
            @media print{body{padding:0;background:#fff;}.card{box-shadow:none;border-radius:0;padding:32px;}}
        </style></head><body><div class="card">
            <div class="header">
                <div class="brand"><div class="brand-icon">W</div><div><div class="brand-name">Wayzza</div><div class="brand-sub">${invoiceSub}</div></div></div>
                <div class="invoice-meta"><div class="invoice-id">INVOICE #${invoiceId}</div><div class="invoice-date">${invoiceDate}</div></div>
            </div>
            <h2>${b.title}</h2>
            <p class="subtitle">Booking Confirmed &nbsp;•&nbsp; Paid via Wayzza Secure Checkout</p>
            <div class="details-grid">
                <div class="detail-item"><div class="label">Guest</div><div class="value">${b.guestEmail}</div></div>
                <div class="detail-item"><div class="label">Booking ID</div><div class="value">${invoiceId}</div></div>
                <div class="detail-item"><div class="label">${checkInLabel}</div><div class="value">${b.checkIn}</div></div>
                <div class="detail-item"><div class="label">${checkOutLabel}</div><div class="value">${b.checkOut}</div></div>
                <div class="detail-item"><div class="label">Duration</div><div class="value">${b.nights} ${durationUnit}</div></div>
                ${b.variantName ? `<div class="detail-item"><div class="label">Room Type</div><div class="value">${b.variantName}</div></div>` : ''}
            </div>
            <table>
                <thead><tr><th>Description</th><th>Amount</th></tr></thead>
                <tbody>
                    <tr><td>${descLabel} (₹${(b.pricePerNight || 0).toLocaleString()} × ${b.nights} ${durationUnitLower})</td><td>₹${baseAmount.toLocaleString()}</td></tr>
                    <tr><td>GST${gst === 0 ? ' (Waived for Vehicles)' : ' @ 12%'}</td><td>${gst === 0 ? '<span style="color:#059669;font-weight:700;">Waived</span>' : `₹${gst.toLocaleString()}`}</td></tr>
                    <tr><td>Service & Platform Fee</td><td>₹${serviceFee.toLocaleString()}</td></tr>
                    <tr class="total-row"><td>Total Paid</td><td>₹${(b.totalPrice || 0).toLocaleString()}</td></tr>
                </tbody>
            </table>
            <div class="badge">✓ Payment Confirmed</div>
            <div class="footer">
                <div class="footer-note">${footerThankYou}<br>For support: support@wayzza.com</div>
                <div class="footer-note">© ${new Date().getFullYear()} Wayzza Inc.</div>
            </div>
        </div></body></html>`;
    // #29: Guard against popup blockers returning null
    const w = window.open('', '_blank', 'width=780,height=900');
    if (!w) {
      showToast('Popup blocked. Please allow popups to download invoices.', 'error');
      return;
    }
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
  }

  if (loading)
    return (
      <WayzzaLayout noPadding>
        <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4 font-sans text-slate-400">
          <div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest">Loading bookings...</p>
        </div>
      </WayzzaLayout>
    );

  // FIX #32: Show error state when API call fails instead of empty list
  if (error)
    return (
      <WayzzaLayout noPadding>
        <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-6 font-sans text-slate-400 px-6">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center">
            <AlertCircle size={28} className="text-rose-400" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Failed to load bookings</h2>
            <p className="text-sm text-slate-400">
              Something went wrong. Please check your connection and try again.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="h-12 px-8 bg-slate-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all"
          >
            Retry
          </button>
        </div>
      </WayzzaLayout>
    );

  return (
    <WayzzaLayout noPadding>
      <div className="bg-white min-h-screen font-sans pb-32 selection:bg-emerald-50 selection:text-emerald-900">
        <header className="max-w-7xl mx-auto px-6 lg:px-12 py-8 md:py-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8">
            <div className="space-y-1 md:space-y-2">
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight uppercase">
                My Bookings
              </h1>
              <p className="text-slate-400 font-bold uppercase text-[11px] md:text-xs tracking-widest">
                Manage your bookings and travel history with Wayzza.
              </p>
            </div>

            <div className="flex w-full md:w-auto overflow-x-auto no-scrollbar gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilterStatus(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all whitespace-nowrap ${
                    filterStatus === tab.key
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <tab.icon
                    size={14}
                    className={filterStatus === tab.key ? 'text-emerald-500' : ''}
                  />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6">
          <AnimatePresence mode="wait">
            {rows.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center space-y-6"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                  <Navigation size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-900">No bookings yet</h3>
                  <p className="text-slate-500 text-sm">
                    Explore our collection of properties, vehicles, and experiences.
                  </p>
                </div>
                <Link
                  to="/listings"
                  className="h-12 px-8 bg-slate-900 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 mt-4"
                >
                  Discover Listings <ArrowRight size={14} />
                </Link>
              </motion.div>
            ) : filtered.length === 0 ? (
              <motion.div
                key="no-filter"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-24 text-center"
              >
                {/* FIX #31: show which filter tab has no results */}
                <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest">
                  No{' '}
                  {tabs.find((t) => t.key === filterStatus)?.label?.toLowerCase() || filterStatus}{' '}
                  bookings found
                </p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {filtered.map((b, i) => {
                  const start = b.checkIn || b.startDate;
                  const end = b.checkOut || b.endDate;
                  const isFuture = start && new Date(start) > new Date();
                  const cfg = statusConfig[b.status] || statusConfig.pending;
                  const isVehicle = b.category === 'bike' || b.category === 'car';
                  const isActivity = b.category === 'activity' || b.category === 'experience';
                  let displayStatusLabel = cfg.label;
                  if (b.status === 'arrived') {
                    displayStatusLabel = isVehicle
                      ? 'Active Rental'
                      : isActivity
                        ? 'Active Experience'
                        : 'Checked In';
                  }

                  return (
                    <motion.div
                      key={b._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white border border-slate-100 rounded-[28px] md:rounded-[32px] p-5 md:p-8 hover:border-emerald-100 transition-all shadow-sm flex flex-col lg:flex-row gap-6 md:gap-8 justify-between"
                    >
                      <div className="flex-1 space-y-6">
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[11px] uppercase tracking-wider ${cfg.bg} ${cfg.color} border ${cfg.border}`}
                          >
                            <cfg.icon size={12} strokeWidth={2.5} /> {displayStatusLabel}
                          </span>
                          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                            ID: {b._id?.slice(-8).toUpperCase()}
                          </span>
                        </div>

                        <div className="space-y-3 md:space-y-4">
                          <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-tight uppercase tracking-tight">
                            {b.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 md:gap-4">
                            <div className="bg-slate-50 px-3 md:px-4 py-1.5 md:py-2 rounded-xl flex items-center gap-2 md:gap-3 text-slate-600 text-[11px] md:text-xs font-bold uppercase">
                              <CalendarCheck size={14} className="text-emerald-500" />
                              {start} — {end}
                            </div>
                            {b.variantName && (
                              <div className="bg-white border border-slate-100 px-4 py-2 rounded-xl text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                                {b.variantName}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col lg:items-end justify-between gap-6 border-t lg:border-t-0 lg:border-l border-slate-50 pt-6 lg:pt-0 lg:pl-8 lg:min-w-[240px]">
                        <div className="lg:text-right space-y-0.5">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            Total amount
                          </span>
                          <p className="text-2xl font-bold text-slate-900">
                            ₹{(b.totalPrice || 0).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex flex-col w-full gap-2">
                          {b.status !== 'cancelled' && isFuture && (
                            <>
                              {b.status === 'paid' && (
                                <button
                                  onClick={() => setPassportModal(b)}
                                  className="h-12 w-full bg-emerald-600 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 transition-all active:scale-95 shadow-md"
                                >
                                  <QrCode size={16} /> QR Passport
                                </button>
                              )}
                              <button
                                onClick={() => navigate('/guest-chat')}
                                className="h-11 w-full text-slate-400 hover:text-emerald-600 font-bold uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 transition-all"
                              >
                                <MessageCircle size={16} /> Chat with host
                              </button>
                              <button
                                onClick={() => cancelBooking(b)}
                                disabled={cancellingId === b._id}
                                className="h-10 w-full text-slate-300 hover:text-rose-500 font-bold uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                              >
                                {cancellingId === b._id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <XCircle size={14} />
                                )}
                                Cancel {isVehicle ? 'rental' : isActivity ? 'experience' : 'stay'}
                              </button>
                            </>
                          )}

                          {b.status === 'paid' && (
                            <>
                              <button
                                onClick={() => downloadInvoice(b)}
                                className="h-10 w-full border border-slate-100 text-slate-600 hover:bg-slate-50 rounded-xl font-bold uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 transition-all"
                              >
                                <FileText size={14} /> Download invoice
                              </button>
                              {/* #28: Only show review button if not already reviewed */}
                              {!isFuture && !reviewedIds.has(b.listingId) && (
                                <button
                                  onClick={() => setReviewModal(b)}
                                  className="h-10 w-full border border-amber-100 text-amber-700 bg-amber-50 rounded-xl font-bold uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 hover:bg-amber-500 hover:text-white transition-all mt-1"
                                >
                                  <Star size={14} /> Leave review
                                </button>
                              )}
                            </>
                          )}

                          {b.status === 'cancelled' && (
                            <div className="space-y-2">
                              <div className="h-12 flex items-center justify-center gap-2 font-bold text-[11px] uppercase tracking-widest text-rose-500 bg-rose-50 rounded-xl border border-rose-100">
                                <AlertCircle size={14} /> Reservation cancelled
                              </div>
                              {b.refundStatus === 'pending' && (
                                <div className="h-10 flex items-center justify-center gap-2 font-bold text-[11px] uppercase tracking-widest text-amber-600 bg-amber-50 rounded-xl border border-amber-100">
                                  <Clock size={12} /> Refund processing
                                </div>
                              )}
                              {b.refundStatus && b.refundStatus !== 'pending' && (
                                <div className="h-10 flex items-center justify-center gap-2 font-bold text-[11px] uppercase tracking-widest text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-100">
                                  <CheckCircle size={12} /> Refund issued
                                </div>
                              )}
                            </div>
                          )}

                          {!isFuture && b.status !== 'cancelled' && (
                            <button
                              onClick={() => navigate(`/listing/${b.listingId}`)}
                              className="h-12 w-full bg-slate-50 text-slate-600 rounded-xl font-bold uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                            >
                              <History size={16} /> Rebook{' '}
                              {isVehicle ? 'rental' : isActivity ? 'experience' : 'stay'}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* REVIEW MODAL */}
      <AnimatePresence>
        {reviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => setReviewModal(null)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-all"
              >
                <XCircle size={20} />
              </button>
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center mb-6 shadow-inner">
                <Star size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight uppercase mb-2">
                Rate your{' '}
                {reviewModalVehicle ? 'rental' : reviewModalActivity ? 'experience' : 'stay'}
              </h3>
              {/* #33: Fixed literal curly-quote rendering */}
              <p className="text-sm font-medium text-slate-500 mb-8">
                How was your experience at{' '}
                <span className="font-semibold text-slate-700">{reviewModal?.title}</span>?
              </p>

              <div className="space-y-6">
                <div className="flex justify-center gap-2 py-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setRating(s)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={
                          rating >= s
                            ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                            : 'text-slate-200'
                        }
                      />
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                    Your feedback (Optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={`Share details about your ${reviewModalVehicle ? 'rental' : reviewModalActivity ? 'experience' : 'stay'}...`}
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all text-sm resize-none"
                  />
                </div>
                <button
                  onClick={submitReview}
                  disabled={submittingReview}
                  className="w-full h-14 bg-slate-900 hover:bg-amber-500 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {submittingReview ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PASSPORT MODAL */}
      <AnimatePresence>
        {passportModal &&
          (() => {
            const passportIsVehicle =
              passportModal.category === 'bike' || passportModal.category === 'car';
            const passportIsActivity =
              passportModal.category === 'activity' || passportModal.category === 'experience';
            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-[40px] p-10 w-full max-w-sm shadow-2xl relative text-center overflow-hidden"
                >
                  {/* Decorative background Elements */}
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />

                  <button
                    onClick={() => setPassportModal(null)}
                    className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-all"
                  >
                    <XCircle size={20} />
                  </button>

                  <div className="flex flex-col items-center space-y-6">
                    <div className="space-y-1">
                      <p className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-600">
                        Verification Passport
                      </p>
                      <h3 className="text-xl font-black text-slate-900 uppercase">
                        {passportIsVehicle
                          ? 'Rental'
                          : passportIsActivity
                            ? 'Experience'
                            : 'Check-in'}{' '}
                        QR Code
                      </h3>
                    </div>

                    <div className="p-4 bg-slate-50 border-2 border-emerald-100 rounded-[32px] shadow-inner relative group">
                      <div className="absolute inset-0 bg-emerald-500/5 blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
                      <div className="relative bg-white p-6 rounded-[24px] shadow-sm">
                        <QRCodeCanvas
                          value={`wayzza-verify://${passportModal._id}`}
                          size={200}
                          level="H"
                          includeMargin={false}
                          imageSettings={{
                            // #31: Use relative path to avoid 3rd-party domain dependency
                            src: '/favicon.png',
                            x: undefined,
                            y: undefined,
                            height: 40,
                            width: 40,
                            excavate: true,
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-4 w-full">
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                          Manual Passcode
                        </p>
                        <div className="flex justify-center gap-2">
                          {passportModal.checkInPasscode?.split('').map((char, i) => (
                            <span
                              key={i}
                              className="w-10 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-xl font-black text-slate-900 shadow-sm"
                            >
                              {char}
                            </span>
                          )) || <span className="text-slate-300 text-sm">Awaiting sync...</span>}
                        </div>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-4 text-left">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 text-emerald-600 shadow-sm">
                          <Scan size={16} />
                        </div>
                        <p className="text-[11px] font-bold text-emerald-800 leading-relaxed uppercase tracking-wider">
                          Present this QR to the staff at{' '}
                          {passportIsVehicle
                            ? 'pick-up'
                            : passportIsActivity
                              ? 'start'
                              : 'check-in'}
                          . This protocol verifies your identity and activates your{' '}
                          {passportIsVehicle
                            ? 'rental'
                            : passportIsActivity
                              ? 'experience'
                              : 'stay'}
                          .
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })()}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title || 'Cancel Reservation'}
        message={
          confirmModal.message ||
          'Are you sure you want to cancel this reservation? This action cannot be undone and your travel plans will be removed.'
        }
        confirmText={confirmModal.confirmText || 'Confirm Cancellation'}
        confirmVariant="rose"
      />
    </WayzzaLayout>
  );
}

// #27: Loader2 is now imported from lucide-react above — local definition removed.
