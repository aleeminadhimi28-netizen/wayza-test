import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Heart, CalendarCheck, MapPin, LogOut, Loader2,
  CheckCircle, Mail, Phone, ArrowRight, Shield,
  ExternalLink, Camera, Settings, Compass, Star, Clock, XCircle
} from "lucide-react";
import { WayzaLayout } from "../../WayzaUI.jsx";
import { useAuth } from "../../AuthContext.jsx";
import { useToast } from "../../ToastContext.jsx";

import { api } from "../../utils/api.js";

const STATUS_CONFIG = {
  paid: { label: "Confirmed", color: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: CheckCircle },
  pending: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-100", icon: Clock },
  cancelled: { label: "Cancelled", color: "bg-rose-50 text-rose-600 border-rose-100", icon: XCircle },
};

export default function Profile() {
  const { user, token, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const realToken = token || localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "account");
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (location.state?.activeTab) setActiveTab(location.state.activeTab);
  }, [location.state]);

  useEffect(() => {
    if (!realToken) { navigate("/login"); return; }
    async function loadProfile() {
      setLoading(true);
      try {
        const d = await api.getProfile();
        if (d.ok) { setName(d.data.name || ""); setPhone(d.data.phone || ""); setEmail(d.data.email || ""); }
      } finally { setLoading(false); }
    }
    loadProfile();
  }, [realToken, navigate]);

  useEffect(() => {
    if (!realToken) return;
    async function loadTabData() {
      try {
        if (activeTab === "bookings") {
          const d = await api.getMyBookings();
          setBookings(Array.isArray(d.data) ? d.data : []);
        } else if (activeTab === "wishlist") {
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
      } catch (err) { console.error(err); }
    }
    loadTabData();
  }, [activeTab, realToken]);

  async function saveProfile() {
    setSaving(true);
    try {
      const data = await api.updateProfile({ name, phone });
      if (data.ok) showToast("Profile updated successfully.", "success");
      else showToast("Failed to update profile.", "error");
    } finally { setSaving(false); }
  }

  async function cancelBooking(id) {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return;
    try {
      const data = await api.cancelBooking({ bookingId: id });
      if (data.ok) {
        showToast("Reservation cancelled.", "success");
        setBookings(prev => prev.map(b => b._id === id ? { ...b, status: "cancelled" } : b));
      } else showToast(data.message, "error");
    } catch { showToast("Connection error. Please try again.", "error"); }
  }

  async function toggleWishlist(listingId) {
    try {
      await api.toggleWishlist({ listingId });
      setWishlist(w => w.filter(item => item._id !== listingId));
      showToast("Removed from your saved properties.", "success");
    } catch { showToast("Failed to update saved list.", "error"); }
  }

  if (loading) return (
    <WayzaLayout>
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    </WayzaLayout>
  );

  const TABS = [
    { id: "account", label: "My Account", icon: User },
    { id: "bookings", label: "My Bookings", icon: CalendarCheck },
    { id: "wishlist", label: "Saved", icon: Heart },
  ];

  const displayName = name?.split(" ")[0] || email?.split("@")[0] || "Guest";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <WayzaLayout noPadding>
      <div className="bg-slate-50 min-h-screen font-sans">

        {/* ─── PROFILE HEADER ─── */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg overflow-hidden relative">
                {initials}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center cursor-pointer">
                  <Camera size={20} className="text-white opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white p-1.5 rounded-lg shadow-md border-2 border-white">
                <CheckCircle size={12} />
              </div>
            </div>

            {/* Info */}
            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
                  <CheckCircle size={11} /> Verified Guest
                </span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome back, <span className="text-emerald-600">{displayName}</span>
              </h1>
              <p className="text-slate-500 text-sm mt-1">{email}</p>
            </div>

            {/* Sign out */}
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="h-10 px-5 border border-slate-200 text-slate-500 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all shrink-0"
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>

        {/* ─── MAIN LAYOUT ─── */}
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* SIDEBAR NAV */}
          <aside className="lg:col-span-3 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
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
                {activeTab === "account" && (
                  <motion.div key="account" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-8 space-y-8">
                    <div className="border-b border-slate-100 pb-6">
                      <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide mb-1">
                        <Settings size={13} /> Account Settings
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900">Personal Information</h2>
                      <p className="text-sm text-slate-500 mt-1">Update your name and contact details.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 block">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                          <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Enter your full name"
                            className="h-11 w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 block">Email Address</label>
                        <div className="relative opacity-60">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                          <input
                            value={email}
                            disabled
                            className="h-11 w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-4 text-sm font-medium text-slate-500 cursor-not-allowed"
                          />
                        </div>
                        <p className="text-xs text-slate-400">Email cannot be changed.</p>
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-semibold text-slate-700 block">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                          <input
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
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
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── BOOKINGS TAB ── */}
                {activeTab === "bookings" && (
                  <motion.div key="bookings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-8 space-y-6">
                    <div className="border-b border-slate-100 pb-6">
                      <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide mb-1">
                        <CalendarCheck size={13} /> Booking History
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900">My Stays</h2>
                      <p className="text-sm text-slate-500 mt-1">Your past, present, and upcoming reservations.</p>
                    </div>

                    {bookings.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                          <Compass size={28} />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900">No bookings yet</h4>
                        <p className="text-sm text-slate-500 max-w-xs">You haven't booked any stays yet. Find your next adventure!</p>
                        <button
                          onClick={() => navigate("/listings")}
                          className="h-10 px-6 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-colors mt-2"
                        >
                          Explore Stays
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {bookings.map(b => {
                          const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                          const SIcon = cfg.icon;
                          return (
                            <div key={b._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-slate-50 border border-slate-200 rounded-xl hover:border-emerald-200 hover:bg-white hover:shadow-md transition-all gap-4">
                              <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 text-emerald-600 flex items-center justify-center font-bold text-base shadow-sm">
                                  {(b.title || "W").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-900 text-sm">{b.title}</h4>
                                  <p className="text-xs text-slate-400 mt-0.5">{b.checkIn} → {b.checkOut}</p>
                                  {b.variantName && <p className="text-xs text-emerald-600 font-medium mt-0.5">{b.variantName}</p>}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 sm:ml-auto">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${cfg.color}`}>
                                  <SIcon size={11} />{cfg.label}
                                </span>
                                <span className="text-sm font-bold text-slate-900">₹{(b.totalPrice || 0).toLocaleString()}</span>
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
                {activeTab === "wishlist" && (
                  <motion.div key="wishlist" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-8 space-y-6">
                    <div className="border-b border-slate-100 pb-6">
                      <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide mb-1">
                        <Heart size={13} /> Saved Stays
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900">My Favourites</h2>
                      <p className="text-sm text-slate-500 mt-1">Properties you've saved to revisit later.</p>
                    </div>

                    {wishlist.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                          <Heart size={28} />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900">No saved stays</h4>
                        <p className="text-sm text-slate-500 max-w-xs">Tap the heart icon on any listing to save it here.</p>
                        <button
                          onClick={() => navigate("/listings")}
                          className="h-10 px-6 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-colors mt-2"
                        >
                          Discover Stays
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {wishlist.map(l => {
                          const img = l.image?.startsWith("http") ? l.image : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/uploads/${l.image}`;
                          const price = l.variants?.length > 0
                            ? Math.min(...l.variants.map(v => v.price || 0))
                            : l.price || 0;
                          return (
                            <div key={l._id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all">
                              <div className="relative h-44 overflow-hidden cursor-pointer" onClick={() => navigate(`/listing/${l._id}`)}>
                                <img
                                  src={img || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80"}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                  alt={l.title}
                                />
                                <button
                                  onClick={e => { e.stopPropagation(); toggleWishlist(l._id); }}
                                  className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full text-rose-500 flex items-center justify-center shadow-md hover:bg-rose-500 hover:text-white transition-all"
                                >
                                  <Heart size={15} className="fill-current" />
                                </button>
                              </div>
                              <div className="p-4 space-y-1">
                                <div className="flex items-center gap-1">
                                  <Star size={11} className="text-amber-400 fill-amber-400" />
                                  <span className="text-xs font-semibold text-slate-500">Top Rated</span>
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm truncate">{l.title}</h3>
                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                  <MapPin size={11} className="text-emerald-500 shrink-0" />{l.location}
                                </p>
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                  <div>
                                    <span className="text-base font-bold text-slate-900">
                                      {price > 0 ? `₹${price.toLocaleString()}` : "Price on request"}
                                    </span>
                                    {price > 0 && <span className="text-xs text-slate-400">/night</span>}
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

              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </WayzaLayout>
  );
}
