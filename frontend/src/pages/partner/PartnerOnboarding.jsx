import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  MapPin,
  PlusCircle,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Building,
  Wallet,
  Home,
  Bike,
  ShieldCheck,
  Car,
  FileText,
  Sparkles,
  Globe,
  Star,
  Navigation,
} from 'lucide-react';
import { useAuth } from '../../AuthContext.jsx';
import { useToast } from '../../ToastContext.jsx';
import { api } from '../../utils/api.js';

/* ─────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────── */

function StyledInput({
  label,
  value,
  onChange,
  placeholder,
  icon,
  type = 'text',
  maxLength,
  required = false,
  hint,
}) {
  return (
    <div className="space-y-2 group">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-widest group-focus-within:text-emerald-600 transition-colors">
        {label} {required && <span className="text-rose-400 font-bold">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
        />
      </div>
      {hint && <p className="text-xs text-slate-400 font-medium pl-1">{hint}</p>}
    </div>
  );
}

function SectorCard({ icon, title, subtitle, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative p-5 rounded-2xl border-2 transition-all duration-200 text-left flex items-center gap-4 ${
        active
          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-600/25'
          : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:shadow-md'
      }`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${active ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-emerald-50'}`}
      >
        <span className={active ? 'text-white' : 'text-slate-400 group-hover:text-emerald-500'}>
          {icon}
        </span>
      </div>
      <div>
        <p className={`font-bold text-sm ${active ? 'text-white' : 'text-slate-800'}`}>{title}</p>
        <p className={`text-xs mt-0.5 font-medium ${active ? 'text-white/70' : 'text-slate-400'}`}>
          {subtitle}
        </p>
      </div>
      {active && (
        <div className="absolute top-3 right-3 w-5 h-5 bg-white rounded-full flex items-center justify-center">
          <CheckCircle size={12} className="text-emerald-600" />
        </div>
      )}
    </button>
  );
}

function CategoryPill({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
        active
          ? 'bg-slate-900 text-white shadow-lg'
          : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
      }`}
    >
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────── */

const ONBOARDING_FORM_KEY = 'partner_onboarding_form';

const getSavedField = (fieldName, defaultValue) => {
  try {
    const form = sessionStorage.getItem(ONBOARDING_FORM_KEY);
    if (form) {
      const parsed = JSON.parse(form);
      if (parsed[fieldName] !== undefined) return parsed[fieldName];
    }
  } catch (e) {
    console.error('Error parsing saved onboarding form:', e);
  }
  return defaultValue;
};

export default function PartnerOnboarding() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState(null);
  // FIX #110: Persist current step in sessionStorage so partners can resume if they navigate away
  const [step, setStep] = useState(() => {
    const saved = sessionStorage.getItem('partner_onboarding_step');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [loading, setLoading] = useState(false);
  const [mainSector, setMainSector] = useState(() => getSavedField('mainSector', 'stays'));

  const [businessName, setBusinessName] = useState(() => getSavedField('businessName', ''));
  const [subCategory, setSubCategory] = useState(() => getSavedField('subCategory', ''));
  const [brandVision, setBrandVision] = useState(() => getSavedField('brandVision', ''));
  const [location, setLocation] = useState(() => getSavedField('location', ''));

  const [msmeNumber, setMsmeNumber] = useState(() => getSavedField('msmeNumber', ''));
  const [gstNumber, setGstNumber] = useState(() => getSavedField('gstNumber', ''));
  const [gstEnabled, setGstEnabled] = useState(() => getSavedField('gstEnabled', false));

  const [listingName, setListingName] = useState(() => getSavedField('listingName', ''));
  const [price, setPrice] = useState(() => getSavedField('price', ''));
  const [listingLat, setListingLat] = useState(() => getSavedField('listingLat', ''));
  const [listingLng, setListingLng] = useState(() => getSavedField('listingLng', ''));
  const [cancellationPolicy, setCancellationPolicy] = useState(() =>
    getSavedField('cancellationPolicy', 'moderate')
  );

  const [roomType, setRoomType] = useState(() => getSavedField('roomType', ''));
  const [vehicleType, setVehicleType] = useState(() => getSavedField('vehicleType', ''));
  const [registrationCategory, setRegistrationCategory] = useState(() =>
    getSavedField('registrationCategory', '')
  );
  const [licensePlate, setLicensePlate] = useState(() => getSavedField('licensePlate', ''));
  const [registrationDate, setRegistrationDate] = useState(() =>
    getSavedField('registrationDate', '')
  );

  // Persist step changes to sessionStorage
  const goToStep = (s) => {
    sessionStorage.setItem('partner_onboarding_step', String(s));
    setStep(s);
  };

  const [detectingLoc, setDetectingLoc] = useState(false);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }
    setDetectingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setListingLat(String(position.coords.latitude.toFixed(6)));
        setListingLng(String(position.coords.longitude.toFixed(6)));
        setDetectingLoc(false);
        showToast('GPS coordinates fetched successfully!', 'success');
      },
      (error) => {
        console.error(error);
        setDetectingLoc(false);
        let msg = 'Failed to detect location. Please type manually.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission denied. Please grant permission or type manually.';
        }
        showToast(msg, 'error');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Save form fields to sessionStorage whenever they change
  useEffect(() => {
    const formData = {
      businessName,
      subCategory,
      brandVision,
      location,
      msmeNumber,
      gstNumber,
      gstEnabled,
      listingName,
      price,
      listingLat,
      listingLng,
      cancellationPolicy,
      roomType,
      vehicleType,
      registrationCategory,
      licensePlate,
      registrationDate,
      mainSector,
    };
    sessionStorage.setItem(ONBOARDING_FORM_KEY, JSON.stringify(formData));
  }, [
    businessName,
    subCategory,
    brandVision,
    location,
    msmeNumber,
    gstNumber,
    gstEnabled,
    listingName,
    price,
    listingLat,
    listingLng,
    cancellationPolicy,
    roomType,
    vehicleType,
    registrationCategory,
    licensePlate,
    registrationDate,
    mainSector,
  ]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'partner') {
      navigate('/partner-login', { replace: true });
    } else {
      setEmail(user.email);
      api.partnerStatus().then((res) => {
        if (res.onboarded || res.onboardingCompleted) {
          navigate('/partner', { replace: true });
          return;
        }
        // Only set default mainSector if not already saved in sessionStorage
        const savedForm = sessionStorage.getItem(ONBOARDING_FORM_KEY);
        let hasSavedSector = false;
        let hasSavedName = false;
        if (savedForm) {
          try {
            const parsed = JSON.parse(savedForm);
            hasSavedSector = parsed.mainSector !== undefined;
            hasSavedName = parsed.businessName && parsed.businessName.trim() !== '';
          } catch (e) {}
        }
        if (!hasSavedSector && res.mainSector) {
          setMainSector(res.mainSector);
          if (res.mainSector === 'stays') setSubCategory('Resort / Hotel');
          else if (res.mainSector === 'vehicles') setSubCategory('Individual / Peer-to-Peer Host');
        }
        // Pre-fill businessName from registration if not already entered
        if (!hasSavedName && res.businessName) {
          setBusinessName(res.businessName);
        }
      });
    }
  }, [user, authLoading, navigate]);

  async function finishOnboarding() {
    if (!email) return;
    if (!businessName || !location) {
      showToast('Please provide all required business details.', 'error');
      return;
    }
    if (!msmeNumber.trim()) {
      showToast('MSME number is required.', 'error');
      return;
    }
    const msmeRegex = /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/;
    if (!msmeRegex.test(msmeNumber.trim())) {
      showToast('Invalid MSME format. Expected: UDYAM-ST-00-0000000', 'error');
      return;
    }
    if (gstEnabled && gstNumber.trim()) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(gstNumber.trim())) {
        showToast('Invalid GST number format. Expected: 29XXXXX0000X1ZX', 'error');
        return;
      }
    }
    if (!listingName || !price) {
      showToast('Please complete your first listing details before submitting.', 'error');
      return;
    }
    if (isNaN(Number(price)) || Number(price) <= 0) {
      showToast('Base rate must be a valid positive number.', 'error');
      return;
    }
    if (
      !listingLat ||
      isNaN(Number(listingLat)) ||
      Number(listingLat) < -90 ||
      Number(listingLat) > 90
    ) {
      showToast('Please provide a valid Latitude between -90 and 90.', 'error');
      return;
    }
    if (
      !listingLng ||
      isNaN(Number(listingLng)) ||
      Number(listingLng) < -180 ||
      Number(listingLng) > 180
    ) {
      showToast('Please provide a valid Longitude between -180 and 180.', 'error');
      return;
    }
    if (mainSector === 'vehicles' && !registrationCategory) {
      showToast('Please select a registration category for your vehicle.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email,
        businessName,
        subCategory,
        brandVision,
        location,
        msmeNumber,
        gstNumber,
        gstEnabled,
        mainSector,
        firstListing: listingName
          ? {
              title: listingName,
              price: Number(price),
              latitude: listingLat ? Number(listingLat) : undefined,
              longitude: listingLng ? Number(listingLng) : undefined,
              roomType: mainSector === 'stays' ? roomType : undefined,
              vehicleType: mainSector === 'vehicles' ? vehicleType : undefined,
              registrationCategory: mainSector === 'vehicles' ? registrationCategory : undefined,
              cancellationPolicy,
              licensePlate: mainSector === 'vehicles' ? licensePlate : undefined,
              registrationDate: mainSector === 'vehicles' ? registrationDate : undefined,
            }
          : null,
      };

      const data = await api.partnerOnboard(payload);
      if (!data.ok) throw new Error();
      showToast('Onboarding submitted! Your account is pending admin approval.', 'success');
      // FIX #110: Clear persisted step on successful submission
      sessionStorage.removeItem('partner_onboarded');
      sessionStorage.removeItem('partner_onboarding_step');
      sessionStorage.removeItem(ONBOARDING_FORM_KEY);
      navigate('/partner', { replace: true });
    } catch (err) {
      showToast('Failed to finalize setup. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (!email) return null;

  const steps = [
    {
      id: 1,
      label: 'Identity',
      description: 'Business & compliance details',
      icon: <Briefcase size={16} />,
    },
    {
      id: 2,
      label: 'Location',
      description: 'Operational hub coordinates',
      icon: <MapPin size={16} />,
    },
    {
      id: 3,
      label: 'Inventory',
      description: 'Your first listing setup',
      icon: <PlusCircle size={16} />,
    },
    { id: 4, label: 'Review', description: 'Confirm & submit', icon: <CheckCircle size={16} /> },
  ];

  const staySubCategories = [
    'Resort / Hotel',
    'Homestay / Guesthouse',
    'Backpacker Hostel',
    'Private Villa / Independent House',
  ];
  const vehiclePartnerTypes = [
    'Individual / Peer-to-Peer Host',
    'Registered Rental Agency',
    'Hotel / Homestay Partner',
  ];
  const stayRoomTypes = [
    'Standard Room',
    'Deluxe Room',
    'Premium / Suite',
    'Dormitory Bed',
    'Bamboo Hut / Cottage',
    'Tent / Glamping',
  ];
  const vehicleTypes = ['Car', 'Scooter / Bike', 'Both (Cars & Bikes)'];
  const registrationCategories = [
    'Commercial Self-Drive (Black Plate / Yellow Text)',
    'Private Vehicle (White Plate)',
    'Commercial EV (Green Plate / Yellow Text)',
    'Commercial Chauffeur/Taxi (Yellow Plate / Black Text)',
  ];
  const cancellationPolicies = ['Flexible', 'Moderate', 'Strict'];

  const progressPct = ((step - 1) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* ── LEFT SIDEBAR ── */}
      <div className="hidden lg:flex flex-col w-[340px] xl:w-[380px] shrink-0 bg-slate-950 text-white relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -right-16 w-48 h-48 bg-emerald-400/8 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 left-8 w-56 h-56 bg-slate-700/40 rounded-full blur-2xl" />
        </div>

        {/* Sidebar content */}
        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-black text-lg tracking-tight leading-none">WAYZZA</p>
              <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-0.5">
                Partner Pro
              </p>
            </div>
          </div>

          {/* Step navigator */}
          <div className="flex-1 space-y-2">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-6">
              Onboarding Flow
            </p>
            {steps.map((s) => (
              <div
                key={s.id}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                  step === s.id
                    ? 'bg-white/10 border border-white/10'
                    : step > s.id
                      ? 'opacity-60'
                      : 'opacity-30'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    step > s.id ? 'bg-emerald-500' : step === s.id ? 'bg-white/20' : 'bg-white/5'
                  }`}
                >
                  {step > s.id ? (
                    <CheckCircle size={16} className="text-white" />
                  ) : (
                    <span className={step === s.id ? 'text-white' : 'text-slate-600'}>
                      {s.icon}
                    </span>
                  )}
                </div>
                <div>
                  <p
                    className={`text-sm font-bold ${step === s.id ? 'text-white' : 'text-slate-400'}`}
                  >
                    {s.label}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">{s.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-auto pt-10 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400">Progress</span>
              <span className="text-emerald-400">{Math.round(progressPct)}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                initial={false}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Step {step} of {steps.length}
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Mobile top nav */}
        <div className="lg:hidden flex items-center justify-between p-5 bg-white border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="font-black text-slate-900 tracking-tight">WAYZZA</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold uppercase tracking-widest px-2 py-0.5 rounded-md">
              Pro
            </span>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {step}/{steps.length}
          </span>
        </div>

        {/* Mobile progress bar */}
        <div className="lg:hidden h-1 bg-slate-100">
          <motion.div
            className="h-full bg-emerald-500 rounded-full"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-start justify-center p-6 md:p-12 lg:p-16">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              {/* ── STEP 1: IDENTITY ── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-10"
                >
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full mb-4">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                        Step 1 — Identity
                      </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                      Tell us about
                      <br />
                      <span className="text-emerald-600">your business.</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mt-3 max-w-md leading-relaxed">
                      Define your presence within the Wayzza partner network. This information will
                      be used for KYC verification.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Sector toggle */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Primary Service Sector
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <SectorCard
                          icon={<Home size={18} />}
                          title="Stays"
                          subtitle="Hotels & Homestays"
                          active={mainSector === 'stays'}
                          onClick={() => {
                            setMainSector('stays');
                            setSubCategory('Resort / Hotel');
                          }}
                        />
                        <SectorCard
                          icon={<Car size={18} />}
                          title="Vehicles"
                          subtitle="Cars & Bikes"
                          active={mainSector === 'vehicles'}
                          onClick={() => {
                            setMainSector('vehicles');
                            setSubCategory('Individual / Peer-to-Peer Host');
                          }}
                        />
                      </div>
                    </div>

                    {/* Business name */}
                    <StyledInput
                      label={
                        mainSector === 'stays'
                          ? 'Official Property Name'
                          : 'Official Business / Fleet Name'
                      }
                      value={businessName}
                      onChange={setBusinessName}
                      required
                      placeholder={
                        mainSector === 'stays' ? 'e.g. Azure Cliff Estate' : 'e.g. Wayzza Rentals'
                      }
                      icon={mainSector === 'stays' ? <Building size={16} /> : <Car size={16} />}
                    />

                    {/* Sub-category */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {mainSector === 'stays' ? 'Property Type' : 'Partner Type'}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(mainSector === 'stays' ? staySubCategories : vehiclePartnerTypes).map(
                          (item) => (
                            <CategoryPill
                              key={item}
                              label={item}
                              active={subCategory === item}
                              onClick={() => setSubCategory(item)}
                            />
                          )
                        )}
                      </div>
                    </div>

                    {/* MSME + GST side by side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <StyledInput
                        label="MSME Number"
                        required
                        value={msmeNumber}
                        onChange={(v) => setMsmeNumber(v.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
                        placeholder="UDYAM-KL-00-0000000"
                        maxLength={20}
                        icon={<FileText size={16} />}
                        hint="Format: UDYAM-ST-00-0000000"
                      />
                      <div className="space-y-2 group">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                          GST Number{' '}
                          <span className="text-slate-300 normal-case font-medium">(optional)</span>
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                            <Wallet size={16} />
                          </div>
                          <input
                            value={gstNumber}
                            onChange={(e) => {
                              const val = e.target.value
                                .toUpperCase()
                                .replace(/[^A-Z0-9]/g, '')
                                .slice(0, 15);
                              setGstNumber(val);
                              if (!val) setGstEnabled(false);
                            }}
                            placeholder="29ABCDE1234F1Z5"
                            maxLength={15}
                            className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                          />
                        </div>
                        {gstNumber.trim() !== '' && (
                          <label className="flex items-center gap-2 cursor-pointer pl-1 mt-1">
                            <input
                              type="checkbox"
                              checked={gstEnabled}
                              onChange={(e) => setGstEnabled(e.target.checked)}
                              className="w-4 h-4 accent-emerald-500 cursor-pointer rounded"
                            />
                            <span className="text-xs font-semibold text-slate-600">
                              Include GST on guest invoices
                            </span>
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Brand vision */}
                    <div className="space-y-2 group">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest group-focus-within:text-emerald-600 transition-colors">
                        Brand Vision{' '}
                        <span className="text-slate-300 normal-case font-medium">(optional)</span>
                      </label>
                      <textarea
                        value={brandVision}
                        onChange={(e) => setBrandVision(e.target.value)}
                        placeholder={
                          mainSector === 'stays'
                            ? "Describe your property's vibe, story, or unique character..."
                            : 'Describe your fleet and what makes your rental experience special...'
                        }
                        className="w-full h-28 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Nav */}
                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      onClick={() => {
                        if (!businessName.trim()) {
                          showToast('Please enter your business name.', 'error');
                          return;
                        }
                        if (!subCategory) {
                          showToast('Please select your category.', 'error');
                          return;
                        }
                        if (!msmeNumber.trim()) {
                          showToast('MSME number is required to continue.', 'error');
                          return;
                        }
                        goToStep(2);
                      }}
                      className="flex items-center gap-3 h-12 px-8 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
                    >
                      Continue <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2: LOCATION ── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-10"
                >
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full mb-4">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                        Step 2 — Location
                      </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                      Where are
                      <br />
                      <span className="text-emerald-600">you based?</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mt-3 max-w-md leading-relaxed">
                      Specify your geographic hub so guests can discover your{' '}
                      {mainSector === 'stays' ? 'property' : 'vehicles'} through search and maps.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <StyledInput
                      label={
                        mainSector === 'stays' ? 'Property Location' : 'Vehicle Hub / Base Location'
                      }
                      required
                      value={location}
                      onChange={setLocation}
                      placeholder="e.g. Varkala Cliff, Kerala"
                      icon={<MapPin size={16} />}
                    />

                    {/* Quick picks */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Quick Select — Popular Hubs
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['Kappil', 'Sree Janardhanapuram', 'North Cliff', 'South Cliff'].map(
                          (h) => (
                            <button
                              key={h}
                              type="button"
                              onClick={() => setLocation(h)}
                              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                location === h
                                  ? 'bg-emerald-600 text-white shadow-md'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600'
                              }`}
                            >
                              <Globe size={11} /> {h}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Coordinates grid */}
                    <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center">
                            <MapPin size={12} className="text-slate-400" />
                          </div>
                          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                            GPS Coordinates <span className="text-rose-500 font-bold">*</span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleDetectLocation}
                          disabled={detectingLoc}
                          className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 disabled:opacity-50 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-200/50 flex items-center gap-1.5 transition-all"
                        >
                          {detectingLoc ? (
                            <div className="w-3 h-3 border-2 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin" />
                          ) : (
                            <Navigation size={10} />
                          )}
                          <span>{detectingLoc ? 'Detecting...' : 'Detect GPS'}</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <StyledInput
                          label="Latitude"
                          value={listingLat}
                          onChange={setListingLat}
                          placeholder="e.g. 8.7379"
                          type="number"
                          icon={<MapPin size={14} />}
                        />
                        <StyledInput
                          label="Longitude"
                          value={listingLng}
                          onChange={setListingLng}
                          placeholder="e.g. 76.7143"
                          type="number"
                          icon={<MapPin size={14} />}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      onClick={() => goToStep(1)}
                      className="flex items-center gap-2 h-12 px-6 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all active:scale-95"
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button
                      onClick={() => {
                        if (!location) {
                          showToast('Please specify an operational location', 'error');
                          return;
                        }
                        if (
                          !listingLat ||
                          isNaN(Number(listingLat)) ||
                          Number(listingLat) < -90 ||
                          Number(listingLat) > 90
                        ) {
                          showToast('Please provide a valid Latitude between -90 and 90.', 'error');
                          return;
                        }
                        if (
                          !listingLng ||
                          isNaN(Number(listingLng)) ||
                          Number(listingLng) < -180 ||
                          Number(listingLng) > 180
                        ) {
                          showToast(
                            'Please provide a valid Longitude between -180 and 180.',
                            'error'
                          );
                          return;
                        }
                        goToStep(3);
                      }}
                      className="flex items-center gap-3 h-12 px-8 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
                    >
                      Continue <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: INVENTORY ── */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-10"
                >
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full mb-4">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                        Step 3 — Inventory
                      </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                      Set up your
                      <br />
                      <span className="text-emerald-600">first listing.</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mt-3 max-w-md leading-relaxed">
                      {mainSector === 'stays'
                        ? 'Configure your first property listing. You can add more rooms and photos after onboarding.'
                        : 'Configure your first vehicle listing. You can add more vehicles and photos after onboarding.'}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Listing name */}
                    <StyledInput
                      label={mainSector === 'stays' ? 'Property / Room Name' : 'Vehicle Name'}
                      required
                      value={listingName}
                      onChange={setListingName}
                      placeholder={
                        mainSector === 'stays'
                          ? 'e.g. Oceanfront Cliff Suite'
                          : 'e.g. Royal Enfield Classic 350'
                      }
                      icon={mainSector === 'stays' ? <Building size={16} /> : <Bike size={16} />}
                    />

                    {/* Type chips */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {mainSector === 'stays' ? 'Room Type' : 'Vehicle Type'}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(mainSector === 'stays' ? stayRoomTypes : vehicleTypes).map((item) => {
                          const isActive =
                            mainSector === 'stays' ? roomType === item : vehicleType === item;
                          const setter = mainSector === 'stays' ? setRoomType : setVehicleType;
                          return (
                            <CategoryPill
                              key={item}
                              label={item}
                              active={isActive}
                              onClick={() => setter(item)}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Vehicle-specific fields */}
                    {mainSector === 'vehicles' && (
                      <>
                        <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl space-y-4">
                          <div className="flex items-center gap-2">
                            <ShieldCheck size={14} className="text-amber-600" />
                            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                              Registration / Legal Category
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {registrationCategories.map((item) => (
                              <button
                                key={item}
                                type="button"
                                onClick={() => setRegistrationCategory(item)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all text-left flex items-center gap-2 ${
                                  registrationCategory === item
                                    ? 'bg-amber-600 text-white shadow-md'
                                    : 'bg-white border border-amber-200 text-amber-700 hover:border-amber-400'
                                }`}
                              >
                                <ShieldCheck size={11} /> {item}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <StyledInput
                            label="License Plate"
                            required
                            value={licensePlate}
                            onChange={setLicensePlate}
                            placeholder="e.g. KL-01-CA-1234"
                            icon={<ShieldCheck size={16} />}
                          />
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                              Registration Date <span className="text-rose-400">*</span>
                            </label>
                            <input
                              type="date"
                              required
                              value={registrationDate}
                              onChange={(e) => setRegistrationDate(e.target.value)}
                              className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Price + payout */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <StyledInput
                        label={`Base Rate (INR) / ${mainSector === 'stays' ? 'night' : 'day'}`}
                        required
                        value={price}
                        onChange={setPrice}
                        type="number"
                        placeholder="e.g. 2500"
                        icon={<Wallet size={16} />}
                      />
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                          Est. Payout (88%)
                        </label>
                        <div className="h-12 bg-slate-900 rounded-xl px-4 flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                            Net Earning
                          </span>
                          <span className="text-lg font-black text-white">
                            ₹{price ? (parseInt(price) * 0.88).toLocaleString() : '0'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cancellation policy */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Cancellation Policy
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {cancellationPolicies.map((item) => (
                          <CategoryPill
                            key={item}
                            label={item}
                            active={cancellationPolicy === item.toLowerCase()}
                            onClick={() => setCancellationPolicy(item.toLowerCase())}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      onClick={() => goToStep(2)}
                      className="flex items-center gap-2 h-12 px-6 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all active:scale-95"
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button
                      onClick={() => {
                        if (!listingName) {
                          showToast('Please define the listing name', 'error');
                          return;
                        }
                        if (mainSector === 'vehicles') {
                          if (!vehicleType) {
                            showToast('Please select a vehicle type', 'error');
                            return;
                          }
                          if (!registrationCategory) {
                            showToast('Please select a registration category', 'error');
                            return;
                          }
                          if (!licensePlate.trim()) {
                            showToast('Please enter the vehicle license plate number', 'error');
                            return;
                          }
                          if (!registrationDate) {
                            showToast('Please select the vehicle registration date', 'error');
                            return;
                          }
                        }
                        if (!price) {
                          showToast('Base rate is required', 'error');
                          return;
                        }
                        if (isNaN(Number(price)) || Number(price) <= 0) {
                          showToast('Base rate must be a valid positive number.', 'error');
                          return;
                        }
                        goToStep(4);
                      }}
                      className="flex items-center gap-3 h-12 px-8 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
                    >
                      Continue <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 4: REVIEW & SUBMIT ── */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-10"
                >
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full mb-4">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                        Step 4 — Review
                      </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                      Almost there.
                      <br />
                      <span className="text-emerald-600">Review & submit.</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mt-3 max-w-md leading-relaxed">
                      Your profile and first listing are configured. Submit for admin KYC review —
                      you'll be notified within 24 hours.
                    </p>
                  </div>

                  {/* Summary cards */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { label: 'Business', value: businessName, icon: <Building size={14} /> },
                        {
                          label: 'Sector',
                          value: mainSector === 'stays' ? 'Stays' : 'Vehicles',
                          icon: mainSector === 'stays' ? <Home size={14} /> : <Car size={14} />,
                        },
                        { label: 'Location', value: location, icon: <MapPin size={14} /> },
                        { label: 'Type', value: subCategory, icon: <Star size={14} /> },
                        {
                          label: 'First Listing',
                          value: listingName,
                          icon: <PlusCircle size={14} />,
                        },
                        {
                          label: 'Base Rate',
                          value: price ? `₹${Number(price).toLocaleString()}` : '—',
                          icon: <Wallet size={14} />,
                        },
                      ].map(({ label, value, icon }) => (
                        <div
                          key={label}
                          className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl"
                        >
                          <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                            {icon}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {label}
                            </p>
                            <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">
                              {value || '—'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={finishOnboarding}
                      disabled={loading}
                      className="w-full h-14 bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/25 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle size={18} /> Submit for Review
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => goToStep(3)}
                      className="w-full h-12 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowLeft size={15} /> Go back and edit
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
