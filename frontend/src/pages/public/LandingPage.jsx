import { useEffect, useRef, useState, useCallback } from 'react';
import { WayzzaLayout, WayzzaHotelItem, WayzzaSkeleton } from '../../WayzzaUI.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Users,
  Sparkles,
  Globe,
  Compass,
  ArrowRight,
  Instagram,
  Twitter,
  Facebook,
  CheckCircle2,
  Send,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  X,
} from 'lucide-react';

import { api } from '../../utils/api.js';
import { fixImg } from '../../utils/image.js';
import { useToast } from '../../ToastContext.jsx';
import SEO from '../../components/SEO.jsx';

const DESTINATIONS = [
  {
    name: 'Varkala Cliff',
    tag: 'Most popular',
    properties: '45+',
    desc: 'Clifftop luxury with ocean-front villas',
    image: '/images/varkala_cliff.webp',
    span: 'hero', // large hero card
  },
  {
    name: 'Edava',
    tag: 'Serene',
    properties: '20+',
    desc: 'Tranquil backwaters meet Arabian Sea',
    image: '/images/varkala_edava.webp',
    span: 'tall', // tall card
  },
  {
    name: 'Odayam',
    tag: 'Hidden gem',
    properties: '15+',
    desc: 'Untouched beach south of the cliff',
    image: '/images/varkala_odayam.webp',
    span: 'wide', // wide card
  },
  {
    name: 'Papanasam',
    tag: 'Spiritual',
    properties: '10+',
    desc: 'Sacred beach with dramatic red cliffs',
    image: '/images/varkala_papanasam.webp',
    span: 'small',
  },
  {
    name: 'Kappil',
    tag: 'Scenic',
    properties: '8+',
    desc: 'Backwaters estuary meets open sea',
    image: '/images/varkala_kappil.webp',
    span: 'wide',
  },
  {
    name: 'Anjengo',
    tag: 'Historic',
    properties: '5+',
    desc: 'Colonial fort ruins on a sliver of coast',
    image: '/images/varkala_anjengo.webp',
    span: 'small',
  },
];

const DEFAULT_PROMO_OFFER = {
  title: 'Offers',
  subtitle: 'Promotions, deals and special offers for you',
  label: 'No catch. Just getaways.',
  heading: 'Book a Getaway Deal',
  text: 'At least 15% off select stays.',
  button: 'Save on your next trip',
  image: '/images/varkala_cliff.webp',
  isActive: true,
};

export const WAYZZA_FAQ = [
  {
    question: 'What is Wayzza?',
    answer:
      'Wayzza is a premium travel booking platform based in Varkala, Kerala. It offers verified clifftop villas, luxury bike and car rentals, and curated local experiences for digital nomads, solo travellers, and couples exploring Varkala.',
  },
  {
    question: 'Where is Wayzza located?',
    answer:
      'Wayzza operates in Varkala, Kerala, India — specifically serving the Varkala North Cliff, Edava, and Odayam areas. Our physical address is Varkala North Cliff, Varkala, Kerala 695141.',
  },
  {
    question: 'What types of stays does Wayzza offer?',
    answer:
      'Wayzza offers a curated selection of clifftop villas with ocean views, boutique hotels, and private homestays in Varkala. All properties are verified by the Wayzza team for quality and authenticity.',
  },
  {
    question: 'Can I rent a Royal Enfield in Varkala through Wayzza?',
    answer:
      'Yes. Wayzza offers a curated fleet of Royal Enfield motorcycles and other bikes available for daily or multi-day rental in Varkala. You can browse and book bikes directly on the platform.',
  },
  {
    question: 'Does Wayzza offer car rentals in Varkala?',
    answer:
      'Yes. Wayzza lists self-drive and chauffeur-driven car rentals available in Varkala and surrounding Kerala regions, including transfers to Trivandrum airport.',
  },
  {
    question: 'How much does it cost to stay in a villa in Varkala?',
    answer:
      'Varkala villas on Wayzza start from approximately ₹2,500 per night for budget options and go up to ₹15,000+ per night for premium clifftop properties with ocean views. Prices vary by season and availability.',
  },
  {
    question: 'Is Varkala good for digital nomads?',
    answer:
      "Yes. Varkala is one of Kerala's top digital nomad destinations, offering reliable WiFi, a laid-back café culture, co-working spots, and stunning ocean views. Wayzza curates long-stay villa options specifically suited to remote workers.",
  },
  {
    question: 'What is the best time to visit Varkala?',
    answer:
      'The best time to visit Varkala is between October and March, when the weather is dry, sunny, and ideal for beach activities and exploration. Wayzza properties are available year-round, including the monsoon season for a lush, quieter experience.',
  },
  {
    question: 'How do I contact Wayzza support?',
    answer:
      'You can reach Wayzza support by email at stay@wayzza.live or directly through our online support center. Our team is available 24/7 for all booking-related enquiries.',
  },
  {
    question: 'Are Wayzza listings verified?',
    answer:
      'Yes. Every property, vehicle, and experience listed on Wayzza is manually verified by the Wayzza team to ensure it meets quality, safety, and authenticity standards before being published on the platform.',
  },
];

function scrollCarousel(id, dir) {
  const el = document.getElementById(id);
  if (el) el.scrollBy({ left: dir * 300, behavior: 'smooth' });
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bikes, setBikes] = useState([]);
  const [bikesLoading, setBikesLoading] = useState(true);
  const [cars, setCars] = useState([]);
  const [carsLoading, setCarsLoading] = useState(true);
  const [promoOffer, setPromoOffer] = useState(DEFAULT_PROMO_OFFER);
  const tab = 'hotel';
  const [search, setSearch] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const moreListingsRef = useRef(null);
  const exampleMockupRef = useRef(null);
  const [showExampleModal, setShowExampleModal] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const handleSeeExample = () => {
    setShowExampleModal(true);
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterLoading(true);
    try {
      const data = await api.subscribeNewsletter(newsletterEmail);
      if (data.ok) {
        showToast('Subscribed to the Wayzza Newsletter!', 'success');
        setNewsletterEmail('');
      } else {
        showToast(data.message || 'Failed to subscribe.', 'error');
      }
    } catch {
      showToast('Network error.', 'error');
    }
    setNewsletterLoading(false);
  };

  useEffect(() => {
    api
      .getPromoOffer()
      .then((res) => {
        if (res.ok && res.data) setPromoOffer(res.data);
      })
      .catch(() => {});

    setLoading(true);
    api
      .getTrendingListings(8, 'hotel')
      .then((data) => {
        if (Array.isArray(data.rows)) setListings(data.rows);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    setBikesLoading(true);
    api
      .getTrendingListings(8, 'bike')
      .then((data) => {
        if (Array.isArray(data.rows)) setBikes(data.rows);
        setBikesLoading(false);
      })
      .catch(() => setBikesLoading(false));

    setCarsLoading(true);
    api
      .getTrendingListings(8, 'car')
      .then((data) => {
        if (Array.isArray(data.rows)) setCars(data.rows);
        setCarsLoading(false);
      })
      .catch(() => setCarsLoading(false));
  }, []);

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    params.set('category', tab);
    if (search) params.set('location', search);
    if (checkIn) params.set('start', checkIn);
    if (checkOut) params.set('end', checkOut);
    if (guests) params.set('guests', guests);
    navigate(`/listings?${params.toString()}`);
  }, [tab, search, checkIn, checkOut, guests, navigate]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const trendingList = listings.slice(0, 8);

  return (
    <WayzzaLayout noPadding hideFooter>
      <SEO
        title="Luxury Clifftop Villas & Royal Enfield Rentals — Varkala, Kerala"
        description="Discover verified luxury clifftop villas, Royal Enfield motorcycle rentals, and premium car hire in Varkala, Kerala. Curated boutique experiences for the modern traveller. Book direct — no OTA fees."
        breadcrumb={[{ name: 'Home', url: 'https://wayzza.live' }]}
        speakable={{ cssSelectors: ['.speakable-summary', 'h1', '.hero-description'] }}
        howTo={{
          name: 'How to Book a Varkala Stay on Wayzza',
          description:
            'Book premium clifftop villas, bike rentals, and local experiences in Varkala in under 5 minutes on Wayzza.',
          totalTime: 'PT5M',
          steps: [
            {
              name: 'Search your dates',
              text: 'Use the search bar on the homepage to enter your destination, check-in and check-out dates, and number of guests.',
              url: 'https://wayzza.live/#search',
            },
            {
              name: 'Browse verified listings',
              text: 'Explore curated villas, bike rentals, cars, and local experiences — all verified by the Wayzza team.',
              url: 'https://wayzza.live/listings',
            },
            {
              name: 'Review pricing and availability',
              text: 'Check nightly rates, amenities, host details, and real guest reviews before reserving.',
            },
            {
              name: 'Reserve instantly',
              text: "Click 'Reserve' on the listing page, confirm your dates and guest count, and complete secure payment via UPI, card, or net banking.",
            },
            {
              name: 'Receive confirmation',
              text: 'Get instant booking confirmation via email with check-in details and a direct line to your Wayzza Concierge.',
            },
          ],
        }}
        faq={WAYZZA_FAQ}
      />

      <div className="bg-white font-sans text-slate-900 selection:bg-emerald-50 selection:text-emerald-900 leading-relaxed antialiased overflow-x-hidden">
        {/* ── HERO ── */}
        <header className="relative h-[90vh] min-h-[600px] md:min-h-[700px] flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <motion.div
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2.5, ease: 'easeOut' }}
              className="w-full h-full"
            >
              <img
                src="/images/varkala_hero.webp"
                alt="Luxury clifftop villa with ocean view in Varkala, Kerala — Wayzza Premium Stays"
                className="w-full h-full object-cover"
                fetchPriority="high"
                loading="eager"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-white" />
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 text-center space-y-4 md:space-y-12">
            {/* FIX #5: reduced space-y-6 → space-y-4 on mobile to avoid pushing card too low */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 md:space-y-6"
            >
              {/* FIX #2: badge — ensure perfect centering with mx-auto on inline-flex */}
              <div className="flex justify-center">
                <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-white font-black shadow-2xl mx-auto">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  Varkala Exclusive
                </div>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tighter text-white leading-[0.95] drop-shadow-2xl speakable-summary">
                Escape the ordinary <br />
                <span className="text-emerald-400 italic">gracefully.</span>
              </h1>

              <p className="text-sm md:text-xl font-medium text-white/90 max-w-2xl mx-auto drop-shadow-lg leading-relaxed px-2 md:px-0 hero-description">
                Handpicked sanctuaries and high-performance mobility curated for the modern explorer
                in Varkala.
              </p>
            </motion.div>

            {/* ── SEARCH BAR ── */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full px-2 md:px-4"
              /* FIX #6: px-0 → px-2 so card has breathing room from screen edges on mobile */
            >
              {/* FIX #1: rounded-2xl → rounded-[24px] for consistent top corner radius on mobile */}
              <div className="bg-white/90 backdrop-blur-2xl rounded-[24px] md:rounded-[40px] p-3 shadow-[0_40px_100px_rgba(0,0,0,0.15)] border border-white/50 flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-1">
                {/* Location */}
                <div className="flex-[1.5] px-4 py-3 rounded-xl md:rounded-[32px] hover:bg-slate-50/50 transition-all text-left">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-1">
                    Destinations
                  </p>
                  <input
                    placeholder="Where to go?"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-full bg-transparent border-none outline-none font-bold text-slate-900 text-base p-0 placeholder:text-slate-300"
                    aria-label="Search destination"
                  />
                </div>

                <div className="hidden md:block w-px h-10 bg-slate-200/60 self-center" />

                {/* Dates — FIX #3: use grid for equal-width Check In / Check Out */}
                <div className="flex-[1.2] px-4 py-3 rounded-xl md:rounded-[32px] hover:bg-slate-50/50 transition-all text-left">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-1">
                    Timeframe
                  </p>
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <div className="relative">
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="bg-transparent border-none outline-none font-bold text-sm p-0 w-full cursor-pointer h-6"
                        style={{ colorScheme: 'light', color: checkIn ? '#0f172a' : 'transparent' }}
                        aria-label="Check in date"
                      />
                      {!checkIn && (
                        <span className="absolute inset-0 font-bold text-slate-400 text-sm pointer-events-none flex items-center">
                          Check In
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="bg-transparent border-none outline-none font-bold text-sm p-0 w-full cursor-pointer h-6"
                        style={{
                          colorScheme: 'light',
                          color: checkOut ? '#0f172a' : 'transparent',
                        }}
                        aria-label="Check out date"
                      />
                      {!checkOut && (
                        <span className="absolute inset-0 font-bold text-slate-400 text-sm pointer-events-none flex items-center">
                          Check Out
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="hidden md:block w-px h-10 bg-slate-200/60 self-center" />

                {/* Guests — FIX #4: replaced raw number input with +/− stepper */}
                <div className="flex-[0.8] px-4 py-3 rounded-xl md:rounded-[32px] hover:bg-slate-50/50 transition-all text-left">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-1">
                    Guests
                  </p>
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-slate-400 shrink-0" />
                    <button
                      type="button"
                      onClick={() => setGuests((g) => Math.max(1, g - 1))}
                      className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-slate-400 hover:text-slate-900 transition-all shrink-0"
                      aria-label="Decrease guests"
                    >
                      <Minus size={10} strokeWidth={3} />
                    </button>
                    <span className="font-bold text-slate-900 text-base w-5 text-center select-none">
                      {guests}
                    </span>
                    <button
                      type="button"
                      onClick={() => setGuests((g) => Math.min(20, g + 1))}
                      className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-slate-400 hover:text-slate-900 transition-all shrink-0"
                      aria-label="Increase guests"
                    >
                      <Plus size={10} strokeWidth={3} />
                    </button>
                  </div>
                </div>

                {/* Search Button — FIX #7: gap-3 → gap-2, icon and text perfectly centered */}
                <button
                  onClick={handleSearch}
                  className="w-full md:w-auto bg-slate-900 text-white px-6 md:px-8 py-4 rounded-xl md:rounded-[32px] shadow-2xl shadow-slate-900/20 transition-all hover:bg-emerald-600 active:scale-95 flex items-center justify-center gap-2 min-h-[52px]"
                  aria-label="Search listings"
                >
                  <Search size={18} strokeWidth={3} className="shrink-0" />
                  <span className="font-black uppercase tracking-[0.3em] text-[11px]">Explore</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 border border-slate-300/30 rounded-full p-2"
            aria-hidden="true"
          >
            <div className="w-1 h-3 bg-slate-300 rounded-full" />
          </motion.div>
        </header>

        {/* ── PROMO + LISTINGS ── */}
        <section
          ref={moreListingsRef}
          className="px-4 sm:px-6 max-w-7xl mx-auto space-y-8 pb-10 pt-6"
        >
          {/* Promo card */}
          {promoOffer && promoOffer.isActive !== false && (
            <div className="bg-white rounded-[24px] md:rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row items-stretch gap-4 p-5">
                <div className="flex-1 min-w-0">
                  <p className="text-emerald-500 uppercase tracking-[0.35em] text-[11px] font-black mb-3">
                    {promoOffer.title || 'OFFERS'}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 mb-3">
                    {promoOffer.heading || 'Book a Getaway Deal'}
                  </h2>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed mb-4">
                    {promoOffer.text || 'At least 15% off select stays.'}
                  </p>
                  <p className="text-xs uppercase tracking-[0.3em] font-black text-slate-400 mb-4">
                    {promoOffer.label || 'NO CATCH. JUST GETAWAYS.'}
                  </p>
                  <button
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-950 text-white px-5 py-3 text-sm font-black uppercase tracking-[0.22em] shadow-lg shadow-slate-950/10 transition hover:bg-emerald-600"
                    onClick={() => navigate('/listings')}
                  >
                    {promoOffer.button || 'SAVE ON YOUR NEXT TRIP'}
                  </button>
                </div>
                <div className="w-full sm:w-56 h-44 sm:h-auto rounded-[20px] overflow-hidden">
                  <img
                    src={api.fixImg(promoOffer.image)}
                    alt="Getaway deal"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Featured listings */}
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-950">
                  Featured in Varkala
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  Select stays curated for premium discovery on the cliff.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollCarousel('featured-scroll', -1)}
                  className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all shadow-sm"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => scrollCarousel('featured-scroll', 1)}
                  className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all shadow-sm"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={18} />
                </button>
                <Link
                  to="/listings"
                  className="hidden sm:block text-xs uppercase font-black tracking-[0.3em] text-slate-400 hover:text-slate-900 ml-2 transition-colors"
                >
                  View all
                </Link>
              </div>
            </div>
            <div
              id="featured-scroll"
              className="flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory scroll-smooth"
            >
              {loading
                ? [1, 2, 3].map((i) => (
                    <div key={i} className="w-[280px] shrink-0 snap-start">
                      <WayzzaSkeleton className="h-[360px] rounded-[32px]" />
                    </div>
                  ))
                : trendingList.map((listing) => (
                    <div key={listing._id} className="w-[280px] shrink-0 snap-start">
                      <WayzzaHotelItem
                        hotel={{
                          id: listing._id,
                          name: listing.title,
                          location: listing.location || 'Premium stay',
                          price: listing.price,
                          image: fixImg(listing.image),
                          wifiSpeed: listing.wifiSpeed || 0,
                          featured: listing.featured || false,
                          viewCount: listing.viewCount || 0,
                        }}
                      />
                    </div>
                  ))}
            </div>
          </div>

          {/* More listings */}
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-950">
                  More listings
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  Browse more curated stays for your next trip.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollCarousel('more-scroll', -1)}
                  className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all shadow-sm"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => scrollCarousel('more-scroll', 1)}
                  className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all shadow-sm"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={18} />
                </button>
                <Link
                  to="/listings"
                  className="hidden sm:block text-xs uppercase font-black tracking-[0.3em] text-slate-400 hover:text-slate-900 ml-2 transition-colors"
                >
                  Browse all
                </Link>
              </div>
            </div>
            <div
              id="more-scroll"
              className="flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory scroll-smooth"
            >
              {loading
                ? [1, 2, 3].map((i) => (
                    <div key={i} className="w-[280px] shrink-0 snap-start">
                      <WayzzaSkeleton className="h-[360px] rounded-[32px]" />
                    </div>
                  ))
                : trendingList.slice(0, 6).map((listing) => (
                    <div key={listing._id} className="w-[280px] shrink-0 snap-start">
                      <WayzzaHotelItem
                        hotel={{
                          id: listing._id,
                          name: listing.title,
                          location: listing.location || 'Premium stay',
                          price: listing.price,
                          image: fixImg(listing.image),
                          wifiSpeed: listing.wifiSpeed || 0,
                          featured: listing.featured || false,
                          viewCount: listing.viewCount || 0,
                        }}
                      />
                    </div>
                  ))}
            </div>
          </div>
        </section>

        {/* ── BIKES & CARS (CLEAN LIGHT AIRBNB STYLE) ── */}
        <section className="py-16 md:py-24 bg-slate-50/50 px-4 sm:px-6 border-t border-b border-slate-100">
          <div className="max-w-7xl mx-auto space-y-16">
            {/* ── BIKES SECTION ── */}
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                    Bikes in Varkala
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    Royal Enfield, cruisers & scooters for self-drive cliff exploration.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollCarousel('bikes-featured-scroll', -1)}
                    className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-400 transition-all shadow-sm"
                    aria-label="Scroll featured bikes left"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => scrollCarousel('bikes-featured-scroll', 1)}
                    className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-400 transition-all shadow-sm"
                    aria-label="Scroll featured bikes right"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <Link
                    to="/listings?category=bike"
                    className="hidden sm:block text-xs font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 ml-2 transition-colors"
                  >
                    View all bikes →
                  </Link>
                </div>
              </div>

              <div
                id="bikes-featured-scroll"
                className="flex gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x snap-mandatory scroll-smooth"
              >
                {bikesLoading ? (
                  [1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-[280px] shrink-0 snap-start">
                      <WayzzaSkeleton className="h-[340px] rounded-3xl" />
                    </div>
                  ))
                ) : bikes.length === 0 ? (
                  <div className="w-full py-12 text-center border border-dashed border-slate-200 rounded-3xl bg-white">
                    <p className="text-slate-400 text-sm font-semibold">No bikes listed yet</p>
                  </div>
                ) : (
                  bikes.map((listing) => (
                    <div key={listing._id} className="w-[280px] shrink-0 snap-start">
                      <WayzzaHotelItem
                        perUnit="day"
                        hotel={{
                          id: listing._id,
                          name: listing.title,
                          location: listing.location || 'Varkala',
                          price: listing.price,
                          image: fixImg(listing.image),
                          wifiSpeed: 0,
                          featured: listing.featured || false,
                          viewCount: listing.viewCount || 0,
                        }}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ── CARS SECTION ── */}
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                    Cars in Varkala
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    Handpicked self-drive & chauffeur cars for seamless Kerala travel.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollCarousel('cars-featured-scroll', -1)}
                    className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-400 transition-all shadow-sm"
                    aria-label="Scroll featured cars left"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => scrollCarousel('cars-featured-scroll', 1)}
                    className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-400 transition-all shadow-sm"
                    aria-label="Scroll featured cars right"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <Link
                    to="/listings?category=car"
                    className="hidden sm:block text-xs font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 ml-2 transition-colors"
                  >
                    View all cars →
                  </Link>
                </div>
              </div>

              <div
                id="cars-featured-scroll"
                className="flex gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x snap-mandatory scroll-smooth"
              >
                {carsLoading ? (
                  [1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-[280px] shrink-0 snap-start">
                      <WayzzaSkeleton className="h-[340px] rounded-3xl" />
                    </div>
                  ))
                ) : cars.length === 0 ? (
                  <div className="w-full py-12 text-center border border-dashed border-slate-200 rounded-3xl bg-white">
                    <p className="text-slate-400 text-sm font-semibold">No cars listed yet</p>
                  </div>
                ) : (
                  cars.map((listing) => (
                    <div key={listing._id} className="w-[280px] shrink-0 snap-start">
                      <WayzzaHotelItem
                        perUnit="day"
                        hotel={{
                          id: listing._id,
                          name: listing.title,
                          location: listing.location || 'Varkala',
                          price: listing.price,
                          image: fixImg(listing.image),
                          wifiSpeed: 0,
                          featured: listing.featured || false,
                          viewCount: listing.viewCount || 0,
                        }}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── DESTINATIONS BENTO (CLEAN LIGHT AIRBNB STYLE) ── */}
        <section className="py-20 md:py-28 bg-white px-4 sm:px-6 relative overflow-hidden border-t border-slate-100">
          <div className="max-w-7xl mx-auto relative z-10">
            {/* Section header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12 md:mb-16"
            >
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700">
                    Territories
                  </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  Where we <span className="text-emerald-600 italic">operate.</span>
                </h2>
              </div>
              <div className="space-y-3 max-w-sm">
                <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed">
                  Our network spans unique Varkala ecosystems, each personally verified for comfort
                  and security.
                </p>
                <button
                  onClick={() => navigate('/listings')}
                  className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 transition-colors border border-emerald-200 px-5 py-2.5 rounded-full hover:border-emerald-400 bg-emerald-50/50"
                >
                  Browse all areas <ArrowRight size={13} />
                </button>
              </div>
            </motion.div>

            {/* ── DESKTOP: 3-col asymmetric grid ── */}
            <div
              className="hidden md:grid gap-4"
              style={{ gridTemplateColumns: '1.4fr 1fr 1fr', gridTemplateRows: '420px 260px' }}
            >
              {/* Hero — Varkala Cliff: spans 2 rows */}
              {DESTINATIONS.filter((d) => d.span === 'hero').map((d) => (
                <motion.div
                  key={d.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  onClick={() => navigate(`/listings?location=${encodeURIComponent(d.name)}`)}
                  className="group cursor-pointer relative rounded-3xl overflow-hidden shadow-md border border-slate-200/80"
                  style={{ gridRow: 'span 2' }}
                >
                  <img
                    src={d.image}
                    alt={d.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                  <div className="absolute top-5 left-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
                      {d.tag}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <p className="text-emerald-400 text-xs font-extrabold uppercase tracking-widest mb-1.5">
                      {d.properties} Properties
                    </p>
                    <h3 className="text-white font-extrabold text-3xl md:text-4xl tracking-tight mb-2">
                      {d.name}
                    </h3>
                    <p className="text-slate-300 text-sm font-medium mb-6 max-w-[260px] leading-relaxed">
                      {d.desc}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all duration-300">
                        <ArrowRight
                          size={16}
                          className="text-white group-hover:translate-x-0.5 transition-transform"
                        />
                      </div>
                      <span className="text-white/80 text-xs font-bold uppercase tracking-wider group-hover:text-white transition-colors">
                        Explore stays
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Edava — col 2, row 1 */}
              {DESTINATIONS.filter((d) => d.span === 'tall').map((d) => (
                <motion.div
                  key={d.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  onClick={() => navigate(`/listings?location=${encodeURIComponent(d.name)}`)}
                  className="group cursor-pointer relative rounded-3xl overflow-hidden shadow-md border border-slate-200/80"
                >
                  <img
                    src={d.image}
                    alt={d.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white">
                      {d.tag}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-emerald-400 text-xs font-extrabold uppercase tracking-widest mb-1">
                      {d.properties} Properties
                    </p>
                    <h3 className="text-white font-extrabold text-2xl tracking-tight mb-1">
                      {d.name}
                    </h3>
                    <p className="text-slate-300 text-xs font-medium mb-3 line-clamp-1">{d.desc}</p>
                    <div className="h-8 w-8 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:bg-emerald-500 transition-all">
                      <ArrowRight size={14} className="text-white" />
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Odayam — col 3, row 1 */}
              {DESTINATIONS.filter((d) => d.name === 'Odayam').map((d) => (
                <motion.div
                  key={d.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                  onClick={() => navigate(`/listings?location=${encodeURIComponent(d.name)}`)}
                  className="group cursor-pointer relative rounded-3xl overflow-hidden shadow-md border border-slate-200/80"
                >
                  <img
                    src={d.image}
                    alt={d.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-2.5 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[9px] font-extrabold uppercase tracking-wider text-white">
                      {d.tag}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 flex justify-between items-end">
                    <div>
                      <p className="text-emerald-400 text-xs font-extrabold uppercase tracking-widest mb-0.5">
                        {d.properties} Properties
                      </p>
                      <h3 className="text-white font-extrabold text-xl tracking-tight">{d.name}</h3>
                    </div>
                    <div className="h-8 w-8 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:bg-emerald-500 transition-all shrink-0">
                      <ArrowRight size={14} className="text-white" />
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Bottom row — 3 equal cards: Papanasam, Kappil, Anjengo */}
              {DESTINATIONS.filter((d) => ['Papanasam', 'Kappil', 'Anjengo'].includes(d.name)).map(
                (d, i) => (
                  <motion.div
                    key={d.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
                    onClick={() => navigate(`/listings?location=${encodeURIComponent(d.name)}`)}
                    className="group cursor-pointer relative rounded-3xl overflow-hidden shadow-md border border-slate-200/80"
                  >
                    <img
                      src={d.image}
                      alt={d.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-2.5 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[9px] font-extrabold uppercase tracking-wider text-white">
                        {d.tag}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5 flex justify-between items-end">
                      <div>
                        <p className="text-emerald-400 text-xs font-extrabold uppercase tracking-widest mb-0.5">
                          {d.properties} Properties
                        </p>
                        <h3 className="text-white font-extrabold text-lg tracking-tight">
                          {d.name}
                        </h3>
                        <p className="text-slate-300 text-[11px] font-medium mt-0.5 line-clamp-1">
                          {d.desc}
                        </p>
                      </div>
                      <div className="h-8 w-8 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:bg-emerald-500 transition-all shrink-0 ml-3">
                        <ArrowRight size={13} className="text-white" />
                      </div>
                    </div>
                  </motion.div>
                )
              )}
            </div>

            {/* ── MOBILE: horizontal scroll strip ── */}
            <div className="md:hidden -mx-4 px-4 flex gap-3 overflow-x-auto pb-3 no-scrollbar snap-x snap-mandatory">
              {DESTINATIONS.map((d, i) => (
                <motion.div
                  key={d.name}
                  initial={{ opacity: 0, scale: 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/listings?location=${encodeURIComponent(d.name)}`)}
                  className="group cursor-pointer relative rounded-2xl overflow-hidden shrink-0 snap-start shadow-md"
                  style={{ width: '72vw', height: '250px' }}
                >
                  <img
                    src={d.image}
                    alt={d.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-2.5 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[9px] font-extrabold uppercase tracking-wider text-white">
                      {d.tag}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 flex justify-between items-end">
                    <div>
                      <p className="text-emerald-400 text-xs font-extrabold uppercase tracking-widest mb-0.5">
                        {d.properties} Properties
                      </p>
                      <h3 className="text-white font-extrabold text-xl tracking-tight">{d.name}</h3>
                      <p className="text-slate-300 text-xs font-medium mt-0.5">{d.desc}</p>
                    </div>
                    <div className="h-8 w-8 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:bg-emerald-500 transition-all shrink-0 ml-3">
                      <ArrowRight size={14} className="text-white" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom stat strip */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-10 grid grid-cols-3 gap-4 border border-slate-200/80 rounded-2xl bg-slate-50/80 px-6 py-5 shadow-sm"
            >
              {[
                { value: '6', label: 'Distinct territories' },
                { value: '100+', label: 'Verified properties' },
                { value: '100%', label: 'Personally inspected' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl md:text-3xl font-extrabold text-emerald-600">
                    {stat.value}
                  </p>
                  <p className="text-slate-500 text-[10px] md:text-xs font-extrabold uppercase tracking-wider mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── TRUST STRIP (CLEAN LIGHT AIRBNB STYLE) ── */}
        <section className="py-16 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: CheckCircle2,
                title: 'Verified Stays',
                desc: 'Every property is personally inspected by our team for absolute quality and safety.',
              },
              {
                icon: Compass,
                title: 'Local Secrets',
                desc: 'Access hidden beaches, secret clifftop spots, and cafes curated by native guides.',
              },
              {
                icon: Sparkles,
                title: 'Wayzza AI',
                desc: 'Plan your entire stay + vehicle combination in seconds with our intelligence engine.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group p-8 md:p-9 bg-white border border-slate-200/80 rounded-3xl hover:border-slate-300 hover:shadow-xl transition-all duration-300 shadow-sm"
              >
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-100/80 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                  <item.icon size={22} strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── PACKAGES PROMO (CLEAN LIGHT AIRBNB STYLE) ── */}
        <section className="py-16 md:py-20 px-4 sm:px-6 bg-slate-50/60 relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="rounded-3xl md:rounded-[40px] bg-white border border-slate-200/80 shadow-md overflow-hidden">
              <div className="flex flex-col md:flex-row items-center gap-0">
                {/* Image */}
                <div className="w-full md:w-1/2 h-64 md:h-80 relative overflow-hidden">
                  <img
                    src="/images/varkala_cliff.webp"
                    alt="Wayzza Travel Packages"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/40 md:to-white/70" />
                  <div className="absolute top-5 left-5 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white shadow-md">
                    <Sparkles size={10} /> Bundled Deals
                  </div>
                </div>
                {/* Text */}
                <div className="flex-1 p-8 md:p-12 space-y-5">
                  <p className="text-emerald-600 font-extrabold text-xs uppercase tracking-widest">
                    Curated Packages
                  </p>
                  <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                    Stay. Ride. Explore.{' '}
                    <span className="text-emerald-600 italic">All in one.</span>
                  </h2>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-md">
                    Skip separate planning. Our curated packages combine a verified villa, a
                    vehicle, and a local experience — at one bundled price.
                  </p>
                  <Link
                    to="/packages"
                    className="inline-flex items-center gap-2 bg-slate-900 text-white px-7 py-3.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider hover:bg-emerald-600 transition-all duration-300 shadow-md"
                  >
                    Browse Packages <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── AI PLANNER (CLEAN LIGHT AIRBNB STYLE) ── */}
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/50 text-slate-900 border-t border-b border-slate-100 relative overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] uppercase tracking-widest text-emerald-700 font-extrabold">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live AI Trip Planner
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-slate-900">
                  Plan your perfect getaway in seconds.
                </h2>
                <p className="max-w-2xl text-slate-500 font-medium text-base sm:text-lg leading-relaxed">
                  Type your travel mood, budget, and destination. The planner returns a curated
                  stay, vehicle, and local experience package instantly.
                </p>

                <div className="grid gap-4 grid-cols-3">
                  {[
                    { title: 'Fast response', value: '< 2s' },
                    { title: 'Verified results', value: '98%' },
                    { title: 'Trips planned', value: '500+' },
                  ].map((stat) => (
                    <div
                      key={stat.title}
                      className="rounded-2xl border border-slate-200/80 bg-white p-4 md:p-5 shadow-sm"
                    >
                      <p className="text-[10px] md:text-xs uppercase tracking-wider text-slate-400 font-extrabold">
                        {stat.title}
                      </p>
                      <p className="mt-1 md:mt-2 text-2xl md:text-3xl font-extrabold text-emerald-600">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate('/ai-trip-planner')}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 md:px-8 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white transition hover:bg-emerald-600 shadow-md"
                  >
                    Open AI Planner
                    <ArrowRight size={15} />
                  </button>
                  <button
                    onClick={handleSeeExample}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 md:px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                  >
                    See an example
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>

              {/* AI terminal mockup */}
              <div
                ref={exampleMockupRef}
                className="relative rounded-3xl md:rounded-[36px] border border-slate-200/80 bg-white p-5 md:p-6 shadow-xl"
              >
                <div className="absolute top-5 left-5 flex items-center gap-2" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="rounded-2xl border border-slate-200/60 bg-slate-50/50 p-4 pt-10">
                  <div className="text-xs uppercase tracking-widest text-emerald-600 font-extrabold mb-3">
                    Wayzza AI Trip Planner
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-4 shadow-sm">
                    <div className="bg-slate-50 rounded-2xl border border-emerald-100 p-3.5 text-slate-800">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 mb-1">
                        Example prompt
                      </p>
                      <p className="leading-relaxed text-slate-700 text-xs font-medium">
                        I want a quiet clifftop villa in Varkala for 3 nights, with a motorbike and
                        tips for hidden cafes. Budget around ₹15,000/night.
                      </p>
                    </div>

                    <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-3">
                      {[
                        { emoji: '🏠', title: 'Sea Cliff Retreat', detail: '₹12,500 / night' },
                        { emoji: '🏍️', title: 'Royal Enfield 350', detail: '₹850 / day' },
                        { emoji: '☕', title: 'Secret Café Trail', detail: '6 stops' },
                      ].map((item) => (
                        <div
                          key={item.title}
                          className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs"
                        >
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                            <span>{item.emoji}</span>
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                              Live
                            </span>
                          </div>
                          <p className="font-bold text-slate-900 text-xs truncate">{item.title}</p>
                          <p className="mt-0.5 text-[11px] text-slate-500 font-medium">
                            {item.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[
                      'Beachfront villa',
                      'Budget under ₹5k',
                      'Couples getaway',
                      'Solo adventure',
                    ].map((label) => (
                      <span
                        key={label}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 shadow-xs"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate('/ai-trip-planner')}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-white transition hover:bg-emerald-700 shadow-sm"
                  >
                    Plan it
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FAQ SECTION (COMPACT & CLEAN) ── */}
        <section className="py-12 md:py-16 px-4 sm:px-6 bg-slate-50 border-t border-slate-100">
          <div className="max-w-2xl mx-auto">
            <div className="text-center space-y-2 mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
                Help & Info
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {WAYZZA_FAQ.slice(0, 4).map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isOpen
                        ? 'bg-white border-emerald-500 shadow-md'
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
                    >
                      <span
                        className={`font-bold text-base transition-colors ${isOpen ? 'text-emerald-700' : 'text-slate-900'}`}
                      >
                        {faq.question}
                      </span>
                      <div
                        className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${isOpen ? 'bg-emerald-600 border-emerald-600 text-white rotate-180' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    <motion.div
                      initial={false}
                      animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 text-slate-500 text-sm font-medium leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <Link
                to="/faq"
                className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest inline-flex items-center gap-1.5"
              >
                View all FAQs <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER (PREMIUM CLEAN LIGHT AIRBNB STYLE) ── */}
        <footer className="bg-slate-50 border-t border-slate-200/80 pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-slate-900">
          <div className="max-w-7xl mx-auto space-y-14">
            {/* Top Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              {/* Brand & Newsletter Column */}
              <div className="lg:col-span-5 space-y-6">
                <div className="space-y-3">
                  <Link to="/" className="inline-block">
                    <img
                      src="/images/logo-light.svg"
                      alt="Wayzza"
                      className="h-10 md:h-12 w-auto object-contain"
                      loading="lazy"
                    />
                  </Link>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm">
                    Curating verified sanctuaries and high-performance mobility for the modern
                    explorer in Varkala, Kerala.
                  </p>
                </div>

                {/* Newsletter Box */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-sm space-y-4 max-w-md">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 block mb-0.5">
                      The Insider List
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900">
                      Join the Wayzza circle.
                    </h4>
                  </div>
                  <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      aria-label="Newsletter email"
                      required
                    />
                    <button
                      type="submit"
                      disabled={newsletterLoading}
                      className={`bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-sm shrink-0 flex items-center gap-1.5 ${newsletterLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                      aria-label="Subscribe to newsletter"
                    >
                      <span>Join</span>
                      <Send size={14} strokeWidth={2.5} />
                    </button>
                  </form>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Monthly sanctuaries. Zero spam. Private access.
                  </p>
                </div>
              </div>

              {/* Navigation Grid */}
              <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-12 pt-2">
                {/* Platform */}
                <div className="space-y-4">
                  <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    Platform
                  </h5>
                  <ul className="space-y-2.5">
                    {[
                      { name: 'Stays', to: '/listings?category=hotel' },
                      { name: 'Mobility', to: '/listings?category=bike' },
                      { name: 'Activities', to: '/experiences' },
                      { name: 'AI Planner', to: '/ai-trip-planner' },
                    ].map((link) => (
                      <li key={link.name}>
                        <Link
                          to={link.to}
                          className="text-xs font-medium text-slate-500 hover:text-emerald-600 transition-colors"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Company */}
                <div className="space-y-4">
                  <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    Company
                  </h5>
                  <ul className="space-y-2.5">
                    {[
                      { name: 'Our Story', to: '/about' },
                      { name: 'Partners', to: '/partner-register' },
                      { name: 'Privacy', to: '/privacy' },
                      { name: 'Support', to: '/support' },
                    ].map((link) => (
                      <li key={link.name}>
                        <Link
                          to={link.to}
                          className="text-xs font-medium text-slate-500 hover:text-emerald-600 transition-colors"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Connect */}
                <div className="col-span-2 sm:col-span-1 space-y-4">
                  <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    Connect
                  </h5>
                  <div className="flex gap-2">
                    {[
                      {
                        Icon: Instagram,
                        url: 'https://www.instagram.com/wayzza.live',
                        label: 'Instagram',
                      },
                      { Icon: Twitter, url: 'https://www.twitter.com/wayzza', label: 'Twitter' },
                      { Icon: Facebook, url: 'https://www.facebook.com/wayzza', label: 'Facebook' },
                    ].map(({ Icon, url, label }) => (
                      <a
                        key={label}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all shadow-xs"
                      >
                        <Icon size={16} />
                      </a>
                    ))}
                  </div>
                  <div className="pt-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                      General Enquiries
                    </span>
                    <a
                      href="mailto:hello@wayzza.live"
                      className="text-xs font-bold text-slate-800 hover:text-emerald-600 transition-colors block"
                    >
                      hello@wayzza.live
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
              <div className="flex items-center gap-4 text-slate-500 font-medium flex-wrap justify-center">
                <span>Wayzza © 2026</span>
                <span className="text-slate-300">•</span>
                <Link to="/privacy" className="hover:text-slate-900 transition-colors">
                  Privacy Policy
                </Link>
                <span className="text-slate-300">•</span>
                <Link to="/terms" className="hover:text-slate-900 transition-colors">
                  Terms of Service
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-medium text-xs">
                  Made with <span className="text-rose-500">❤️</span> in Varkala
                </span>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="flex items-center gap-1.5 text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 hover:text-slate-900 transition-all text-xs font-bold shadow-xs"
                  aria-label="Back to top"
                >
                  <Globe size={13} className="text-emerald-600" />
                  <span>Back to top</span>
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* ── Sample AI Trip Itinerary Modal ── */}
      {showExampleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-[32px] p-6 sm:p-8 max-w-xl w-full text-slate-900 shadow-2xl relative border border-slate-100 my-8"
          >
            <button
              onClick={() => setShowExampleModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] uppercase font-black tracking-widest mb-3">
              <Sparkles size={12} /> Sample AI Generated Package
            </div>

            <h3 className="text-2xl font-black text-slate-950 tracking-tight">
              Varkala Clifftop Dream Package
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              3 Nights / 4 Days • Target Budget: ₹15,000 / night • Vibe: Relax & Unwind
            </p>

            {/* Itinerary Timeline */}
            <div className="mt-6 space-y-3.5 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                <div className="font-extrabold text-emerald-600 uppercase tracking-wider text-[10px]">
                  Day 1 • Arrival & Coastal Mobility
                </div>
                <div className="font-bold text-slate-900 text-sm">Check-in at Sea Cliff Retreat</div>
                <p className="text-slate-600 leading-relaxed">
                  Pickup Royal Enfield Classic 350 at Trivandrum. Check into ocean-view clifftop villa, relax with welcome coconut drink.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                <div className="font-extrabold text-emerald-600 uppercase tracking-wider text-[10px]">
                  Day 2 • Secret Cafes & Sunset Surf
                </div>
                <div className="font-bold text-slate-900 text-sm">Cliff Cafe Trail & Black Beach Surf</div>
                <p className="text-slate-600 leading-relaxed">
                  Guided 2-hr surfing lesson at Black Beach, followed by lunch at hidden clifftop cafes. Evening sunset ride along North Cliff.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                <div className="font-extrabold text-emerald-600 uppercase tracking-wider text-[10px]">
                  Day 3 • Rejuvenation & Sunset Cruise
                </div>
                <div className="font-bold text-slate-900 text-sm">Ayurvedic Spa & Catamaran Cruise</div>
                <p className="text-slate-600 leading-relaxed">
                  2-hour full body authentic Kerala Ayurvedic massage treatment. Private Catamaran sunset cruise with fresh canapes.
                </p>
              </div>
            </div>

            {/* Included breakdown */}
            <div className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Estimated Total</span>
                <span className="text-emerald-700 font-black text-lg">₹42,500 <span className="text-xs font-normal text-slate-500">all-inclusive</span></span>
              </div>
              <button
                onClick={() => {
                  setShowExampleModal(false);
                  navigate('/ai-trip-planner');
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                Customize Your Own Package →
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </WayzzaLayout>
  );
}
