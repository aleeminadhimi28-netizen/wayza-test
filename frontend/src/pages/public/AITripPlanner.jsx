import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WayzzaLayout } from '../../WayzzaUI.jsx';
import SEO from '../../components/SEO.jsx';
import { api } from '../../utils/api.js';
import { useToast } from '../../ToastContext.jsx';
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
  IndianRupee,
  User,
  Mail,
  Send,
  MessageSquare,
  Sparkles,
  X,
} from 'lucide-react';

// ── Data ───────────────────────────────────────────────────────────────────────

const VARKALA = {
  id: 'varkala',
  label: 'Varkala',
  sub: 'Clifftop & Beach',
  icon: Waves,
  img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1600&q=80',
};

const DESTINATIONS = [VARKALA];

const DURATIONS = [
  { id: '2n3d', label: '2N / 3D', nights: 2 },
  { id: '3n4d', label: '3N / 4D', nights: 3 },
  { id: '4n5d', label: '4N / 5D', nights: 4 },
  { id: '7n8d', label: '7N / 8D', nights: 7 },
];

const VIBES = [
  {
    id: 'relax',
    label: 'Relax & Unwind',
    icon: Moon,
    color: 'from-blue-500/20 to-teal-500/20',
    border: 'border-teal-400',
  },
  {
    id: 'adventure',
    label: 'Adventure',
    icon: Zap,
    color: 'from-orange-500/20 to-red-500/20',
    border: 'border-orange-400',
  },
  {
    id: 'romance',
    label: 'Romance',
    icon: Heart,
    color: 'from-pink-500/20 to-rose-500/20',
    border: 'border-pink-400',
  },
  {
    id: 'culture',
    label: 'Cultural',
    icon: Coffee,
    color: 'from-amber-500/20 to-yellow-500/20',
    border: 'border-amber-400',
  },
  {
    id: 'luxury',
    label: 'Luxury',
    icon: Star,
    color: 'from-purple-500/20 to-violet-500/20',
    border: 'border-purple-400',
  },
  {
    id: 'wellness',
    label: 'Wellness',
    icon: Sun,
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
  { id: 'bike', label: 'Bike Rental', icon: Bike, price: 800, desc: 'Royal Enfield / Scooter' },
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
  { id: 'budget', label: 'Budget', sub: 'Guesthouses & hostels', icon: Home },
  { id: 'standard', label: 'Standard', sub: 'Comfortable homestays', icon: Home },
  { id: 'premium', label: 'Premium', sub: 'Boutique villas', icon: Home },
  { id: 'luxury', label: 'Luxury', sub: 'Clifftop suites', icon: Home },
];

const TRANSPORT = [
  { id: 'none', label: 'No Transfer', icon: Car },
  { id: 'shared', label: 'Shared Cab', icon: Car },
  { id: 'private', label: 'Private Car', icon: Car },
  { id: 'suv', label: 'Luxury SUV', icon: Car },
];

const BUDGET_PRESETS = [5000, 10000, 15000, 25000, 50000];

const STEPS = ['Duration', 'Vibe', 'Stay', 'Add-ons', 'Budget & Contact'];

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
          </button>
        );
      })}
    </div>
  );
}

function StepBudgetAndContact({
  budget,
  setBudget,
  guests,
  setGuests,
  transport,
  setTransport,
  contact,
  setContact,
}) {
  return (
    <div className="space-y-6">
      {/* Budget Selector */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-700 mb-1">
            Your Preferred Budget Limit (₹)
          </label>
          <p className="text-xs text-slate-500">
            Tell us how much you plan to spend. We will curate stays, mobility & activities to
            match.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl px-4 py-3 shadow-inner focus-within:border-emerald-500 transition-all">
          <IndianRupee size={18} className="text-emerald-600 shrink-0" />
          <input
            type="number"
            value={budget}
            onChange={(e) => {
              const val = e.target.value;
              setBudget(val === '' ? '' : Math.max(0, parseInt(val) || 0));
            }}
            placeholder="Enter budget (e.g. 15000)"
            className="w-full font-black text-xl text-slate-900 outline-none bg-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {BUDGET_PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setBudget(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all border ${
                budget === p
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              ₹{p.toLocaleString('en-IN')}
            </button>
          ))}
        </div>
      </div>

      {/* Guest & Transport */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-700 mb-2">
            Number of Travellers
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setGuests(Math.max(1, guests - 1))}
              className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center text-lg font-black text-slate-700 hover:border-emerald-400"
            >
              −
            </button>
            <span className="font-black text-xl text-slate-900 w-8 text-center">{guests}</span>
            <button
              type="button"
              onClick={() => setGuests(Math.min(12, guests + 1))}
              className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center text-lg font-black text-slate-700 hover:border-emerald-400"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-700 mb-2">
            Airport Transfer
          </label>
          <select
            value={transport}
            onChange={(e) => setTransport(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 outline-none"
          >
            {TRANSPORT.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contact Details */}
      <div className="space-y-3 pt-2">
        <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-700">
          Your Contact Details
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <User size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Your Full Name *"
              value={contact.name}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
            />
          </div>
          <div className="relative">
            <Phone size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Phone / WhatsApp Number *"
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="relative">
          <Mail size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="email"
            placeholder="Email Address *"
            value={contact.email}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
          />
        </div>

        <textarea
          rows={2}
          placeholder="Special requests or preferences (e.g. ocean view villa, Royal Enfield bike preference...)"
          value={contact.notes}
          onChange={(e) => setContact({ ...contact, notes: e.target.value })}
          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-emerald-500"
        />
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────────

export default function TourPackager() {
  const { showToast } = useToast();
  const [step, setStep] = useState(0);
  const [supportWhatsApp, setSupportWhatsApp] = useState('');

  useEffect(() => {
    api.getPlatformConfig()
      .then((res) => {
        if (res?.ok && res?.data?.supportWhatsApp) {
          setSupportWhatsApp(res.data.supportWhatsApp.replace(/[^0-9]/g, ''));
        }
      })
      .catch(() => {});
  }, []);

  const destination = 'varkala';
  const [duration, setDuration] = useState('3n4d');
  const [vibe, setVibe] = useState('relax');
  const [stay, setStay] = useState('standard');
  const [addons, setAddons] = useState([]);
  const [guests, setGuests] = useState(2);
  const [transport, setTransport] = useState('private');
  const [budget, setBudget] = useState(15000);
  const [contact, setContact] = useState({ name: '', phone: '', email: '', notes: '' });

  const [submitting, setSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

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
      title: 'Set Budget & Contact Info',
      sub: 'Enter your preferred budget limit and contact details for our concierge team',
      component: (
        <StepBudgetAndContact
          budget={budget}
          setBudget={setBudget}
          guests={guests}
          setGuests={setGuests}
          transport={transport}
          setTransport={setTransport}
          contact={contact}
          setContact={setContact}
        />
      ),
    },
  ];

  const dest = DESTINATIONS.find((d) => d.id === destination);
  const dur = DURATIONS.find((d) => d.id === duration);
  const vib = VIBES.find((v) => v.id === vibe);
  const sty = STAY_TYPES.find((s) => s.id === stay);

  const handleSubmitRequest = async () => {
    if (!contact.name || !contact.phone || !contact.email) {
      setStep(4);
      showToast('Please complete your name, phone and email address.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        budget: parseFloat(budget) || 15000,
        destination: dest?.label || 'Varkala',
        duration: dur?.label || '3N / 4D',
        vibe: vib?.label || 'Relax & Unwind',
        stay: sty?.label || 'Standard',
        addons: addons.map((id) => ADDONS.find((a) => a.id === id)?.label || id),
        guests,
        transport,
        notes: contact.notes,
      };

      const res = await api.submitCustomPackageRequest(payload);
      if (res.ok) {
        setSuccessModal(true);
      } else {
        showToast(res.message || 'Failed to submit request.', 'error');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
    }
    setSubmitting(false);
  };

  return (
    <WayzzaLayout noPadding>
      <SEO
        title="Wayzza Concierge — Custom Varkala Package Builder"
        description="Tell us your budget and travel preferences. Our Varkala Concierge team will curate a verified stay, bike, and local experience package within your budget limit."
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
            <Sparkles size={12} /> Wayzza Concierge • Varkala
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
            Set your target budget, vibe, stay and add-ons. Our local experts will craft an instant
            custom package matching your exact budget.
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
                  onClick={handleSubmitRequest}
                  disabled={submitting}
                  className="flex items-center gap-2 bg-emerald-500 text-slate-950 text-sm font-black px-6 py-2.5 rounded-2xl hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-60"
                >
                  <Send size={15} />
                  {submitting ? 'Submitting…' : 'Submit Package Request'}
                </button>
              )}
            </div>
          </div>

          {/* Right: Live Budget & Package Summary */}
          <div className="space-y-4 lg:sticky lg:top-24">
            {/* Target Budget Card */}
            <div className="bg-slate-950 text-white rounded-[24px] p-6 shadow-xl">
              <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">
                Your Target Budget
              </div>
              <div className="mt-2 flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-2xl px-3.5 py-2 focus-within:border-emerald-500 transition-all">
                <IndianRupee size={24} className="text-emerald-400 shrink-0" />
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBudget(val === '' ? '' : Math.max(0, parseInt(val) || 0));
                  }}
                  placeholder="50000"
                  className="w-full bg-transparent text-emerald-400 font-black text-2xl sm:text-3xl outline-none p-0 border-none placeholder:text-emerald-400/30"
                  aria-label="Target budget amount"
                />
              </div>

              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                Budget limit for {guests} {guests === 1 ? 'person' : 'people'}
              </p>

              {/* Quick Presets */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {BUDGET_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setBudget(p)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                      budget === p
                        ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/30'
                    }`}
                  >
                    ₹{(p / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>

              {/* Selected Options Summary */}
              <div className="mt-5 space-y-2.5 border-t border-white/10 pt-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Destination</span>
                  <span className="font-bold text-white">{dest?.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Duration</span>
                  <span className="font-bold text-white">{dur?.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Vibe</span>
                  <span className="font-bold text-white">{vib?.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Stay Tier</span>
                  <span className="font-bold text-white">{sty?.label}</span>
                </div>
                {addons.length > 0 && (
                  <div className="flex items-start justify-between">
                    <span className="text-slate-400">Add-ons</span>
                    <span className="font-bold text-white text-right max-w-[130px]">
                      {addons.map((id) => ADDONS.find((a) => a.id === id)?.label).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  if (step < 4) setStep(4);
                  else handleSubmitRequest();
                }}
                disabled={submitting}
                className="mt-6 w-full bg-emerald-500 text-slate-950 font-black py-3 rounded-2xl hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                <Send size={14} />
                {step < 4
                  ? 'Enter Contact Info →'
                  : submitting
                    ? 'Submitting…'
                    : 'Request Package →'}
              </button>
            </div>

            {/* Trust badges */}
            <div className="bg-white rounded-[20px] border border-slate-100 p-4 space-y-3">
              {[
                { icon: Shield, label: 'Custom curated to your budget' },
                { icon: Phone, label: '24/7 Wayzza Travel Concierge' },
                { icon: Check, label: 'Free cancellation (48h)' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 text-xs text-slate-600 font-medium"
                >
                  <div className="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={13} className="text-emerald-500" />
                  </div>
                  {label}
                </div>
              ))}
            </div>

            {supportWhatsApp && (
              <a
                href={`https://wa.me/${supportWhatsApp}?text=${encodeURIComponent('Hi Wayzza Concierge, I need help with a custom Varkala package')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full border-2 border-slate-200 rounded-[20px] py-3 text-xs font-bold text-slate-700 hover:border-emerald-400 hover:text-emerald-600 transition-all"
              >
                <MessageSquare size={14} className="text-emerald-500" /> Chat With Concierge
              </a>
            )}
          </div>
        </div>
      </main>

      {/* ── Success Modal ── */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl relative border border-slate-100"
          >
            <button
              onClick={() => setSuccessModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900"
            >
              <X size={16} />
            </button>

            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Check size={32} strokeWidth={3} />
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-950">Request Received!</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Thank you, <strong className="text-slate-900">{contact.name}</strong>! Our Wayzza
                Varkala experts are preparing your custom package for{' '}
                <strong>₹{budget.toLocaleString('en-IN')}</strong>.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-left text-xs space-y-1.5 text-slate-600">
              <div>
                📍 <strong>Destination:</strong> {dest?.label} ({dur?.label})
              </div>
              <div>
                ✨ <strong>Vibe:</strong> {vib?.label}
              </div>
              <div>
                💰 <strong>Target Budget:</strong> ₹{budget.toLocaleString('en-IN')}
              </div>
              <div>
                📱 <strong>Contact:</strong> {contact.phone}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {supportWhatsApp && (
                <a
                  href={`https://wa.me/${supportWhatsApp}?text=${encodeURIComponent(`Hi Wayzza Concierge! I just submitted a package request for Varkala (${dur?.label}, Budget: ₹${budget}). My name is ${contact.name}.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20"
                >
                  <MessageSquare size={16} /> Chat Instantly on WhatsApp
                </a>
              )}

              <button
                type="button"
                onClick={() => setSuccessModal(false)}
                className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-slate-700"
              >
                Close & Return
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </WayzzaLayout>
  );
}
