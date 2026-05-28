import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
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
  CheckCircle,
  Shield,
  Calendar,
  Car,
  Bike,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import SEO from '../../components/SEO.jsx';
import ListingConcierge from '../../components/ListingConcierge.jsx';
import NeighborhoodVibes from '../../components/NeighborhoodVibes.jsx';
import { api } from '../../utils/api.js';
import { fixImg } from '../../utils/image.js';
import { AMENITY_CATEGORIES, ALL_AMENITIES } from '../../utils/amenities.js';
import ListingGallery from '../../components/listing/ListingGallery.jsx';
import ListingReviews from '../../components/listing/ListingReviews.jsx';
import BookingCard from '../../components/listing/BookingCard.jsx';
import VehicleListingPage from '../../components/listing/VehicleListingPage.jsx';

function getDatesInRange(startStr, endStr) {
  if (!startStr || !endStr) return [];
  const dates = [];
  const start = new Date(startStr);
  const end = new Date(endStr);
  const current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const target = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (current < target) {
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function calculatePriceForDates(listing, variantIndex, checkIn, checkOut) {
  const variant = listing?.variants?.[variantIndex];
  const basePrice = variant?.price || listing?.price || 0;
  if (!checkIn || !checkOut) return { pricePerNight: basePrice, baseAmount: 0 };
  const dates = getDatesInRange(checkIn, checkOut);
  if (dates.length === 0) return { pricePerNight: basePrice, baseAmount: 0 };
  const variantRules = Array.isArray(variant?.priceRules) ? variant.priceRules : [];
  let totalBaseAmount = 0;
  for (const dateStr of dates) {
    const matchedRule = variantRules.find((r) => r.date === dateStr);
    totalBaseAmount += matchedRule ? Number(matchedRule.price) : basePrice;
  }
  return { pricePerNight: totalBaseAmount / dates.length, baseAmount: totalBaseAmount };
}

function StarRow({ rating, size = 16, interactive = false, onSet }) {
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
  const { formatPrice: _formatPrice } = useCurrency();

  const [listing, setListing] = useState(null);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [platformConfig, setPlatformConfig] = useState(null);
  const [reserving, setReserving] = useState(false);

  const loadReviews = useCallback(async () => {
    if (!id) return;
    try {
      const data = await api.getReviews(id);
      const rows = Array.isArray(data.data) ? data.data : [];
      setReviews(rows);
      if (user?.email) setAlreadyReviewed(rows.some((r) => r.guestEmail === user.email));
    } catch {
      /* fail silently */
    }
  }, [id, user?.email]);

  async function submitReview() {
    if (!rating || !id) return;
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

  const handleReserve = async () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setReserving(true);
    try {
      const fresh = await api.getListing(id);
      if (fresh.ok && fresh.data) {
        const freshVariant = fresh.data.variants?.[selectedVariant];
        const freshPrice = Number(freshVariant?.price || fresh.data.price || 0);
        if (freshPrice !== variantBasePrice) {
          setListing(fresh.data);
          showToast(
            `Price updated to ₹${freshPrice.toLocaleString()}/${isVehicle ? 'day' : 'night'}. Please review before reserving.`,
            'error'
          );
          setReserving(false);
          return;
        }
      }
    } catch {
      /* non-critical */
    }
    const checkInParam = checkIn ? `&checkIn=${checkIn}` : '';
    const checkOutParam = checkOut ? `&checkOut=${checkOut}` : '';
    navigate(`/booking/${id}?variant=${selectedVariant}${checkInParam}${checkOutParam}`, {
      state: { variantIndex: selectedVariant, expectedPricePerNight: basePrice },
    });
    setReserving(false);
  };

  const handleMobileReserve = () => {
    if (!checkIn || !checkOut) {
      showToast(
        `Please select your ${isVehicle ? 'pick-up and drop-off' : 'check-in and check-out'} dates first`,
        'error'
      );
      document.getElementById('reservation-console')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    handleReserve();
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!id) return;
    api
      .getListing(id)
      .then((json) => {
        if (json.ok && json.data) {
          setListing(json.data);
          // Fire-and-forget: increment view count for real trending data
          api.trackView(id).catch(() => {});
        } else setError(json.message || 'Property not found');
      })
      .catch(() => setError('Connection anomaly detected'));
    loadReviews();
    if (user) {
      api.getWishlist().then((json) => {
        const list = Array.isArray(json.data) ? json.data : [];
        setSaved(list.some((x) => x.listingId === id));
      });
      api.getMyBookings().then((json) => {
        const bkgs = Array.isArray(json.data) ? json.data : [];
        const today = new Date();
        setCanReview(
          bkgs.some(
            (b) =>
              b.listingId === id &&
              ['paid', 'arrived', 'departed'].includes(b.status) &&
              new Date(b.checkOut || b.endDate) < today
          )
        );
      });
    }
  }, [id, user, loadReviews]);

  useEffect(() => {
    api
      .getPlatformConfig()
      .then((res) => {
        if (res.ok) setPlatformConfig(res.data);
      })
      .catch(() => {});
  }, []);

  if (error) {
    return (
      <WayzzaLayout noPadding>
        <SEO
          title="Listing Not Found"
          description="This listing could not be found. Browse all available luxury stays and rentals in Varkala on Wayzza."
          noindex={true}
          url="https://wayzza.live/listings"
        />
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-400 mb-6">
            <AlertCircle size={36} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-3">Listing not found</h1>
          <p className="text-slate-500 text-sm font-medium mb-8 max-w-sm">{error}</p>
          <button
            onClick={() => navigate('/listings')}
            className="h-12 px-8 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-all flex items-center gap-2"
          >
            Browse Listings <ArrowRight size={16} />
          </button>
        </div>
      </WayzzaLayout>
    );
  }

  if (!listing) {
    return (
      <WayzzaLayout noPadding>
        <SEO title="Loading..." />
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
  }

  // ── Derived values ──────────────────────────────────────────────────
  const images = (listing.images || []).map(fixImg);
  if (images.length === 0) images.push(fixImg(listing.image));

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  const activeVariant = listing.variants?.[selectedVariant];
  const variantBasePrice = activeVariant?.price || listing.price || 0;
  const { pricePerNight, baseAmount } = calculatePriceForDates(
    listing,
    selectedVariant,
    checkIn,
    checkOut
  );
  const basePrice = pricePerNight;

  const isVehicle = listing.category === 'bike' || listing.category === 'car';
  const isBike = listing.category === 'bike';
  const isCar = listing.category === 'car';

  const nights =
    checkIn && checkOut
      ? Math.max(0, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000))
      : 0;

  const getCategoryPluralLabel = () => {
    if (isVehicle) return 'Vehicles';
    if (listing.category === 'experience') return 'Experiences';
    return 'Stays';
  };
  const getCategoryTerm = () => {
    if (isBike) return 'ride';
    if (isCar) return 'vehicle';
    if (listing.category === 'experience') return 'experience';
    return 'stay';
  };
  const getCategoryNewLabel = () => {
    if (isBike) return 'New Bike';
    if (isCar) return 'New Car';
    if (listing.category === 'experience') return 'New Experience';
    return 'New Stay';
  };

  const gstRate = platformConfig?.gstRate ?? 0.12;
  const serviceFeeRate = platformConfig?.serviceFee ?? 99;
  const gst =
    !isVehicle && listing.ownerGstEnabled
      ? Math.round((nights > 0 ? baseAmount : basePrice * nights) * gstRate)
      : 0;
  const serviceFee = nights > 0 ? serviceFeeRate : 0;
  const total = (nights > 0 ? baseAmount : basePrice * nights) + gst + serviceFee;

  const today = new Date().toISOString().split('T')[0];
  const canonicalUrl = `https://wayzza.live/listing/${id}`;

  const vehicleIcon = isBike ? <Bike size={14} /> : <Car size={14} />;
  const categoryColor = isVehicle ? 'emerald' : 'emerald';

  // ── SEO Schema: category-aware for rich results eligibility ──────────────────
  const priceValidUntil = new Date(Date.now() + 2592000000).toISOString().split('T')[0];
  const amenityFeatureList = (listing.amenities || []).slice(0, 12).map((a) => ({
    '@type': 'LocationFeatureSpecification',
    name: a,
    value: true,
  }));

  let seoSchema;
  if (listing.category === 'hotel') {
    seoSchema = {
      '@context': 'https://schema.org',
      '@type': 'BedAndBreakfast',
      '@id': `${canonicalUrl}#accommodation`,
      name: listing.title,
      description:
        listing.description ||
        'A verified luxury clifftop villa in Varkala, Kerala. Curated and managed by Wayzza.',
      image: images.slice(0, 5),
      url: canonicalUrl,
      telephone: '+91 80892 22444',
      email: 'stay@wayzza.live',
      checkinTime: '14:00',
      checkoutTime: '11:00',
      starRating: { '@type': 'Rating', ratingValue: '4' },
      priceRange: `₹${basePrice.toLocaleString('en-IN')}`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: listing.location || 'Varkala',
        addressRegion: 'Kerala',
        postalCode: '695141',
        addressCountry: 'IN',
      },
      geo:
        listing.latitude && listing.longitude
          ? { '@type': 'GeoCoordinates', latitude: listing.latitude, longitude: listing.longitude }
          : { '@type': 'GeoCoordinates', latitude: 8.7379, longitude: 76.7163 },
      brand: { '@type': 'Brand', name: 'Wayzza Verified' },
      amenityFeature: amenityFeatureList,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: basePrice,
        availability: 'https://schema.org/InStock',
        url: canonicalUrl,
        priceValidUntil,
        description: 'Per night rate. Service fee and applicable taxes added at checkout.',
      },
      aggregateRating:
        reviews.length > 0
          ? {
              '@type': 'AggregateRating',
              ratingValue: avgRating,
              reviewCount: reviews.length,
              bestRating: '5',
              worstRating: '1',
            }
          : undefined,
    };
  } else if (isBike) {
    seoSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${canonicalUrl}#product`,
      name: listing.title,
      description:
        listing.description ||
        'Royal Enfield motorcycle available for daily rental in Varkala, Kerala. Helmet, insurance, and roadside assistance included.',
      image: images.slice(0, 3),
      sku: listing._id,
      brand: {
        '@type': 'Brand',
        name: listing.vehicleType?.toLowerCase().includes('enfield')
          ? 'Royal Enfield'
          : 'Wayzza Bikes',
      },
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'Vehicle Type',
          value: listing.vehicleType || 'Motorcycle',
        },
        {
          '@type': 'PropertyValue',
          name: 'Rental Location',
          value: listing.location || 'Varkala, Kerala',
        },
        { '@type': 'PropertyValue', name: 'Helmet Included', value: 'Yes' },
        { '@type': 'PropertyValue', name: 'Insurance Included', value: 'Comprehensive' },
        { '@type': 'PropertyValue', name: 'Minimum Rider Age', value: '21 years' },
      ],
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: basePrice,
        availability: 'https://schema.org/InStock',
        url: canonicalUrl,
        priceValidUntil,
        seller: { '@type': 'Organization', name: 'Wayzza', url: 'https://wayzza.live' },
        description: 'Per day (24 hours) inclusive of helmet and comprehensive insurance.',
      },
      aggregateRating:
        reviews.length > 0
          ? {
              '@type': 'AggregateRating',
              ratingValue: avgRating,
              reviewCount: reviews.length,
              bestRating: '5',
              worstRating: '1',
            }
          : undefined,
    };
  } else if (isCar) {
    seoSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${canonicalUrl}#product`,
      name: listing.title,
      description:
        listing.description ||
        'Premium car available for chauffeur-driven or self-drive rental in Varkala, Kerala. Airport transfers from Trivandrum (TRV) available.',
      image: images.slice(0, 3),
      sku: listing._id,
      brand: { '@type': 'Brand', name: listing.vehicleType || 'Wayzza Cars' },
      additionalProperty: [
        { '@type': 'PropertyValue', name: 'Vehicle Type', value: listing.vehicleType || 'Car' },
        {
          '@type': 'PropertyValue',
          name: 'Rental Location',
          value: listing.location || 'Varkala, Kerala',
        },
        {
          '@type': 'PropertyValue',
          name: 'Airport Transfer',
          value: 'Available from Trivandrum (TRV)',
        },
        { '@type': 'PropertyValue', name: 'Chauffeur Option', value: 'Available' },
      ],
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: basePrice,
        availability: 'https://schema.org/InStock',
        url: canonicalUrl,
        priceValidUntil,
        seller: { '@type': 'Organization', name: 'Wayzza', url: 'https://wayzza.live' },
        description: 'Per day rate. Fuel and driver charges may apply.',
      },
      aggregateRating:
        reviews.length > 0
          ? {
              '@type': 'AggregateRating',
              ratingValue: avgRating,
              reviewCount: reviews.length,
              bestRating: '5',
              worstRating: '1',
            }
          : undefined,
    };
  } else {
    seoSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: listing.title,
      description: listing.description,
      image: images.slice(0, 3),
      url: canonicalUrl,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: basePrice,
        availability: 'https://schema.org/InStock',
        url: canonicalUrl,
        priceValidUntil,
      },
      aggregateRating:
        reviews.length > 0
          ? { '@type': 'AggregateRating', ratingValue: avgRating, reviewCount: reviews.length }
          : undefined,
    };
  }

  const seoBreadcrumb = [
    { name: 'Home', url: 'https://wayzza.live' },
    {
      name: getCategoryPluralLabel(),
      url: `https://wayzza.live/listings?category=${listing.category}`,
    },
    { name: listing.title, url: canonicalUrl },
  ];

  // ── VEHICLE LISTING — dedicated layout ──────────────────────────
  if (isVehicle) {
    return (
      <WayzzaLayout noPadding>
        <SEO
          title={listing.title}
          description={listing.description}
          image={images[0]}
          type="product"
          schema={seoSchema}
          breadcrumb={seoBreadcrumb}
        />
        <VehicleListingPage
          listing={listing}
          images={images}
          isBike={isBike}
          isCar={isCar}
          avgRating={avgRating}
          reviews={reviews}
          canReview={canReview}
          alreadyReviewed={alreadyReviewed}
          rating={rating}
          setRating={setRating}
          comment={comment}
          setComment={setComment}
          submitting={submitting}
          submitReview={submitReview}
          saved={saved}
          toggleWishlist={toggleWishlist}
          showToast={showToast}
          checkIn={checkIn}
          setCheckIn={setCheckIn}
          checkOut={checkOut}
          setCheckOut={setCheckOut}
          today={today}
          handleReserve={handleReserve}
          handleMobileReserve={handleMobileReserve}
          nights={nights}
          basePrice={basePrice}
          serviceFee={serviceFee}
          total={total}
          reserving={reserving}
          navigate={navigate}
        />
      </WayzzaLayout>
    );
  }

  // ── ROOM / STAY LISTING — Redesigned editorial layout ───────────
  return (
    <WayzzaLayout noPadding>
      <SEO
        title={listing.title}
        description={listing.description}
        image={images[0]}
        type="product"
        schema={seoSchema}
        breadcrumb={seoBreadcrumb}
      />

      <div className="bg-slate-50 min-h-screen font-sans pb-24 lg:pb-0">
        {/* ══════════════════════════════════════════════════════════
            GALLERY HERO — full-bleed, cinematic title overlay
        ══════════════════════════════════════════════════════════ */}
        <div className="relative">
          {/* Floating breadcrumb pill — top left */}
          <div className="absolute top-4 left-4 z-20 hidden md:flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-2">
            <button
              onClick={() => navigate('/')}
              className="text-white/70 text-xs font-semibold hover:text-white transition-colors"
            >
              Home
            </button>
            <ChevronRight size={10} className="text-white/40" />
            <button
              onClick={() => navigate('/listings')}
              className="text-white/70 text-xs font-semibold hover:text-white transition-colors"
            >
              Stays
            </button>
            <ChevronRight size={10} className="text-white/40" />
            <span className="text-white text-xs font-bold truncate max-w-[200px]">
              {listing.title}
            </span>
          </div>

          {/* Floating action buttons — top right */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <button
              onClick={toggleWishlist}
              className={`flex items-center gap-1.5 h-9 px-3.5 rounded-full font-semibold text-xs transition-all backdrop-blur-md border ${
                saved
                  ? 'bg-rose-500/90 border-rose-400/50 text-white'
                  : 'bg-black/40 border-white/10 text-white hover:bg-black/60'
              }`}
            >
              <Heart size={13} className={saved ? 'fill-white' : ''} />
              {saved ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                showToast('Link copied!', 'success');
              }}
              className="w-9 h-9 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all"
            >
              <Share2 size={13} />
            </button>
          </div>

          {/* Gallery grid */}
          <ListingGallery images={images} title={listing.title} priority />

          {/* Title + meta — overlaid on gallery bottom via gradient scrim */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/88 via-black/40 to-transparent px-5 md:px-10 pb-8 pt-36 pointer-events-none">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white">
                {listing.category || 'Stay'}
              </div>
              {listing.price > 8000 && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-400/20 backdrop-blur-sm border border-amber-300/30 rounded-lg text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                  <Sparkles size={10} /> Priority Asset
                </div>
              )}
              {listing.approved && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-400/20 backdrop-blur-sm border border-emerald-300/30 rounded-lg text-[10px] font-bold text-emerald-300 uppercase tracking-widest">
                  <Shield size={10} /> Verified
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-3 drop-shadow-lg">
              {listing.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pointer-events-auto">
              {/* Rating */}
              <div className="flex items-center gap-1.5">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-white">{avgRating || 'New'}</span>
                <span className="text-white/60 text-sm">
                  {reviews.length > 0
                    ? `· ${reviews.length} review${reviews.length !== 1 ? 's' : ''}`
                    : `· ${getCategoryNewLabel()}`}
                </span>
              </div>
              {/* Location */}
              {listing.latitude && listing.longitude ? (
                <a
                  href={`https://www.google.com/maps?q=${listing.latitude},${listing.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white font-medium transition-colors"
                >
                  <MapPin size={13} className="text-emerald-400 shrink-0" />
                  {listing.location || 'Kerala'} ·{' '}
                  <span className="text-emerald-400">View map ↗</span>
                </a>
              ) : (
                <div className="flex items-center gap-1.5 text-sm text-white/80">
                  <MapPin size={13} className="text-emerald-400 shrink-0" />
                  <span>{listing.location || 'Kerala'}</span>
                </div>
              )}
              {/* WiFi */}
              {listing.wifiSpeed > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-white/80">
                  <Wifi size={13} className="text-emerald-400" />
                  <span className="font-semibold">{listing.wifiSpeed} Mbps Wi-Fi</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── PACKAGE CONTEXT BANNER ── */}
        {location.state?.fromPackage && (
          <div className="max-w-[1280px] mx-auto px-5 md:px-10 mt-5">
            <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4">
              <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                <Sparkles size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5">
                  Curated Package
                </p>
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {location.state.fromPackage.name}
                  <span className="text-slate-400 font-medium ml-2">
                    — ₹{Number(location.state.fromPackage.price).toLocaleString('en-IN')} bundled
                  </span>
                </p>
              </div>
              <button
                onClick={() => navigate('/packages')}
                className="text-xs font-semibold text-emerald-600 hover:underline shrink-0"
              >
                ← Packages
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            MAIN CONTENT GRID
        ══════════════════════════════════════════════════════════ */}
        <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ────────────────────────────────────────────────────
                LEFT COLUMN — Details (7/12)
            ──────────────────────────────────────────────────── */}
            <div className="lg:col-span-7 space-y-5">
              {/* ── ABOUT ── */}
              <div className="bg-white rounded-3xl p-7 md:p-9 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 shrink-0 px-1">
                    About This Property
                  </span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <p className="text-[1.05rem] text-slate-600 leading-relaxed font-medium">
                  &ldquo;
                  {listing.description ||
                    'An extraordinary sanctuary where serene architecture meets the rhythm of the coast, designed for those who seek more than just a place to rest.'}
                  &rdquo;
                </p>
              </div>

              {/* ── QUICK FACTS STRIP ── */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Check-in time */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3 hover:border-emerald-200 hover:shadow-md transition-all group">
                  <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-110 transition-transform">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Check-in
                    </p>
                    <p className="text-sm font-bold text-slate-900">2:00 PM</p>
                  </div>
                </div>
                {/* Check-out time */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3 hover:border-emerald-200 hover:shadow-md transition-all group">
                  <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-110 transition-transform">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Check-out
                    </p>
                    <p className="text-sm font-bold text-slate-900">11:00 AM</p>
                  </div>
                </div>
                {/* WiFi */}
                {listing.wifiSpeed > 0 && (
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3 hover:border-emerald-200 hover:shadow-md transition-all group">
                    <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-110 transition-transform">
                      <Wifi size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Wi-Fi
                      </p>
                      <p className="text-sm font-bold text-slate-900">{listing.wifiSpeed} Mbps</p>
                    </div>
                  </div>
                )}
                {/* Location */}
                {listing.location && (
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3 hover:border-emerald-200 hover:shadow-md transition-all group">
                    <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-110 transition-transform">
                      <MapPin size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Location
                      </p>
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {listing.location}
                      </p>
                    </div>
                  </div>
                )}
                {/* Verified */}
                {listing.approved && (
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3 hover:border-emerald-200 hover:shadow-md transition-all group">
                    <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-110 transition-transform">
                      <Shield size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Status
                      </p>
                      <p className="text-sm font-bold text-emerald-700">Wayzza Verified</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ── AMENITIES ── */}
              {listing.amenities && listing.amenities.length > 0 && (
                <div className="bg-white rounded-3xl p-7 md:p-9 border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-7">
                    <div className="h-0.5 w-8 bg-emerald-500 rounded-full" />
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600">
                      Amenities &amp; Utilities
                    </h2>
                  </div>
                  <div className="space-y-8">
                    {AMENITY_CATEGORIES.map((category) => {
                      const present = category.amenities.filter((a) =>
                        listing.amenities.includes(a.label)
                      );
                      if (present.length === 0) return null;
                      return (
                        <div key={category.id}>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">
                            {category.label}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                            {present.map((a, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 hover:shadow-sm transition-all group cursor-default"
                              >
                                <div className="w-8 h-8 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:border-emerald-200 transition-all shrink-0 shadow-sm">
                                  <a.icon size={14} />
                                </div>
                                <div>
                                  <span className="text-xs font-semibold text-slate-700 block">
                                    {a.label}
                                  </span>
                                  {a.id === 'wifi' && listing.wifiSpeed > 0 && (
                                    <span className="text-[10px] font-bold text-emerald-600">
                                      {listing.wifiSpeed} Mbps
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
                </div>
              )}

              {/* ── ROOM VARIANTS ── */}
              {listing.variants?.length > 0 && (
                <div className="bg-white rounded-3xl p-7 md:p-9 border border-slate-100 shadow-sm">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-7">
                    <div className="flex items-center gap-3">
                      <div className="h-0.5 w-8 bg-emerald-500 rounded-full" />
                      <div>
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600">
                          Choose Your Room
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          {listing.variants.length} room{' '}
                          {listing.variants.length === 1 ? 'type' : 'types'} · select to update
                          pricing
                        </p>
                      </div>
                    </div>
                    {selectedVariant !== null && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold rounded-xl">
                        <CheckCircle size={12} />
                        {listing.variants[selectedVariant]?.name}
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    {listing.variants.map((v, i) => {
                      const isSelected = selectedVariant === i;
                      return (
                        <div
                          key={i}
                          onClick={() => setSelectedVariant(i)}
                          className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-2 ${
                            isSelected
                              ? 'border-emerald-500 shadow-xl shadow-emerald-500/10'
                              : 'border-slate-100 hover:border-slate-200 hover:shadow-lg'
                          }`}
                        >
                          {/* Selected ribbon */}
                          {isSelected && (
                            <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                              <CheckCircle size={10} /> Selected
                            </div>
                          )}

                          <div className="flex flex-col md:flex-row">
                            {/* Room image */}
                            <div className="relative w-full md:w-60 h-48 md:h-auto shrink-0 overflow-hidden bg-slate-100">
                              {v.image ? (
                                <>
                                  <img
                                    src={fixImg(v.image)}
                                    alt={v.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
                                  <div className="absolute bottom-3 left-3">
                                    <span className="px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                                      {v.type || 'Room'}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <Star size={32} />
                                </div>
                              )}
                            </div>

                            {/* Content area */}
                            <div
                              className={`flex-1 flex flex-col p-5 md:p-6 transition-colors duration-200 ${
                                isSelected
                                  ? 'bg-emerald-50/40'
                                  : 'bg-white group-hover:bg-slate-50/50'
                              }`}
                            >
                              <div className="mb-2">
                                <h3
                                  className={`text-lg font-black leading-tight ${
                                    isSelected ? 'text-emerald-700' : 'text-slate-900'
                                  }`}
                                >
                                  {v.name}
                                </h3>
                                {v.desc && (
                                  <p className="text-sm text-slate-500 font-medium leading-relaxed mt-1.5 line-clamp-2">
                                    {v.desc}
                                  </p>
                                )}
                              </div>

                              {/* Amenity chips */}
                              {v.amenities && v.amenities.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 my-3">
                                  {v.amenities.slice(0, 5).map((amenityLabel, idx) => {
                                    const amenityObj = ALL_AMENITIES.find(
                                      (a) => a.label === amenityLabel
                                    );
                                    if (!amenityObj) return null;
                                    return (
                                      <span
                                        key={idx}
                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${
                                          isSelected
                                            ? 'bg-white border-emerald-100 text-emerald-700'
                                            : 'bg-slate-50 border-slate-100 text-slate-500'
                                        }`}
                                      >
                                        <amenityObj.icon
                                          size={9}
                                          className={
                                            isSelected ? 'text-emerald-500' : 'text-slate-400'
                                          }
                                        />
                                        {amenityLabel}
                                      </span>
                                    );
                                  })}
                                  {v.amenities.length > 5 && (
                                    <span className="px-2.5 py-1 bg-slate-100 border border-slate-100 rounded-lg text-[10px] font-semibold text-slate-400">
                                      +{v.amenities.length - 5} more
                                    </span>
                                  )}
                                </div>
                              )}

                              <div
                                className={`h-px w-full my-3 ${isSelected ? 'bg-emerald-100' : 'bg-slate-100'}`}
                              />

                              {/* Price + CTA */}
                              <div className="flex items-center justify-between gap-4 mt-auto">
                                <div>
                                  <div
                                    className={`text-2xl font-black leading-none ${
                                      isSelected ? 'text-emerald-700' : 'text-slate-900'
                                    }`}
                                  >
                                    ₹{v.price.toLocaleString()}
                                  </div>
                                  <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
                                    per night · excl. taxes
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedVariant(i);
                                  }}
                                  className={`h-10 px-5 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 ${
                                    isSelected
                                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                      : 'bg-slate-900 text-white hover:bg-emerald-600'
                                  }`}
                                >
                                  {isSelected ? '✓ Selected' : 'Select Room'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── NEIGHBOURHOOD VIBES ── */}
              <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                <div className="px-7 md:px-9 pt-7 pb-0">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-0.5 w-8 bg-slate-200 rounded-full" />
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                      Neighbourhood
                    </h2>
                  </div>
                </div>
                <NeighborhoodVibes location={listing.location} category={listing.category} />
              </div>

              {/* ── REVIEWS ── */}
              <div className="bg-white rounded-3xl p-7 md:p-9 border border-slate-100 shadow-sm">
                <ListingReviews reviews={reviews} avgRating={avgRating} />
              </div>

              {/* ── LEAVE A REVIEW ── */}
              {canReview && !alreadyReviewed && (
                <div className="bg-white rounded-3xl p-7 md:p-9 border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-0.5 w-8 bg-amber-400 rounded-full" />
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-amber-600">
                      Leave a Review
                    </h2>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">
                    Rate your {getCategoryTerm()}
                  </h3>
                  <p className="text-sm text-slate-400 font-medium mb-5">
                    Your feedback helps the Wayzza community make better choices.
                  </p>
                  <StarRow rating={rating} size={28} interactive onSet={setRating} />
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={`Share details about your ${getCategoryTerm()}...`}
                    rows={4}
                    className="w-full mt-5 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all resize-none font-medium"
                  />
                  <button
                    onClick={submitReview}
                    disabled={submitting}
                    className="mt-4 h-12 px-7 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Star size={14} className="fill-white" />
                    )}
                    Submit Review
                  </button>
                </div>
              )}

              {alreadyReviewed && (
                <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4">
                  <CheckCircle size={16} />
                  <span className="text-sm font-semibold">
                    You&apos;ve reviewed this {getCategoryTerm()} — thank you!
                  </span>
                </div>
              )}
            </div>

            {/* ────────────────────────────────────────────────────
                RIGHT COLUMN — Booking Console (5/12)
            ──────────────────────────────────────────────────── */}
            <div className="lg:col-span-5 relative">
              <div className="sticky top-24 space-y-4" id="reservation-console">
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
                  reserving={reserving}
                />

                {/* Direct inquiry card */}
                <div className="hidden lg:flex bg-white border border-slate-200 rounded-2xl p-5 items-center gap-4 hover:shadow-md transition-all cursor-pointer group">
                  <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Direct Inquiries</p>
                    <p className="text-xs text-slate-400 font-medium">Connect with our Concierge</p>
                  </div>
                  <ChevronRight size={16} className="ml-auto text-slate-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            MOBILE STICKY BAR
        ══════════════════════════════════════════════════════════ */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100]">
          <div className="bg-white/95 backdrop-blur-xl border-t border-slate-200 px-5 py-3.5 flex items-center justify-between shadow-2xl shadow-slate-900/10">
            <div>
              <p className="text-lg font-black text-slate-900 leading-none">
                ₹{basePrice.toLocaleString()}
                <span className="text-slate-400 font-medium text-sm ml-1">/ night</span>
              </p>
              <button
                onClick={() =>
                  document
                    .getElementById('reservation-console')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="text-xs font-bold text-emerald-600 mt-0.5 block"
              >
                {checkIn && checkOut
                  ? `${nights} night${nights !== 1 ? 's' : ''} selected`
                  : 'Select dates'}
              </button>
            </div>
            <button
              onClick={handleMobileReserve}
              className="px-8 py-3.5 bg-slate-900 text-white font-black text-xs tracking-[0.2em] uppercase rounded-2xl shadow-xl active:scale-95 hover:bg-emerald-600 transition-all"
            >
              Reserve
            </button>
          </div>
        </div>

        {/* Intelligence Overlay */}
        <ListingConcierge listingId={listing._id} listingTitle={listing.title} />
      </div>
    </WayzzaLayout>
  );
}
