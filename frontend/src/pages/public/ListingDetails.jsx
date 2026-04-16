import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { WayzaLayout, WayzaSkeleton } from "../../WayzaUI.jsx";
import { useAuth } from "../../AuthContext.jsx";
import { useToast } from "../../ToastContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "../../CurrencyContext.jsx";
import {
  ChevronLeft, ChevronRight, X, Star, Share2, Heart, MapPin,
  CheckCircle, Shield, Info, Wifi, Coffee, Wind, Tv,
  Utensils, Zap, Phone, Send, MessageSquare, ArrowRight,
  Grid3x3, Users, Calendar, Car, Bike, Anchor, Hotel,
  Clock, CreditCard, ChevronDown, ChevronUp, Sparkles, ShieldCheck
} from "lucide-react";
import MapView from "../../components/MapView.jsx";
import SEO from "../../components/SEO.jsx";
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
  const { formatPrice } = useCurrency();

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
  
  const [platformConfig, setPlatformConfig] = useState(null);

  useEffect(() => {
     api.getPlatformConfig().then(res => { if (res.ok) setPlatformConfig(res.data); }).catch(() => {});
  }, []);

  const isVehicle = listing.category === "bike" || listing.category === "car";
  const gstRate = platformConfig?.gstRate ?? 0.12;
  const serviceFeeRate = platformConfig?.serviceFee ?? 99;

  const gst = isVehicle ? 0 : Math.round(basePrice * nights * gstRate);
  const serviceFee = nights > 0 ? serviceFeeRate : 0;
  const total = basePrice * nights + gst + serviceFee;

  const today = new Date().toISOString().split("T")[0];

  return (
    <WayzaLayout noPadding>
      <SEO 
        title={listing.title} 
        description={listing.description} 
        image={images[0]}
        type="product" 
      />
      <div className="bg-white min-h-screen font-sans selection:bg-emerald-100 selection:text-emerald-900">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-10 md:py-16">

          {/* ─── BREADCRUMB ─── */}
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-10 overflow-x-auto no-scrollbar whitespace-nowrap">
            <button onClick={() => navigate("/")} className="hover:text-emerald-600 transition-colors">Protocol</button>
            <ChevronRight size={10} />
            <button onClick={() => navigate("/listings")} className="hover:text-emerald-600 transition-colors">Stays</button>
            <ChevronRight size={10} />
            <span className="text-slate-900 truncate max-w-[200px]">{listing.title}</span>
          </div>

          {/* ─── TITLE & ACTIONS ─── */}
          <div className="flex flex-col xl:flex-row justify-between items-start gap-12 mb-16">
            <div className="space-y-6 max-w-4xl">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="px-3 py-1 bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-md">
                  {listing.category || "Estate"}
                </div>
                {listing.price > 8000 && (
                  <div className="flex items-center gap-2 text-amber-600 text-[10px] font-black uppercase tracking-[0.4em] italic">
                    <Sparkles size={12} /> Priority Asset
                  </div>
                )}
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter uppercase leading-[0.8] font-serif italic">
                {listing.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 content-center text-center rounded-2xl border border-emerald-100 italic font-black text-xl text-emerald-600 font-serif">
                    {avgRating}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Exceptional</p>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{reviews.length} Audited Reviews</p>
                  </div>
                </div>
                <div className="h-10 w-px bg-slate-100 hidden md:block" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 flex items-center justify-center rounded-xl text-slate-400">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">{listing.location || "Kerala, India"}</p>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest italic leading-none mt-1">Prime Location</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 w-full xl:w-auto">
              <button
                onClick={toggleWishlist}
                className={`flex-1 xl:flex-none h-16 px-10 rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] transition-all border flex items-center justify-center gap-4 ${saved ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-white border-slate-100 text-slate-900 hover:border-rose-200"}`}
              >
                <Heart size={18} className={saved ? "fill-rose-600" : ""} />
                {saved ? "Retained" : "Archive"}
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); showToast("Listing encrypted & shared.", "success"); }}
                className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-900 hover:border-emerald-200 transition-all shadow-sm"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {/* ─── GALLERY ─── */}
          <div className="relative mb-20 rounded-[40px] overflow-hidden bg-slate-50 h-[400px] md:h-[650px] group cursor-pointer border border-slate-100" onClick={() => setGalleryOpen(true)}>
            <img src={images[0]} alt="Hero" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="absolute bottom-10 right-10 flex items-center gap-4">
              <div className="bg-white/80 backdrop-blur-xl border border-white/20 px-6 py-4 rounded-3xl flex items-center gap-4 shadow-2xl">
                <Grid3x3 size={20} className="text-slate-900" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900">Catalog ({images.length} frames)</span>
              </div>
            </div>
          </div>

          {/* ─── MAIN CONTENT ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">

            {/* LEFT: INFORMATION */}
            <div className="lg:col-span-7 space-y-20">

              {/* Narrative */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <span className="h-px w-12 bg-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-600 italic">Project Narrative</span>
                </div>
                <div className="flex items-center justify-between pb-8 border-b border-slate-100">
                  <div>
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none italic font-serif mb-4">The Experience.</h2>
                    <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest italic">Curated by Wayza Network Architecture</p>
                  </div>
                  <div className="w-16 h-16 bg-slate-950 rounded-3xl flex items-center justify-center text-white italic font-black text-2xl font-serif">
                    {listing.title?.charAt(0)}
                  </div>
                </div>
                <p className="text-2xl text-slate-600 leading-relaxed font-medium italic">
                  "{listing.description || "An extraordinary sanctuary where serene architecture meets the rhythm of the coast, designed for those who seek more than just a place to rest. Every corner is thoughtfully crafted to offer comfort, beauty, and a true sense of place."}"
                </p>
              </section>

              {/* Artifacts (Amenities) */}
              <section className="space-y-12 bg-slate-50/50 p-12 rounded-[48px] border border-slate-100">
                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">Available Utilities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-10">
                  {AMENITIES.map((a, i) => (
                    <div key={i} className="flex flex-col gap-4 group">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <a.icon size={20} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-slate-900">{a.label}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Variants Detail */}
              {listing.variants?.length > 0 && (
                <section className="space-y-10">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">Accomodation Options</h2>
                  <div className="grid gap-6">
                    {listing.variants.map((v, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedVariant(i)}
                        className={`p-10 rounded-[40px] border-2 transition-all cursor-pointer flex flex-col md:flex-row justify-between items-center gap-8 ${selectedVariant === i ? "border-emerald-500 bg-emerald-50/30" : "border-slate-100 hover:border-emerald-200"}`}
                      >
                        <div className="space-y-3">
                          <h3 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic font-serif">{v.name}</h3>
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{v.desc || "Executive level residency"}</p>
                        </div>
                        <div className="text-center md:text-right">
                          <p className="text-4xl font-black text-slate-900 tracking-tighter">₹{v.price.toLocaleString()}</p>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">per cycle</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Audit (Reviews) */}
              <section className="space-y-12">
                <header className="flex items-center justify-between">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">Guest Audit</h2>
                  <div className="flex items-center gap-4">
                    <span className="text-5xl font-black text-slate-900 tabular-nums">{avgRating}</span>
                    <div className="h-10 w-px bg-slate-200" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{reviews.length} Audits</span>
                  </div>
                </header>

                <div className="grid gap-8">
                  {reviews.slice(0, 3).map((r, i) => (
                    <div key={i} className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black">{(r.guestEmail || "G").charAt(0).toUpperCase()}</div>
                          <div>
                            <p className="text-sm font-black uppercase tracking-widest text-slate-900">{r.guestEmail?.split("@")[0]}</p>
                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest italic leading-none mt-1">Verified Stay</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} className={s <= r.rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-100"} />)}
                        </div>
                      </div>
                      <p className="text-lg text-slate-600 italic leading-relaxed font-medium">"{r.comment || "An absolutely wonderful stay. Everything was exactly as described."}"</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* RIGHT: RESERVATION CONSOLE */}
            <div className="lg:col-span-5 relative">
              <div className="sticky top-32 space-y-8">
                <div className="bg-slate-950 rounded-[48px] p-12 text-white shadow-3xl shadow-slate-900/40 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

                  <div className="relative z-10 space-y-10">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-400 mb-2">Access Rate</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-6xl font-black tracking-tighter font-serif italic">₹{basePrice.toLocaleString()}</span>
                          <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">/ Slot</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-emerald-500 font-serif italic">{avgRating}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Protocol Score</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-2">Check-in</label>
                            <input
                              type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                              className="w-full bg-transparent border-b border-white/10 py-2 font-bold text-sm outline-none focus:border-emerald-500 transition-colors"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-2">Check-out</label>
                            <input
                              type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                              className="w-full bg-transparent border-b border-white/10 py-2 font-bold text-sm outline-none focus:border-emerald-500 transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                      {nights > 0 && (
                        <div className="space-y-3">
                          <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/60">
                            <span>Residency x {nights}</span>
                            <span>₹{(basePrice * nights).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs font-black uppercase tracking-widest text-emerald-400 pt-3 border-t border-white/10">
                            <span>Final Commitment</span>
                            <span className="text-2xl tracking-tighter font-serif italic">₹{total.toLocaleString()}</span>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleReserve}
                        className="w-full h-20 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase text-xs tracking-[0.5em] rounded-[28px] transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-4"
                      >
                        <span>Initialize Reservation</span>
                        <ArrowRight size={18} />
                      </button>
                    </div>

                    <div className="flex flex-col items-center gap-4 pt-4">
                      <div className="flex items-center gap-3 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                        <ShieldCheck size={14} className="text-emerald-500" /> Secure Encryption Protocol
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 flex items-center gap-6 group hover:bg-white hover:shadow-xl transition-all duration-500">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                    <MessageSquare size={20} className="text-emerald-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black uppercase tracking-widest text-slate-900">Direct Inquiries</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connect with our Concierge</p>
                  </div>
                  <ChevronRight size={16} className="ml-auto text-slate-300" />
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
