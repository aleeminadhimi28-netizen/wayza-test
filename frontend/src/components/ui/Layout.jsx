import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from './PageTransition.jsx';
import { Bell, X, Moon, Sun, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../../utils/api.js';
import {
  initiateSocketConnection,
  joinUserRoom,
  subscribeToNotifications,
  disconnectSocket,
} from '../../utils/socket.js';
import { useCurrency, CURRENCIES } from '../../CurrencyContext.jsx';

export function Layout({ children, noPadding = false, hideFooter = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const boxRef = useRef(null);
  const currRef = useRef(null);
  const { currency, changeCurrency } = useCurrency();
  const [showCurr, setShowCurr] = useState(false);

  // NOTIFICATIONS
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  // THEME
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('wayzza-dark'));
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains('wayzza-dark')) {
      root.classList.remove('wayzza-dark');
      setIsDarkMode(false);
    } else {
      root.classList.add('wayzza-dark');
      setIsDarkMode(true);
    }
  };

  useEffect(() => {
    if (!user) return;
    async function fetchNotifs() {
      try {
        const res = await api.getNotifications();
        if (res.ok) setNotifs(res.data || []);
      } catch (error) {
        // Ignore notification fetch errors
      }
    }
    fetchNotifs();
    const int = setInterval(fetchNotifs, 30000);

    initiateSocketConnection();
    joinUserRoom(user.email);
    const unsubscribe = subscribeToNotifications((notification) => {
      setNotifs((prev) => [notification, ...prev].slice(0, 20));
    });

    return () => {
      clearInterval(int);
      unsubscribe();
      disconnectSocket();
    };
  }, [user]);

  async function openNotifs() {
    setShowNotifs(!showNotifs);
    if (!showNotifs && notifs.some((n) => !n.read)) {
      await api.markNotificationsRead();
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
      if (currRef.current && !currRef.current.contains(e.target)) setShowCurr(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const navLinks = [
    { name: 'Stays', to: '/listings?category=hotel' },
    { name: 'Experiences', to: '/experiences' },
    { name: 'Bikes', to: '/listings?category=bike' },
    { name: 'Cars', to: '/listings?category=car' },
    { name: 'AI Trip', to: '/ai-trip-planner', icon: Sparkles },
  ];

  const isHomePage = location?.pathname === '/';

  // FIX: single source of truth for nav state — avoids repeated ternary chains
  const isTransparent = !scrolled && isHomePage && !mobileMenuOpen;

  const headerBg = isTransparent
    ? 'bg-transparent'
    : 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-100';

  const textColor = isTransparent ? 'text-white' : 'text-slate-900';
  const subTextColor = isTransparent ? 'text-white/60' : 'text-slate-500';

  // FIX: unified icon button base — same size & shape at every breakpoint
  // All nav icons: w-10 h-10, rounded-2xl, flex center, consistent glass/solid variants
  const iconBtn = isTransparent
    ? 'w-10 h-10 rounded-2xl flex items-center justify-center transition-all bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white'
    : 'w-10 h-10 rounded-2xl flex items-center justify-center transition-all bg-slate-100 hover:bg-slate-200 text-slate-700';

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 py-3 ${headerBg}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
          {/* ── LOGO ── */}
          <Link
            to="/"
            className={`flex items-center shrink-0 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            {/* FIX: fixed logo height so it doesn't affect nav row height */}
            <div className="relative h-10 w-[160px] sm:w-[200px] md:w-[240px]">
              <img
                src="/images/logo-dark.svg"
                alt="Wayzza"
                className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ${isTransparent ? 'opacity-100' : 'opacity-0'}`}
              />
              <img
                src="/images/logo-light.svg"
                alt="Wayzza"
                className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ${isTransparent ? 'opacity-0' : 'opacity-100'}`}
              />
            </div>
          </Link>

          {/* ── DESKTOP NAV LINKS ── */}
          <div
            className={`hidden lg:flex gap-6 font-bold uppercase tracking-widest text-[11px] ${subTextColor}`}
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.to}
                className={`hover:text-emerald-500 transition-colors relative group flex items-center gap-1.5 ${link.icon ? 'text-emerald-500 font-extrabold' : ''}`}
              >
                {link.icon && <link.icon size={12} />}
                {link.name}
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-1 bg-emerald-500 rounded-full transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* ── RIGHT SIDE ICONS ── */}
          {/* FIX: items-center on every wrapper, gap-2 consistent, no size variation between mobile/desktop */}
          <div className="flex items-center gap-2">
            {/* CURRENCY SELECTOR */}
            {/* FIX: removed h-10/h-11 split — now always h-10, px-3, rounded-2xl */}
            <div className="relative" ref={currRef}>
              <button
                onClick={() => {
                  setShowCurr(!showCurr);
                  setShowNotifs(false);
                  setOpen(false);
                }}
                className={`h-10 px-3 rounded-2xl flex items-center gap-2 transition-all font-bold text-[11px] uppercase tracking-widest ${
                  isTransparent
                    ? 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                aria-label="Select currency"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                {/* FIX: always show symbol on mobile, code on sm+ — no xs breakpoint needed */}
                <span className="hidden sm:inline">{currency.code}</span>
                <span className="sm:hidden">{currency.symbol}</span>
              </button>

              <AnimatePresence>
                {showCurr && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-[240px] min-w-[240px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-[120] p-2"
                  >
                    <div className="px-4 py-3 border-b border-slate-50 mb-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        Select Currency
                      </span>
                    </div>
                    {CURRENCIES.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => {
                          changeCurrency(c.code);
                          setShowCurr(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-colors ${
                          currency.code === c.code
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="font-bold text-xs">{c.label}</span>
                        <span className="font-bold text-[11px] text-slate-400">
                          {c.symbol} {c.code}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* THEME TOGGLE */}
            {/* FIX: was w-9 h-9 md:w-10 md:h-10 rounded-full — now w-10 h-10 rounded-2xl everywhere */}
            <button
              onClick={toggleTheme}
              className={`${iconBtn} ${
                !isTransparent &&
                (isDarkMode ? 'bg-indigo-50 text-indigo-500 hover:bg-indigo-100' : '')
              }`}
              aria-label="Toggle theme"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* AUTH BUTTONS (desktop only) */}
            {!user ? (
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  to="/login"
                  className={`font-bold text-[11px] tracking-widest uppercase px-4 py-2 rounded-2xl transition-all ${
                    isTransparent
                      ? 'text-white hover:bg-white/10'
                      : 'text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-emerald-600 text-white px-6 py-2.5 rounded-2xl font-bold text-[11px] tracking-widest uppercase hover:bg-emerald-500 transition-all"
                >
                  Join Now
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* NOTIFICATION BELL */}
                {/* FIX: was w-10 h-10 md:w-12 md:h-12 — now w-10 h-10 everywhere */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifs(!showNotifs);
                      setShowCurr(false);
                      setOpen(false);
                    }}
                    className={`${iconBtn} relative`}
                    aria-label="Notifications"
                  >
                    <Bell size={16} />
                    {notifs.filter((n) => !n.read).length > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full animate-pulse border-2 border-white" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifs && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-4 w-[320px] min-w-[320px] bg-white rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden z-[120] flex flex-col max-h-[420px]"
                      >
                        <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                          <span className="font-bold text-xs text-slate-900 uppercase tracking-widest">
                            Notifications
                          </span>
                          <button
                            onClick={() => setShowNotifs(false)}
                            className="text-slate-400 hover:text-slate-900"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="overflow-y-auto p-4 flex-1">
                          {notifs.length === 0 ? (
                            <p className="text-center text-xs text-slate-400 py-6">
                              No new notifications
                            </p>
                          ) : (
                            notifs.map((n) => (
                              <div
                                key={n._id}
                                className={`p-4 rounded-2xl mb-2 flex flex-col gap-1.5 text-sm ${
                                  n.read
                                    ? 'bg-white text-slate-500 border border-slate-50'
                                    : 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-100/50'
                                }`}
                              >
                                <span className="leading-snug">{n.message}</span>
                                <span className="text-[11px] uppercase tracking-widest opacity-40">
                                  {new Date(n.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* USER AVATAR */}
                {/* FIX: was w-10 h-10 md:w-12 md:h-12 — now w-10 h-10 everywhere */}
                <div ref={boxRef} className="relative">
                  <button
                    onClick={() => {
                      setOpen(!open);
                      setShowCurr(false);
                      setShowNotifs(false);
                    }}
                    className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-lg hover:bg-emerald-600 transition-all active:scale-95 border border-white/10"
                  >
                    {user.email.charAt(0).toUpperCase()}
                  </button>
                  <AnimatePresence>
                    {open && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-[280px] min-w-[280px] bg-white rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-slate-100 z-[120] overflow-hidden"
                      >
                        <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                          <p className="text-[11px] font-bold text-emerald-600 tracking-widest uppercase">
                            Signed in as
                          </p>
                          <p className="text-lg font-bold truncate mt-1 text-slate-900">
                            {user.email.split('@')[0]}
                          </p>
                          <p className="text-[11px] font-medium text-slate-400 mt-0.5 truncate lowercase">
                            {user.email}
                          </p>
                        </div>
                        <div className="p-2 space-y-1">
                          {user.role === 'partner' && (
                            <Link
                              to="/partner"
                              onClick={() => setOpen(false)}
                              className="flex items-center px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 rounded-2xl"
                            >
                              Provider Dashboard
                            </Link>
                          )}
                          {user.role === 'admin' && (
                            <Link
                              to="/admin"
                              onClick={() => setOpen(false)}
                              className="flex items-center px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 rounded-2xl"
                            >
                              Admin Dashboard
                            </Link>
                          )}
                          <Link
                            to="/my-bookings"
                            onClick={() => setOpen(false)}
                            className="flex items-center px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-900 hover:bg-slate-50 rounded-2xl"
                          >
                            My Bookings
                          </Link>
                          <Link
                            to="/profile"
                            onClick={() => setOpen(false)}
                            className="flex items-center px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-900 hover:bg-slate-50 rounded-2xl"
                          >
                            Account Profile
                          </Link>
                          <button
                            onClick={() => {
                              logout();
                              setOpen(false);
                              navigate('/');
                            }}
                            className="w-full text-center py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-white bg-slate-900 hover:bg-rose-500 transition-all mt-1"
                          >
                            Log Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* HAMBURGER */}
            {/* FIX: added border border-white/20 on hero to match other glass buttons */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden w-10 h-10 flex items-center justify-center rounded-2xl transition-all ${
                isTransparent
                  ? 'bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20'
                  : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
              }`}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'}
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE MENU PANEL ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[9999] bg-white dark:bg-slate-950 lg:hidden flex flex-col shadow-2xl"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xl font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white"
              >
                Wayzza
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900 hover:bg-slate-200 transition-all"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-5 rounded-[20px] font-black text-lg uppercase tracking-tighter transition-all active:scale-95 ${
                      link.icon
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-slate-50 text-slate-900 border border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {link.icon && <link.icon size={18} />}
                      {link.name}
                    </div>
                    <ArrowRight size={18} className="opacity-30" />
                  </Link>
                ))}
              </div>

              {!user ? (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="h-16 bg-slate-950 text-white rounded-[20px] flex items-center justify-center font-black text-[11px] uppercase tracking-widest shadow-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="h-16 bg-emerald-500 text-slate-950 rounded-[20px] flex items-center justify-center font-black text-[11px] uppercase tracking-widest shadow-lg"
                  >
                    Join Now
                  </Link>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[28px] p-6 space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black text-lg shrink-0">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-black text-slate-900 leading-none truncate">
                        {user.email.split('@')[0]}
                      </p>
                      <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                        Verified Member
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-3.5 bg-white border border-slate-200 rounded-xl text-center text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                      Account
                    </Link>
                    <Link
                      to="/my-bookings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-3.5 bg-white border border-slate-200 rounded-xl text-center text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                      Bookings
                    </Link>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      navigate('/');
                    }}
                    className="w-full py-4 bg-slate-950 text-white rounded-[18px] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-rose-500 transition-all"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PageTransition>
        <main
          className={`${!isHomePage && !noPadding ? 'pt-[72px]' : 'pt-0'} transition-all duration-500`}
        >
          {children}
        </main>
      </PageTransition>

      {!hideFooter && (
        <footer className="bg-slate-950 text-white/40">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 md:py-32 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-20">
            <div className="space-y-6 md:space-y-10 text-center md:text-left">
              <Link to="/" className="flex items-center justify-center md:justify-start">
                <img
                  src="/images/logo-dark.svg"
                  alt="Wayzza"
                  className="h-10 md:h-14 w-auto object-contain"
                />
              </Link>
              <p className="text-base font-medium leading-relaxed text-white/30 max-w-xs mx-auto md:mx-0">
                &ldquo;Connecting travelers with extraordinary stays.&rdquo;
              </p>
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-white font-black uppercase tracking-widest text-[11px] mb-6 md:mb-10">
                Resources
              </h4>
              <ul className="space-y-4 text-[14px] font-bold">
                <li>
                  <Link to="/support" className="text-emerald-400">
                    Support Center
                  </Link>
                </li>
                <li>
                  <Link to="/about">Our Story</Link>
                </li>
                <li>
                  <Link to="/privacy">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/terms">Terms of Service</Link>
                </li>
                <li>
                  <Link to="/compliance">Data Compliance</Link>
                </li>
              </ul>
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-white font-black uppercase tracking-widest text-[11px] mb-6 md:mb-10">
                Partner with Us
              </h4>
              <ul className="space-y-4 text-[14px] font-bold">
                <li>
                  <Link to="/partner-register" className="text-emerald-500">
                    Become a Partner
                  </Link>
                </li>
                <li>
                  <Link to="/partner-login">Partner Login</Link>
                </li>
                <li>
                  <Link to="/compliance">Verification Policy</Link>
                </li>
              </ul>
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-white font-black uppercase tracking-widest text-[11px] mb-6 md:mb-10">
                Community
              </h4>
              <ul className="space-y-4 text-[14px] font-bold text-white/60">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:contact@wayzza.live"
                    className="hover:text-white transition-colors"
                  >
                    Contact Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10 border-t border-white/5 text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40 flex flex-col sm:flex-row items-center justify-center gap-2">
              Made with <span className="text-rose-500 animate-pulse">❤️</span> in Varkala
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

export const WayzzaLayout = Layout;
