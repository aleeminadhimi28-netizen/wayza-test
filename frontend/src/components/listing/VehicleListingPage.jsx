/**
 * VehicleListingPage.jsx
 * A dedicated, vehicle-specific listing layout for cars and bikes.
 * Uses the same emerald + slate colour system as the rest of Wayzza,
 * but with an entirely different structure (dark hero, spec strip, etc.)
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Star,
  MapPin,
  Share2,
  Heart,
  Shield,
  Calendar,
  Car,
  Bike,
  FileText,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Gauge,
  Fuel,
  Tag,
  Sparkles,
  Images,
  X,
  ExternalLink,
  Navigation,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ListingReviews from './ListingReviews.jsx';
import VehicleRentalCard from './VehicleRentalCard.jsx';
import { VEHICLE_AMENITY_CATEGORIES, AMENITY_CATEGORIES } from '../../utils/amenities.js';
import ListingConcierge from '../ListingConcierge.jsx';

/* ── Inline star widget ───────────────────────────────────────────── */
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

/* ── Spec chip ────────────────────────────────────────────────────── */
function SpecChip({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group">
      <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-110 transition-transform">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
          {label}
        </p>
        <p className="text-sm font-bold text-slate-900 truncate">{value}</p>
      </div>
    </div>
  );
}

/* ── Vehicle photo grid + lightbox ────────────────────────────────── */
function VehicleGallery({ images, title }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const openAt = (i) => { setActiveIdx(i); setLightboxOpen(true); };
  const close = () => setLightboxOpen(false);
  const next = useCallback(() => setActiveIdx((i) => (i + 1) % images.length), [images.length]);
  const prev = useCallback(() => setActiveIdx((i) => (i - 1 + images.length) % images.length), [images.length]);

  /* Keyboard nav */
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxOpen, next, prev]);

  /* Lock body scroll */
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

  return (
    <>
      {/* ── 5-photo grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-2 h-[340px] md:h-[460px] lg:h-[540px] rounded-3xl overflow-hidden">

        {/* Hero — 2 cols × 2 rows */}
        <div
          className="lg:col-span-2 lg:row-span-2 relative overflow-hidden cursor-pointer group"
          onClick={() => openAt(0)}
        >
          <img
            src={images[0]}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
            fetchPriority="high"
            loading="eager"
          />
          {/* Cinematic dark gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent pointer-events-none" />
          {/* Mobile counter */}
          <div className="absolute bottom-3 left-3 lg:hidden bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full">
            1 / {images.length}
          </div>
        </div>

        {/* Top-right */}
        {images[1] && (
          <div className="hidden lg:block relative overflow-hidden cursor-pointer group" onClick={() => openAt(1)}>
            <img src={images[1]} alt="Photo 2" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out" loading="lazy" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
          </div>
        )}

        {/* Top-far-right */}
        {images[2] && (
          <div className="hidden lg:block relative overflow-hidden cursor-pointer group" onClick={() => openAt(2)}>
            <img src={images[2]} alt="Photo 3" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out" loading="lazy" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
          </div>
        )}

        {/* Bottom-right */}
        {images[3] && (
          <div className="hidden lg:block relative overflow-hidden cursor-pointer group" onClick={() => openAt(3)}>
            <img src={images[3]} alt="Photo 4" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out" loading="lazy" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
          </div>
        )}

        {/* Bottom-far-right + "Show all" */}
        {images[4] && (
          <div className="hidden lg:block relative overflow-hidden cursor-pointer group" onClick={() => openAt(4)}>
            <img src={images[4]} alt="Photo 5" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out" loading="lazy" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            <button
              onClick={(e) => { e.stopPropagation(); openAt(0); }}
              className="absolute bottom-3 right-3 flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-slate-200 text-slate-900 px-4 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-lg hover:bg-slate-950 hover:text-white transition-all duration-300"
            >
              <Images size={13} />
              All {images.length} photos
            </button>
          </div>
        )}
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[99999] bg-black/97 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 shrink-0">
              <div>
                <p className="text-white font-bold text-sm">{title}</p>
                <p className="text-white/40 text-xs font-medium mt-0.5">
                  {activeIdx + 1} of {images.length}
                </p>
              </div>
              <button onClick={close} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Main image */}
            <div className="flex-1 relative flex items-center justify-center px-4 md:px-20 min-h-0">
              <button onClick={prev} className="absolute left-4 md:left-6 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all hover:scale-110">
                <ChevronLeft size={26} />
              </button>
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeIdx}
                  src={images[activeIdx]}
                  alt={`${title} photo ${activeIdx + 1}`}
                  initial={{ opacity: 0, x: 40, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -40, scale: 0.97 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="max-h-full max-w-full object-contain rounded-2xl select-none"
                  draggable={false}
                />
              </AnimatePresence>
              <button onClick={next} className="absolute right-4 md:right-6 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all hover:scale-110">
                <ChevronRight size={26} />
              </button>
            </div>

            {/* Thumbnail strip */}
            <div className="shrink-0 px-6 py-4 border-t border-white/10">
              <div className="flex gap-2 overflow-x-auto no-scrollbar justify-start md:justify-center">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    className={`relative w-16 h-12 md:w-20 md:h-14 rounded-xl overflow-hidden shrink-0 transition-all duration-200 ${
                      i === activeIdx
                        ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-black opacity-100 scale-105'
                        : 'opacity-40 hover:opacity-70'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function VehicleListingPage({
  listing,
  images,
  isBike,
  isCar,
  avgRating,
  reviews,
  canReview,
  alreadyReviewed,
  rating,
  setRating,
  comment,
  setComment,
  submitting,
  submitReview,
  saved,
  toggleWishlist,
  showToast,
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  today,
  handleReserve,
  handleMobileReserve,
  nights,
  basePrice,
  serviceFee,
  total,
  reserving,
  navigate,
}) {
  const vehicleIcon = isBike ? <Bike size={13} /> : <Car size={13} />;

  /* Registration date formatted */
  const regDateFormatted = (() => {
    if (!listing.registrationDate) return null;
    const d = new Date(listing.registrationDate);
    if (isNaN(d.getTime())) return listing.registrationDate;
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long' });
  })();

  /* Merge amenities: check both vehicle and standard categories */
  const allAmenityRows = [
    ...VEHICLE_AMENITY_CATEGORIES,
    ...AMENITY_CATEGORIES,
  ].map((cat) => {
    const present = cat.amenities.filter((a) =>
      (listing.amenities || []).includes(a.label)
    );
    return { ...cat, present };
  }).filter((cat) => cat.present.length > 0);

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-24 lg:pb-0">

      <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-6">

        {/* ── IDENTITY HEADER ──────────────────────────────────────── */}
        <div className="mb-6">
          {/* Category + action row */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
            <div className="flex flex-wrap items-center gap-2">
              {/* Vehicle type badge */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest ${
                isBike ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-100 text-slate-700'
              }`}>
                {vehicleIcon}
                {listing.category === 'bike' ? 'Bike' : 'Car'} Rental
              </div>
              {listing.approved && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-xs font-bold text-emerald-700 uppercase tracking-widest">
                  <Shield size={11} /> Verified
                </div>
              )}
              {listing.price > 1500 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-lg text-xs font-bold text-amber-700 uppercase tracking-widest">
                  <Sparkles size={11} /> Premium Fleet
                </div>
              )}
            </div>

            {/* Save + Share */}
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

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            {listing.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-slate-900">{avgRating || 'New'}</span>
              <span className="text-sm text-slate-400">
                {reviews.length > 0 ? `· ${reviews.length} review${reviews.length !== 1 ? 's' : ''}` : '· New Vehicle'}
              </span>
            </div>
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
          </div>
        </div>

        {/* ── GALLERY ──────────────────────────────────────────────── */}
        <div className="mb-6">
          <VehicleGallery images={images} title={listing.title} />
        </div>

        {/* ── VEHICLE SPEC STRIP ───────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <SpecChip icon={isBike ? Bike : Car} label="Vehicle Type" value={listing.vehicleType} />
          <SpecChip icon={FileText} label="License Plate" value={listing.licensePlate} />
          <SpecChip icon={Shield} label="Registration" value={listing.registrationCategory} />
          <SpecChip icon={Calendar} label="Registered" value={regDateFormatted} />
          {listing.fuelType && (
            <SpecChip icon={Fuel} label="Fuel Type" value={listing.fuelType} />
          )}
          {listing.engineCC && (
            <SpecChip icon={Gauge} label="Engine" value={`${listing.engineCC}cc`} />
          )}
          {listing.cancellationPolicy && (
            <SpecChip icon={Tag} label="Cancellation" value={listing.cancellationPolicy} />
          )}
        </div>

        {/* ── MAIN CONTENT GRID ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT: Details */}
          <div className="lg:col-span-7 space-y-5">

            {/* About this vehicle */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-0.5 w-6 bg-emerald-500 rounded-full" />
                <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                  About this vehicle
                </h2>
              </div>
              <p className="text-base text-slate-600 leading-relaxed font-medium">
                {listing.description ||
                  'A well-maintained vehicle available for self-drive rental through the Wayzza platform. Explore Kerala at your own pace with full flexibility.'}
              </p>
            </div>

            {/* Cancellation policy notice */}
            {listing.cancellationPolicy && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
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

            {/* Inclusions & Features */}
            {allAmenityRows.length > 0 && (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-0.5 w-6 bg-slate-300 rounded-full" />
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Inclusions &amp; Features
                  </h2>
                </div>
                <div className="space-y-7">
                  {allAmenityRows.map((cat) => (
                    <div key={cat.id}>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                        {cat.label}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {cat.present.map((a, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group"
                          >
                            <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0">
                              <a.icon size={14} />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">
                              {a.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pickup location card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Map embed or static placeholder */}
              {listing.latitude && listing.longitude ? (
                <div className="relative w-full h-44 overflow-hidden">
                  <iframe
                    title="Pickup Location"
                    src={`https://maps.google.com/maps?q=${listing.latitude},${listing.longitude}&z=15&output=embed`}
                    className="w-full h-full border-0"
                    loading="lazy"
                    allowFullScreen
                  />
                  <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5" />
                </div>
              ) : (
                <div className="w-full h-44 bg-slate-100 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Navigation size={28} />
                    <span className="text-xs font-semibold">Map not available</span>
                  </div>
                </div>
              )}

              <div className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Pickup Location</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{listing.location || 'Varkala, Kerala'}</p>
                  </div>
                </div>
                {listing.latitude && listing.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${listing.latitude},${listing.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors shrink-0 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl"
                  >
                    <ExternalLink size={12} />
                    Open in Maps
                  </a>
                )}
              </div>
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
                <ListingReviews reviews={reviews} avgRating={avgRating} />
              </div>
            )}

            {/* Submit review */}
            {canReview && !alreadyReviewed && (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-0.5 w-6 bg-amber-400 rounded-full" />
                  <h2 className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                    Leave a Review
                  </h2>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Rate your {isBike ? 'ride' : 'rental'}
                </h3>
                <p className="text-sm text-slate-400 font-medium mb-5">
                  Your feedback helps the Wayzza community make better choices.
                </p>
                <StarRow rating={rating} size={24} interactive onSet={setRating} />
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={`Share details about your ${isBike ? 'ride' : 'rental'}...`}
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
                  You&apos;ve reviewed this {isBike ? 'ride' : 'rental'} — thank you!
                </span>
              </div>
            )}
          </div>

          {/* RIGHT: Rental Console */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-24 space-y-4" id="reservation-console">
              <VehicleRentalCard
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
                serviceFee={serviceFee}
                total={total}
                reserving={reserving}
                isBike={isBike}
              />

              {/* Direct inquiry */}
              <div className="hidden lg:flex bg-white border border-slate-200 rounded-2xl p-5 items-center gap-4 hover:shadow-md transition-all cursor-pointer group">
                <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Direct Inquiries</p>
                  <p className="text-xs text-slate-400 font-medium">
                    Connect with our Concierge
                  </p>
                </div>
                <ChevronRight size={16} className="ml-auto text-slate-300" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── MOBILE STICKY BAR ────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-5 py-3 z-[100] flex items-center justify-between shadow-lg">
        <div>
          <p className="text-base font-black text-slate-900">
            ₹{basePrice.toLocaleString()}
            <span className="text-slate-400 font-medium text-sm ml-1">/ day</span>
          </p>
          <button
            onClick={() =>
              document.getElementById('reservation-console')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="text-xs font-bold text-emerald-600"
          >
            {checkIn && checkOut
              ? `${nights} day${nights !== 1 ? 's' : ''} selected`
              : 'Select pickup dates'}
          </button>
        </div>
        <button
          onClick={handleMobileReserve}
          className="px-7 py-3 bg-slate-900 text-white font-bold text-sm rounded-xl shadow-lg active:scale-95 hover:bg-emerald-600 transition-all flex items-center gap-2"
        >
          {isBike ? <Bike size={15} /> : <Car size={15} />}
          Rent Now
        </button>
      </div>

      {/* AI Concierge overlay */}
      <ListingConcierge listingId={listing._id} listingTitle={listing.title} />
    </div>
  );
}
