import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { WayzzaLayout, WayzzaSkeleton } from '../../WayzzaUI.jsx';
import { useAuth } from '../../AuthContext.jsx';
import { useToast } from '../../ToastContext.jsx';
import { useCurrency } from '../../CurrencyContext.jsx';
import {
  ChevronRight,
  Star,
  Share2,
  Heart,
  MapPin,
  Wifi,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import SEO from '../../components/SEO.jsx';
import ListingConcierge from '../../components/ListingConcierge.jsx';
import NeighborhoodVibes from '../../components/NeighborhoodVibes.jsx';
import { api } from '../../utils/api.js';
import { fixImg } from '../../utils/image.js';
import { AMENITY_CATEGORIES } from '../../utils/amenities.js';
import ListingGallery from '../../components/listing/ListingGallery.jsx';
import ListingReviews from '../../components/listing/ListingReviews.jsx';
import BookingCard from '../../components/listing/BookingCard.jsx';

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
          className={`transition-all ${
            i <= (hov || rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
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

  useEffect(() => {
    window.scrollTo(0, 0);
    api.getListing(id).then((json) => setListing(json.data || json));
    loadReviews();
    if (user) {
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
      if (user?.email) setAlreadyReviewed(rows.some((r) => r.guestEmail === user.email));
    } catch {}
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
    if (!user) {
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
      .catch(() => {});
  }, []);

  // Loading skeleton
  if (!listing)
    return (
      <WayzzaLayout noPadding>
        <SEO title="Loading property..." />
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

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

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
  const canonicalUrl = `https://wayzza.live/listing/${id}`;

  return (
    <WayzzaLayout noPadding>
      <SEO
        title={listing.title}
        description={listing.description}
        image={images[0]}
        type="product"
        schema={{
          '@context': 'https://schema.org',
          '@type': listing.category === 'hotel' ? 'LodgingBusiness' : 'Vehicle',
          name: listing.title,
          description: listing.description,
          image: images.slice(0, 3),
          url: canonicalUrl,
          priceRange: `₹${basePrice.toLocaleString()}`,
          address: {
            '@type': 'PostalAddress',
            addressLocality: listing.location || 'Varkala',
            addressRegion: 'Kerala',
            addressCountry: 'IN',
          },
          brand: {
            '@type': 'Brand',
            name: 'Wayzza Verified',
          },
          sku: listing._id,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: basePrice,
            availability: 'https://schema.org/InStock',
            url: canonicalUrl,
            priceValidUntil: new Date(Date.now() + 2592000000).toISOString().split('T')[0], // 30 days from now
          },
          aggregateRating:
            reviews.length > 0
              ? {
                  '@type': 'AggregateRating',
                  ratingValue: avgRating,
                  reviewCount: reviews.length,
                }
              : undefined,
        }}
        breadcrumb={[
          { name: 'Home', url: 'https://wayzza.live' },
          {
            name: isVehicle ? 'Vehicles' : 'Stays',
            url: `https://wayzza.live/listings?category=${listing.category}`,
          },
          { name: listing.title, url: canonicalUrl },
        ]}
      />
      <div className="bg-white min-h-screen font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-24 lg:pb-0">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8 lg:py-16">
          {/* ─── BREADCRUMB ─── */}
          <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.4em] text-slate-300 mb-8 lg:mb-10 overflow-x-auto no-scrollbar whitespace-nowrap">
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
            <span className="text-slate-900 truncate max-w-[150px] md:max-w-[200px]">
              {listing.title}
            </span>
          </div>

          {/* ─── TITLE & ACTIONS ─── */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8 lg:gap-12 mb-12 lg:mb-16">
            <div className="space-y-4 lg:space-y-6 max-w-4xl">
              <div className="flex flex-wrap gap-2 lg:gap-4 items-center">
                <div className="px-2 lg:px-3 py-1 bg-slate-950 text-white text-[11px] lg:text-[11px] font-black uppercase tracking-[0.4em] rounded-md">
                  {listing.category || 'Estate'}
                </div>
                {listing.price > 8000 && (
                  <div className="flex items-center gap-2 text-amber-600 text-[11px] lg:text-[11px] font-black uppercase tracking-[0.4em]">
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
                    {avgRating || '—'}
                  </div>
                  <div>
                    <p className="text-[11px] lg:text-[11px] font-black uppercase tracking-widest text-slate-900">
                      {avgRating
                        ? avgRating >= 9
                          ? 'Exceptional'
                          : avgRating >= 8
                            ? 'Excellent'
                            : 'Great'
                        : 'New'}
                    </p>
                    <p className="text-[11px] lg:text-[11px] font-bold text-slate-300 uppercase tracking-widest">
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
                      <p className="text-[11px] lg:text-[11px] font-black uppercase tracking-widest text-slate-900">
                        {listing.location || 'Kerala'}
                      </p>
                      <p className="text-[11px] lg:text-[11px] font-bold text-emerald-600 uppercase tracking-widest leading-none mt-0.5 lg:mt-1 hover:underline">
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
                      <p className="text-[11px] lg:text-[11px] font-black uppercase tracking-widest text-slate-900">
                        {listing.location || 'Kerala'}
                      </p>
                      <p className="text-[11px] lg:text-[11px] font-bold text-emerald-600 uppercase tracking-widest leading-none mt-0.5 lg:mt-1">
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
                        <p className="text-[11px] lg:text-[11px] font-black uppercase tracking-widest text-slate-900">
                          Verified Wi-Fi
                        </p>
                        <p className="text-[11px] lg:text-[11px] font-black text-emerald-600 uppercase tracking-widest">
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
                className={`flex-1 lg:flex-none h-14 lg:h-16 px-6 lg:px-10 rounded-xl lg:rounded-2xl font-black uppercase text-[11px] lg:text-[11px] tracking-[0.4em] transition-all border flex items-center justify-center gap-3 lg:gap-4 ${saved ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-white border-slate-100 text-slate-900 hover:border-rose-200'}`}
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

          {/* GALLERY GRID */}
          <ListingGallery images={images} title={listing.title} priority />

          {/* ─── MAIN CONTENT ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
            {/* LEFT: INFORMATION */}
            <div className="lg:col-span-7 space-y-20">
              {/* Narrative */}
              <section className="space-y-6 lg:space-y-8">
                <div className="flex items-center gap-4">
                  <span className="h-px w-8 lg:w-12 bg-emerald-500" />
                  <span className="text-[11px] lg:text-[11px] font-black uppercase tracking-[0.5em] text-emerald-600">
                    Project Narrative
                  </span>
                </div>
                <div className="flex items-center justify-between pb-6 lg:pb-8 border-b border-slate-100">
                  <div>
                    <h2 className="text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-3 lg:mb-4">
                      The Experience.
                    </h2>
                    <p className="text-slate-400 font-bold uppercase text-[11px] lg:text-[11px] tracking-widest">
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
                      <span className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-300">
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
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
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
                                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">
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
                  <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-300">
                    Accommodation Options
                  </h2>
                  <div className="grid gap-6">
                    {listing.variants.map((v, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedVariant(i)}
                        className={`p-6 md:p-10 rounded-[32px] md:rounded-[40px] border-2 transition-all cursor-pointer flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 ${selectedVariant === i ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'}`}
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
                          <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">
                            per cycle
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Audit (Reviews) */}
              <ListingReviews reviews={reviews} avgRating={avgRating} />
            </div>

            {/* RIGHT: RESERVATION CONSOLE */}
            <div className="lg:col-span-5 relative">
              <div className="sticky top-32 space-y-6">
                {/* ─── White Airbnb-style Booking Card ─── */}
                <BookingCard
                  basePrice={basePrice}
                  avgRating={avgRating}
                  reviewsCount={reviews.length}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  setCheckIn={setCheckIn}
                  setCheckOut={setCheckOut}
                  today={today}
                  handleReserve={handleReserve}
                  nights={nights}
                  gst={gst}
                  gstRate={gstRate}
                  isVehicle={isVehicle}
                  serviceFee={serviceFee}
                  total={total}
                />

                {/* Direct Inquiries */}
                <div className="hidden lg:flex bg-slate-50 border border-slate-100 rounded-[32px] p-8 items-center gap-6 group hover:bg-white hover:shadow-xl transition-all duration-500">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                    <MessageSquare size={20} className="text-emerald-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black uppercase tracking-widest text-slate-900">
                      Direct Inquiries
                    </p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
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
              ₹{basePrice.toLocaleString()}{' '}
              <span className="text-slate-400 font-medium">/ night</span>
            </p>
            <button
              onClick={() => {
                const el = document.getElementById('reservation-console');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest"
            >
              {checkIn && checkOut ? `${nights} nights selected` : 'Select dates'}
            </button>
          </div>
          <button
            onClick={handleReserve}
            className="px-8 py-4 bg-slate-950 text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-xl shadow-lg active:scale-95"
          >
            Reserve
          </button>
        </div>

        {/* Intelligence Overlay */}
        <ListingConcierge listingId={listing._id} listingTitle={listing.title} />
      </div>
    </WayzzaLayout>
  );
}
