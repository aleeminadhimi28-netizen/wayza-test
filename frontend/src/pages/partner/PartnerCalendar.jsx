import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar, CheckCircle, Clock, MapPin, ArrowRight,
    CalendarDays, ChevronLeft, ChevronRight, X, Users, Zap
} from "lucide-react";
import { api } from "../../utils/api.js";

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Each booking gets a theme
const THEMES = [
    { bar: "bg-emerald-400", barMid: "bg-emerald-300", label: "text-emerald-900", badge: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    { bar: "bg-blue-400", barMid: "bg-blue-300", label: "text-blue-900", badge: "bg-blue-100 text-blue-800 border-blue-200" },
    { bar: "bg-violet-400", barMid: "bg-violet-300", label: "text-violet-900", badge: "bg-violet-100 text-violet-800 border-violet-200" },
    { bar: "bg-amber-400", barMid: "bg-amber-300", label: "text-amber-900", badge: "bg-amber-100 text-amber-800 border-amber-200" },
    { bar: "bg-rose-400", barMid: "bg-rose-300", label: "text-rose-900", badge: "bg-rose-100 text-rose-800 border-rose-200" },
    { bar: "bg-cyan-400", barMid: "bg-cyan-300", label: "text-cyan-900", badge: "bg-cyan-100 text-cyan-800 border-cyan-200" },
];

function toDateOnly(val) {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}

export default function PartnerCalendar() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const today = toDateOnly(new Date());
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        if (!user?.email) return;
        api.getPartnerBookings()
            .then(d => { setBookings(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, [user?.email]);

    // Processed bookings with parsed dates + assigned theme
    const processed = bookings
        .filter(b => b.status !== "cancelled")
        .map((b, i) => ({
            ...b,
            ciDate: toDateOnly(b.checkIn),
            coDate: toDateOnly(b.checkOut),
            theme: THEMES[i % THEMES.length],
        }))
        .filter(b => b.ciDate && b.coDate);

    function prevMonth() {
        if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
        else setViewMonth(m => m - 1);
    }
    function nextMonth() {
        if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
        else setViewMonth(m => m + 1);
    }

    // Build calendar weeks (array of 7-day arrays)
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startOffset = firstOfMonth.getDay(); // 0=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    const allCells = Array.from({ length: totalCells }, (_, i) => {
        const dayNum = i - startOffset + 1;
        const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
        return {
            date: inMonth ? new Date(viewYear, viewMonth, dayNum) : null,
            dayNum,
            inMonth,
        };
    });
    // Split into weeks
    const weeks = [];
    for (let w = 0; w < allCells.length / 7; w++) {
        weeks.push(allCells.slice(w * 7, w * 7 + 7));
    }

    // For each cell, get bookings that overlap this day
    function bookingsForDay(date) {
        if (!date) return [];
        const d = date.getTime();
        return processed.filter(b => d >= b.ciDate.getTime() && d <= b.coDate.getTime());
    }

    // Upcoming stays (from today onward)
    const upcoming = processed
        .filter(b => b.coDate >= today)
        .sort((a, b) => a.ciDate - b.ciDate);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 font-sans pb-12">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide mb-1">
                        <CalendarDays size={14} /> Schedule
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Booking Calendar</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage your property occupancy and upcoming guest arrivals.</p>
                </div>
                <span className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
                    <Users size={14} className="text-emerald-500" />
                    {upcoming.length} Upcoming
                </span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

                {/* ════ CALENDAR ════ */}
                <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                    {/* Month Nav */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                        <button onClick={prevMonth}
                            className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 text-slate-600 hover:text-emerald-700 flex items-center justify-center transition-all shadow-sm">
                            <ChevronLeft size={16} />
                        </button>
                        <div className="text-center">
                            <h2 className="text-lg font-bold text-slate-900">{MONTH_NAMES[viewMonth]}</h2>
                            <p className="text-xs text-slate-400 font-semibold">{viewYear}</p>
                        </div>
                        <button onClick={nextMonth}
                            className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 text-slate-600 hover:text-emerald-700 flex items-center justify-center transition-all shadow-sm">
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Day-of-week headers */}
                    <div className="grid grid-cols-7 border-b border-slate-100">
                        {DAY_NAMES.map(d => (
                            <div key={d} className="py-2.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Weeks */}
                    <div className="divide-y divide-slate-50">
                        {weeks.map((week, wi) => (
                            <div key={wi} className="grid grid-cols-7 relative" style={{ minHeight: 90 }}>
                                {week.map((cell, di) => {
                                    const isToday = cell.date && sameDay(cell.date, today);
                                    const dayBookings = bookingsForDay(cell.date);

                                    return (
                                        <div key={di}
                                            className={`relative min-h-[90px] border-r border-slate-50 last:border-r-0 transition-colors group
                                                ${cell.inMonth ? "bg-white hover:bg-slate-50/60" : "bg-slate-50/40"}
                                            `}
                                        >
                                            {/* Day number */}
                                            <div className="pt-2 pl-2 pr-1">
                                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors
                                                    ${isToday
                                                        ? "bg-emerald-500 text-white shadow"
                                                        : cell.inMonth
                                                            ? "text-slate-700 group-hover:bg-slate-100"
                                                            : "text-slate-300"
                                                    }`}>
                                                    {cell.inMonth ? cell.dayNum : ""}
                                                </span>
                                            </div>

                                            {/* Booking bars */}
                                            <div className="mt-1 space-y-0.5 px-0 overflow-hidden">
                                                {dayBookings.slice(0, 3).map(b => {
                                                    if (!cell.date) return null;
                                                    const isStart = sameDay(cell.date, b.ciDate);
                                                    const isEnd = sameDay(cell.date, b.coDate);
                                                    const isMid = !isStart && !isEnd;
                                                    const isLastCol = di === 6;
                                                    const isFirstCol = di === 0;

                                                    return (
                                                        <button
                                                            key={b._id}
                                                            onClick={() => setSelected(b)}
                                                            className={`
                                                                w-full h-6 flex items-center transition-opacity hover:opacity-80
                                                                ${isMid ? b.theme.barMid : b.theme.bar}
                                                                ${isStart ? "rounded-l-full pl-2" : "pl-1"}
                                                                ${isEnd ? "rounded-r-full pr-1" : "pr-0"}
                                                                ${isStart && isFirstCol ? "ml-1" : ""}
                                                                ${isEnd && isLastCol ? "mr-1" : ""}
                                                            `}
                                                            style={{
                                                                marginLeft: isStart ? "4px" : "0",
                                                                marginRight: isEnd ? "4px" : "0",
                                                                borderRadius: isStart && isEnd ? "9999px" : isStart ? "9999px 0 0 9999px" : isEnd ? "0 9999px 9999px 0" : "0",
                                                            }}
                                                        >
                                                            {isStart && (
                                                                <span className={`text-[9px] font-bold truncate ${b.theme.label} ml-1`}>
                                                                    {b.guestEmail?.split("@")[0]}
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                                {dayBookings.length > 3 && (
                                                    <div className="text-[9px] font-bold text-slate-400 pl-2">
                                                        +{dayBookings.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    {processed.length > 0 && (
                        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 flex flex-wrap gap-2 items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active:</span>
                            {processed.map(b => (
                                <button key={b._id} onClick={() => setSelected(b)}
                                    className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg border ${b.theme.badge}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${b.theme.bar}`} />
                                    {b.guestEmail?.split("@")[0]} · {b.checkIn} → {b.checkOut}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ════ UPCOMING SIDEBAR ════ */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
                        <h3 className="font-bold text-slate-900">Upcoming Stays</h3>
                        <p className="text-xs text-slate-400 mt-0.5">All active and future bookings</p>
                    </div>
                    <div className="divide-y divide-slate-50 max-h-[520px] overflow-y-auto">
                        {upcoming.length === 0 ? (
                            <div className="py-16 text-center px-6">
                                <Calendar size={28} className="text-slate-200 mx-auto mb-3" />
                                <p className="text-sm font-bold text-slate-700 mb-1">No upcoming stays</p>
                                <p className="text-xs text-slate-400">Bookings will appear here as guests reserve.</p>
                            </div>
                        ) : upcoming.map((b, i) => {
                            const isActive = b.ciDate <= today && b.coDate >= today;
                            return (
                                <motion.button key={b._id}
                                    initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                    onClick={() => setSelected(b)}
                                    className="w-full text-left p-4 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-1.5 self-stretch rounded-full shrink-0 ${b.theme.bar}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 justify-between mb-0.5">
                                                <p className="font-bold text-sm text-slate-900 truncate">
                                                    {b.guestEmail?.split("@")[0]}
                                                </p>
                                                {isActive && (
                                                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                                                        <Zap size={9} /> LIVE
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-semibold truncate mb-1.5">{b.title}</p>
                                            <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                                                <span className="font-bold text-slate-700">{b.checkIn}</span>
                                                <ArrowRight size={10} className="text-slate-300" />
                                                <span className="font-bold text-slate-700">{b.checkOut}</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border ${b.status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>
                                                    {b.status === "paid" ? <><CheckCircle size={9} /> Confirmed</> : <><Clock size={9} /> Pending</>}
                                                </span>
                                                <span className="text-xs font-bold text-slate-900">₹{(b.totalPrice || 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ════ DETAIL MODAL ════ */}
            <AnimatePresence>
                {selected && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setSelected(null)}
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div initial={{ opacity: 0, scale: 0.93, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                        >
                            {/* Header stripe */}
                            <div className={`h-2 w-full ${selected.theme.bar}`} />
                            <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{selected.title}</h3>
                                    {selected.location && (
                                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                            <MapPin size={11} /> {selected.location}
                                        </p>
                                    )}
                                </div>
                                <button onClick={() => setSelected(null)}
                                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors shrink-0 mt-0.5">
                                    <X size={15} />
                                </button>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Date range */}
                                <div className="flex items-center justify-around bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="text-center">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Check-In</p>
                                        <p className="font-bold text-base text-slate-900">{selected.checkIn}</p>
                                    </div>
                                    <div className="flex flex-col items-center gap-0.5">
                                        <ArrowRight size={18} className="text-slate-300" />
                                        <span className="text-[9px] font-bold text-slate-400">{selected.nights || "—"} nights</span>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Check-Out</p>
                                        <p className="font-bold text-base text-slate-900">{selected.checkOut}</p>
                                    </div>
                                </div>

                                {/* Details list */}
                                <div className="space-y-3">
                                    {[
                                        { label: "Guest", value: selected.guestEmail },
                                        { label: "Room / Variant", value: selected.variantName || "Standard" },
                                        { label: "Total Revenue", value: `₹${(selected.totalPrice || 0).toLocaleString()}` },
                                        { label: "Your Net (90%)", value: `₹${(selected.netEarnings || Math.round((selected.totalPrice || 0) * 0.9)).toLocaleString()}` },
                                    ].map(row => (
                                        <div key={row.label} className="flex items-center justify-between text-sm border-b border-slate-50 pb-2 last:border-0">
                                            <span className="text-slate-500 font-medium">{row.label}</span>
                                            <span className="font-bold text-slate-900">{row.value}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Status badges */}
                                <div className="flex items-center justify-between pt-1">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${selected.status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>
                                        {selected.status === "paid" ? <CheckCircle size={11} /> : <Clock size={11} />}
                                        {selected.status === "paid" ? "Confirmed" : "Pending"}
                                    </span>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${selected.payoutStatus === "paid_out" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>
                                        Payout: {selected.payoutStatus === "paid_out" ? "Settled ✓" : "Pending"}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}