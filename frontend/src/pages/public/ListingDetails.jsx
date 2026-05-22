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
  FileText,
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
              b.listingId === id && b.status === 'paid' && new Date(b.checkOut || b.endDate) < today
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
  while (images.length < 5)
    images.push(
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
    );

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

  // ── ROOM / STAY LISTING — existing layout (unchanged) ───────────
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
        {/* ── BREADCRUMB ── */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 overflow-x-auto whitespace-nowrap no-scrollbar">
              <button
                onClick={() => navigate('/')}
                className="hover:text-emerald-600 transition-colors shrink-0"
              >
                Home
              </button>
              <ChevronRight size={12} />
              <button
                onClick={() => navigate('/listings')}
                className="hover:text-emerald-600 transition-colors shrink-0"
              >
                {getCategoryPluralLabel()}
              </button>
              <ChevronRight size={12} />
              <span className="text-slate-700 font-semibold truncate">{listing.title}</span>
            </div>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-8">
          {/* ── PACKAGE CONTEXT BANNER ── */}
          {location.state?.fromPackage && (
            <div className="mb-6 flex items-center gap-4 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4">
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
          )}

          {/* ── HERO HEADER ── */}
          <div className="bg-white rounded-3xl p-6 md:p-8 mb-6 border border-slate-100 shadow-sm">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
              <div className="flex-1 min-w-0">
                {/* Category badge row */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest ${
                      isBike
                        ? 'bg-orange-100 text-orange-700'
                        : isCar
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isVehicle ? vehicleIcon : null}
                    {listing.category || 'Stay'}
                  </div>
                  {listing.price > 8000 && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-lg text-xs font-bold text-amber-700 uppercase tracking-widest">
                      <Sparkles size={11} /> Priority Asset
                    </div>
                  )}
                  {listing.approved && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-xs font-bold text-emerald-700 uppercase tracking-widest">
                      <Shield size={11} /> Verified
                    </div>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-5">
                  {listing.title}
                </h1>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      <span className="text-sm font-bold text-slate-900">{avgRating || 'New'}</span>
                    </div>
                    <span className="text-slate-400 text-sm">
                      {reviews.length > 0
                        ? `· ${reviews.length} review${reviews.length !== 1 ? 's' : ''}`
                        : `· ${getCategoryNewLabel()}`}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPin size={14} className="text-emerald-500 shrink-0" />
                    {listing.latitude && listing.longitude ? (
                      <a
                        href={`https://www.google.com/maps?q=${listing.latitude},${listing.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-emerald-600 transition-colors font-medium"
                      >
                        {listing.location || 'Kerala'} ·{' '}
                        <span className="text-emerald-600">View map ↗</span>
                      </a>
                    ) : (
                      <span className="font-medium">{listing.location || 'Kerala'}</span>
                    )}
                  </div>

                  {/* WiFi */}
                  {listing.wifiSpeed > 0 && (
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                      <Wifi size={14} className="text-emerald-500" />
                      <span className="font-medium text-emerald-700">
                        {listing.wifiSpeed} Mbps Wi-Fi
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={toggleWishlist}
                  className={`flex items-center gap-2 h-10 px-4 rounded-xl font-semibold text-sm transition-all border ${
                    saved
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-rose-200 hover:text-rose-500'
                  }`}
                >
                  <Heart size={15} className={saved ? 'fill-rose-500' : ''} />
                  {saved ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    showToast('Link copied!', 'success');
                  }}
                  className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:border-slate-300 transition-all"
                >
                  <Share2 size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* ── GALLERY ── */}
          <div className="mb-6">
            <ListingGallery images={images} title={listing.title} priority />
          </div>

          {/* ── MAIN CONTENT GRID ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ── LEFT: Details ── */}
            <div className="lg:col-span-7 space-y-5">
              {/* Description card */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-0.5 w-6 bg-emerald-500 rounded-full" />
                  <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                    {isVehicle ? 'About this vehicle' : 'About this property'}
                  </h2>
                </div>
                <p className="text-base text-slate-600 leading-relaxed font-medium">
                  {listing.description ||
                    (isVehicle
                      ? 'A well-maintained vehicle available for self-drive rental through the Wayzza platform. Explore Kerala at your own pace with full flexibility.'
                      : 'An extraordinary sanctuary where serene architecture meets the rhythm of the coast, designed for those who seek more than just a place to rest.')}
                </p>
              </div>

              {/* ── Vehicle Specs card ── */}
              {isVehicle && (
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-0.5 w-6 bg-slate-300 rounded-full" />
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Vehicle Specifications
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-2 gap-5">
                    {listing.vehicleType && (
                      <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-9 h-9 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                          {isBike ? <Bike size={16} /> : <Car size={16} />}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                            Vehicle Type
                          </p>
                          <p className="text-sm font-bold text-slate-900">{listing.vehicleType}</p>
                        </div>
                      </div>
                    )}

                    {listing.registrationCategory && (
                      <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-9 h-9 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                          <Shield size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                            Registration
                          </p>
                          <p className="text-sm font-bold text-slate-900 leading-tight">
                            {listing.registrationCategory}
                          </p>
                        </div>
                      </div>
                    )}

                    {listing.licensePlate && (
                      <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-9 h-9 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                          <FileText size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                            License Plate
                          </p>
                          <p className="text-sm font-bold text-slate-900 font-mono">
                            {listing.licensePlate}
                          </p>
                        </div>
                      </div>
                    )}

                    {listing.registrationDate && (
                      <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-9 h-9 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                          <Calendar size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                            Registered
                          </p>
                          <p className="text-sm font-bold text-slate-900">
                            {(() => {
                              const d = new Date(listing.registrationDate);
                              if (isNaN(d.getTime())) return listing.registrationDate;
                              return d.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                              });
                            })()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {listing.cancellationPolicy && (
                    <div className="mt-5 flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                      <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-0.5">
                          Cancellation Policy
                        </p>
                        <p className="text-sm font-semibold text-amber-900 capitalize">
                          {listing.cancellationPolicy}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Neighborhood */}
              <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                <div className="p-6 md:p-8 pb-0">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-0.5 w-6 bg-slate-300 rounded-full" />
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Neighbourhood
                    </h2>
                  </div>
                </div>
                <NeighborhoodVibes location={listing.location} category={listing.category} />
              </div>

              {/* Amenities */}
              {listing.amenities && listing.amenities.length > 0 && (
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-0.5 w-6 bg-slate-300 rounded-full" />
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {isVehicle ? 'Inclusions & Features' : 'Amenities & Utilities'}
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
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                            {category.label}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {present.map((a, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group"
                              >
                                <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0">
                                  <a.icon size={15} />
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

              {/* Variants (stays only) */}
              {!isVehicle && listing.variants?.length > 1 && (
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-0.5 w-6 bg-slate-300 rounded-full" />
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Room Options
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {listing.variants.map((v, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedVariant(i)}
                        className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center gap-4 ${
                          selectedVariant === i
                            ? 'border-emerald-500 bg-emerald-50/40'
                            : 'border-slate-200 hover:border-emerald-200 bg-slate-50/50'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 mb-1">{v.name}</h3>
                          <p className="text-xs text-slate-400 font-medium">
                            {v.desc || 'Executive level residency'}
                          </p>
                          {v.amenities && v.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {v.amenities.slice(0, 4).map((amenityLabel, idx) => {
                                const amenityObj = ALL_AMENITIES.find(
                                  (a) => a.label === amenityLabel
                                );
                                if (!amenityObj) return null;
                                return (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-100 rounded-md text-[10px] font-semibold text-slate-500"
                                  >
                                    <amenityObj.icon size={9} className="text-emerald-500" />
                                    {amenityLabel}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xl font-black text-slate-900">
                            ₹{v.price.toLocaleString()}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">/ night</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
                <ListingReviews reviews={reviews} avgRating={avgRating} />
              </div>

              {/* Review submission */}
              {canReview && !alreadyReviewed && (
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="h-0.5 w-6 bg-amber-400 rounded-full" />
                    <h2 className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                      Leave a Review
                    </h2>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    Rate your {getCategoryTerm()}
                  </h3>
                  <p className="text-sm text-slate-400 font-medium mb-5">
                    Your feedback helps the Wayzza community make better choices.
                  </p>
                  <StarRow rating={rating} size={24} interactive onSet={setRating} />
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={`Share details about your ${getCategoryTerm()}...`}
                    rows={4}
                    className="w-full mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all resize-none font-medium"
                  />
                  <button
                    onClick={submitReview}
                    disabled={submitting}
                    className="mt-4 h-11 px-6 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
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

            {/* ── RIGHT: Booking Console ── */}
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

                {/* Direct inquiry */}
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

        {/* ── MOBILE STICKY BAR ── */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-5 py-3 z-[100] flex items-center justify-between shadow-lg">
          <div>
            <p className="text-base font-black text-slate-900">
              ₹{basePrice.toLocaleString()}
              <span className="text-slate-400 font-medium text-sm ml-1">
                / {isVehicle ? 'day' : 'night'}
              </span>
            </p>
            <button
              onClick={() =>
                document
                  .getElementById('reservation-console')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
              className="text-xs font-bold text-emerald-600"
            >
              {checkIn && checkOut
                ? `${nights} ${isVehicle ? 'days' : 'nights'} selected`
                : isVehicle
                  ? 'Select dates'
                  : 'Select dates'}
            </button>
          </div>
          <button
            onClick={handleMobileReserve}
            className="px-7 py-3 bg-slate-900 text-white font-bold text-sm rounded-xl shadow-lg active:scale-95 hover:bg-emerald-600 transition-all"
          >
            {isVehicle ? 'Rent Now' : 'Reserve'}
          </button>
        </div>

        {/* Intelligence Overlay */}
        <ListingConcierge listingId={listing._id} listingTitle={listing.title} />
      </div>
    </WayzzaLayout>
  );
}
