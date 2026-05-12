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
  Bike,
  Car,
  Home,
  Instagram,
  Twitter,
  Facebook,
  CheckCircle2,
  Send,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
} from 'lucide-react';

import { api } from '../../utils/api.js';
import { fixImg } from '../../utils/image.js';
import { useToast } from '../../ToastContext.jsx';
import SEO from '../../components/SEO.jsx';

const CATEGORIES = [
  { label: 'Villas', key: 'hotel', icon: Home },
  { label: 'Bikes', key: 'bike', icon: Bike },
  { label: 'Cars', key: 'car', icon: Car },
  { label: 'Secrets', key: 'experience', icon: Sparkles },
];

const DESTINATIONS = [
  {
    name: 'Varkala Cliff',
    properties: '45+ Properties',
    image: '/images/varkala_cliff.png',
    className: 'md:col-span-8 md:row-span-2 h-[300px] md:h-full',
  },
  {
    name: 'Edava',
    properties: '20+ Properties',
    image: '/images/varkala_edava.png',
    className: 'md:col-span-4 h-[220px] md:h-[284px]',
  },
  {
    name: 'Odayam',
    properties: '15+ Properties',
    image: '/images/varkala_odayam.png',
    className: 'md:col-span-4 h-[220px] md:h-[284px]',
  },
];

const PROMO_OFFER = {
  title: 'Offers',
  subtitle: 'Promotions, deals and special offers for you',
  label: 'No catch. Just getaways.',
  heading: 'Book a Getaway Deal',
  text: 'At least 15% off select stays.',
  button: 'Save on your next trip',
  image: '/images/varkala_cliff.png',
};

function scrollCarousel(id, dir) {
  const el = document.getElementById(id);
  if (el) el.scrollBy({ left: dir * 300, behavior: 'smooth' });
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('hotel');
  const [search, setSearch] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const moreListingsRef = useRef(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);

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
    setLoading(true);
    api
      .getListings({ category: tab, limit: 8 })
      .then((data) => {
        const list = data.rows || data;
        if (Array.isArray(list)) setListings(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tab]);

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
        title="Escape the Ordinary"
        description="Handpicked clifftop villas, Royal Enfield rentals, and hidden local secrets curated for the modern explorer in Varkala, Kerala."
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
        faq={[
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
              'You can reach Wayzza support by email at stay@wayzza.live or by phone at +91 80892 22444. Support is available 24/7 for all booking-related enquiries.',
          },
          {
            question: 'Are Wayzza listings verified?',
            answer:
              'Yes. Every property, vehicle, and experience listed on Wayzza is manually verified by the Wayzza team to ensure it meets quality, safety, and authenticity standards before being published on the platform.',
          },
        ]}
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
                src="/images/varkala_hero.png"
                alt="Luxury Sanctuary in Varkala"
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
                        style={{ colorScheme: 'light', color: checkOut ? '#0f172a' : 'transparent' }}
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
          <div className="bg-white rounded-[24px] md:rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row items-stretch gap-4 p-5">
              <div className="flex-1 min-w-0">
                <p className="text-emerald-500 uppercase tracking-[0.35em] text-[11px] font-black mb-3">
                  {PROMO_OFFER.title}
                </p>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 mb-3">
                  {PROMO_OFFER.heading}
                </h2>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-4">
                  {PROMO_OFFER.text}
                </p>
                <p className="text-xs uppercase tracking-[0.3em] font-black text-slate-400 mb-4">
                  {PROMO_OFFER.label}
                </p>
                <button
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-950 text-white px-5 py-3 text-sm font-black uppercase tracking-[0.22em] shadow-lg shadow-slate-950/10 transition hover:bg-emerald-600"
                  onClick={() => navigate('/listings')}
                >
                  {PROMO_OFFER.button}
                </button>
              </div>
              <div className="w-full sm:w-56 h-44 sm:h-auto rounded-[20px] overflow-hidden">
                <img
                  src={PROMO_OFFER.image}
                  alt="Getaway deal"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

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
                    <div key={i} className="min-w-[280px] snap-start">
                      <WayzzaSkeleton className="h-[360px] rounded-[32px]" />
                    </div>
                  ))
                : trendingList.map((listing) => (
                    <div key={listing._id} className="min-w-[280px] snap-start">
                      <WayzzaHotelItem
                        hotel={{
                          id: listing._id,
                          name: listing.title,
                          location: listing.location || 'Premium stay',
                          price: listing.price,
                          image: fixImg(listing.image),
                          wifiSpeed: listing.wifiSpeed || 0,
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
                    <div key={i} className="min-w-[280px] snap-start">
                      <WayzzaSkeleton className="h-[360px] rounded-[32px]" />
                    </div>
                  ))
                : trendingList.slice(0, 6).map((listing) => (
                    <div key={listing._id} className="min-w-[280px] snap-start">
                      <WayzzaHotelItem
                        hotel={{
                          id: listing._id,
                          name: listing.title,
                          location: listing.location || 'Premium stay',
                          price: listing.price,
                          image: fixImg(listing.image),
                          wifiSpeed: listing.wifiSpeed || 0,
                        }}
                      />
                    </div>
                  ))}
            </div>
          </div>
        </section>

        {/* ── DESTINATIONS MASONRY ── */}
        <section className="py-20 md:py-32 bg-slate-50 px-4 sm:px-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12 md:mb-20">
              <div className="space-y-3">
                <p className="text-emerald-500 font-black uppercase tracking-[0.4em] text-[11px]">
                  Territories
                </p>
                <h2 className="text-3xl md:text-6xl font-bold tracking-tighter text-slate-900">
                  Where we operate.
                </h2>
              </div>
              <p className="text-slate-400 font-medium max-w-sm text-base md:text-lg leading-relaxed">
                Our network spans unique ecosystems, each personally verified for soul and security.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
              {DESTINATIONS.map((d, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`group cursor-pointer relative rounded-[32px] md:rounded-[56px] overflow-hidden shadow-xl transition-all duration-700 hover:shadow-2xl ${d.className}`}
                  onClick={() => navigate(`/listings?location=${d.name}`)}
                >
                  <img
                    src={d.image}
                    alt={d.name}
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-6 md:bottom-12 left-6 md:left-12 right-6 md:right-12 flex justify-between items-end">
                    <div className="space-y-1 md:space-y-2">
                      <p className="text-[11px] uppercase font-black tracking-[0.3em] text-emerald-400">
                        {d.properties}
                      </p>
                      <h3 className="font-bold text-2xl md:text-4xl text-white tracking-tight">
                        {d.name}
                      </h3>
                    </div>
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-[20px] md:rounded-[24px] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center group-hover:bg-emerald-500 transition-all duration-500 shrink-0">
                      <ArrowRight
                        size={20}
                        className="text-white group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TRUST STRIP ── */}
        <section className="py-20 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: CheckCircle2,
                title: 'Verified Stays',
                desc: 'Every property is personally inspected by our team for absolute quality.',
              },
              {
                icon: Compass,
                title: 'Local Secrets',
                desc: 'Access hidden beaches and cafes curated by our native guides.',
              },
              {
                icon: Sparkles,
                title: 'Wayzza AI',
                desc: 'Plan your entire stay + vehicle combination in seconds with our AI engine.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 md:p-10 bg-white border border-slate-100 rounded-[32px] md:rounded-[48px] hover:border-slate-300 hover:shadow-xl transition-all duration-500"
              >
                <div className="w-14 h-14 bg-slate-50 rounded-[20px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <item.icon size={26} strokeWidth={1.5} className="text-slate-900" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── AI PLANNER ── */}
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-[#06110d] text-white overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[5%] w-[45%] h-[65%] bg-emerald-500/10 blur-[130px] rounded-full" />
            <div className="absolute bottom-0 right-[12%] w-[38%] h-[45%] bg-emerald-700/10 blur-[110px] rounded-full" />
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[11px] uppercase tracking-[0.35em] text-emerald-300 font-black">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live AI Trip Planner
                </div>
                <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-white">
                  Plan your perfect getaway in seconds.
                </h2>
                <p className="max-w-2xl text-slate-300 text-base sm:text-lg leading-8">
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
                      className="rounded-3xl border border-white/10 bg-white/5 p-4 md:p-5"
                    >
                      <p className="text-[10px] md:text-sm uppercase tracking-[0.35em] text-slate-400 font-semibold">
                        {stat.title}
                      </p>
                      <p className="mt-2 md:mt-3 text-2xl md:text-3xl font-black text-emerald-300">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate('/ai-trip-planner')}
                    className="inline-flex items-center justify-center gap-3 rounded-3xl bg-emerald-500 px-6 md:px-8 py-4 text-sm font-black uppercase tracking-[0.35em] text-slate-950 transition hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
                  >
                    Open AI Planner
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => navigate('/ai-trip-planner')}
                    className="inline-flex items-center justify-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-6 md:px-8 py-4 text-sm font-bold uppercase tracking-[0.35em] text-white transition hover:border-emerald-400 hover:bg-white/10"
                  >
                    See an example
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* AI terminal mockup */}
              <div className="relative rounded-[32px] md:rounded-[44px] border border-white/10 bg-slate-900/95 p-5 md:p-6 shadow-[0_35px_100px_rgba(0,0,0,0.45)]">
                <div className="absolute top-5 left-5 flex items-center gap-2" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="rounded-[24px] border border-white/10 bg-slate-950/80 p-4 pt-10">
                  <div className="text-sm uppercase tracking-[0.35em] text-emerald-300 font-bold mb-4">
                    Wayzza AI Trip Planner
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-5 space-y-5">
                    <div className="bg-slate-950/80 rounded-3xl border border-emerald-500/10 p-4 text-slate-100">
                      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-300 mb-2">
                        Example prompt
                      </p>
                      <p className="leading-7 text-slate-200 text-sm">
                        I want a quiet clifftop villa in Varkala for 3 nights, with a motorbike and
                        tips for hidden cafes. Budget around ₹15,000/night.
                      </p>
                    </div>

                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                      {[
                        { emoji: '🏠', title: 'Sea Cliff Retreat', detail: '₹12,500 / night' },
                        { emoji: '🏍️', title: 'Royal Enfield 350', detail: '₹850 / day' },
                        { emoji: '☕', title: 'Secret Café Trail', detail: '6 stops' },
                      ].map((item) => (
                        <div
                          key={item.title}
                          className="rounded-2xl border border-white/10 bg-white/5 p-4"
                        >
                          <div className="flex items-center justify-between text-sm text-slate-300 mb-3">
                            <span>{item.emoji}</span>
                            <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] uppercase tracking-[0.3em] text-emerald-300">
                              Live
                            </span>
                          </div>
                          <p className="font-semibold text-white text-sm">{item.title}</p>
                          <p className="mt-1 text-xs text-slate-400">{item.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[
                      'Beachfront villa',
                      'Budget under ₹5k',
                      'Couples getaway',
                      'Solo adventure',
                    ].map((label) => (
                      <span
                        key={label}
                        className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-200"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate('/ai-trip-planner')}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-3xl bg-emerald-500 px-6 py-4 text-sm font-black uppercase tracking-[0.35em] text-slate-950 transition hover:bg-emerald-400"
                  >
                    Plan it
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="bg-slate-950 pt-20 md:pt-32 pb-12 px-4 sm:px-6 overflow-hidden relative border-t border-white/5">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-900/5 blur-[100px] rounded-full pointer-events-none" />
          <div
            className="absolute -bottom-10 -right-20 text-[18vw] font-black text-white/[0.01] select-none pointer-events-none uppercase tracking-tighter leading-none"
            aria-hidden="true"
          >
            Wayzza
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 mb-16 md:mb-32">
              {/* Brand column */}
              <div className="md:col-span-5 space-y-8">
                <div className="space-y-4">
                  <Link to="/" className="flex items-center justify-center md:justify-start">
                    <img
                      src="/images/logo-dark.svg"
                      alt="Wayzza"
                      className="h-10 md:h-14 w-auto object-contain"
                      loading="lazy"
                    />
                  </Link>
                  <p className="text-white/40 text-base font-medium leading-relaxed max-w-sm text-center md:text-left">
                    Curating verified sanctuaries and high-performance mobility for the modern
                    explorer.
                  </p>
                </div>

                {/* Newsletter */}
                <div className="p-6 md:p-8 bg-white/5 border border-white/10 rounded-[24px] md:rounded-[32px] space-y-5 max-w-md hover:border-emerald-500/30 transition-all duration-500">
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-400">
                      The Insider List
                    </p>
                    <h4 className="text-lg md:text-xl font-bold text-white">
                      Join the Wayzza circle.
                    </h4>
                  </div>
                  <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Your email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                      aria-label="Newsletter email"
                      required
                    />
                    <button
                      type="submit"
                      disabled={newsletterLoading}
                      className={`bg-emerald-500 text-slate-950 p-3 rounded-2xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20 shrink-0 ${newsletterLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-emerald-400'}`}
                      aria-label="Subscribe to newsletter"
                    >
                      <Send size={18} strokeWidth={3} />
                    </button>
                  </form>
                  <p className="text-[11px] text-white/20 font-medium">
                    Monthly sanctuaries. Zero spam. Private access.
                  </p>
                </div>
              </div>

              {/* Links grid */}
              <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
                <div className="space-y-6">
                  <h5 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20">
                    Platform
                  </h5>
                  <ul className="space-y-3">
                    {[
                      { name: 'Stays', to: '/listings' },
                      { name: 'Mobility', to: '/listings' },
                      { name: 'Secrets', to: '/experiences' },
                      { name: 'AI Planner', to: '/ai-trip-planner' },
                    ].map((link) => (
                      <li key={link.name}>
                        <Link
                          to={link.to}
                          className="text-sm font-bold text-white/40 hover:text-emerald-400 transition-all hover:translate-x-1 inline-block uppercase tracking-widest"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-6">
                  <h5 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20">
                    Company
                  </h5>
                  <ul className="space-y-3">
                    {[
                      { name: 'Our Story', to: '/about' },
                      { name: 'Partners', to: '/partner-register' },
                      { name: 'Privacy', to: '/privacy' },
                      { name: 'Support', to: '/support' },
                    ].map((link) => (
                      <li key={link.name}>
                        <Link
                          to={link.to}
                          className="text-sm font-bold text-white/40 hover:text-emerald-400 transition-all hover:translate-x-1 inline-block uppercase tracking-widest"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="col-span-2 md:col-span-1 space-y-6">
                  <h5 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20">
                    Connect
                  </h5>
                  <div className="flex gap-3">
                    {[
                      {
                        Icon: Instagram,
                        url: 'https://www.instagram.com/wayzza',
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
                        className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-emerald-400 hover:border-emerald-500/50 hover:-translate-y-1 transition-all"
                      >
                        <Icon size={18} />
                      </a>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-white/20 font-black uppercase tracking-widest">
                      General Enquiries
                    </p>
                    <a
                      href="mailto:hello@wayzza.live"
                      className="text-sm font-bold text-white hover:text-emerald-400 transition-colors"
                    >
                      hello@wayzza.live
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-wrap justify-center gap-6 text-[11px] font-black uppercase tracking-[0.3em] text-white/20">
                <span>Wayzza © 2026</span>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy
                </Link>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms
                </Link>
              </div>
              <div className="flex items-center gap-4 flex-wrap justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="px-5 py-2.5 bg-white/[0.03] border border-white/5 rounded-full flex items-center gap-2"
                >
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">
                    Made with <span className="text-rose-500">❤️</span> in Varkala
                  </span>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="flex items-center gap-3 text-white/40 text-[11px] font-black uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all"
                  aria-label="Back to top"
                >
                  <Globe size={13} className="text-emerald-500" />
                  <span>Global Gateway</span>
                </motion.button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </WayzzaLayout>
  );
}
