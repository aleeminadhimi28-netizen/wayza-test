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
  Sparkles,
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
    label: 'text-[#050a08]',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  {
    bar: 'bg-blue-400',
    barMid: 'bg-blue-300',
    label: 'text-[#050a08]',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  {
    bar: 'bg-violet-400',
    barMid: 'bg-violet-300',
    label: 'text-[#050a08]',
    badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  },
  {
    bar: 'bg-amber-400',
    barMid: 'bg-amber-300',
    label: 'text-[#050a08]',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  {
    bar: 'bg-rose-400',
    barMid: 'bg-rose-300',
    label: 'text-[#050a08]',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
  {
    bar: 'bg-cyan-400',
    barMid: 'bg-cyan-300',
    label: 'text-[#050a08]',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
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
      <div className="flex items-center justify-center min-h-[400px] bg-[#050a08]">
        <div className="w-10 h-10 border-2 border-white/10 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#050a08] font-sans text-white selection:bg-emerald-900/50 selection:text-emerald-200 pb-20">
      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-700/5 blur-[100px] rounded-full" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(52,211,153,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-10 space-y-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.03] border border-white/[0.08] p-8 rounded-3xl backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-[0.4em] mb-1">
              <Sparkles size={12} /> Schedule
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">
              Booking Calendar
            </h1>
            <p className="text-sm text-white/30 font-medium mt-1">
              Manage occupancy and configure external notifications.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-white bg-white/[0.05] border border-white/[0.1] px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm uppercase tracking-wide">
              <Users size={14} className="text-emerald-400" />
              {upcoming.length} Upcoming
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* ════ LEFT: CALENDAR ════ */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl backdrop-blur-xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.05] bg-white/[0.02]">
                <button
                  onClick={prevMonth}
                  className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] text-white flex items-center justify-center transition-all shadow-sm"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="text-center">
                  <h2 className="text-lg font-black text-white uppercase tracking-tight">
                    {MONTH_NAMES[viewMonth]}
                  </h2>
                  <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">
                    {viewYear}
                  </p>
                </div>
                <button
                  onClick={nextMonth}
                  className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] text-white flex items-center justify-center transition-all shadow-sm"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="grid grid-cols-7 border-b border-white/[0.05] bg-white/[0.01]">
                {DAY_NAMES.map((d) => (
                  <div
                    key={d}
                    className="py-3 text-center text-[10px] font-black text-white/30 uppercase tracking-[0.2em]"
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="divide-y divide-white/[0.02]">
                {weeks.map((week, wi) => (
                  <div key={wi} className="grid grid-cols-7 relative" style={{ minHeight: 95 }}>
                    {week.map((cell, di) => {
                      const isToday = cell.date && sameDay(cell.date, today);
                      const dayBookings = bookingsForDay(cell.date);
                      return (
                        <div
                          key={di}
                          className={`relative min-h-[95px] border-r border-white/[0.02] last:border-r-0 transition-colors ${cell.inMonth ? 'bg-transparent' : 'bg-white/[0.01]'}`}
                        >
                          <div className="pt-2 pl-2">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${isToday ? 'bg-emerald-500 text-[#050a08] shadow-lg shadow-emerald-500/20' : cell.inMonth ? 'text-white/70' : 'text-white/10'}`}
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
                                  className={`w-full h-5 flex items-center ${isStart && !isEnd ? 'rounded-l-lg' : isEnd && !isStart ? 'rounded-r-lg' : isStart && isEnd ? 'rounded-lg' : ''} ${b.theme.bar} px-2 hover:opacity-80 transition-opacity`}
                                >
                                  {isStart && (
                                    <span
                                      className={`text-[10px] font-bold truncate uppercase tracking-wide ${b.theme.label}`}
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
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                  <Share2 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">
                    Native Calendar Sync
                  </h3>
                  <p className="text-xs text-white/30 font-medium mt-0.5">
                    Add your Wayzza schedule to Google or Apple Calendar.
                  </p>
                </div>
              </div>
              <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.05] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="truncate flex-1">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">
                    Personal iCal Feed URL
                  </p>
                  <p className="text-xs text-white/70 font-mono truncate">
                    {feedUrl || 'Generating feed...'}
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className="h-10 px-4 bg-white/[0.05] border border-white/[0.1] rounded-lg flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wide hover:bg-white/[0.08] transition-all shadow-sm shrink-0"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy Link'}
                </button>
              </div>
            </div>
          </div>

          {/* ════ RIGHT: ALERTS & UPCOMING ════ */}
          <div className="space-y-6">
            {/* WHATSAPP CARD */}
            <div className="bg-gradient-to-br from-emerald-900/50 to-[#050a08] border border-emerald-500/20 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-colors duration-1000" />
              <div className="relative z-10">
                <h3 className="text-lg font-black uppercase tracking-tight mb-1 flex items-center gap-2 text-white">
                  <Zap className="text-emerald-400" size={18} />
                  WhatsApp Alerts
                </h3>
                <p className="text-white/40 text-xs mb-6 font-medium leading-relaxed">
                  Get instant confirmation alerts directly to your WhatsApp.
                </p>

                <div className="space-y-4">
                  <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-md tracking-wider">
                        Online
                      </span>
                    </div>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-wide">
                      Primary Number
                    </p>
                    <p className="text-white font-bold text-sm tracking-wide mt-0.5">
                      {partnerPhone || 'Not configured'}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full h-11 bg-white text-[#050a08] rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10"
                  >
                    Configure Alerts
                  </button>
                </div>
              </div>
            </div>

            {/* UPCOMING LIST */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl backdrop-blur-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.05] bg-white/[0.02]">
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">
                  Upcoming Arrivals
                </h3>
              </div>
              <div className="divide-y divide-white/[0.02] max-h-[400px] overflow-y-auto">
                {upcoming.length === 0 ? (
                  <div className="py-12 text-center px-6">
                    <Calendar size={24} className="text-white/10 mx-auto mb-2" />
                    <p className="text-xs font-bold text-white/30 uppercase tracking-widest">
                      No upcoming stays
                    </p>
                  </div>
                ) : (
                  upcoming.map((b) => (
                    <button
                      key={b._id}
                      onClick={() => setSelected(b)}
                      className="w-full text-left p-4 hover:bg-white/[0.01] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-1 h-10 rounded-full ${b.theme.bar}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-sm truncate">
                            {b.guestEmail?.split('@')?.[0]}
                          </p>
                          <p className="text-xs text-white/30 font-medium truncate mb-1">
                            {b.title}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-white/20 font-bold uppercase tracking-wide">
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
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selected && (
          <div
            className="fixed inset-0 bg-[#050a08]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#050a08] border border-white/[0.08] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className={`h-1.5 w-full ${selected.theme.bar}`} />
              <div className="px-6 py-5 border-b border-white/[0.05] flex items-start justify-between bg-white/[0.02]">
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">
                    {selected.title}
                  </h3>
                  <p className="text-xs text-white/30 font-medium mt-0.5">{selected.guestEmail}</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-white/40 hover:bg-white/[0.1] hover:text-white transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-wider mb-1">
                      Check-In
                    </p>
                    <p className="font-bold text-sm text-white">{selected.checkIn}</p>
                  </div>
                  <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-wider mb-1">
                      Check-Out
                    </p>
                    <p className="font-bold text-sm text-white">{selected.checkOut}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wide">
                    <span className="text-white/30">Nights</span>
                    <span className="text-white">{selected.nights}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wide">
                    <span className="text-white/30">Net Earnings</span>
                    <span className="text-emerald-400">
                      ₹
                      {(
                        selected.netEarnings || Math.round(selected.totalPrice * 0.9)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1.5 uppercase tracking-wide">
                    <CheckCircle size={12} strokeWidth={2.5} /> Paid & Confirmed
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
