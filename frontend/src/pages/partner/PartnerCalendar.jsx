import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  CheckCircle,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
  Zap,
  Share2,
  Copy,
  Check,
  MessageSquare,
} from 'lucide-react';
import { api } from '../../utils/api.js';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const THEMES = [
  {
    bar: 'bg-emerald-400',
    barMid: 'bg-emerald-300',
    label: 'text-emerald-900',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    bar: 'bg-blue-400',
    barMid: 'bg-blue-300',
    label: 'text-blue-900',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    bar: 'bg-violet-400',
    barMid: 'bg-violet-300',
    label: 'text-violet-900',
    badge: 'bg-violet-100 text-violet-800 border-violet-200',
  },
  {
    bar: 'bg-amber-400',
    barMid: 'bg-amber-300',
    label: 'text-amber-900',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    bar: 'bg-rose-400',
    barMid: 'bg-rose-300',
    label: 'text-rose-900',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  {
    bar: 'bg-cyan-400',
    barMid: 'bg-cyan-300',
    label: 'text-cyan-900',
    badge: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  },
];

function toDateOnly(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function PartnerCalendar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = toDateOnly(new Date());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(null);
  const [feedUrl, setFeedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [partnerPhone, setPartnerPhone] = useState('');

  useEffect(() => {
    if (!user?.email) return;
    api
      .getPartnerBookings()
      .then((d) => {
        setBookings(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    api.getCalendarSettings().then((d) => {
      if (d.ok) setFeedUrl(d.feedUrl);
    });

    api.getProfile().then((d) => {
      if (d.ok && d.data?.phone) setPartnerPhone(d.data.phone);
    });
  }, [user?.email]);

  const handleCopy = () => {
    navigator.clipboard.writeText(feedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const processed = bookings
    .filter((b) => b.status !== 'cancelled')
    .map((b, i) => ({
      ...b,
      ciDate: toDateOnly(b.checkIn),
      coDate: toDateOnly(b.checkOut),
      theme: THEMES[i % THEMES.length],
    }))
    .filter((b) => b.ciDate && b.coDate);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  }

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startOffset = firstOfMonth.getDay();
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
  const weeks = [];
  for (let w = 0; w < allCells.length / 7; w++) {
    weeks.push(allCells.slice(w * 7, w * 7 + 7));
  }

  function bookingsForDay(date) {
    if (!date) return [];
    const d = date.getTime();
    return processed.filter((b) => d >= b.ciDate.getTime() && d <= b.coDate.getTime());
  }

  const upcoming = processed.filter((b) => b.coDate >= today).sort((a, b) => a.ciDate - b.ciDate);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 font-sans pb-12"
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide mb-1">
            <CalendarDays size={14} /> Schedule
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Booking Calendar</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage occupancy and configure external notifications.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
            <Users size={14} className="text-emerald-500" />
            {upcoming.length} Upcoming
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* ════ LEFT: CALENDAR ════ */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
              <button
                onClick={prevMonth}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-emerald-50 text-slate-600 flex items-center justify-center transition-all shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="text-center">
                <h2 className="text-lg font-bold text-slate-900">{MONTH_NAMES[viewMonth]}</h2>
                <p className="text-xs text-slate-400 font-semibold">{viewYear}</p>
              </div>
              <button
                onClick={nextMonth}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-emerald-50 text-slate-600 flex items-center justify-center transition-all shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-7 border-b border-slate-100">
              {DAY_NAMES.map((d) => (
                <div
                  key={d}
                  className="py-2.5 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="divide-y divide-slate-50">
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 relative" style={{ minHeight: 95 }}>
                  {week.map((cell, di) => {
                    const isToday = cell.date && sameDay(cell.date, today);
                    const dayBookings = bookingsForDay(cell.date);
                    return (
                      <div
                        key={di}
                        className={`relative min-h-[95px] border-r border-slate-50 last:border-r-0 transition-colors ${cell.inMonth ? 'bg-white' : 'bg-slate-50/40'}`}
                      >
                        <div className="pt-2 pl-2">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${isToday ? 'bg-emerald-500 text-white shadow' : cell.inMonth ? 'text-slate-700' : 'text-slate-300'}`}
                          >
                            {cell.inMonth ? cell.dayNum : ''}
                          </span>
                        </div>
                        <div className="mt-1 space-y-0.5 px-0.5 overflow-hidden">
                          {dayBookings.slice(0, 3).map((b) => {
                            const isStart = sameDay(cell.date, b.ciDate);
                            const isEnd = sameDay(cell.date, b.coDate);
                            return (
                              <button
                                key={b._id}
                                onClick={() => setSelected(b)}
                                className={`w-full h-5 flex items-center ${isStart && !isEnd ? 'rounded-l-full' : isEnd && !isStart ? 'rounded-r-full' : isStart && isEnd ? 'rounded-full' : ''} ${b.theme.bar} px-2 hover:opacity-80 transition-opacity`}
                              >
                                {isStart && (
                                  <span
                                    className={`text-[11px] font-bold truncate ${b.theme.label}`}
                                  >
                                    {b.guestEmail?.split('@')?.[0]}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* CALENDAR SYNC CARD */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <Share2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Native Calendar Sync</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Add your Wayzza schedule to Google or Apple Calendar.
                </p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
              <div className="truncate flex-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Personal iCal Feed URL
                </p>
                <p className="text-xs text-slate-900 font-mono truncate">
                  {feedUrl || 'Generating feed...'}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="h-10 px-4 bg-white border border-slate-200 rounded-lg flex items-center gap-2 text-slate-600 font-bold text-xs hover:text-emerald-600 transition-all shadow-sm shrink-0"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>

        {/* ════ RIGHT: ALERTS & UPCOMING ════ */}
        <div className="space-y-6">
          {/* WHATSAPP CARD */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <MessageSquare size={80} />
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-1 flex items-center gap-2 text-white">
                <Zap className="text-emerald-400" size={18} />
                WhatsApp Notifications
              </h3>
              <p className="text-slate-400 text-xs mb-6 font-medium leading-relaxed">
                Get instant confirmation alerts directly to your WhatsApp.
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase bg-emerald-400/10 px-2 py-0.5 rounded-md">
                      Online
                    </span>
                  </div>
                  <p className="text-xs text-white/80 font-medium">
                    Primary Number: <br />
                    <span className="text-white font-bold text-sm tracking-wide">
                      {partnerPhone || 'Not configured'}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full h-11 bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Configure Alerts
                </button>
              </div>
            </div>
          </div>

          {/* UPCOMING LIST */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
              <h3 className="font-bold text-slate-900">Upcoming Arrivals</h3>
            </div>
            <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
              {upcoming.length === 0 ? (
                <div className="py-12 text-center px-6">
                  <Calendar size={24} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-500">No upcoming stays</p>
                </div>
              ) : (
                upcoming.map((b) => (
                  <button
                    key={b._id}
                    onClick={() => setSelected(b)}
                    className="w-full text-left p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-1 h-10 rounded-full ${b.theme.bar}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-900 truncate">
                          {b.guestEmail?.split('@')?.[0]}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium truncate mb-1">
                          {b.title}
                        </p>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-bold">
                          <span>{b.checkIn}</span>
                          <ArrowRight size={10} />
                          <span>{b.checkOut}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className={`h-1.5 w-full ${selected.theme.bar}`} />
              <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">{selected.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{selected.guestEmail}</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500"
                >
                  <X size={15} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Check-In</p>
                    <p className="font-bold text-sm text-slate-900">{selected.checkIn}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Check-Out</p>
                    <p className="font-bold text-sm text-slate-900">{selected.checkOut}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-500">Nights</span>
                    <span className="text-slate-900">{selected.nights}</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-500">Net Earnings</span>
                    <span className="text-slate-900 font-bold">
                      ₹
                      {(
                        selected.netEarnings || Math.round(selected.totalPrice * 0.9)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                    <CheckCircle size={10} /> Paid & Confirmed
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
