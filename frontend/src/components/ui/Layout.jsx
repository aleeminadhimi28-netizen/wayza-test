import React, { useState, useRef, useEffect } from 'react'; // eslint-disable-line no-unused-vars
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from './PageTransition.jsx';
import { Bell, X, Moon, Sun, Sparkles, Globe } from 'lucide-react';
import { api } from '../../utils/api.js';
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
    const int = setInterval(fetchNotifs, 10000);
    return () => clearInterval(int);
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
  const headerBg =
    scrolled || !isHomePage || mobileMenuOpen
      ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-100'
      : 'bg-transparent';
  const textColor = scrolled || !isHomePage || mobileMenuOpen ? 'text-slate-900' : 'text-white';
  const subTextColor =
    scrolled || !isHomePage || mobileMenuOpen ? 'text-slate-500' : 'text-white/60';

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 py-4 ${headerBg}`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          <Link
            to="/"
            className={`text-2xl md:text-3xl font-bold transition-all duration-500 tracking-tight uppercase ${textColor}`}
          >
            Wayzza<span className="text-emerald-500">.</span>
          </Link>
          <div
            className={`hidden lg:flex gap-10 font-bold uppercase tracking-widest text-[10px] ${subTextColor}`}
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.to}
                className={`hover:text-emerald-500 transition-colors relative group flex items-center gap-1.5 ${link.icon ? 'text-emerald-500 font-extrabold' : ''}`}
              >
                {link.icon && <link.icon size={12} />}
                {link.name}
                <span
                  className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-1 bg-emerald-500 rounded-full transition-all duration-300 group-hover:w-full`}
                />
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            {/* CURRENCY SELECTOR */}
            <div className="relative" ref={currRef}>
              <button
                onClick={() => setShowCurr(!showCurr)}
                className={`h-10 px-3 md:h-11 md:px-4 rounded-xl md:rounded-2xl flex items-center gap-2 transition-all font-bold text-[9px] md:text-[10px] uppercase tracking-widest ${scrolled || !isHomePage || mobileMenuOpen ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                <Globe size={13} className="text-emerald-500" />
                <span className="hidden xs:inline">{currency.code}</span>
                <span className="xs:hidden">{currency.symbol}</span>
              </button>
              <AnimatePresence>
                {showCurr && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 p-2"
                  >
                    <div className="px-4 py-3 border-b border-slate-50 mb-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
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
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-colors ${currency.code === c.code ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50 text-slate-600'}`}
                      >
                        <span className="font-bold text-xs">{c.label}</span>
                        <span className="font-bold text-[10px] text-slate-400">
                          {c.symbol} {c.code}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* THEME TOGGLE */}
            <button
              onClick={toggleTheme}
              className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all ${scrolled || !isHomePage || mobileMenuOpen ? (isDarkMode ? 'bg-indigo-50 text-indigo-500 hover:bg-indigo-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100') : 'bg-white/10 text-white hover:bg-white/20'}`}
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {!user ? (
              <div className="hidden sm:flex items-center gap-8">
                <Link
                  to="/login"
                  className={`font-bold text-[10px] tracking-widest uppercase ${scrolled ? 'text-slate-900' : 'text-white'}`}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-bold text-[10px] tracking-widest uppercase"
                >
                  Join Now
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {/* NOTIFICATION BELL */}
                <div className="relative">
                  <button
                    onClick={openNotifs}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-colors relative ${scrolled || !isHomePage || mobileMenuOpen ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    <Bell size={18} />
                    {notifs.filter((n) => !n.read).length > 0 && (
                      <span className="absolute top-2 right-2 md:top-2.5 md:right-3 w-2 h-2 md:w-2.5 md:h-2.5 bg-emerald-500 rounded-full animate-pulse border-2 border-slate-900" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifs && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-6 w-80 bg-white rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden z-50 flex flex-col max-h-[400px]"
                      >
                        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
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
                                className={`p-4 rounded-2xl mb-2 flex flex-col gap-1.5 text-sm ${n.read ? 'bg-white text-slate-500 border border-slate-50' : 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-100/50'}`}
                              >
                                <span className="leading-snug">{n.message}</span>
                                <span className="text-[9px] uppercase tracking-widest opacity-40">
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

                <div ref={boxRef} className="relative">
                  <button
                    onClick={() => setOpen(!open)}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xl hover:bg-emerald-600 transition-all active:scale-95 group overflow-hidden border border-white/10"
                  >
                    {user.email.charAt(0).toUpperCase()}
                  </button>
                  <AnimatePresence>
                    {open && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        className="absolute right-0 mt-6 w-72 bg-white rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-slate-100 z-50 overflow-hidden"
                      >
                        <div className="p-8 border-b border-slate-50 bg-slate-50/50 text-slate-900 uppercase">
                          <p className="text-[9px] font-bold text-emerald-600 tracking-widest">
                            Signed in as
                          </p>
                          <p className="text-lg font-bold truncate mt-1">
                            {user.email.split('@')[0]}
                          </p>
                          <p className="text-[10px] font-medium text-slate-400 mt-0.5 truncate lowercase">
                            {user.email}
                          </p>
                        </div>
                        <div className="p-2 space-y-1">
                          {user.role === 'partner' && (
                            <Link
                              to="/partner"
                              onClick={() => setOpen(false)}
                              className="flex items-center px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 rounded-2xl"
                            >
                              Provider Dashboard
                            </Link>
                          )}
                          {user.role === 'admin' && (
                            <Link
                              to="/admin"
                              onClick={() => setOpen(false)}
                              className="flex items-center px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 rounded-2xl"
                            >
                              Admin Dashboard
                            </Link>
                          )}
                          <Link
                            to="/my-bookings"
                            onClick={() => setOpen(false)}
                            className="flex items-center px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-900 hover:bg-slate-50 rounded-2xl"
                          >
                            My Bookings
                          </Link>
                          <Link
                            to="/profile"
                            onClick={() => setOpen(false)}
                            className="flex items-center px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-900 hover:bg-slate-50 rounded-2xl"
                          >
                            Account Profile
                          </Link>
                          <button
                            onClick={() => {
                              logout();
                              setOpen(false);
                              navigate('/');
                            }}
                            className="w-full text-center py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white bg-slate-900 hover:bg-rose-500 transition-all"
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
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-xl transition-all ${scrolled ? 'bg-slate-100 text-slate-900' : 'bg-white/10 text-white'}`}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* MOBILE MENU PANEL */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[110] bg-white lg:hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-bold tracking-tight uppercase text-slate-900"
                >
                  Wayzza<span className="text-emerald-500">.</span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
                    Explorer Menu
                  </p>
                  <div className="grid gap-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between p-6 rounded-[24px] font-black text-xl uppercase tracking-tighter transition-all active:scale-95 ${link.icon ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-900 border border-slate-100'}`}
                      >
                        <div className="flex items-center gap-4">
                          {link.icon && <link.icon size={20} />}
                          {link.name}
                        </div>
                        <ArrowRight size={20} className="opacity-30" />
                      </Link>
                    ))}
                  </div>
                </div>

                {!user ? (
                  <div className="space-y-4 pt-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
                      Account Protocol
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="h-20 bg-slate-950 text-white rounded-[24px] flex flex-col items-center justify-center gap-1 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/20"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="h-20 bg-emerald-500 text-slate-950 rounded-[24px] flex flex-col items-center justify-center gap-1 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20"
                      >
                        Join Now
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
                      Your Profile
                    </p>
                    <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black text-xl">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-lg font-black text-slate-900 leading-none truncate w-40">
                            {user.email.split('@')[0]}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                            Verified Member
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          to="/profile"
                          onClick={() => setMobileMenuOpen(false)}
                          className="py-4 bg-white border border-slate-200 rounded-xl text-center text-[10px] font-black uppercase tracking-widest"
                        >
                          Account
                        </Link>
                        <Link
                          to="/my-bookings"
                          onClick={() => setMobileMenuOpen(false)}
                          className="py-4 bg-white border border-slate-200 rounded-xl text-center text-[10px] font-black uppercase tracking-widest"
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
                        className="w-full py-5 bg-slate-950 text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.3em]"
                      >
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-8 border-t border-slate-100 bg-slate-50 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">
                  Wayzza Network v2.0
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <PageTransition>
        <main
          className={`${!isHomePage && !noPadding ? 'pt-24' : 'pt-0'} transition-all duration-500`}
        >
          {children}
        </main>
      </PageTransition>

      {!hideFooter && (
        <footer className="bg-slate-950 text-white/40">
          <div className="max-w-7xl mx-auto px-8 py-16 md:py-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-20">
            <div className="space-y-6 md:space-y-10 text-center md:text-left">
              <Link to="/" className="text-3xl md:text-4xl font-black tracking-tight uppercase text-white">
                Wayzza<span className="text-emerald-500">.</span>
              </Link>
              <p className="text-base md:text-lg font-medium leading-relaxed text-white/30 max-w-xs mx-auto md:mx-0">
                &ldquo;Connecting travelers with extraordinary stays.&rdquo;
              </p>
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-6 md:mb-10">
                Resources
              </h4>
              <ul className="space-y-4 md:space-y-5 text-[14px] md:text-[15px] font-bold">
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
              </ul>
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-6 md:mb-10">
                Partner with Us
              </h4>
              <ul className="space-y-4 md:space-y-5 text-[14px] md:text-[15px] font-bold">
                <li>
                  <Link to="/partner-register" className="text-emerald-500">
                    Become a Partner
                  </Link>
                </li>
                <li>
                  <Link to="/partner-login">Partner Login</Link>
                </li>
                <li>
                  <Link to="/about">Verification Policy</Link>
                </li>
              </ul>
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-6 md:mb-10">
                Community
              </h4>
              <ul className="space-y-4 md:space-y-5 text-[14px] md:text-[15px] font-bold text-white/60">
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
          <div className="max-w-7xl mx-auto px-8 py-10 md:py-16 border-t border-white/5 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 flex flex-col md:flex-row items-center justify-center gap-2">
              Made with <span className="text-rose-500 animate-pulse text-lg">❤️</span> in Varkala
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

export const WayzzaLayout = Layout;
