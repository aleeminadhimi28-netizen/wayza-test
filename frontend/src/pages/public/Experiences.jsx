import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { WayzzaLayout } from '../../WayzzaUI.jsx';
import {
  Anchor,
  ArrowRight,
  Star,
  MapPin,
  Sparkles,
  Zap,
  Globe,
  Music,
  Wind,
  Waves,
  Coffee,
  Clock,
  Users,
  ChevronRight,
  Heart,
  Camera,
  Utensils,
} from 'lucide-react';
import SEO from '../../components/SEO.jsx';

// ── Curated experience data ────────────────────────────────────────────────────

const EXPERIENCES = [
  {
    id: 'cliff-yoga',
    cat: 'wellness',
    title: 'Sunrise Cliff Yoga',
    location: 'North Cliff, Varkala',
    duration: '90 min',
    groupSize: 'Up to 10',
    price: 799,
    rating: 4.9,
    reviews: 214,
    badge: 'Top Rated',
    badgeColor: '#f59e0b',
    desc: 'Start your morning 50 metres above the Arabian Sea. Expert-led Hatha yoga session on the cliff edge with panoramic ocean views.',
    img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=80',
    tags: ['Yoga', 'Sunrise', 'Meditative'],
  },
  {
    id: 'backwater-kayak',
    cat: 'adventure',
    title: 'Backwater Kayak Trail',
    location: 'Varkala Backwaters',
    duration: '3 hrs',
    groupSize: '2–6',
    price: 1499,
    rating: 4.8,
    reviews: 132,
    badge: 'Thrill Pick',
    badgeColor: '#ef4444',
    desc: 'Paddle through narrow mangrove channels and hidden lagoons. Expert guide leads you through routes no tourist boat can reach.',
    img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=700&q=80',
    tags: ['Kayak', 'Mangroves', 'Wildlife'],
  },
  {
    id: 'seafood-cooking',
    cat: 'culinary',
    title: 'Kerala Seafood Masterclass',
    location: 'Black Beach Kitchen',
    duration: '2.5 hrs',
    groupSize: '2–8',
    price: 1299,
    rating: 4.9,
    reviews: 98,
    badge: "Chef's Table",
    badgeColor: '#10b981',
    desc: 'Cook authentic Kerala fish curry, prawn moilee, and coconut chutney with a local Malayali chef. Market visit included.',
    img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=700&q=80',
    tags: ['Cooking', 'Seafood', 'Local Chef'],
  },
  {
    id: 'sunset-cruise',
    cat: 'maritime',
    title: 'Sunset Catamaran Cruise',
    location: 'Varkala Coast',
    duration: '2 hrs',
    groupSize: 'Up to 12',
    price: 1899,
    rating: 4.8,
    reviews: 176,
    badge: 'Most Booked',
    badgeColor: '#6366f1',
    desc: 'Sail into a liquid gold sunset aboard a private catamaran. Canapes, mocktails, and live acoustic music included.',
    img: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=700&q=80',
    tags: ['Cruise', 'Sunset', 'Romantic'],
  },
  {
    id: 'kathakali',
    cat: 'cultural',
    title: 'Private Kathakali Performance',
    location: 'Heritage Hall, Varkala',
    duration: '1.5 hrs',
    groupSize: '2–20',
    price: 999,
    rating: 4.7,
    reviews: 64,
    badge: 'Heritage',
    badgeColor: '#d97706',
    desc: 'An intimate performance by a Padma Shri-trained Kathakali artist, with a pre-show makeup demonstration and costume showcase.',
    img: 'https://images.unsplash.com/photo-1610189352649-c2e2e9b2b3e3?w=700&q=80',
    tags: ['Dance', 'Culture', 'Art'],
  },
  {
    id: 'ayurveda-spa',
    cat: 'wellness',
    title: 'Authentic Ayurveda Ritual',
    location: 'Cliff Wellness Centre',
    duration: '2 hrs',
    groupSize: '1–2',
    price: 2499,
    rating: 5.0,
    reviews: 89,
    badge: '5-Star Rated',
    badgeColor: '#8b5cf6',
    desc: 'Abhyanga full-body oil massage, Shirodhara head treatment, and steam therapy by a certified Ayurvedic physician.',
    img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=700&q=80',
    tags: ['Ayurveda', 'Spa', 'Healing'],
  },
  {
    id: 'cliff-photography',
    cat: 'cultural',
    title: 'Golden Hour Photo Walk',
    location: 'Varkala Cliff & Beach',
    duration: '2 hrs',
    groupSize: '1–4',
    price: 2999,
    rating: 4.9,
    reviews: 41,
    badge: 'New',
    badgeColor: '#0ea5e9',
    desc: 'Professional photographer leads you to the best cliff vantage points during golden hour. 30 edited high-res images delivered.',
    img: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=700&q=80',
    tags: ['Photography', 'Golden Hour', 'Portraits'],
  },
  {
    id: 'surf-lesson',
    cat: 'adventure',
    title: 'Learn to Surf — Beginner',
    location: 'Papanasam Beach',
    duration: '2 hrs',
    groupSize: '2–6',
    price: 1199,
    rating: 4.6,
    reviews: 153,
    badge: 'Adventure',
    badgeColor: '#ef4444',
    desc: "ISA-certified instructor, soft-top boards, rash guard and fins provided. Perfect for first-timers on Varkala's gentlest waves.",
    img: 'https://images.unsplash.com/photo-1531722569936-825d4ecc6b37?w=700&q=80',
    tags: ['Surf', 'Beach', 'Sport'],
  },
  {
    id: 'village-walk',
    cat: 'cultural',
    title: 'Hidden Village Heritage Walk',
    location: 'Sivagiri & Surrounds',
    duration: '3 hrs',
    groupSize: '2–10',
    price: 699,
    rating: 4.8,
    reviews: 77,
    badge: 'Local Favourite',
    badgeColor: '#10b981',
    desc: 'Walk through paddy fields, visit a coir weaving workshop, and share chai with a local family. Strictly off guidebooks.',
    img: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&q=80',
    tags: ['Heritage', 'Village', 'Local Life'],
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Globe },
  { id: 'adventure', label: 'Adventure', icon: Zap },
  { id: 'wellness', label: 'Wellness', icon: Wind },
  { id: 'culinary', label: 'Culinary', icon: Coffee },
  { id: 'cultural', label: 'Cultural', icon: Music },
  { id: 'maritime', label: 'Maritime', icon: Waves },
];

// ── Card ───────────────────────────────────────────────────────────────────────

function ExpCard({ exp, index }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="group bg-white rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col cursor-pointer"
      onClick={() => navigate(`/listings?category=activity&q=${encodeURIComponent(exp.title)}`)}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={exp.img}
          alt={exp.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Badge */}
        <div
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow"
          style={{ background: exp.badgeColor }}
        >
          {exp.badge}
        </div>

        {/* Save */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSaved(!saved);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-white/40"
        >
          <Heart size={14} className={saved ? 'fill-rose-500 text-rose-500' : 'text-white'} />
        </button>

        {/* Duration pill */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
          <Clock size={10} /> {exp.duration}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold mb-1">
              <MapPin size={10} className="text-emerald-500" /> {exp.location}
            </div>
            <h3 className="font-black text-slate-900 text-base leading-snug">{exp.title}</h3>
          </div>
          <div className="flex items-center gap-0.5 bg-amber-50 text-amber-600 px-2 py-1 rounded-full flex-shrink-0">
            <Star size={10} className="fill-amber-500 text-amber-500" />
            <span className="text-[11px] font-black">{exp.rating}</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{exp.desc}</p>

        <div className="flex flex-wrap gap-1.5">
          {exp.tags.map((t) => (
            <span
              key={t}
              className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              From
            </div>
            <div className="text-xl font-black text-slate-900">
              ₹{exp.price.toLocaleString('en-IN')}
              <span className="text-xs font-normal text-slate-400"> /person</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-600 group-hover:text-emerald-600 transition-colors">
            <Users size={12} /> {exp.groupSize}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function Experiences() {
  const navigate = useNavigate();
  const [activeCat, setActiveCat] = useState('all');
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 120]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  const filtered =
    activeCat === 'all' ? EXPERIENCES : EXPERIENCES.filter((e) => e.cat === activeCat);

  return (
    <WayzzaLayout noPadding>
      <SEO
        title="Curated Luxury Experiences in Varkala \u2014 Ayurveda, Yoga & Sunset Cruises"
        description="Book authentic curated experiences in Varkala, Kerala. Cliff yoga, Ayurveda rituals, sunset catamaran cruises, Kathakali performances, and seafood masterclasses. Verified by Wayzza."
        breadcrumb={[
          { name: 'Home', url: 'https://wayzza.live' },
          { name: 'Experiences', url: 'https://wayzza.live/experiences' },
        ]}
        itemList={{
          name: 'Best Curated Experiences in Varkala, Kerala',
          description:
            'Handpicked authentic experiences in Varkala \u2014 from cliff yoga and Ayurveda to sunset cruises and Kathakali. Verified and curated by the Wayzza team.',
          url: 'https://wayzza.live/experiences',
          items: EXPERIENCES.map((exp) => ({
            name: exp.title,
            description: exp.desc,
            image: exp.img,
            url: `https://wayzza.live/experiences#${exp.id}`,
          })),
        }}
        faq={[
          {
            question: 'What experiences can I book in Varkala through Wayzza?',
            answer:
              'Wayzza curates 9+ verified experiences in Varkala including Sunrise Cliff Yoga, Backwater Kayaking, Kerala Seafood Masterclass, Sunset Catamaran Cruise, private Kathakali performances, Authentic Ayurveda Rituals, Golden Hour Photo Walks, beginner surf lessons, and Hidden Village Heritage Walks.',
          },
          {
            question: 'Are Wayzza experiences suitable for couples and honeymooners?',
            answer:
              'Yes. Several of our experiences are ideal for couples \u2014 particularly the Sunset Catamaran Cruise, the Authentic Ayurveda Ritual (couples package available), and the Golden Hour Photo Walk. These can be booked as standalone experiences or bundled with a clifftop villa stay for a complete honeymoon package.',
          },
          {
            question:
              'Can I combine a Wayzza experience with a villa stay or Royal Enfield rental?',
            answer:
              'Absolutely. Wayzza is uniquely positioned to bundle experiences with stays and mobility. Use our AI Trip Planner to mix and match a clifftop villa, Royal Enfield rental, and curated experiences into one seamless package \u2014 at no extra booking fee.',
          },
          {
            question: 'What is the best experience to do in Varkala as a first-time visitor?',
            answer:
              'For first-time visitors, we recommend the Sunrise Cliff Yoga (for the unbeatable ocean views at 6 AM) combined with the Sunset Catamaran Cruise in the evening. This combination gives you the full spectrum of Varkala\u2019s magic in a single day. Both experiences are among our highest-rated with 4.8\u20134.9 star average ratings.',
          },
        ]}
      />

      {/* ── Hero ── */}
      <section className="relative h-[88vh] min-h-[640px] flex items-end bg-slate-950 overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1626442651167-797745778a08?w=2000&q=85"
            alt="Varkala Experiences"
            className="w-full h-full object-cover opacity-50"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
        </motion.div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-full text-white text-[11px] font-bold uppercase tracking-widest">
              <Anchor size={12} className="text-amber-400" /> Beyond the Stay
            </div>
            <h1 className="text-6xl sm:text-8xl md:text-[110px] font-black text-white tracking-tighter leading-[0.85] uppercase">
              NATIVE
              <br />
              <span className="text-amber-400 lowercase">secrets.</span>
            </h1>
            <p className="text-white/60 text-lg max-w-xl leading-relaxed">
              Handpicked local adventures, cultural rituals, and flavour journeys — designed for
              those who travel deeper.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() =>
                  window.scrollTo({ top: window.innerHeight * 0.7, behavior: 'smooth' })
                }
                className="flex items-center gap-2 h-12 px-6 bg-amber-500 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
              >
                <Sparkles size={14} /> Explore All
              </button>
              <button
                onClick={() => navigate('/ai-trip-planner')}
                className="flex items-center gap-2 h-12 px-6 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all"
              >
                Build a Package <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>

          {/* Stat strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 flex flex-wrap gap-8"
          >
            {[
              { icon: Star, label: 'Avg Rating', value: '4.8 ★' },
              { icon: Users, label: 'Happy Travellers', value: '3,200+' },
              { icon: Camera, label: 'Experiences', value: `${EXPERIENCES.length} Curated` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Icon size={14} className="text-amber-400" />
                </div>
                <div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                    {label}
                  </div>
                  <div className="text-white font-black text-sm">{value}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Category Filter ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-3">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const active = activeCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    active
                      ? 'bg-slate-950 text-white shadow'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={13} className={active ? 'text-amber-400' : ''} />
                  {cat.label}
                  {active && (
                    <span className="bg-white/20 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
                      {filtered.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {activeCat === 'all'
                ? 'All Experiences'
                : CATEGORIES.find((c) => c.id === activeCat)?.label}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {filtered.length} experiences in Varkala
            </p>
          </div>
          <div className="text-xs text-slate-400 font-semibold hidden sm:block">
            Verified & locally curated
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeCat}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filtered.map((exp, i) => (
              <ExpCard key={exp.id} exp={exp} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── CTA Banner ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[32px] overflow-hidden bg-amber-500 p-10 sm:p-14 text-center"
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=1200&q=80)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-slate-950 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-5">
              <Utensils size={11} className="text-amber-400" /> Custom Package Builder
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tighter mb-3">
              Mix & match your
              <br />
              perfect Varkala trip.
            </h2>
            <p className="text-slate-950/60 text-base max-w-lg mx-auto mb-7">
              Combine a stay, vehicle, and your favourite experiences into one seamless package.
            </p>
            <button
              onClick={() => navigate('/ai-trip-planner')}
              className="inline-flex items-center gap-2 bg-slate-950 text-white font-black px-7 py-3.5 rounded-2xl hover:bg-slate-800 transition-all active:scale-95"
            >
              Build Your Package <ArrowRight size={15} />
            </button>
          </div>
        </motion.div>
      </section>
    </WayzzaLayout>
  );
}
