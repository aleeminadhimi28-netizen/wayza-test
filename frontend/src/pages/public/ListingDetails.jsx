import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { WayzaLayout, WayzaSkeleton } from "../../WayzaUI.jsx";
import { useAuth } from "../../AuthContext.jsx";
import { useToast } from "../../ToastContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, X, Star, Share2, Heart, MapPin,
  CheckCircle, Shield, Info, Wifi, Coffee, Wind, Tv,
  Utensils, Zap, Phone, Send, MessageSquare, ArrowRight,
  Grid3x3, Users, Calendar, Car, Bike, Anchor, Hotel,
  Clock, CreditCard, ChevronDown, ChevronUp
} from "lucide-react";
import MapView from "../../components/MapView.jsx";

import { api } from "../../utils/api.js";

const AMENITIES = [
  { icon: Wifi, label: "Free WiFi" },
  { icon: Coffee, label: "Breakfast included" },
  { icon: Wind, label: "Air conditioning" },
  { icon: Tv, label: "Flat-screen TV" },
  { icon: Utensils, label: "Kitchen access" },
  { icon: Shield, label: "24hr security" },
  { icon: Car, label: "Free parking" },
  { icon: Zap, label: "Power backup" },
];

function StarRow({ rating, size = 16, interactive = false, onSet, onHover }) {
  const [hov, setHov] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          onClick={() => interactive && onSet?.(i)}
          onMouseEnter={() => interactive && setHov(i)}
          onMouseLeave={() => interactive && setHov(0)}
          className={`transition-all ${i <= (hov || rating)
            ? "fill-amber-400 text-amber-400"
            : "fill-slate-200 text-slate-200"
            } ${interactive ? "cursor-pointer hover:scale-110" : ""}`}
        />
      ))}
    </div>
  );
}

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [listing, setListing] = useState(null);
  const [saved, setSaved] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const fixImg = (img) => {
    if (!img) return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";
    if (img.startsWith("http")) return img;
    const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
    if (img.startsWith("uploads/")) return `${BASE}/${img}`;
    return `${BASE}/uploads/${img}`;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    api.getListing(id)
      .then(json => setListing(json.data || json));
    loadReviews();
    const token = localStorage.getItem("token");
    if (token) {
      api.getWishlist()
        .then(json => {
          const list = Array.isArray(json.data) ? json.data : [];
          setSaved(list.some(x => x.listingId === id));
        });
      api.getMyBookings()
        .then(json => {
          const bookings = Array.isArray(json.data) ? json.data : [];
          setCanReview(bookings.some(b => b.listingId === id && b.status === "paid"));
        });
    }
  }, [id]);

  async function loadReviews() {
    try {
      const data = await api.getReviews(id);
      const rows = Array.isArray(data.data) ? data.data : [];
      setReviews(rows);
      const token = localStorage.getItem("token");
      if (token && user?.email) setAlreadyReviewed(rows.some(r => r.guestEmail === user.email));
    } catch { }
  }

  async function submitReview() {
    if (!rating) return;
    setSubmitting(true);
    try {
      const data = await api.postReview({ listingId: id, rating, comment });
      if (data.ok) {
        showToast("Review submitted. Thank you!", "success");
        setComment(""); setRating(5); setAlreadyReviewed(true); loadReviews();
      } else { showToast(data.message || "Failed to submit review.", "error"); }
    } catch { showToast("Connection error. Please try again.", "error"); }
    setSubmitting(false);
  }

  const toggleWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login", { state: { from: location } }); return; }
    try {
      const data = await api.toggleWishlist({ listingId: id });
      setSaved(data.saved);
      showToast(data.saved ? "Saved to favorites!" : "Removed from favorites", "info");
    } catch { showToast("Failed to update saved list.", "error"); }
  };

  const handleReserve = () => {
    if (!user) { navigate("/login", { state: { from: location } }); return; }
    navigate(`/booking/${id}`, { state: { variantIndex: selectedVariant } });
  };

  // Loading skeleton
  if (!listing) return (
    <WayzaLayout noPadding>
      <div className="max-w-[1200px] mx-auto py-8 px-4 sm:px-6 space-y-6">
        <WayzaSkeleton className="h-8 w-2/3" />
        <WayzaSkeleton className="h-[420px] w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <WayzaSkeleton className="h-32 rounded-2xl" />
            <WayzaSkeleton className="h-48 rounded-2xl" />
          </div>
          <WayzaSkeleton className="h-[400px] rounded-2xl" />
        </div>
      </div>
    </WayzaLayout>
  );

  let images = (listing.images || []).map(fixImg);
  if (images.length === 0) images.push(fixImg(listing.image));
  while (images.length < 5) images.push("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80");

  const next = () => setGalleryIndex((galleryIndex + 1) % images.length);
  const prev = () => setGalleryIndex((galleryIndex - 1 + images.length) % images.length);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : "4.9";

  const activeVariant = listing.variants?.[selectedVariant];
  const basePrice = activeVariant?.price || listing.price || 0;
  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000))
    : 0;
  const gst = Math.round(basePrice * nights * 0.12);
  const serviceFee = nights > 0 ? 199 : 0;
  const total = basePrice * nights + gst + serviceFee;

  const today = new Date().toISOString().split("T")[0];

  return (
    <WayzaLayout noPadding>
      <div className="bg-slate-50 min-h-screen font-sans selection:bg-emerald-100 selection:text-emerald-900">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">

          {/* ─── BREADCRUMB ─── */}
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
            <button onClick={() => navigate("/listings")} className="hover:text-emerald-600 transition-colors">Properties</button>
            <ChevronRight size={14} />
            <button onClick={() => navigate(`/listings?location=${encodeURIComponent(listing.location || "")}`)} className="hover:text-emerald-600 transition-colors">{listing.location || "Kerala"}</button>
            <ChevronRight size={14} />
            <span className="text-slate-600 font-medium truncate max-w-[200px]">{listing.title}</span>
          </div>

          {/* ─── TITLE ROW ─── */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">{listing.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {/* Rating */}
                <div className="flex items-center gap-1.5">
                  <StarRow rating={Math.round(parseFloat(avgRating))} size={15} />
                  <span className="font-bold text-slate-900">{avgRating}</span>
                  <span className="text-slate-400">({reviews.length} reviews)</span>
                </div>
                <span className="text-slate-300">·</span>
                {/* Location */}
                <div className="flex items-center gap-1 text-slate-500">
                  <MapPin size={14} className="text-emerald-500" />
                  {listing.location || "Kerala, India"}
                </div>
                {/* Verified */}
                {listing.approved && (
                  <>
                    <span className="text-slate-300">·</span>
                    <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle size={14} />
                      Verified by Wayza
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); showToast("Link copied!", "success"); }}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:border-emerald-500 hover:text-emerald-600 transition-all"
              >
                <Share2 size={16} />
                Share
              </button>
              <button
                onClick={toggleWishlist}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-semibold transition-all ${saved ? "border-rose-300 bg-rose-50 text-rose-600" : "border-slate-300 text-slate-700 hover:border-rose-300 hover:text-rose-500"}`}
              >
                <Heart size={16} className={saved ? "fill-rose-500" : ""} />
                {saved ? "Saved" : "Save"}
              </button>
            </div>
          </div>

          {/* ─── PHOTO GRID ─── */}
          <div className="relative mb-8 rounded-2xl overflow-hidden bg-slate-200 h-[380px] sm:h-[440px] grid grid-cols-4 grid-rows-2 gap-1.5 cursor-pointer">
            {/* Main large image */}
            <div className="col-span-2 row-span-2 overflow-hidden" onClick={() => { setGalleryIndex(0); setGalleryOpen(true); }}>
              <img src={images[0]} alt="Main" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            {/* 4 smaller images */}
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="overflow-hidden relative" onClick={() => { setGalleryIndex(i); setGalleryOpen(true); }}>
                <img src={images[i]} alt={`Photo ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                {i === 4 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">+{images.length - 4} more</span>
                  </div>
                )}
              </div>
            ))}
            {/* Show all photos button */}
            <button
              onClick={() => setGalleryOpen(true)}
              className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/95 backdrop-blur-sm text-slate-900 text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all border border-white/80"
            >
              <Grid3x3 size={16} />
              Show all photos
            </button>
          </div>

          {/* ─── MAIN LAYOUT ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* ══ LEFT COLUMN ══ */}
            <div className="lg:col-span-2 space-y-6">

              {/* Overview */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
                <div className="flex items-start justify-between pb-5 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {listing.category === "hotel" ? "Hotel" : listing.category === "bike" ? "Bike Rental" : listing.category === "car" ? "Car Rental" : "Experience"} in {listing.location || "Kerala"}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Hosted by Wayza Partner · Superhost</p>
                  </div>
                  <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {listing.title?.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Quick facts */}
                <div className="flex flex-wrap gap-6 py-2">
                  {[
                    { icon: Users, text: "Up to 4 guests" },
                    { icon: CheckCircle, text: "Free cancellation" },
                    { icon: Shield, text: "Verified property" },
                    { icon: Clock, text: "Check-in after 12 PM" },
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <f.icon size={18} className="text-emerald-600 shrink-0" />
                      {f.text}
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {listing.description || "An extraordinary sanctuary where serene architecture meets the rhythm of the coast, designed for those who seek more than just a place to rest. Every corner is thoughtfully crafted to offer comfort, beauty, and a true sense of place."}
                  </p>
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <h2 className="text-lg font-bold text-slate-900">What this place offers</h2>
                <div className="grid grid-cols-2 gap-3">
                  {(showAllAmenities ? AMENITIES : AMENITIES.slice(0, 6)).map((a, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-slate-700 py-1">
                      <a.icon size={18} className="text-emerald-600 shrink-0" />
                      {a.label}
                    </div>
                  ))}
                </div>
                {AMENITIES.length > 6 && (
                  <button
                    onClick={() => setShowAllAmenities(v => !v)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 border border-slate-300 px-4 py-2.5 rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-all mt-2"
                  >
                    {showAllAmenities ? <><ChevronUp size={16} /> Show less</> : <><ChevronDown size={16} /> Show all {AMENITIES.length} amenities</>}
                  </button>
                )}
              </div>

              {/* Room variants */}
              {listing.variants?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                  <h2 className="text-lg font-bold text-slate-900">Choose your room</h2>
                  <div className="space-y-3">
                    {listing.variants.map((v, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedVariant(i)}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedVariant === i ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-emerald-300"}`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedVariant === i ? "border-emerald-500 bg-emerald-500" : "border-slate-300"}`}>
                              {selectedVariant === i && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <span className="font-semibold text-slate-900">{v.name}</span>
                          </div>
                          {v.desc && <p className="text-sm text-slate-500 ml-7">{v.desc}</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xl font-bold text-slate-900">₹{v.price.toLocaleString()}</p>
                          <p className="text-xs text-slate-400">per night</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Map */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Location</h2>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                    <MapPin size={14} className="text-emerald-500" />
                    {listing.location || "Kerala, India"}
                  </p>
                </div>
                <div className="h-[280px] rounded-xl overflow-hidden border border-slate-200">
                  <MapView lat={listing?.latitude || 8.7379} lng={listing?.longitude || 76.7163} title={listing?.title} />
                </div>
              </div>

              {/* Reviews */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Guest reviews</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1.5 bg-emerald-600 text-white px-2.5 py-1 rounded-lg">
                        <span className="font-bold text-sm">{avgRating}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        {parseFloat(avgRating) >= 9 ? "Exceptional" : parseFloat(avgRating) >= 8 ? "Excellent" : "Very Good"}
                      </span>
                      <span className="text-sm text-slate-400">· {reviews.length} reviews</span>
                    </div>
                  </div>
                </div>

                {/* Review cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {reviews.slice(0, 4).map((r, i) => (
                    <motion.div
                      key={r._id || i}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-900 text-white text-sm font-bold flex items-center justify-center shrink-0">
                            {(r.guestEmail || "G").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm leading-tight">{r.guestEmail?.split("@")[0]}</p>
                            <p className="text-xs text-emerald-600 font-medium">Verified guest</p>
                          </div>
                        </div>
                        <StarRow rating={r.rating} size={13} />
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        "{r.comment || "An absolutely wonderful stay. Everything was exactly as described."}"
                      </p>
                      <p className="text-xs text-slate-400">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "Recent"}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {reviews.length === 0 && (
                  <div className="py-10 text-center border border-dashed border-slate-200 rounded-xl">
                    <MessageSquare size={32} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No reviews yet. Be the first to review after your stay!</p>
                  </div>
                )}

                {/* Write review */}
                {user && canReview && !alreadyReviewed && (
                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <h3 className="font-bold text-slate-900">Share your experience</h3>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-500">Your rating</p>
                      <StarRow rating={rating} size={28} interactive onSet={setRating} />
                    </div>
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Tell us about your stay..."
                      rows={4}
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 resize-none transition-all"
                    />
                    <button
                      onClick={submitReview}
                      disabled={submitting}
                      className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50"
                    >
                      {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
                      {submitting ? "Submitting..." : "Submit review"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ══ BOOKING WIDGET ══ */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 bg-white rounded-2xl border border-slate-200 shadow-xl p-6 space-y-5">

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">₹{basePrice.toLocaleString()}</span>
                  <span className="text-slate-400 text-sm">/ night</span>
                  {listing.variants?.length > 0 && (
                    <span className="text-xs text-emerald-600 font-semibold ml-auto">({activeVariant?.name || "Standard"})</span>
                  )}
                </div>

                {/* Rating summary */}
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                  <StarRow rating={Math.round(parseFloat(avgRating))} size={14} />
                  <span className="text-sm font-bold text-slate-900">{avgRating}</span>
                  <span className="text-xs text-slate-400">· {reviews.length} reviews</span>
                </div>


                {/* ── VARIANT SELECTOR (in booking widget) ── */}
                {listing.variants?.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Room / Option type</label>
                    <div className="space-y-2">
                      {listing.variants.map((v, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedVariant(i)}
                          className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 text-left transition-all ${selectedVariant === i
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-slate-200 hover:border-emerald-300 bg-white"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Radio dot */}
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selectedVariant === i ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
                              }`}>
                              {selectedVariant === i && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <div>
                              <p className={`text-sm font-bold ${selectedVariant === i ? "text-emerald-700" : "text-slate-900"}`}>{v.name}</p>
                              {v.desc && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{v.desc}</p>}
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <p className={`text-base font-bold ${selectedVariant === i ? "text-emerald-700" : "text-slate-900"}`}>
                              ₹{v.price.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-slate-400">/ night</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Date inputs */}
                <div className="border border-slate-300 rounded-xl overflow-hidden divide-y divide-slate-200">
                  <div className="grid grid-cols-2 divide-x divide-slate-200">
                    <div className="p-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Check-in</label>
                      <input
                        type="date"
                        min={today}
                        value={checkIn}
                        onChange={e => { setCheckIn(e.target.value); if (checkOut && e.target.value >= checkOut) setCheckOut(""); }}
                        className="w-full text-sm font-semibold text-slate-900 focus:outline-none bg-transparent"
                      />
                    </div>
                    <div className="p-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Check-out</label>
                      <input
                        type="date"
                        min={checkIn || today}
                        value={checkOut}
                        onChange={e => setCheckOut(e.target.value)}
                        className="w-full text-sm font-semibold text-slate-900 focus:outline-none bg-transparent"
                      />
                    </div>
                  </div>
                </div>


                {/* Price breakdown (when dates selected) */}
                {nights > 0 && (
                  <div className="space-y-2.5 py-3 border-y border-slate-100 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>₹{basePrice.toLocaleString()} × {nights} night{nights > 1 ? "s" : ""}</span>
                      <span className="font-semibold text-slate-900">₹{(basePrice * nights).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Taxes & GST (12%)</span>
                      <span className="font-semibold text-slate-900">₹{gst.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Service fee</span>
                      <span className="font-semibold text-slate-900">₹{serviceFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                      <span>Total</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Reserve button */}
                <button
                  onClick={handleReserve}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                >
                  <CreditCard size={18} />
                  {nights > 0 ? `Reserve · ₹${total.toLocaleString()}` : "Reserve"}
                </button>

                <p className="text-center text-xs text-slate-400">You won't be charged yet</p>

                {/* Info note */}
                <div className="flex gap-3 p-3.5 bg-amber-50 border border-amber-100 rounded-xl">
                  <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 leading-relaxed">
                    High demand in <strong>{listing.location}</strong>. Reserve now to secure this rate.
                  </p>
                </div>

                {/* Trust icons */}
                <div className="flex justify-around pt-2 border-t border-slate-100 text-xs text-slate-400">
                  <div className="flex flex-col items-center gap-1">
                    <Shield size={16} className="text-emerald-500" />
                    <span>Secure</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <CheckCircle size={16} className="text-emerald-500" />
                    <span>Verified</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Clock size={16} className="text-emerald-500" />
                    <span>Free cancel</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── FULLSCREEN GALLERY ─── */}
        <AnimatePresence>
          {galleryOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 z-[99999] flex flex-col"
            >
              {/* Gallery header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div>
                  <p className="text-white font-bold">{listing.title}</p>
                  <p className="text-white/40 text-xs">{galleryIndex + 1} / {images.length}</p>
                </div>
                <button
                  onClick={() => setGalleryOpen(false)}
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Main image */}
              <div className="flex-1 flex items-center justify-center relative px-16 py-4">
                <button onClick={prev} className="absolute left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-10">
                  <ChevronLeft size={28} />
                </button>
                <motion.img
                  key={galleryIndex}
                  src={images[galleryIndex]}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="max-h-full max-w-full object-contain rounded-xl"
                  alt={`Photo ${galleryIndex + 1}`}
                />
                <button onClick={next} className="absolute right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-10">
                  <ChevronRight size={28} />
                </button>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 px-6 py-4 overflow-x-auto no-scrollbar border-t border-white/10">
                {images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setGalleryIndex(i)}
                    className={`w-20 h-14 rounded-lg overflow-hidden shrink-0 cursor-pointer border-2 transition-all ${i === galleryIndex ? "border-emerald-500 opacity-100" : "border-transparent opacity-50 hover:opacity-75"}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </WayzaLayout>
  );
}
