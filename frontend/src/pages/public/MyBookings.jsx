import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { WayzzaLayout } from "../../WayzzaUI.jsx";
import { useAuth } from "../../AuthContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
    CalendarCheck, MessageCircle, XCircle, Clock, CheckCircle,
    AlertCircle, ArrowRight, Shield, Star, FileText, History, Info, Navigation
} from "lucide-react";

import { api } from "../../utils/api.js";
import { QRCodeCanvas } from "qrcode.react";
import { Scan, QrCode } from "lucide-react";

export default function MyBookings() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");

    // Review State
    const [reviewModal, setReviewModal] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);
    
    // Passport Modal
    const [passportModal, setPassportModal] = useState(null);

    useEffect(() => {
        if (!user?.email) { setLoading(false); return; }
        api.getMyBookings()
            .then(data => setRows(Array.isArray(data.data) ? data.data : []))
            .catch(() => setRows([]))
            .finally(() => setLoading(false));
    }, [user?.email]);

    async function cancelBooking(id) {
        if (!window.confirm("Are you sure you want to cancel this reservation? This action cannot be undone.")) return;
        setCancellingId(id);
        try {
            const data = await api.cancelBooking({ bookingId: id });
            if (!data.ok) { alert(data.message || "Failed to cancel reservation."); return; }
            setRows(prev => prev.map(b => b._id === id ? { ...b, status: "cancelled" } : b));
        } catch {
            alert("Connection error. Please try again.");
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
                comment
            });
            if (res.ok) {
                alert("Thank you for your review!");
                setReviewModal(null);
                setComment("");
                setRating(5);
            } else {
                alert(res.message || "Failed to submit review");
            }
        } catch (err) {
            alert("Connection error. Please try again.");
        } finally {
            setSubmittingReview(false);
        }
    }

    function downloadInvoice(b) {
        const isVehicle = b.category === "bike" || b.category === "car";
        const gst = b.gst !== undefined ? b.gst : (isVehicle ? 0 : Math.round((b.pricePerNight || 0) * (b.nights || 1) * 0.12));
        const baseAmount = (b.pricePerNight || 0) * (b.nights || 1);
        const serviceFee = b.serviceFee !== undefined ? b.serviceFee : 99;
        const invoiceId = `WAY-${b._id?.slice(-8).toUpperCase() || 'XXXXXXXX'}`;
        const invoiceDate = new Date(b.paidAt || b.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
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
                <div class="brand"><div class="brand-icon">W</div><div><div class="brand-name">Wayzza</div><div class="brand-sub">Premium Stays</div></div></div>
                <div class="invoice-meta"><div class="invoice-id">INVOICE #${invoiceId}</div><div class="invoice-date">${invoiceDate}</div></div>
            </div>
            <h2>${b.title}</h2>
            <p class="subtitle">Booking Confirmed &nbsp;•&nbsp; Paid via Wayzza Secure Checkout</p>
            <div class="details-grid">
                <div class="detail-item"><div class="label">Guest</div><div class="value">${b.guestEmail}</div></div>
                <div class="detail-item"><div class="label">Booking ID</div><div class="value">${invoiceId}</div></div>
                <div class="detail-item"><div class="label">Check-In</div><div class="value">${b.checkIn}</div></div>
                <div class="detail-item"><div class="label">Check-Out</div><div class="value">${b.checkOut}</div></div>
                <div class="detail-item"><div class="label">Duration</div><div class="value">${b.nights} Night${b.nights !== 1 ? 's' : ''}</div></div>
                ${b.variantName ? `<div class="detail-item"><div class="label">Room Type</div><div class="value">${b.variantName}</div></div>` : ''}
            </div>
            <table>
                <thead><tr><th>Description</th><th>Amount</th></tr></thead>
                <tbody>
                    <tr><td>Accommodation (₹${(b.pricePerNight || 0).toLocaleString()} × ${b.nights} night${b.nights !== 1 ? 's' : ''})</td><td>₹${baseAmount.toLocaleString()}</td></tr>
                    <tr><td>GST${gst === 0 ? ' (Waived for Vehicles)' : ' @ 12%'}</td><td>${gst === 0 ? '<span style="color:#059669;font-weight:700;">Waived</span>' : `₹${gst.toLocaleString()}`}</td></tr>
                    <tr><td>Service & Platform Fee</td><td>₹${serviceFee.toLocaleString()}</td></tr>
                    <tr class="total-row"><td>Total Paid</td><td>₹${(b.totalPrice || 0).toLocaleString()}</td></tr>
                </tbody>
            </table>
            <div class="badge">✓ Payment Confirmed</div>
            <div class="footer">
                <div class="footer-note">Thank you for staying with Wayzza.<br>For support: support@wayzza.com</div>
                <div class="footer-note">© ${new Date().getFullYear()} Wayzza Inc.</div>
            </div>
        </div></body></html>`;
        const w = window.open('', '_blank', 'width=780,height=900');
        w.document.write(html);
        w.document.close();
        setTimeout(() => w.print(), 500);
    }

    const statusConfig = {
        paid: { label: "Confirmed", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle, border: "border-emerald-100" },
        pending: { label: "Pending", color: "text-amber-600", bg: "bg-amber-50", icon: Clock, border: "border-amber-100" },
        cancelled: { label: "Cancelled", color: "text-rose-600", bg: "bg-rose-50", icon: XCircle, border: "border-rose-100" },
    };

    const filtered = filterStatus === "all" ? rows : rows.filter(b => b.status === filterStatus);

    const tabs = [
        { key: "all", label: "All Bookings", icon: History },
        { key: "paid", label: "Confirmed", icon: CheckCircle },
        { key: "pending", label: "Pending", icon: Clock },
        { key: "cancelled", label: "Cancelled", icon: XCircle },
    ];

    if (loading) return (
        <WayzzaLayout noPadding>
            <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4 font-sans text-slate-400">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
                <p className="text-xs font-bold uppercase tracking-widest">Loading bookings...</p>
            </div>
        </WayzzaLayout>
    );

    return (
        <WayzzaLayout noPadding>
            <div className="bg-white min-h-screen font-sans pb-32 selection:bg-emerald-50 selection:text-emerald-900">

                <header className="max-w-7xl mx-auto px-6 lg:px-12 py-12 md:py-20">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">My Bookings</h1>
                            <p className="text-slate-500 font-medium">Manage your stays and travel history with Wayzza.</p>
                        </div>

                        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                            {tabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilterStatus(tab.key)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all ${filterStatus === tab.key
                                        ? "bg-white text-slate-900 shadow-sm border border-slate-100"
                                        : "text-slate-400 hover:text-slate-600"
                                        }`}
                                >
                                    <tab.icon size={14} className={filterStatus === tab.key ? "text-emerald-500" : ""} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                <main className="max-w-5xl mx-auto px-6">
                    <AnimatePresence mode="wait">
                        {rows.length === 0 ? (
                            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center space-y-6">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                                    <Navigation size={32} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-slate-900">No bookings yet</h3>
                                    <p className="text-slate-500 text-sm">Explore our collection of stays and start your journey.</p>
                                </div>
                                <Link to="/listings" className="h-12 px-8 bg-slate-900 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 mt-4">Discover Stays <ArrowRight size={14} /></Link>
                            </motion.div>
                        ) : filtered.length === 0 ? (
                            <motion.div key="no-filter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center">
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No matching bookings found</p>
                            </motion.div>
                        ) : (
                            <div className="space-y-6">
                                {filtered.map((b, i) => {
                                    const start = b.checkIn || b.startDate;
                                    const end = b.checkOut || b.endDate;
                                    const isFuture = start && new Date(start) > new Date();
                                    const cfg = statusConfig[b.status] || statusConfig.pending;

                                    return (
                                        <motion.div
                                            key={b._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="bg-white border border-slate-100 rounded-[32px] p-6 md:p-8 hover:border-emerald-100 transition-all shadow-sm flex flex-col lg:flex-row gap-8 justify-between"
                                        >
                                            <div className="flex-1 space-y-6">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                                                        <cfg.icon size={12} strokeWidth={2.5} /> {cfg.label}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">ID: {b._id?.slice(-8).toUpperCase()}</span>
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="text-2xl font-bold text-slate-900 leading-tight uppercase tracking-tight">{b.title}</h3>
                                                    <div className="flex flex-wrap gap-4">
                                                        <div className="bg-slate-50 px-4 py-2 rounded-xl flex items-center gap-3 text-slate-600 text-xs font-semibold">
                                                            <CalendarCheck size={16} className="text-emerald-500" />
                                                            {start} — {end}
                                                        </div>
                                                        {b.variantName && (
                                                            <div className="bg-white border border-slate-100 px-4 py-2 rounded-xl text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                                                {b.variantName}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col lg:items-end justify-between gap-6 border-t lg:border-t-0 lg:border-l border-slate-50 pt-6 lg:pt-0 lg:pl-8 lg:min-w-[240px]">
                                                <div className="lg:text-right space-y-0.5">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total amount</span>
                                                    <p className="text-2xl font-bold text-slate-900">₹{(b.totalPrice || 0).toLocaleString()}</p>
                                                </div>

                                                <div className="flex flex-col w-full gap-2">
                                                    {b.status !== "cancelled" && isFuture && (
                                                        <>
                                                            {b.status === "paid" && (
                                                                <button
                                                                    onClick={() => setPassportModal(b)}
                                                                    className="h-12 w-full bg-emerald-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 transition-all active:scale-95 shadow-md"
                                                                >
                                                                    <QrCode size={16} /> QR Passport
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => navigate("/guest-chat")}
                                                                className="h-11 w-full text-slate-400 hover:text-emerald-600 font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all"
                                                            >
                                                                <MessageCircle size={16} /> Chat with host
                                                            </button>
                                                            <button
                                                                onClick={() => cancelBooking(b._id)}
                                                                disabled={cancellingId === b._id}
                                                                className="h-10 w-full text-slate-300 hover:text-rose-500 font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                                            >
                                                                {cancellingId === b._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle size={14} />}
                                                                Cancel stay
                                                            </button>
                                                        </>
                                                    )}

                                                    {b.status === "paid" && (
                                                        <>
                                                            <button
                                                                onClick={() => downloadInvoice(b)}
                                                                className="h-10 w-full border border-slate-100 text-slate-600 hover:bg-slate-50 rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all"
                                                            >
                                                                <FileText size={14} /> Download invoice
                                                            </button>
                                                            {!isFuture && (
                                                                <button
                                                                    onClick={() => setReviewModal(b)}
                                                                    className="h-10 w-full border border-amber-100 text-amber-700 bg-amber-50 rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-amber-500 hover:text-white transition-all mt-1"
                                                                >
                                                                    <Star size={14} /> Leave review
                                                                </button>
                                                            )}
                                                        </>
                                                    )}

                                                    {b.status === "cancelled" && (
                                                        <div className="h-12 flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest text-rose-500 bg-rose-50 rounded-xl border border-rose-100">
                                                            <AlertCircle size={14} /> Reservation cancelled
                                                        </div>
                                                    )}

                                                    {!isFuture && b.status !== "cancelled" && (
                                                        <button
                                                            onClick={() => navigate(`/listing/${b.listingId}`)}
                                                            className="h-12 w-full bg-slate-50 text-slate-600 rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                                        >
                                                            <History size={16} /> Rebook stay
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
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl relative"
                        >
                            <button onClick={() => setReviewModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-all">
                                <XCircle size={20} />
                            </button>
                            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center mb-6 shadow-inner">
                                <Star size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight uppercase mb-2">Rate your stay</h3>
                            <p className="text-sm font-medium text-slate-500 mb-8">"How was your experience at {reviewModal.title}?"</p>

                            <div className="space-y-6">
                                <div className="flex justify-center gap-2 py-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button key={s} onClick={() => setRating(s)} className="p-1 transition-transform hover:scale-110">
                                            <Star size={32} className={rating >= s ? "fill-amber-400 text-amber-400 drop-shadow-sm" : "text-slate-200"} />
                                        </button>
                                    ))}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Your feedback (Optional)</label>
                                    <textarea
                                        value={comment} onChange={(e) => setComment(e.target.value)}
                                        placeholder="Share details about your stay..."
                                        rows={4}
                                        className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all text-sm resize-none"
                                    />
                                </div>
                                <button
                                    onClick={submitReview} disabled={submittingReview}
                                    className="w-full h-14 bg-slate-900 hover:bg-amber-500 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                                >
                                    {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Review"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* PASSPORT MODAL */}
            <AnimatePresence>
                {passportModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[40px] p-10 w-full max-w-sm shadow-2xl relative text-center overflow-hidden"
                        >
                            {/* Decorative background Elements */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
                            
                            <button onClick={() => setPassportModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-all">
                                <XCircle size={20} />
                            </button>

                            <div className="flex flex-col items-center space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">Verification Passport</p>
                                    <h3 className="text-xl font-black text-slate-900 uppercase">Neural Handshake</h3>
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
                                                src: "https://wayzza.com/favicon.png", // Mock logo
                                                x: undefined, y: undefined, height: 40, width: 40, excavate: true,
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 w-full">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manual Passcode</p>
                                        <div className="flex justify-center gap-2">
                                            {passportModal.checkInPasscode?.split('').map((char, i) => (
                                                <span key={i} className="w-10 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-xl font-black text-slate-900 shadow-sm">
                                                    {char}
                                                </span>
                                            )) || <span className="text-slate-300 text-sm">Awaiting sync...</span>}
                                        </div>
                                    </div>

                                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-4 text-left">
                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 text-emerald-600 shadow-sm">
                                            <Scan size={16} />
                                        </div>
                                        <p className="text-[10px] font-bold text-emerald-800 leading-relaxed uppercase tracking-wider">
                                            Present this QR to the property staff at check-in. This protocol verifies your neural identity and activates your stay.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </WayzzaLayout>
    );
}

function Loader2({ className }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
    )
}