import { useEffect, useRef, useState } from 'react';
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
  Award,
  Bike,
  Car,
  Home,
  Instagram,
  Twitter,
  Facebook,
  CheckCircle2,
  MessageSquare,
  Send,
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
    className: 'md:col-span-8 md:row-span-2 h-[400px] md:h-full',
  },
  {
    name: 'Edava',
    properties: '20+ Properties',
    image: '/images/varkala_edava.png',
    className: 'md:col-span-4 h-[300px] md:h-[284px]',
  },
  {
    name: 'Odayam',
    properties: '15+ Properties',
    image: '/images/varkala_odayam.png',
    className: 'md:col-span-4 h-[300px] md:h-[284px]',
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

  // Newsletter State
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
    } catch (err) {
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



  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set('category', tab);
    if (search) params.set('location', search);
    if (checkIn) params.set('start', checkIn);
    if (checkOut) params.set('end', checkOut);
    if (guests) params.set('guests', guests);
    navigate(`/listings?${params.toString()}`);
  };

  const trendingList = listings.slice(0, 8);

  return (
    <WayzzaLayout noPadding hideFooter>
      <SEO
        title="Curated Sanctuaries & Elite Mobility"
        breadcrumb={[
          { name: 'Home', url: 'https://wayza-app.vercel.app' },
        ]}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'Wayzza',
          description: 'Curated sanctuaries and elite mobility for digital nomads in Varkala',
          url: 'https://wayza-app.vercel.app',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Varkala',
            addressLocality: 'Varkala',
            addressRegion: 'Kerala',
            postalCode: '695141',
            addressCountry: 'IN',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: '8.7379',
            longitude: '76.7269',
          },
        }}
      />
      <div className="bg-white font-sans text-slate-900 selection:bg-emerald-50 selection:text-emerald-900 leading-relaxed antialiased">
        {/* ════ SECTION: PREMIUM HERO ════ */}
        <header className="relative h-[85vh] min-h-[620px] md:min-h-[700px] flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <motion.div
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2.5, ease: 'easeOut' }}
              className="w-full h-full"
            >
              <img
                src="/images/varkala_hero.png"
                alt="Luxury Sanctuary"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white" />
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 text-center space-y-8 md:space-y-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 md:space-y-6"
            >
              <h1 className="text-4xl md:text-8xl font-bold tracking-tighter text-white leading-[0.95] md:leading-[0.9] drop-shadow-2xl">
                Escape the ordinary <br />
                <span className="text-emerald-400 italic">gracefully.</span>
              </h1>
              <p className="text-sm md:text-xl font-medium text-white/90 max-w-2xl mx-auto drop-shadow-lg leading-relaxed px-4 md:px-0">
                Handpicked sanctuaries and high-performance mobility curated{' '}
                <br className="hidden md:block" /> for the modern explorer.
              </p>
            </motion.div>

            {/* PILL SEARCH ORCHESTRATOR */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-5xl mx-auto w-full px-2 md:px-4"
            >
              <div className="bg-white/90 backdrop-blur-2xl rounded-[32px] md:rounded-[40px] p-2 md:p-3 shadow-[0_40px_100px_rgba(0,0,0,0.15)] border border-white/50 flex flex-col md:flex-row items-center gap-1 md:gap-2">
                {/* Location */}
                <div className="flex-[1.5] w-full px-5 md:px-10 py-3 md:py-5 rounded-[24px] md:rounded-[32px] hover:bg-slate-50/50 transition-all text-left cursor-pointer group">
                  <p className="text-[9px] md:text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-1 group-hover:text-emerald-600 transition-colors">
                    Destinations
                  </p>
                  <input
                    placeholder="Where to go?"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent border-none outline-none font-bold text-slate-900 text-base md:text-lg p-0 placeholder:text-slate-300"
                  />
                </div>

                <div className="hidden md:block w-px h-12 bg-slate-200/50" />

                {/* Check In/Out */}
                <div className="flex-1 w-full px-5 md:px-10 py-3 md:py-5 rounded-[24px] md:rounded-[32px] hover:bg-slate-50/50 transition-all text-left cursor-pointer group">
                  <p className="text-[9px] md:text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-1 group-hover:text-emerald-600 transition-colors">
                    Timeframe
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="bg-transparent border-none outline-none font-bold text-slate-900 text-xs md:text-sm p-0 w-24 md:w-28 cursor-pointer"
                    />
                    <span className="text-slate-300">-</span>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="bg-transparent border-none outline-none font-bold text-slate-900 text-xs md:text-sm p-0 w-24 md:w-28 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="hidden md:block w-px h-12 bg-slate-200/50" />

                {/* Guests */}
                <div className="flex-1 w-full px-5 md:px-10 py-3 md:py-5 rounded-[24px] md:rounded-[32px] hover:bg-slate-50/50 transition-all text-left cursor-pointer group">
                  <p className="text-[9px] md:text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-1 group-hover:text-emerald-600 transition-colors">
                    Guests
                  </p>
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-slate-400" />
                    <input
                      type="number"
                      min="1"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="w-full bg-transparent border-none outline-none font-bold text-slate-900 text-base md:text-lg p-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  className="w-full md:w-auto bg-slate-900 text-white px-8 md:px-10 py-4 md:py-6 rounded-[24px] md:rounded-[32px] shadow-2xl shadow-slate-900/20 transition-all hover:bg-emerald-600 hover:scale-[1.01] active:scale-95 group flex items-center justify-center gap-3 md:gap-4 mt-2 md:mt-0"
                >
                  <Search
                    size={20}
                    strokeWidth={3}
                    className="transition-transform group-hover:rotate-12"
                  />
                  <span className="font-black uppercase tracking-[0.3em] text-[10px] md:text-[11px]">Explore</span>
                </button>
              </div>
            </motion.div>

          </div>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 border border-slate-300/30 rounded-full p-2"
          >
            <div className="w-1 h-3 bg-slate-300 rounded-full" />
          </motion.div>
        </header>


        {/* ════ MOBILE-LIKE PROMO + DESTINATIONS ════ */}
        <section ref={moreListingsRef} className="px-6 max-w-7xl mx-auto space-y-8 pb-10">
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row items-stretch gap-4 p-5">
              <div className="flex-1 min-w-0">
                <p className="text-emerald-500 uppercase tracking-[0.35em] text-[10px] font-black mb-3">
                  {PROMO_OFFER.title}
                </p>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 mb-3">
                  {PROMO_OFFER.heading}
                </h2>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
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
              <div className="w-full sm:w-56 rounded-[28px] overflow-hidden shadow-inner">
                <img
                  src={PROMO_OFFER.image}
                  alt="Getaway deal"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-slate-950">Featured listings</h3>
                <p className="text-sm text-slate-500 font-medium">Explore select stays curated for mobile discovery.</p>
              </div>
              <Link
                to="/listings"
                className="text-xs uppercase font-black tracking-[0.3em] text-slate-400 hover:text-slate-900"
              >
                View all
              </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
              {loading ? (
                [1, 2, 3].map((index) => (
                  <div key={index} className="min-w-[280px] snap-start">
                    <WayzzaSkeleton className="h-[360px] rounded-[32px]" />
                  </div>
                ))
              ) : (
                trendingList.map((listing) => (
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
                ))
              )}
            </div>
          </div>

          <div className="space-y-10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-slate-950">More listings</h3>
                <p className="text-sm text-slate-500 font-medium">Browse more curated stays designed for your next trip.</p>
              </div>
              <Link
                to="/listings"
                className="text-xs uppercase font-black tracking-[0.3em] text-slate-400 hover:text-slate-900"
              >
                Browse all
              </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
              {loading ? (
                [1, 2, 3].map((index) => (
                  <div key={index} className="min-w-[280px] snap-start">
                    <WayzzaSkeleton className="h-[360px] rounded-[32px]" />
                  </div>
                ))
              ) : (
                trendingList.slice(0, 6).map((listing) => (
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
                ))
              )}
            </div>
          </div>
        </section>

        {/* ════ DESTINATIONS MASONRY ════ */}
        <section className="py-32 bg-slate-50 px-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent" />
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-end justify-between gap-10 mb-20">
              <div className="space-y-4">
                <p className="text-emerald-500 font-black uppercase tracking-[0.4em] text-[10px]">
                  Territories
                </p>
                <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-slate-900">
                  Where we operate.
                </h2>
              </div>
              <p className="text-slate-400 font-medium max-w-sm text-lg leading-relaxed">
                Our network spans unique ecosystems, each personally verified for soul and security.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {DESTINATIONS.map((d, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`group cursor-pointer relative rounded-[56px] overflow-hidden shadow-2xl-soft transition-all duration-700 hover:shadow-3xl ${d.className}`}
                  onClick={() => navigate(`/listings?location=${d.name}`)}
                >
                  <img
                    src={d.image}
                    alt={d.name}
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 group-hover:rotate-1"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase font-black tracking-[0.3em] text-emerald-400">
                        {d.properties}
                      </p>
                      <h3 className="font-bold text-4xl text-white tracking-tight">{d.name}</h3>
                    </div>
                    <div className="w-16 h-16 rounded-[24px] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-emerald-400 transition-all duration-500">
                      <ArrowRight
                        size={24}
                        className="text-white group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ════ TRUST STRIP ════ */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: CheckCircle2,
                title: 'Verified Stays',
                desc: 'Every property is personally inspected by our team for absolute quality.',
                color: 'emerald',
              },
              {
                icon: Compass,
                title: 'Local Secrets',
                desc: 'Access hidden beaches and cafes curated by our native guides.',
                color: 'blue',
              },
              {
                icon: Sparkles,
                title: 'Wayzza AI',
                desc: 'Plan your entire stay + vehicle combination in seconds with our AI engine.',
                color: 'indigo',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-10 bg-white border border-slate-100 rounded-[48px] hover:border-slate-300 hover:shadow-2xl-soft transition-all duration-500"
              >
                <div
                  className={`w-16 h-16 bg-slate-50 rounded-[24px] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}
                >
                  <item.icon size={28} strokeWidth={1.5} className="text-slate-900" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ════ SECTION: AI TRIP PLANNER ════ */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#06110d] text-white overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[5%] w-[45%] h-[65%] bg-emerald-500/10 blur-[130px] rounded-full" />
            <div className="absolute bottom-0 right-[12%] w-[38%] h-[45%] bg-emerald-700/10 blur-[110px] rounded-full" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.18),transparent_45%)]" />
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
                  LIVE AI TRIP PLANNER
                </div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-white">
                  Plan your perfect getaway in seconds.
                </h2>
                <p className="max-w-2xl text-slate-300 text-base sm:text-lg leading-8">
                  Type your travel mood, budget, and destination. The planner returns a curated stay,
                  vehicle, and local experience package instantly.
                </p>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { title: 'Fast response', value: '< 2s' },
                    { title: 'Verified results', value: '98%' },
                    { title: 'Trips planned', value: '500+' },
                  ].map((stat) => (
                    <div key={stat.title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                      <p className="text-sm uppercase tracking-[0.35em] text-slate-400 font-semibold">
                        {stat.title}
                      </p>
                      <p className="mt-3 text-3xl font-black text-emerald-300">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => navigate('/ai-trip-planner')}
                    className="inline-flex items-center justify-center gap-3 rounded-3xl bg-emerald-500 px-8 py-4 text-sm font-black uppercase tracking-[0.35em] text-slate-950 transition hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
                  >
                    Open AI Planner
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => navigate('/ai-trip-planner')}
                    className="inline-flex items-center justify-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-bold uppercase tracking-[0.35em] text-white transition hover:border-emerald-400 hover:bg-white/10"
                  >
                    Explore example plan
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              <div className="relative rounded-[44px] border border-white/10 bg-slate-900/95 p-6 shadow-[0_35px_100px_rgba(0,0,0,0.45)]">
                <div className="absolute top-5 left-5 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-5 pt-10">
                  <div className="text-sm uppercase tracking-[0.35em] text-emerald-300 font-bold mb-4">
                    Wayzza AI Trip Planner
                  </div>
                  <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 space-y-6">
                    <div className="bg-slate-950/80 rounded-3xl border border-emerald-500/10 p-5 text-slate-100">
                      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-300 mb-3">
                        Example prompt
                      </p>
                      <p className="leading-7 text-slate-200">
                        I want a quiet clifftop villa in Varkala for 3 nights, with a motorbike and tips for hidden cafes. Budget around ₹15,000/night.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      {[
                        { emoji: '🏡', title: 'Sea Cliff Retreat', detail: '₹12,500 / night' },
                        { emoji: '🏍️', title: 'Royal Enfield 350', detail: '₹850 / day' },
                        { emoji: '☕', title: 'Secret Café Trail', detail: '6 stops' },
                      ].map((item) => (
                        <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
                            <span>{item.emoji}</span>
                            <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] uppercase tracking-[0.35em] text-emerald-300">
                              Live
                            </span>
                          </div>
                          <p className="mt-4 font-semibold text-white">{item.title}</p>
                          <p className="mt-2 text-sm text-slate-400">{item.detail}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-4">
                      <div className="flex items-center gap-2 text-sm text-emerald-300 font-semibold uppercase tracking-[0.35em] mb-3">
                        <CheckCircle2 size={16} /> Fast planning
                      </div>
                      <p className="text-sm text-slate-400 leading-6">
                        One click opens the planner with real AI-powered recommendations for stays, cars, and experiences.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-5">
                  <div className="flex flex-wrap gap-2">
                    {['Beachfront villa', 'Budget under ₹5k', 'Couples getaway', 'Solo adventure'].map((label) => (
                      <span key={label} className="rounded-full border border-white/10 bg-slate-950/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-200">
                        {label}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate('/ai-trip-planner')}
                    className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-3xl bg-emerald-500 px-6 py-4 text-sm font-black uppercase tracking-[0.35em] text-slate-950 transition hover:bg-emerald-400"
                  >
                    Plan it
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <footer className="bg-slate-950 pt-32 pb-12 px-6 overflow-hidden relative border-t border-white/5">
          {/* Atmospheric Glows */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-900/5 blur-[100px] rounded-full pointer-events-none" />

          {/* Massive Background Watermark */}
          <div className="absolute -bottom-10 -right-20 text-[18vw] font-black text-white/[0.02] select-none pointer-events-none uppercase tracking-tighter leading-none">
            Varkala
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-32">
              {/* Brand Column */}
              <div className="md:col-span-5 space-y-10">
                <div className="space-y-6">
                  <h2 className="text-4xl font-black tracking-tighter text-white uppercase">
                    Wayzza<span className="text-emerald-500">.</span>
                  </h2>
                  <p className="text-white/40 text-lg font-medium leading-relaxed max-w-sm">
                    Curating verified sanctuaries and high-performance mobility for the modern
                    explorer.
                  </p>
                </div>

                {/* Premium Newsletter invitation */}
                <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] space-y-6 max-w-md group hover:border-emerald-500/30 transition-all duration-500">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
                      The Insider List
                    </p>
                    <h4 className="text-xl font-bold text-white">Join the Wayzza circle.</h4>
                  </div>
                  <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Your email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={newsletterLoading}
                      className={`bg-emerald-500 text-slate-950 p-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20 ${newsletterLoading ? 'opacity-70 cursor-not-allowed hover:bg-emerald-500' : 'hover:bg-emerald-400'}`}
                    >
                      <Send size={18} strokeWidth={3} />
                    </button>
                  </form>
                  <p className="text-[10px] text-white/20 font-medium">
                    Monthly sanctuaries. Zero spam. Private access.
                  </p>
                </div>
              </div>

              {/* Links Grid */}
              <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
                <div className="space-y-8">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                    Platform
                  </h5>
                  <ul className="space-y-4">
                    {['Stays', 'Mobility', 'Secrets', 'AI Planner'].map((l) => (
                      <li key={l}>
                        <Link
                          to="/listings"
                          className="text-sm font-bold text-white/40 hover:text-emerald-400 transition-all hover:translate-x-1 inline-block uppercase tracking-widest"
                        >
                          {l}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-8">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                    Company
                  </h5>
                  <ul className="space-y-4">
                    {['Our Story', 'Partners', 'Careers', 'Support'].map((l) => (
                      <li key={l}>
                        <Link
                          to="/about"
                          className="text-sm font-bold text-white/40 hover:text-emerald-400 transition-all hover:translate-x-1 inline-block uppercase tracking-widest"
                        >
                          {l}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-8">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                    Connect
                  </h5>
                  <div className="flex gap-4">
                    {[Instagram, Twitter, Facebook].map((Icon, i) => (
                      <a
                        key={i}
                        href="#"
                        className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-emerald-400 hover:border-emerald-500/50 hover:-translate-y-1 transition-all"
                      >
                        <Icon size={20} />
                      </a>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">
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

            {/* Bottom Bar */}
            <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                <span>Wayzza © 2026</span>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy
                </Link>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms
                </Link>
              </div>

              <div className="flex items-center gap-12">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="px-6 py-3 bg-white/[0.03] border border-white/5 rounded-full flex items-center gap-3"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                    Made with <span className="text-rose-500 animate-pulse">❤️</span> in Varkala
                  </span>
                </motion.div>
                <div className="hidden md:flex items-center gap-4 text-white/20 text-[10px] font-black uppercase tracking-widest">
                  <Globe size={14} className="text-emerald-500/50" />
                  <span>Global Gateway</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </WayzzaLayout>
  );
}
