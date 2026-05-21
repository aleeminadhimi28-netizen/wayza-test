import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { WayzzaLayout } from '../../WayzzaUI.jsx';
import SEO from '../../components/SEO.jsx';
import {
  MapPin,
  Clock,
  Star,
  Check,
  ChevronRight,
  ChevronLeft,
  Waves,
  Anchor,
  Sun,
  Moon,
  Heart,
  Zap,
  Utensils,
  Car,
  Home,
  Camera,
  ArrowRight,
  Shield,
  Phone,
  Bike,
  Coffee,
  Music,
} from 'lucide-react';

// ── Data ───────────────────────────────────────────────────────────────────────

const VARKALA = {
  id: 'varkala',
  label: 'Varkala',
  sub: 'Clifftop & Beach',
  icon: Waves,
  img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1600&q=80',
  base: 4500,
};

const DESTINATIONS = [VARKALA];

const DURATIONS = [
  { id: '2n3d', label: '2N / 3D', nights: 2, mult: 1 },
  { id: '3n4d', label: '3N / 4D', nights: 3, mult: 1.45 },
  { id: '4n5d', label: '4N / 5D', nights: 4, mult: 1.85 },
  { id: '7n8d', label: '7N / 8D', nights: 7, mult: 3.1 },
];

const VIBES = [
  {
    id: 'relax',
    label: 'Relax & Unwind',
    icon: Moon,
    add: 0,
    color: 'from-blue-500/20 to-teal-500/20',
    border: 'border-teal-400',
  },
  {
    id: 'adventure',
    label: 'Adventure',
    icon: Zap,
    add: 1200,
    color: 'from-orange-500/20 to-red-500/20',
    border: 'border-orange-400',
  },
  {
    id: 'romance',
    label: 'Romance',
    icon: Heart,
    add: 2000,
    color: 'from-pink-500/20 to-rose-500/20',
    border: 'border-pink-400',
  },
  {
    id: 'culture',
    label: 'Cultural',
    icon: Coffee,
    add: 800,
    color: 'from-amber-500/20 to-yellow-500/20',
    border: 'border-amber-400',
  },
  {
    id: 'luxury',
    label: 'Luxury',
    icon: Star,
    add: 3500,
    color: 'from-purple-500/20 to-violet-500/20',
    border: 'border-purple-400',
  },
  {
    id: 'wellness',
    label: 'Wellness',
    icon: Sun,
    add: 1500,
    color: 'from-green-500/20 to-emerald-500/20',
    border: 'border-emerald-400',
  },
];

const ADDONS = [
  { id: 'spa', label: 'Ayurvedic Spa', icon: Sun, price: 2500, desc: '2-hr full-body treatment' },
  {
    id: 'cruise',
    label: 'Sunset Cruise',
    icon: Anchor,
    price: 1800,
    desc: 'Catamaran with canapes',
  },
  {
    id: 'cooking',
    label: 'Cooking Class',
    icon: Utensils,
    price: 1200,
    desc: 'Local chef, 3 dishes',
  },
  { id: 'bike', label: 'Bike Rental', icon: Bike, price: 800, desc: '3 days, helmet included' },
  { id: 'photo', label: 'Photo Session', icon: Camera, price: 3500, desc: '2-hr pro photographer' },
  {
    id: 'music',
    label: 'Live Kathakali',
    icon: Music,
    price: 900,
    desc: 'Traditional performance',
  },
];

const STAY_TYPES = [
  { id: 'budget', label: 'Budget', sub: 'Guesthouses & hostels', mult: 0.7, icon: Home },
  { id: 'standard', label: 'Standard', sub: 'Comfortable homestays', mult: 1, icon: Home },
  { id: 'premium', label: 'Premium', sub: 'Boutique villas', mult: 1.6, icon: Home },
  { id: 'luxury', label: 'Luxury', sub: 'Clifftop suites', mult: 2.4, icon: Home },
];

const TRANSPORT = [
  { id: 'none', label: 'No Transfer', price: 0, icon: Car },
  { id: 'shared', label: 'Shared Cab', price: 800, icon: Car },
  { id: 'private', label: 'Private Car', price: 2200, icon: Car },
  { id: 'suv', label: 'Luxury SUV', price: 4000, icon: Car },
];

const STEPS = ['Duration', 'Vibe', 'Stay', 'Add-ons', 'Guests'];

// ── Step Components ─────────────────────────────────────────────────────────────

function StepDuration({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {DURATIONS.map((d) => {
        const sel = value === d.id;
        return (
          <button
            key={d.id}
            onClick={() => onChange(d.id)}
            className={`rounded-2xl border-2 p-5 text-left transition-all ${sel ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
          >
            <Clock size={18} className={sel ? 'text-emerald-500' : 'text-slate-400'} />
            <div
              className={`text-2xl font-black mt-2 ${sel ? 'text-emerald-600' : 'text-slate-900'}`}
            >
              {d.label}
            </div>
            <div className="text-xs text-slate-400 mt-1">{d.nights} nights stay</div>
          </button>
        );
      })}
    </div>
  );
}

function StepVibe({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {VIBES.map((v) => {
        const Icon = v.icon;
        const sel = value === v.id;
        return (
          <button
            key={v.id}
            onClick={() => onChange(v.id)}
            className={`rounded-2xl border-2 p-4 text-left transition-all bg-gradient-to-br ${v.color} ${sel ? `${v.border} shadow-md` : 'border-slate-200 hover:border-slate-300'}`}
          >
            <Icon size={20} className={sel ? 'text-slate-800' : 'text-slate-500'} />
            <div className="font-black text-slate-900 mt-2 text-sm">{v.label}</div>
            {v.add > 0 && (
              <div className="text-xs text-slate-500 mt-0.5">+₹{v.add.toLocaleString('en-IN')}</div>
            )}
            {sel && (
              <div className="mt-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                Selected ✓
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function StepStay({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {STAY_TYPES.map((s) => {
        const Icon = s.icon;
        const sel = value === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className={`rounded-2xl border-2 p-5 text-left transition-all ${sel ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
          >
            <Icon size={18} className={sel ? 'text-emerald-500' : 'text-slate-400'} />
            <div className={`font-black mt-2 ${sel ? 'text-emerald-700' : 'text-slate-900'}`}>
              {s.label}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{s.sub}</div>
          </button>
        );
      })}
    </div>
  );
}

function StepAddons({ value, onChange }) {
  const toggle = (id) =>
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {ADDONS.map((a) => {
        const Icon = a.icon;
        const sel = value.includes(a.id);
        return (
          <button
            key={a.id}
            onClick={() => toggle(a.id)}
            className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${sel ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${sel ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}
            >
              <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-900 text-sm">{a.label}</div>
              <div className="text-xs text-slate-500">{a.desc}</div>
            </div>
            <div
              className={`text-sm font-black flex-shrink-0 ${sel ? 'text-emerald-600' : 'text-slate-400'}`}
            >
              +₹{a.price.toLocaleString('en-IN')}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function StepGuests({ guests, setGuests, transport, setTransport }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-bold text-slate-700 mb-3">Number of Travellers</div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setGuests(Math.max(1, guests - 1))}
            className="w-11 h-11 rounded-full border-2 border-slate-200 flex items-center justify-center text-xl font-black text-slate-700 hover:border-emerald-400 transition-colors"
          >
            −
          </button>
          <div className="text-center">
            <div className="text-4xl font-black text-slate-900">{guests}</div>
            <div className="text-xs text-slate-400">{guests === 1 ? 'person' : 'people'}</div>
          </div>
          <button
            onClick={() => setGuests(Math.min(12, guests + 1))}
            className="w-11 h-11 rounded-full border-2 border-slate-200 flex items-center justify-center text-xl font-black text-slate-700 hover:border-emerald-400 transition-colors"
          >
            +
          </button>
        </div>
      </div>
      <div>
        <div className="text-sm font-bold text-slate-700 mb-3">Airport Transfer</div>
        <div className="grid grid-cols-2 gap-2">
          {TRANSPORT.map((t) => {
            const Icon = t.icon;
            const sel = transport === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTransport(t.id)}
                className={`rounded-xl border-2 p-3 text-left transition-all ${sel ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
              >
                <div className="font-bold text-sm text-slate-900">{t.label}</div>
                <div
                  className={`text-xs mt-0.5 font-semibold ${sel ? 'text-emerald-600' : 'text-slate-400'}`}
                >
                  {t.price === 0 ? 'Free' : `+₹${t.price.toLocaleString('en-IN')}`}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Price Calculator ─────────────────────────────────────────────────────────────

function calcPrice({ destination, duration, vibe, stay, addons, guests, transport }) {
  const dest = DESTINATIONS.find((d) => d.id === destination);
  const dur = DURATIONS.find((d) => d.id === duration);
  const vib = VIBES.find((v) => v.id === vibe);
  const sty = STAY_TYPES.find((s) => s.id === stay);
  const trans = TRANSPORT.find((t) => t.id === transport);
  if (!dest || !dur || !vib || !sty) return 0;
  const basePerPerson = dest.base * dur.mult * sty.mult + vib.add;
  const addonsTotal = addons.reduce((sum, id) => {
    const a = ADDONS.find((x) => x.id === id);
    return sum + (a ? a.price : 0);
  }, 0);
  const transTotal = trans ? trans.price : 0;
  return Math.round((basePerPerson + addonsTotal) * guests + transTotal);
}

// ── Main Component ───────────────────────────────────────────────────────────────

export default function TourPackager() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const destination = 'varkala';
  const [duration, setDuration] = useState('3n4d');
  const [vibe, setVibe] = useState('relax');
  const [stay, setStay] = useState('standard');
  const [addons, setAddons] = useState([]);
  const [guests, setGuests] = useState(2);
  const [transport, setTransport] = useState('private');
  const [submitted, setSubmitted] = useState(false);

  const totalPrice = calcPrice({ destination, duration, vibe, stay, addons, guests, transport });

  const stepContent = [
    {
      title: 'How long is your trip?',
      sub: 'Select your preferred duration',
      component: <StepDuration value={duration} onChange={setDuration} />,
    },
    {
      title: "What's your travel vibe?",
      sub: "We'll tailor every detail to match",
      component: <StepVibe value={vibe} onChange={setVibe} />,
    },
    {
      title: 'Choose your stay type',
      sub: 'From cozy guesthouses to clifftop suites',
      component: <StepStay value={stay} onChange={setStay} />,
    },
    {
      title: 'Add experiences',
      sub: 'Optional extras to make it unforgettable',
      component: <StepAddons value={addons} onChange={setAddons} />,
    },
    {
      title: 'Finalize your trip',
      sub: 'Travellers and transport preferences',
      component: (
        <StepGuests
          guests={guests}
          setGuests={setGuests}
          transport={transport}
          setTransport={setTransport}
        />
      ),
    },
  ];

  const dest = DESTINATIONS.find((d) => d.id === destination);
  const dur = DURATIONS.find((d) => d.id === duration);
  const vib = VIBES.find((v) => v.id === vibe);

  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleBook = () => {
    setSubmitted(true);
    // FIX #76: Check mountedRef before navigating to prevent state update on unmounted component
    setTimeout(() => {
      if (!mountedRef.current) return;
      navigate(`/listings?location=${encodeURIComponent(dest?.label || 'Varkala')}`, {
        state: {
          fromPackage: {
            name: `Custom ${dest?.label} Package`,
            price: totalPrice,
            guests,
            vibe: vib?.label,
            duration: dur?.label,
          },
        },
      });
    }, 1200);
  };

  return (
    <WayzzaLayout noPadding>
      <SEO
        title="Build Your Custom Kerala Tour Package — Wayzza"
        description="Design your perfect Kerala trip with Wayzza. Choose destination, duration, vibe, stay type, and experiences. Get an instant quote and book in minutes."
      />

      {/* ── Hero ── */}
      <header className="relative bg-slate-950 text-white overflow-hidden min-h-[380px] flex items-end">
        <div className="absolute inset-0">
          <img src={VARKALA.img} alt="Varkala" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />
        </div>
        <div className="relative w-full max-w-5xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-[11px] uppercase tracking-widest font-black mb-5"
          >
            <MapPin size={12} /> Varkala, Kerala
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl sm:text-6xl font-black tracking-tighter leading-tight"
          >
            Build Your Varkala
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Dream Package.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed"
          >
            Choose your destination, vibe, stay, and experiences. Get an instant price — then book
            it all in one click.
          </motion.p>
        </div>
      </header>

      {/* ── Builder ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 relative z-10 pb-24">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
          {/* Left: Step panel */}
          <div className="bg-white rounded-[28px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
            {/* Step nav */}
            <div className="flex overflow-x-auto scrollbar-none border-b border-slate-100 px-2 py-2 gap-1">
              {STEPS.map((s, i) => (
                <button
                  key={s}
                  onClick={() => setStep(i)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    step === i
                      ? 'bg-slate-950 text-white'
                      : i < step
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {i < step ? '✓ ' : `${i + 1}. `}
                  {s}
                </button>
              ))}
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                <div className="mb-5">
                  <h2 className="text-xl font-black text-slate-900">{stepContent[step].title}</h2>
                  <p className="text-sm text-slate-400 mt-1">{stepContent[step].sub}</p>
                </div>
                {stepContent[step].component}
              </motion.div>
            </AnimatePresence>

            {/* Nav buttons */}
            <div className="flex items-center justify-between px-6 pb-6 pt-2">
              <button
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} /> Back
              </button>
              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-2 bg-slate-950 text-white text-sm font-black px-5 py-2.5 rounded-2xl hover:bg-emerald-600 transition-all"
                >
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleBook}
                  disabled={submitted}
                  className="flex items-center gap-2 bg-emerald-500 text-slate-950 text-sm font-black px-6 py-2.5 rounded-2xl hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-60"
                >
                  {submitted ? 'Redirecting…' : 'Book This Package'} <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Right: Live summary */}
          <div className="space-y-4 lg:sticky lg:top-24">
            {/* Price card */}
            <div className="bg-slate-950 text-white rounded-[24px] p-6">
              <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">
                Your Package
              </div>
              <div className="text-4xl font-black text-emerald-400 mt-2">
                ₹{totalPrice.toLocaleString('en-IN')}
              </div>
              <div className="text-slate-400 text-xs mt-1">
                total for {guests} {guests === 1 ? 'person' : 'people'}
              </div>

              <div className="mt-5 space-y-2.5 border-t border-white/10 pt-4">
                {[
                  { label: 'Destination', value: dest?.label },
                  { label: 'Duration', value: dur?.label },
                  { label: 'Vibe', value: vib?.label },
                  { label: 'Travellers', value: `${guests} ${guests === 1 ? 'person' : 'people'}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{label}</span>
                    <span className="font-bold text-white">{value}</span>
                  </div>
                ))}
                {addons.length > 0 && (
                  <div className="flex items-start justify-between text-sm">
                    <span className="text-slate-400">Add-ons</span>
                    <span className="font-bold text-white text-right max-w-[140px]">
                      {addons.map((id) => ADDONS.find((a) => a.id === id)?.label).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleBook}
                disabled={submitted}
                className="mt-6 w-full bg-emerald-500 text-slate-950 font-black py-3 rounded-2xl hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-60"
              >
                {submitted ? 'Redirecting…' : 'Book Now →'}
              </button>
            </div>

            {/* Trust badges */}
            <div className="bg-white rounded-[20px] border border-slate-100 p-4 space-y-3">
              {[
                { icon: Shield, label: 'Verified properties only' },
                { icon: Phone, label: '24/7 travel concierge' },
                { icon: Check, label: 'Free cancellation (48h)' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 text-sm text-slate-600 font-medium"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-emerald-500" />
                  </div>
                  {label}
                </div>
              ))}
            </div>

            {/* FIX #78: Replace with real Wayzza WhatsApp number before go-live */}
            <a
              href="https://wa.me/91XXXXXXXXXX?text=Hi%2C%20I%27d%20like%20help%20with%20a%20custom%20Kerala%20package"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full border-2 border-slate-200 rounded-[20px] py-3 text-sm font-bold text-slate-700 hover:border-emerald-400 hover:text-emerald-600 transition-all"
            >
              <Phone size={14} /> Talk to a Travel Expert
            </a>
          </div>
        </div>
      </main>
    </WayzzaLayout>
  );
}
