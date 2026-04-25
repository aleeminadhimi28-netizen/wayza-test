import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Heart,
  CalendarCheck,
  MapPin,
  LogOut,
  Loader2,
  CheckCircle,
  Mail,
  Phone,
  ArrowRight,
  Shield,
  ExternalLink,
  Camera,
  Settings,
  Compass,
  Star,
  Clock,
  XCircle,
} from 'lucide-react';
import { WayzzaLayout } from '../../WayzzaUI.jsx';
import { useAuth } from '../../AuthContext.jsx';
import { useToast } from '../../ToastContext.jsx';
import TwoFactorSetup from '../../components/TwoFactorSetup.jsx';

import { api } from '../../utils/api.js';

const STATUS_CONFIG = {
  paid: {
    label: 'Confirmed',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    icon: CheckCircle,
  },
  pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: Clock },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-rose-50 text-rose-600 border-rose-100',
    icon: XCircle,
  },
};

export default function Profile() {
  const { user, token, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const realToken = token || localStorage.getItem('token');

  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'account');
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [picture, setPicture] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [is2FASetupOpen, setIs2FASetupOpen] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [disabling2FA, setDisabling2FA] = useState(false);
  const [disableToken, setDisableToken] = useState('');

  useEffect(() => {
    if (location.state?.activeTab) setActiveTab(location.state.activeTab);
  }, [location.state]);

  useEffect(() => {
    if (!realToken) {
      navigate('/login');
      return;
    }
    async function loadProfile() {
      setLoading(true);
      try {
        const d = await api.getProfile();
        if (d.ok) {
          setName(d.data.name || '');
          setPhone(d.data.phone || '');
          setEmail(d.data.email || '');
          setPicture(d.data.picture || '');
          setTwoFactorEnabled(!!d.data.twoFactorEnabled);
        }
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [realToken, navigate]);

  useEffect(() => {
    if (!realToken) return;
    async function loadTabData() {
      try {
        if (activeTab === 'bookings') {
          const d = await api.getMyBookings();
          setBookings(Array.isArray(d.data) ? d.data : []);
        } else if (activeTab === 'wishlist') {
          const d = await api.getWishlist();
          const saved = Array.isArray(d.data) ? d.data : [];
          const detailed = await Promise.all(
            saved.map(async (s) => {
              const listing = await api.getListing(s.listingId);
              return listing?.data ? { ...listing.data, savedId: s._id } : null;
            })
          );
          setWishlist(detailed.filter(Boolean));
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadTabData();
  }, [activeTab, realToken]);

  async function saveProfile() {
    setSaving(true);
    try {
      const data = await api.updateProfile({ name, phone, picture });
      if (data.ok) showToast('Profile updated successfully.', 'success');
      else showToast('Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function cancelBooking(id) {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      const data = await api.cancelBooking({ bookingId: id });
      if (data.ok) {
        showToast('Reservation cancelled.', 'success');
        setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status: 'cancelled' } : b)));
      } else showToast(data.message, 'error');
    } catch {
      showToast('Connection error. Please try again.', 'error');
    }
  }

  async function toggleWishlist(listingId) {
    try {
      await api.toggleWishlist({ listingId });
      setWishlist((w) => w.filter((item) => item._id !== listingId));
      showToast('Removed from your saved properties.', 'success');
    } catch {
      showToast('Failed to update saved list.', 'error');
    }
  }

  async function handleDisable2FA() {
    if (disableToken.length !== 6) return;
    setDisabling2FA(true);
    try {
      const res = await api.disable2FA(disableToken);
      if (res.ok) {
        showToast('Two-factor authentication disabled.', 'success');
        setTwoFactorEnabled(false);
        setDisableToken('');
      } else {
        showToast(res.message || 'Invalid code', 'error');
      }
    } catch {
      showToast('Server error.', 'error');
    } finally {
      setDisabling2FA(false);
    }
  }

  function fixProfileImage(img) {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return img.startsWith('/') ? `${base}${img}` : `${base}/${img}`;
  }

  async function handleAvatarUpload(file) {
    if (!file) return;
    setUploadingPicture(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const result = await api.uploadImage(form);
      if (result.ok && result.filename) {
        setPicture(result.filename);
        showToast('Profile photo uploaded. Save changes to keep it.', 'success');
      } else {
        showToast(result.message || 'Photo upload failed.', 'error');
      }
    } catch (err) {
      showToast('Could not upload profile photo.', 'error');
    } finally {
      setUploadingPicture(false);
    }
  }

  if (loading)
    return (
      <WayzzaLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      </WayzzaLayout>
    );

  const TABS = [
    { id: 'account', label: 'My Account', icon: User },
    { id: 'bookings', label: 'My Bookings', icon: CalendarCheck },
    { id: 'wishlist', label: 'Saved', icon: Heart },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const displayName = name?.split(' ')[0] || email?.split('@')[0] || 'Guest';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <WayzzaLayout noPadding>
      <div className="bg-slate-50 min-h-screen font-sans">
        {/* ─── PROFILE HEADER ─── */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-6 py-8 md:py-12 flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <label className="cursor-pointer">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl md:text-3xl font-bold shadow-lg overflow-hidden relative">
                  {picture ? (
                    <img
                      src={fixProfileImage(picture)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                    {uploadingPicture ? (
                      <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <Camera
                        size={18}
                        className="text-white opacity-0 group-hover:opacity-100 transition-all"
                      />
                    )}
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
                />
              </label>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-lg shadow-md border-2 border-white">
                <CheckCircle size={10} />
              </div>
            </div>

            {/* Info */}
            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <span className="text-[10px] md:text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
                  <CheckCircle size={10} /> Verified Guest
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                Welcome back, <span className="text-emerald-600">{displayName}</span>
              </h1>
              <p className="text-slate-400 text-xs md:text-sm mt-1">{email}</p>
            </div>

            {/* Sign out */}
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="w-full sm:w-auto h-10 px-5 border border-slate-200 text-slate-500 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all shrink-0"
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>

        {/* ─── MAIN LAYOUT ─── */}
        <div className="max-w-6xl mx-auto px-6 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* SIDEBAR NAV */}
          <aside className="lg:col-span-3 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                    activeTab === tab.id
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Security card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                <Shield size={14} className="text-emerald-500" /> Account Security
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your account is protected with end-to-end encryption and secure authentication.
              </p>
            </div>
          </aside>

          {/* CONTENT AREA */}
          <main className="lg:col-span-9">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <AnimatePresence mode="wait">
                {/* ── ACCOUNT TAB ── */}
                {activeTab === 'account' && (
                  <motion.div
                    key="account"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-5 md:p-8 space-y-6 md:space-y-8"
                  >
                    <div className="border-b border-slate-100 pb-5 md:pb-6">
                      <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] md:text-xs uppercase tracking-wide mb-1">
                        <Settings size={13} /> Account Settings
                      </div>
                      <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">Personal Information</h2>
                      <p className="text-xs md:text-sm text-slate-400 mt-1">
                        Update your name and contact details.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 block">
                          Full Name
                        </label>
                        <div className="relative">
                          <User
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={15}
                          />
                          <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            className="h-11 w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 block">
                          Email Address
                        </label>
                        <div className="relative opacity-60">
                          <Mail
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={15}
                          />
                          <input
                            value={email}
                            disabled
                            className="h-11 w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-4 text-sm font-medium text-slate-500 cursor-not-allowed"
                          />
                        </div>
                        <p className="text-xs text-slate-400">Email cannot be changed.</p>
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-semibold text-slate-700 block">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={15}
                          />
                          <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="h-11 w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                      <button
                        onClick={saveProfile}
                        disabled={saving}
                        className="h-11 px-8 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-2 active:scale-95"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── BOOKINGS TAB ── */}
                {activeTab === 'bookings' && (
                  <motion.div
                    key="bookings"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-5 md:p-8 space-y-6"
                  >
                    <div className="border-b border-slate-100 pb-5 md:pb-6">
                      <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] md:text-xs uppercase tracking-wide mb-1">
                        <CalendarCheck size={13} /> Booking History
                      </div>
                      <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">My Stays</h2>
                      <p className="text-xs md:text-sm text-slate-400 mt-1">
                        Your past, present, and upcoming reservations.
                      </p>
                    </div>

                    {bookings.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                          <Compass size={28} />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900">No bookings yet</h4>
                        <p className="text-sm text-slate-500 max-w-xs">
                          You haven't booked any stays yet. Find your next adventure!
                        </p>
                        <button
                          onClick={() => navigate('/listings')}
                          className="h-10 px-6 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-colors mt-2"
                        >
                          Explore Stays
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {bookings.map((b) => {
                          const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                          const SIcon = cfg.icon;
                          return (
                            <div
                              key={b._id}
                              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-slate-50 border border-slate-200 rounded-xl hover:border-emerald-200 hover:bg-white hover:shadow-md transition-all gap-4"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 text-emerald-600 flex items-center justify-center font-bold text-base shadow-sm">
                                  {(b.title || 'W').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-900 text-sm">{b.title}</h4>
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    {b.checkIn} → {b.checkOut}
                                  </p>
                                  {b.variantName && (
                                    <p className="text-xs text-emerald-600 font-medium mt-0.5">
                                      {b.variantName}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 sm:ml-auto">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${cfg.color}`}
                                >
                                  <SIcon size={11} />
                                  {cfg.label}
                                </span>
                                <span className="text-sm font-bold text-slate-900">
                                  ₹{(b.totalPrice || 0).toLocaleString()}
                                </span>
                                <button
                                  onClick={() => navigate(`/listing/${b.listingId}`)}
                                  className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center shadow-sm"
                                >
                                  <ExternalLink size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── WISHLIST TAB ── */}
                {activeTab === 'wishlist' && (
                  <motion.div
                    key="wishlist"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-5 md:p-8 space-y-6"
                  >
                    <div className="border-b border-slate-100 pb-5 md:pb-6">
                      <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] md:text-xs uppercase tracking-wide mb-1">
                        <Heart size={13} /> Saved Stays
                      </div>
                      <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">My Favourites</h2>
                      <p className="text-xs md:text-sm text-slate-400 mt-1">
                        Properties you've saved to revisit later.
                      </p>
                    </div>

                    {wishlist.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                          <Heart size={28} />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900">No saved stays</h4>
                        <p className="text-sm text-slate-500 max-w-xs">
                          Tap the heart icon on any listing to save it here.
                        </p>
                        <button
                          onClick={() => navigate('/listings')}
                          className="h-10 px-6 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-colors mt-2"
                        >
                          Discover Stays
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {wishlist.map((l) => {
                          const img = l.image?.startsWith('http')
                            ? l.image
                            : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${l.image}`;
                          const price =
                            l.variants?.length > 0
                              ? Math.min(...l.variants.map((v) => v.price || 0))
                              : l.price || 0;
                          return (
                            <div
                              key={l._id}
                              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all"
                            >
                              <div
                                className="relative h-44 overflow-hidden cursor-pointer"
                                onClick={() => navigate(`/listing/${l._id}`)}
                              >
                                <img
                                  src={
                                    img ||
                                    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
                                  }
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                  alt={l.title}
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleWishlist(l._id);
                                  }}
                                  className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full text-rose-500 flex items-center justify-center shadow-md hover:bg-rose-500 hover:text-white transition-all"
                                >
                                  <Heart size={15} className="fill-current" />
                                </button>
                              </div>
                              <div className="p-4 space-y-1">
                                <div className="flex items-center gap-1">
                                  <Star size={11} className="text-amber-400 fill-amber-400" />
                                  <span className="text-xs font-semibold text-slate-500">
                                    Top Rated
                                  </span>
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm truncate">
                                  {l.title}
                                </h3>
                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                  <MapPin size={11} className="text-emerald-500 shrink-0" />
                                  {l.location}
                                </p>
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                  <div>
                                    <span className="text-base font-bold text-slate-900">
                                      {price > 0
                                        ? `₹${price.toLocaleString()}`
                                        : 'Price on request'}
                                    </span>
                                    {price > 0 && (
                                      <span className="text-xs text-slate-400">/night</span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => navigate(`/listing/${l._id}`)}
                                    className="h-8 px-3 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600 transition-colors flex items-center gap-1"
                                  >
                                    View <ArrowRight size={12} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── SECURITY TAB ── */}
                {activeTab === 'security' && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-5 md:p-8 space-y-6 md:space-y-8"
                  >
                    <div className="border-b border-slate-100 pb-5 md:pb-6">
                      <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] md:text-xs uppercase tracking-wide mb-1">
                        <Shield size={13} /> Security Protocols
                      </div>
                      <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">Account Protection</h2>
                      <p className="text-xs md:text-sm text-slate-400 mt-1">
                        Manage secondary authentication layers for your identity.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div
                        className={`p-6 rounded-3xl border-2 transition-all ${twoFactorEnabled ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 bg-slate-50/50'}`}
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-14 h-14 rounded-2xl flex items-center justify-center ${twoFactorEnabled ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white text-slate-400 border border-slate-200'}`}
                            >
                              <Smartphone size={24} />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 uppercase tracking-tight">
                                Authenticator App (TOTP)
                              </h3>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Use Google Authenticator, Authy, or similar apps.
                              </p>
                            </div>
                          </div>

                          {twoFactorEnabled ? (
                            <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                              Active
                            </span>
                          ) : (
                            <button
                              onClick={() => setIs2FASetupOpen(true)}
                              className="h-10 px-6 bg-slate-900 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                            >
                              Activate 2FA
                            </button>
                          )}
                        </div>

                        {twoFactorEnabled && (
                          <div className="mt-8 pt-8 border-t border-emerald-100/50 space-y-4">
                            <div className="flex items-start gap-3 text-emerald-700 bg-emerald-100/30 p-4 rounded-2xl">
                              <AlertCircle size={16} className="shrink-0 mt-0.5" />
                              <p className="text-[11px] font-semibold leading-relaxed uppercase tracking-wide">
                                2FA is active. To disable it, enter the code from your app below.
                              </p>
                            </div>
                            <div className="flex gap-3">
                              <input
                                type="text"
                                maxLength={6}
                                placeholder="6-digit code"
                                value={disableToken}
                                onChange={(e) => setDisableToken(e.target.value.replace(/\D/g, ''))}
                                className="h-12 w-32 bg-white border border-emerald-100 rounded-xl text-center font-bold tracking-[0.2em] text-emerald-900 focus:border-emerald-500 outline-none transition-all"
                              />
                              <button
                                onClick={handleDisable2FA}
                                disabled={disabling2FA || disableToken.length !== 6}
                                className="h-12 px-6 bg-rose-500 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-rose-600 transition-all disabled:opacity-20 shadow-lg shadow-rose-500/10"
                              >
                                {disabling2FA ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  'Disable 2FA'
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <TwoFactorSetup
              isOpen={is2FASetupOpen}
              onClose={() => setIs2FASetupOpen(false)}
              onComplete={() => setTwoFactorEnabled(true)}
            />
          </main>
        </div>
      </div>
    </WayzzaLayout>
  );
}
