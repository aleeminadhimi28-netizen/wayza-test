import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { WayzzaLayout, WayzzaSkeleton } from '../../WayzzaUI.jsx';
import { useAuth } from '../../AuthContext.jsx';
import { useToast } from '../../ToastContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrency } from '../../CurrencyContext.jsx';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Star,
  Share2,
  Heart,
  MapPin,
  CheckCircle,
  Shield,
  Info,
  Wifi,
  Coffee,
  Wind,
  Tv,
  Utensils,
  Zap,
  Phone,
  Send,
  MessageSquare,
  ArrowRight,
  Grid3x3,
  Users,
  Calendar,
  Car,
  Bike,
  Anchor,
  Hotel,
  Clock,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import MapView from '../../components/MapView.jsx';
import SEO from '../../components/SEO.jsx';
import ListingConcierge from '../../components/ListingConcierge.jsx';
import NeighborhoodVibes from '../../components/NeighborhoodVibes.jsx';
import { api } from '../../utils/api.js';
import { AMENITY_CATEGORIES, getAmenityByLabel } from '../../utils/amenities.js';

const AMENITIES = []; // Legacy

function StarRow({ rating, size = 16, interactive = false, onSet, onHover }) {
  const [hov, setHov] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          onClick={() => interactive && onSet?.(i)}
          onMouseEnter={() => interactive && setHov(i)}
          onMouseLeave={() => interactive && setHov(0)}
          className={`transition-all ${i <= (hov || rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
            } ${interactive ? 'cursor-pointer hover:scale-110' : ''}`}
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
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const fixImg = (img) => {
    if (!img)
      return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
    if (img.startsWith('http')) return img;
    const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    if (img.startsWith('uploads/')) return `${BASE}/${img}`;
    return `${BASE}/uploads/${img}`;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    api.getListing(id).then((json) => setListing(json.data || json));
    loadReviews();
    const token = localStorage.getItem('token');
    if (token) {
      api.getWishlist().then((json) => {
        const list = Array.isArray(json.data) ? json.data : [];
        setSaved(list.some((x) => x.listingId === id));
      });
      api.getMyBookings().then((json) => {
        const bookings = Array.isArray(json.data) ? json.data : [];
        setCanReview(bookings.some((b) => b.listingId === id && b.status === 'paid'));
      });
    }
  }, [id]);

  async function loadReviews() {
    try {
      const data = await api.getReviews(id);
      const rows = Array.isArray(data.data) ? data.data : [];
      setReviews(rows);
      const token = localStorage.getItem('token');
      if (token && user?.email) setAlreadyReviewed(rows.some((r) => r.guestEmail === user.email));
    } catch { }
  }

  async function submitReview() {
    if (!rating) return;
    setSubmitting(true);
    try {
      const data = await api.postReview({ listingId: id, rating, comment });
      if (data.ok) {
        showToast('Review submitted. Thank you!', 'success');
        setComment('');
        setRating(5);
        setAlreadyReviewed(true);
        loadReviews();
      } else {
        showToast(data.message || 'Failed to submit review.', 'error');
      }
    } catch {
      showToast('Connection error. Please try again.', 'error');
    }
    setSubmitting(false);
  }

  const toggleWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { from: location } });
      return;
    }
    try {
      const data = await api.toggleWishlist({ listingId: id });
      setSaved(data.saved);
      showToast(data.saved ? 'Saved to favorites!' : 'Removed from favorites', 'info');
    } catch {
      showToast('Failed to update saved list.', 'error');
    }
  };

  const handleReserve = () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    navigate(`/booking/${id}`, { state: { variantIndex: selectedVariant } });
  };

  const [platformConfig, setPlatformConfig] = useState(null);

  useEffect(() => {
    api
      .getPlatformConfig()
      .then((res) => {
        if (res.ok) setPlatformConfig(res.data);
      })
      .catch(() => { });
  }, []);

  // Loading skeleton
  if (!listing)
    return (
      <WayzzaLayout noPadding>
        <div className="max-w-[1200px] mx-auto py-8 px-4 sm:px-6 space-y-6">
          <WayzzaSkeleton className="h-8 w-2/3" />
          <WayzzaSkeleton className="h-[420px] w-full rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <WayzzaSkeleton className="h-32 rounded-2xl" />
              <WayzzaSkeleton className="h-48 rounded-2xl" />
            </div>
            <WayzzaSkeleton className="h-[400px] rounded-2xl" />
          </div>
        </div>
      </WayzzaLayout>
    );

  const images = (listing.images || []).map(fixImg);
  if (images.length === 0) images.push(fixImg(listing.image));
  while (images.length < 5)
    images.push(
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
    );

  const next = () => setGalleryIndex((galleryIndex + 1) % images.length);
  const prev = () => setGalleryIndex((galleryIndex - 1 + images.length) % images.length);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '4.9';

  const activeVariant = listing.variants?.[selectedVariant];
  const basePrice = activeVariant?.price || listing.price || 0;
  const nights =
    checkIn && checkOut
      ? Math.max(0, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000))
      : 0;

  const isVehicle = listing.category === 'bike' || listing.category === 'car';
  const gstRate = platformConfig?.gstRate ?? 0.12;
  const serviceFeeRate = platformConfig?.serviceFee ?? 99;

  const gst = isVehicle ? 0 : Math.round(basePrice * nights * gstRate);
  const serviceFee = nights > 0 ? serviceFeeRate : 0;
  const total = basePrice * nights + gst + serviceFee;

  const today = new Date().toISOString().split('T')[0];

  return (
    <WayzzaLayout noPadding>
      <SEO
        title={listing.title}
        description={listing.description}
        image={images[0]}
        type="product"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: listing.title,
          description: listing.description,
          image: images.slice(0, 3),
          offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: basePrice,
            availability: 'https://schema.org/InStock',
            url: window.location.href,
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: avgRating,
            reviewCount: reviews.length,
          },
        }}
        breadcrumb={[
          { name: 'Home', url: 'https://wayza-app.vercel.app' },
          { name: listing.category === 'villa' ? 'Stays' : 'Vehicles', url: `https://wayza-app.vercel.app/listings?type=${listing.category}` },
          { name: listing.title, url: window.location.href },
        ]}
      />
      <div className="bg-white min-h-screen font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-24 lg:pb-0">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8 lg:py-16">
          {/* ─── BREADCRUMB ─── */}
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-8 lg:mb-10 overflow-x-auto no-scrollbar whitespace-nowrap">
            <button
              onClick={() => navigate('/')}
              className="hover:text-emerald-600 transition-colors"
            >
              Protocol
            </button>
            <ChevronRight size={10} />
            <button
              onClick={() => navigate('/listings')}
              className="hover:text-emerald-600 transition-colors"
            >
              Stays
            </button>
            <ChevronRight size={10} />
            <span className="text-slate-900 truncate max-w-[150px] md:max-w-[200px]">{listing.title}</span>
          </div>

          {/* ─── TITLE & ACTIONS ─── */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8 lg:gap-12 mb-12 lg:mb-16">
            <div className="space-y-4 lg:space-y-6 max-w-4xl">
              <div className="flex flex-wrap gap-2 lg:gap-4 items-center">
                <div className="px-2 lg:px-3 py-1 bg-slate-950 text-white text-[9px] lg:text-[10px] font-black uppercase tracking-[0.4em] rounded-md">
                  {listing.category || 'Estate'}
                </div>
                {listing.price > 8000 && (
                  <div className="flex items-center gap-2 text-amber-600 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.4em]">
                    <Sparkles size={12} /> Priority Asset
                  </div>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9] lg:leading-[0.8]">
                {listing.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-6 lg:gap-x-10 gap-y-4">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-emerald-50 flex items-center justify-center rounded-xl lg:rounded-2xl border border-emerald-100 font-black text-lg lg:text-xl text-emerald-600">
                    {avgRating}
                  </div>
                  <div>
                    <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-900">
                      Exceptional
                    </p>
                    <p className="text-[9px] lg:text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                      {reviews.length} Audits
                    </p>
                  </div>
                </div>
                <div className="h-8 lg:h-10 w-px bg-slate-100 hidden md:block" />
                {listing.latitude && listing.longitude ? (
                  <a
                    href={`https://www.google.com/maps?q=${listing.latitude},${listing.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 hover:bg-slate-50 p-1.5 -m-1.5 rounded-xl transition-colors"
                  >
                    <div className="w-9 h-9 lg:w-10 lg:h-10 bg-emerald-50 border border-emerald-100 flex items-center justify-center rounded-xl text-emerald-600 shadow-sm">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-900">
                        {listing.location || 'Kerala'}
                      </p>
                      <p className="text-[9px] lg:text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none mt-0.5 lg:mt-1 hover:underline">
                        Open Maps ↗
                      </p>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 lg:w-10 lg:h-10 bg-slate-50 flex items-center justify-center rounded-xl text-slate-400">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-900">
                        {listing.location || 'Kerala'}
                      </p>
                      <p className="text-[9px] lg:text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none mt-0.5 lg:mt-1">
                        Prime Location
                      </p>
                    </div>
                  </div>
                )}
                {listing.wifiSpeed > 0 && (
                  <>
                    <div className="h-8 lg:h-10 w-px bg-slate-100 hidden md:block" />
                    <div className="flex items-center gap-3 bg-emerald-50 px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl border border-emerald-100">
                      <Wifi size={14} className="text-emerald-600" />
                      <div>
                        <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-900">
                          Verified Wi-Fi
                        </p>
                        <p className="text-[9px] lg:text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                          {listing.wifiSpeed} MBPS
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 lg:gap-4 shrink-0 w-full lg:w-auto">
              <button
                onClick={toggleWishlist}
                className={`flex-1 lg:flex-none h-14 lg:h-16 px-6 lg:px-10 rounded-xl lg:rounded-2xl font-black uppercase text-[9px] lg:text-[10px] tracking-[0.4em] transition-all border flex items-center justify-center gap-3 lg:gap-4 ${saved ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-white border-slate-100 text-slate-900 hover:border-rose-200'}`}
              >
                <Heart size={18} className={saved ? 'fill-rose-600' : ''} />
                {saved ? 'Retained' : 'Archive'}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('Listing encrypted & shared.', 'success');
                }}
                className="w-14 h-14 lg:w-16 lg:h-16 bg-white border border-slate-100 rounded-xl lg:rounded-2xl flex items-center justify-center text-slate-900 hover:border-emerald-200 transition-all shadow-sm"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {/* ─── GALLERY GRID ─── */}
          <div className="lg:grid lg:grid-cols-[3fr_2fr] lg:grid-rows-2 gap-2 h-[350px] md:h-[480px] lg:h-[560px] rounded-2xl lg:rounded-3xl overflow-hidden relative mb-12 lg:mb-20">
            {/* Mobile View: Single image carousel simulation */}
            <div
              className="lg:row-span-2 relative h-full w-full overflow-hidden group cursor-pointer"
              onClick={() => {
                setGalleryIndex(0);
                setGalleryOpen(true);
              }}
            >
              <img
                src={images[0]}
                alt="Main"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Mobile photo count badge */}
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full lg:hidden">
                1 / {images.length}
              </div>
            </div>

            {/* Top thumbnail (desktop only) */}
            <div
              className="hidden lg:block relative overflow-hidden group cursor-pointer"
              onClick={() => {
                setGalleryIndex(1);
                setGalleryOpen(true);
              }}
            >
              <img
                src={images[1]}
                alt="Photo 2"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Bottom thumbnail + Show all button (desktop only) */}
            <div
              className="hidden lg:block relative overflow-hidden group cursor-pointer"
              onClick={() => {
                setGalleryIndex(2);
                setGalleryOpen(true);
              }}
            >
              <img
                src={images[2]}
                alt="Photo 3"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setGalleryIndex(0);
                  setGalleryOpen(true);
                }}
                className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-900 px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-950 hover:text-white transition-all shadow-md"
              >
                <Grid3x3 size={12} />
                Show all photos ({images.length})
              </button>
            </div>
          </div>

          {/* ─── MAIN CONTENT ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
            {/* LEFT: INFORMATION */}
            <div className="lg:col-span-7 space-y-20">
              {/* Narrative */}
              <section className="space-y-6 lg:space-y-8">
                <div className="flex items-center gap-4">
                  <span className="h-px w-8 lg:w-12 bg-emerald-500" />
                  <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.5em] text-emerald-600">
                    Project Narrative
                  </span>
                </div>
                <div className="flex items-center justify-between pb-6 lg:pb-8 border-b border-slate-100">
                  <div>
                    <h2 className="text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-3 lg:mb-4">
                      The Experience.
                    </h2>
                    <p className="text-slate-400 font-bold uppercase text-[8px] lg:text-[9px] tracking-widest">
                      Curated by Wayzza Network Architecture
                    </p>
                  </div>
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-slate-950 rounded-2xl lg:rounded-3xl flex items-center justify-center text-white font-black text-xl lg:text-2xl">
                    {listing.title?.charAt(0)}
                  </div>
                </div>
                <p className="text-xl lg:text-2xl text-slate-600 leading-relaxed font-medium">
                  "
                  {listing.description ||
                    'An extraordinary sanctuary where serene architecture meets the rhythm of the coast, designed for those who seek more than just a place to rest.'}
                  "
                </p>
              </section>

              {/* Neighborhood Discovery */}
              <NeighborhoodVibes location={listing.location} category={listing.category} />

              {/* Artifacts (Amenities) */}
              {listing.amenities && listing.amenities.length > 0 && (
                <section className="space-y-12">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="h-px w-12 bg-slate-200" />
                      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">
                        Available Utilities
                      </span>
                    </div>
                  </div>

                  <div className="space-y-16">
                    {AMENITY_CATEGORIES.map((category) => {
                      const presentInListing = category.amenities.filter((a) =>
                        listing.amenities.includes(a.label)
                      );
                      if (presentInListing.length === 0) return null;

                      return (
                        <div key={category.id} className="space-y-8">
                          <div className="space-y-1">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">
                              {category.label}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {category.description}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                            {presentInListing.map((a, i) => (
                              <div key={i} className="flex items-center gap-5 group">
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all duration-300">
                                  <a.icon size={20} />
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-xs font-black uppercase tracking-widest text-slate-900 block">
                                    {a.label}
                                  </span>
                                  {a.id === 'wifi' && listing.wifiSpeed > 0 && (
                                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">
                                      Verified {listing.wifiSpeed} Mbps
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Variants Detail */}
              {listing.variants?.length > 0 && (
                <section className="space-y-10">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">
                    Accomodation Options
                  </h2>
                  <div className="grid gap-6">
                    {listing.variants.map((v, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedVariant(i)}
                        className={`p-10 rounded-[40px] border-2 transition-all cursor-pointer flex flex-col md:flex-row justify-between items-center gap-8 ${selectedVariant === i ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'}`}
                      >
                        <div className="space-y-3">
                          <h3 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">
                            {v.name}
                          </h3>
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                            {v.desc || 'Executive level residency'}
                          </p>
                        </div>
                        <div className="text-center md:text-right">
                          <p className="text-4xl font-black text-slate-900 tracking-tighter">
                            ₹{v.price.toLocaleString()}
                          </p>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                            per cycle
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Audit (Reviews) */}
              <section className="space-y-12">
                <header className="flex items-center justify-between">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">
                    Guest Audit
                  </h2>
                  <div className="flex items-center gap-4">
                    <span className="text-5xl font-black text-slate-900 tabular-nums">
                      {avgRating}
                    </span>
                    <div className="h-10 w-px bg-slate-200" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      {reviews.length} Audits
                    </span>
                  </div>
                </header>

                <div className="grid gap-8">
                  {reviews.slice(0, 3).map((r, i) => (
                    <div
                      key={i}
                      className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-6"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black">
                            {(r.guestEmail || 'G').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-black uppercase tracking-widest text-slate-900">
                              {r.guestEmail?.split('@')[0]}
                            </p>
                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest leading-none mt-1">
                              Verified Stay
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={10}
                              className={
                                s <= r.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-slate-100 text-slate-100'
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-lg text-slate-600 leading-relaxed font-medium">
                        "
                        {r.comment ||
                          'An absolutely wonderful stay. Everything was exactly as described.'}
                        "
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* RIGHT: RESERVATION CONSOLE */}
            <div className="lg:col-span-5 relative">
              <div className="sticky top-32 space-y-6">
                {/* ── White Airbnb-style Booking Card ── */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-900/8">
                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-black text-slate-900 tracking-tight">
                      ₹{basePrice.toLocaleString()}
                    </span>
                    <span className="text-sm text-slate-400 font-medium">/ night</span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <span>
                      {avgRating} · {reviews.length} reviews · Exceptional
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 border border-slate-200 rounded-xl overflow-hidden mb-3">
                    <div className="p-3 border-r border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        Check-in
                      </label>
                      <input
                        type="date"
                        value={checkIn}
                        min={today}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full text-sm font-semibold text-slate-900 bg-transparent outline-none cursor-pointer"
                      />
                    </div>
                    <div className="p-3 hover:bg-slate-50 transition-colors cursor-pointer">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        Check-out
                      </label>
                      <input
                        type="date"
                        value={checkOut}
                        min={checkIn || today}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full text-sm font-semibold text-slate-900 bg-transparent outline-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div className="border border-slate-200 rounded-xl p-3 mb-5 hover:bg-slate-50 transition-colors cursor-pointer">
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      Guests
                    </label>
                    <span className="text-sm font-semibold text-slate-900">1 guest</span>
                  </div>

                  {/* Reserve Button */}
                  <button
                    onClick={handleReserve}
                    className="w-full py-4 bg-slate-950 hover:bg-slate-800 text-white font-black uppercase text-xs tracking-[0.3em] rounded-xl transition-all active:scale-[0.98] shadow-sm"
                  >
                    Reserve Now
                  </button>

                  {/* Price Breakdown */}
                  <div className="mt-5 space-y-3">
                    {nights > 0 ? (
                      <>
                        <div className="flex justify-between text-sm text-slate-600">
                          <span>
                            ₹{basePrice.toLocaleString()} × {nights} night{nights > 1 ? 's' : ''}
                          </span>
                          <span>₹{(basePrice * nights).toLocaleString()}</span>
                        </div>
                        {!isVehicle && gst > 0 && (
                          <div className="flex justify-between text-sm text-slate-600">
                            <span>GST ({Math.round(gstRate * 100)}%)</span>
                            <span>₹{gst.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm text-slate-600">
                          <span>Wayzza service fee</span>
                          <span>₹{serviceFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-black text-slate-900 pt-3 border-t border-slate-100 text-base">
                          <span>Total</span>
                          <span>₹{total.toLocaleString()}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-center text-xs text-slate-400 py-2">
                        Select dates to see pricing
                      </p>
                    )}
                  </div>

                  <p className="text-center text-xs text-slate-400 mt-3">
                    You won't be charged yet
                  </p>

                  {/* Trust Badges */}
                  <div className="flex justify-center gap-8 mt-5 pt-5 border-t border-slate-100">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Shield size={16} className="text-slate-500" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Secure</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
                        <CheckCircle size={16} className="text-emerald-500" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Verified</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
                        <CreditCard size={16} className="text-amber-500" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Razorpay</span>
                    </div>
                  </div>
                </div>

                {/* Direct Inquiries */}
                <div className="hidden lg:flex bg-slate-50 border border-slate-100 rounded-[32px] p-8 items-center gap-6 group hover:bg-white hover:shadow-xl transition-all duration-500">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                    <MessageSquare size={20} className="text-emerald-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black uppercase tracking-widest text-slate-900">
                      Direct Inquiries
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Connect with our Concierge
                    </p>
                  </div>
                  <ChevronRight size={16} className="ml-auto text-slate-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── MOBILE STICKY BOTTOM BAR ─── */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 z-[100] flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div>
            <p className="text-sm font-black text-slate-900">
              ₹{basePrice.toLocaleString()} <span className="text-slate-400 font-medium">/ night</span>
            </p>
            <button
              onClick={() => {
                const el = document.getElementById('reservation-console');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest"
            >
              {checkIn && checkOut ? `${nights} nights selected` : 'Select dates'}
            </button>
          </div>
          <button
            onClick={handleReserve}
            className="px-8 py-4 bg-slate-950 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl shadow-lg active:scale-95"
          >
            Reserve
          </button>
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
                  <p className="text-white/40 text-xs">
                    {galleryIndex + 1} / {images.length}
                  </p>
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
                <button
                  onClick={prev}
                  className="absolute left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-10"
                >
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
                <button
                  onClick={next}
                  className="absolute right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-10"
                >
                  <ChevronRight size={28} />
                </button>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 px-6 py-4 overflow-x-auto no-scrollbar border-t border-white/10">
                {images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setGalleryIndex(i)}
                    className={`w-20 h-14 rounded-lg overflow-hidden shrink-0 cursor-pointer border-2 transition-all ${i === galleryIndex ? 'border-emerald-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-75'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Intelligence Overlay */}
        <ListingConcierge listingId={listing._id} listingTitle={listing.title} />
      </div>
    </WayzzaLayout>
  );
}
