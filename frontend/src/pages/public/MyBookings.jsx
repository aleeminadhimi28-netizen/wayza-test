import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { WayzaLayout } from "../../WayzaUI.jsx";
import { useAuth } from "../../AuthContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
    CalendarCheck, MessageCircle, XCircle, Clock, CheckCircle,
    AlertCircle, ArrowRight, Plane, MapPin, Zap, Layers, History,
    Shield, Briefcase, Info, MoreVertical, Sparkles, Navigation, Globe,
    FileText, Download, Star
} from "lucide-react";

import { api } from "../../utils/api.js";

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
        const gst = Math.round((b.pricePerNight || 0) * (b.nights || 1) * 0.12);
        const baseAmount = (b.pricePerNight || 0) * (b.nights || 1);
        const serviceFee = 99;
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
                <div class="brand"><div class="brand-icon">W</div><div><div class="brand-name">Wayza</div><div class="brand-sub">Premium Stays</div></div></div>
                <div class="invoice-meta"><div class="invoice-id">INVOICE #${invoiceId}</div><div class="invoice-date">${invoiceDate}</div></div>
            </div>
            <h2>${b.title}</h2>
            <p class="subtitle">Booking Confirmed &nbsp;•&nbsp; Paid via Wayza Secure Checkout</p>
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
                    <tr><td>GST @ 12%</td><td>₹${gst.toLocaleString()}</td></tr>
                    <tr><td>Service & Platform Fee</td><td>₹${serviceFee.toLocaleString()}</td></tr>
                    <tr class="total-row"><td>Total Paid</td><td>₹${(b.totalPrice || 0).toLocaleString()}</td></tr>
                </tbody>
            </table>
            <div class="badge">✓ Payment Confirmed</div>
            <div class="footer">
                <div class="footer-note">Thank you for staying with Wayza.<br>For support: support@wayza.com</div>
                <div class="footer-note">© ${new Date().getFullYear()} Wayza Inc.</div>
            </div>
        </div></body></html>`;
        const w = window.open('', '_blank', 'width=780,height=900');
        w.document.write(html);
        w.document.close();
        setTimeout(() => w.print(), 500);
    }

    const statusConfig = {
        paid: { label: "Confirmed", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle, border: "border-emerald-100" },
        pending: { label: "Awaiting", color: "text-amber-600", bg: "bg-amber-50", icon: Clock, border: "border-amber-100" },
        cancelled: { label: "Cancelled", color: "text-rose-600", bg: "bg-rose-50", icon: XCircle, border: "border-rose-100" },
    };

    const filtered = filterStatus === "all" ? rows : rows.filter(b => b.status === filterStatus);

    const tabs = [
        { key: "all", label: "Stay Archive", icon: History },
        { key: "paid", label: "Verified Stays", icon: CheckCircle },
        { key: "pending", label: "Awaiting Audit", icon: Clock },
        { key: "cancelled", label: "Voided Stays", icon: XCircle },
    ];

    if (loading) return (
        <WayzaLayout noPadding>
            <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-8 font-sans">
                <div className="w-16 h-16 border-4 border-slate-50 border-t-emerald-500 rounded-full animate-spin" />
                <div className="text-center space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-300">Retrieving Information</p>
                    <p className="text-xl font-bold text-slate-900 tracking-tight uppercase">Loading your travels...</p>
                </div>
            </div>
        </WayzaLayout>
    );

    return (
        <WayzaLayout noPadding>
            <div className="bg-slate-50 min-h-screen font-sans pb-32 selection:bg-emerald-100 selection:text-emerald-900">

                {/* REFINED HEADER */}
                <header className="bg-white border-b border-slate-100 pt-24 pb-16 px-6 lg:px-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] -mr-32 -mt-32 pointer-events-none" />

                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-12 relative z-10">
                        <div className="space-y-6">
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
                                <Sparkles size={16} /> Guest Journey Portal
                            </motion.div>
                            <h1 className="text-6xl md:text-9xl font-bold text-slate-900 tracking-tighter leading-[0.8] uppercase">
                                Stay <span className="text-emerald-500 italic font-serif lowercase">Archive.</span>
                            </h1>
                            <p className="text-slate-400 font-medium text-xl max-w-xl italic border-l-4 border-emerald-500/20 pl-8">"Review and manage your curated collection of personal stays and experiences."</p>
                        </div>

                        {/* STATUS FILTER */}
                        <div className="flex flex-wrap gap-2 bg-slate-50 p-2 rounded-[24px] border border-slate-100 shadow-inner">
                            {tabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilterStatus(tab.key)}
                                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all ${filterStatus === tab.key
                                        ? "bg-white text-slate-900 shadow-md border border-slate-100"
                                        : "text-slate-400 hover:text-slate-900"
                                        }`}
                                >
                                    <tab.icon size={14} className={filterStatus === tab.key ? "text-emerald-500" : ""} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {/* CONTENT AREA */}
                <main className="max-w-5xl mx-auto px-6 py-20">

                    <AnimatePresence mode="wait">
                        {rows.length === 0 ? (
                            <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[48px] p-24 text-center border border-slate-100 shadow-sm flex flex-col items-center space-y-10">
                                <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 shadow-inner">
                                    <Navigation size={40} />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">Your collection is empty</h3>
                                    <p className="text-slate-400 font-medium text-lg italic max-w-md mx-auto">"Every great story starts with a single step. Let's find your next extraordinary stay."</p>
                                </div>
                                <Link to="/listings" className="h-16 px-12 bg-slate-900 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-2xl shadow-emerald-500/10 active:scale-95 flex items-center gap-3">Discover Stays <ArrowRight size={18} /></Link>
                            </motion.div>
                        ) : filtered.length === 0 ? (
                            <motion.div key="no-filter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-40 text-center bg-white rounded-[48px] border border-slate-100 shadow-sm">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
                                    <Info size={32} />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 uppercase mb-2">No results found</h4>
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest italic">No matching stays for the "{filterStatus}" category</p>
                            </motion.div>
                        ) : (
                            <div className="space-y-10">
                                {filtered.map((b, i) => {
                                    const start = b.checkIn || b.startDate;
                                    const end = b.checkOut || b.endDate;
                                    const isFuture = start && new Date(start) > new Date();
                                    const cfg = statusConfig[b.status] || statusConfig.pending;

                                    return (
                                        <motion.div
                                            key={b._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="group relative bg-white border border-slate-100 rounded-[40px] p-10 md:p-14 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all overflow-hidden border-l-8 border-l-transparent hover:border-l-emerald-500"
                                        >
                                            <div className="flex flex-col lg:flex-row justify-between gap-12 relative z-10">
                                                {/* DETAILS SECTION */}
                                                <div className="flex-1 space-y-10">
                                                    <div className="flex flex-wrap items-center gap-4">
                                                        <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-full font-bold text-[9px] uppercase tracking-widest ${cfg.bg} ${cfg.color} border ${cfg.border} shadow-sm`}>
                                                            <cfg.icon size={14} strokeWidth={2.5} /> {cfg.label}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                                                            <div className="w-1 h-3 bg-emerald-500 rounded-full" />
                                                            Subject ID: {b._id?.slice(-12).toUpperCase()}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-8">
                                                        <h3 className="text-3xl md:text-5xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors uppercase tracking-tight leading-[0.9]">{b.title}</h3>
                                                        <div className="flex flex-wrap items-center gap-6">
                                                            <div className="bg-slate-50 px-6 py-4 rounded-[20px] border border-slate-100 flex items-center gap-4 shadow-inner">
                                                                <CalendarCheck size={20} className="text-emerald-500" />
                                                                <div className="flex flex-col">
                                                                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-300">Stay Duration</span>
                                                                    <span className="text-sm font-bold text-slate-700">{start} <ArrowRight size={12} className="inline mx-2 text-emerald-500/30" /> {end}</span>
                                                                </div>
                                                            </div>
                                                            {b.variantName && (
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-300 ml-1">Selection</span>
                                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-4 py-3 rounded-xl border border-slate-200">{b.variantName}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* SUMMARY & ACTIONS */}
                                                <div className="w-full lg:w-72 flex flex-col justify-between items-end gap-10 border-t lg:border-t-0 lg:border-l border-slate-50 pt-10 lg:pt-0 lg:pl-10">
                                                    <div className="text-right space-y-2">
                                                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Total Investment</span>
                                                        <p className="text-4xl font-bold text-slate-900 italic tracking-tighter">₹{(b.totalPrice || 0).toLocaleString()}</p>
                                                    </div>

                                                    <div className="flex flex-col w-full gap-3">
                                                        {b.status !== "cancelled" && isFuture && (
                                                            <>
                                                                <button
                                                                    onClick={() => navigate("/guest-chat")}
                                                                    className="h-16 w-full bg-slate-900 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-xl active:scale-95"
                                                                >
                                                                    <MessageCircle size={18} /> Concierge Chat
                                                                </button>
                                                                <button
                                                                    onClick={() => cancelBooking(b._id)}
                                                                    disabled={cancellingId === b._id}
                                                                    className="h-12 w-full border border-slate-100 text-slate-300 rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all disabled:opacity-20"
                                                                >
                                                                    {cancellingId === b._id ? <Loader2 className="w-4 h-4 animate-spin text-rose-500" /> : <XCircle size={16} />}
                                                                    Modify Reservation
                                                                </button>
                                                            </>
                                                        )}

                                                        {b.status === "paid" && (
                                                            <>
                                                                <button
                                                                    onClick={() => downloadInvoice(b)}
                                                                    className="h-11 w-full border border-emerald-100 text-emerald-700 bg-emerald-50 rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm"
                                                                >
                                                                    <FileText size={14} /> Download Invoice
                                                                </button>
                                                                {!isFuture && (
                                                                    <button
                                                                        onClick={() => setReviewModal(b)}
                                                                        className="h-11 w-full border border-amber-100 text-amber-700 bg-amber-50 rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all shadow-sm mt-3"
                                                                    >
                                                                        <Star size={14} /> Leave a Review
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}

                                                        {b.status === "cancelled" && (
                                                            <div className="h-16 flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-widest text-rose-500 bg-rose-50 rounded-2xl border border-rose-100 italic">
                                                                <AlertCircle size={16} /> Reservation Voided
                                                            </div>
                                                        )}

                                                        {!isFuture && b.status !== "cancelled" && (
                                                            <button
                                                                onClick={() => navigate(`/listing/${b.listingId}`)}
                                                                className="h-16 w-full bg-slate-50 text-slate-400 rounded-2xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 border border-slate-100 hover:bg-slate-900 hover:text-white transition-all shadow-sm group/btn"
                                                            >
                                                                <History size={18} /> Rebook This Stay <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </AnimatePresence>
                </main>

                {/* INFO FEED */}
                <div className="max-w-5xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-10 bg-white rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 blur-3xl -ml-16 -mt-16" />

                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                                <Shield size={28} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Travel Protection Active</h4>
                                <p className="text-xs text-slate-400 font-medium italic">Your security and privacy are our highest priority during every stay.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-8 relative z-10 opacity-40 group-hover:opacity-100 transition-all">
                            <div className="flex flex-col items-center gap-1">
                                <Globe size={18} className="text-emerald-600" />
                                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-900">Global</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <Zap size={18} className="text-emerald-600" />
                                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-900">Direct</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="py-20 text-center">
                    <p className="text-[9px] font-bold text-slate-200 uppercase tracking-[0.5em] select-none">Wayza Premium Guest Concierge // Network Stable</p>
                </div>
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
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight uppercase mb-2">Rate Your Stay</h3>
                            <p className="text-sm font-medium text-slate-500 mb-8 italic">"How was your experience at {reviewModal.title}?"</p>

                            <div className="space-y-6">
                                <div className="flex justify-center gap-2 py-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button key={s} onClick={() => setRating(s)} className="p-1 transition-transform hover:scale-110">
                                            <Star size={32} className={rating >= s ? "fill-amber-400 text-amber-400 drop-shadow-sm" : "text-slate-200"} />
                                        </button>
                                    ))}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Your Feedback (Optional)</label>
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
        </WayzaLayout>
    );
}

function Loader2({ className }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
    )
}