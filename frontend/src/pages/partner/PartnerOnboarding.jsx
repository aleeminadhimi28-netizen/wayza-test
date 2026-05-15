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
} from 'lucide-react';
import { useAuth } from '../../AuthContext.jsx';
import { useToast } from '../../ToastContext.jsx';
import { api } from '../../utils/api.js';

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  icon,
  type = 'text',
  maxLength,
  required = false,
}) {
  return (
    <div className="space-y-4 group">
      <label className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] ml-2 group-focus-within:text-emerald-600 transition-colors">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-emerald-500 transition-colors">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full h-16 bg-white/50 border border-slate-100 rounded-[24px] pl-16 pr-6 font-bold text-sm tracking-widest text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-100 shadow-sm uppercase"
        />
      </div>
    </div>
  );
}

function Nav({ back, next }) {
  return (
    <div className="flex items-center justify-between pt-8 border-t border-slate-100">
      {back ? (
        <button
          onClick={back}
          className="w-14 h-14 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-200 transition-all active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
      ) : (
        <div />
      )}
      {next && (
        <button
          onClick={next}
          className="h-14 px-8 bg-slate-950 text-white rounded-full font-black uppercase text-[10px] tracking-[0.4em] flex items-center gap-4 hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
        >
          Continue <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}

export default function PartnerOnboarding() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mainSector, setMainSector] = useState('stays');

  const [businessName, setBusinessName] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [brandVision, setBrandVision] = useState('');
  const [location, setLocation] = useState('');

  // MSME / GST
  const [msmeNumber, setMsmeNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [gstEnabled, setGstEnabled] = useState(false);

  // Listing fields
  const [listingName, setListingName] = useState('');
  const [price, setPrice] = useState('');
  const [listingLat, setListingLat] = useState('');
  const [listingLng, setListingLng] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState('moderate');

  // Stays listing
  const [roomType, setRoomType] = useState('');
  // Vehicles listing
  const [vehicleType, setVehicleType] = useState('');
  const [registrationCategory, setRegistrationCategory] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'partner') {
      navigate('/partner-login', { replace: true });
    } else {
      setEmail(user.email);
      api.partnerStatus().then((res) => {
        if (res.mainSector) setMainSector(res.mainSector);
        if (res.mainSector === 'stays') setSubCategory('Resort / Hotel');
        else if (res.mainSector === 'vehicles') setSubCategory('Individual / Peer-to-Peer Host');
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
    // Validate MSME format: UDYAM-XX-00-XXXXXXX (alphanumeric, 2-letter state, 2-digit dist, 7-digit num)
    const msmeRegex = /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/;
    if (!msmeRegex.test(msmeNumber.trim())) {
      showToast('Invalid MSME format. Expected: UDYAM-ST-00-0000000', 'error');
      return;
    }
    // Validate GST format if provided
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
            }
          : null,
      };

      const data = await api.partnerOnboard(payload);

      if (!data.ok) throw new Error();
      showToast('Onboarding submitted! Your account is pending admin approval.', 'success');
      sessionStorage.removeItem('partner_onboarded');
      navigate('/partner', { replace: true });
    } catch (err) {
      showToast('Failed to finalize setup. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (!email) return null;

  const steps = [
    { id: 1, title: 'Identity', icon: <Briefcase /> },
    { id: 2, title: 'Location', icon: <MapPin /> },
    { id: 3, title: 'Inventory', icon: <PlusCircle /> },
    { id: 4, title: 'Finalize', icon: <CheckCircle /> },
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
  const vehicleTypes = ['Car', 'Scooter or Bike', 'Both'];
  const registrationCategories = [
    'Commercial Self-Drive (Black Plate / Yellow Text)',
    'Private Vehicle (White Plate)',
    'Commercial EV (Green Plate / Yellow Text)',
    'Commercial Chauffeur/Taxi (Yellow Plate / Black Text)',
  ];
  const cancellationPolicies = ['Flexible', 'Moderate', 'Strict'];

  return (
    <div className="min-h-screen bg-white font-sans flex items-center justify-center p-6 relative overflow-hidden selection:bg-emerald-100 selection:text-emerald-900">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/40 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-100/60 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-amber-50/30 blur-[100px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl bg-white/40 backdrop-blur-3xl rounded-[64px] p-12 md:p-20 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.08)] border border-white/40 relative z-10 overflow-hidden"
      >
        <div className="absolute top-12 right-12 flex items-center gap-3">
          <span className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-300">
            Wayzza
          </span>
          <div className="px-3 py-1 bg-slate-950 text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-md">
            Pro
          </div>
        </div>

        <div className="flex items-center gap-6 mb-24">
          {steps.map((s, _i) => (
            <div key={s.id} className="flex-1 space-y-4">
              <div
                className={`h-1.5 rounded-full transition-all duration-1000 ${step >= s.id ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-100'}`}
              />
              <div
                className={`flex items-center gap-3 transition-opacity duration-500 ${step === s.id ? 'opacity-100' : 'opacity-20'}`}
              >
                <span className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-900">
                  {s.title}
                </span>
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── PHASE 01: IDENTITY ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="space-y-16"
            >
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <span className="h-px w-12 bg-emerald-500" />
                  <span className="text-[11px] font-black uppercase tracking-[0.5em] text-emerald-600">
                    Phase 01: Onboarding
                  </span>
                </div>
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 uppercase leading-[0.8]">
                  Partner <br />
                  <span className="lowercase">Identity.</span>
                </h2>
                <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest leading-relaxed max-w-sm">
                  "Define your presence within the Wayzza luxury network architecture."
                </p>
              </div>

              <div className="space-y-12">
                <FormInput
                  label="Official Asset Name"
                  value={businessName}
                  onChange={setBusinessName}
                  required
                  placeholder="E.G. AZURE CLIFF ESTATE"
                  icon={<Building size={24} />}
                />

                {/* Sub-Category / Partner Type based on mainSector */}
                <div className="space-y-6">
                  <label className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] ml-2">
                    {mainSector === 'stays' ? 'Property Sub-Category' : 'Partner Type (Compliance)'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(mainSector === 'stays' ? staySubCategories : vehiclePartnerTypes).map(
                      (item) => (
                        <button
                          key={item}
                          onClick={() => setSubCategory(item)}
                          className={`p-6 rounded-[32px] border-2 transition-all text-left flex items-center gap-6 group/btn ${subCategory === item ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-600/20' : 'bg-white/50 border-slate-100 text-slate-900 hover:border-emerald-200'}`}
                        >
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${subCategory === item ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400 group-hover/btn:text-emerald-500'}`}
                          >
                            {mainSector === 'stays' ? (
                              <Home size={20} />
                            ) : (
                              <ShieldCheck size={20} />
                            )}
                          </div>
                          <p className="font-black uppercase tracking-widest text-[10px] leading-relaxed">
                            {item}
                          </p>
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* MSME & GST */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormInput
                    label="MSME Number"
                    required
                    value={msmeNumber}
                    onChange={(v) => {
                      const cleaned = v.toUpperCase().replace(/[^A-Z0-9-]/g, '');
                      setMsmeNumber(cleaned);
                    }}
                    placeholder="UDYAM-KL-00-0000000"
                    maxLength={20}
                    icon={<Briefcase size={20} />}
                  />
                  <div className="space-y-4 group">
                    <label className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] ml-2 group-focus-within:text-emerald-600 transition-colors">
                      GST Number <span className="text-slate-200">(optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-emerald-500 transition-colors">
                        <Wallet size={20} />
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
                        className="w-full h-16 bg-white/50 border border-slate-100 rounded-[24px] pl-16 pr-6 font-bold text-sm tracking-widest text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-100 shadow-sm uppercase"
                      />
                    </div>
                    {gstNumber.trim() !== '' && (
                      <label className="flex items-center gap-3 cursor-pointer pl-2 mt-2">
                        <input
                          type="checkbox"
                          checked={gstEnabled}
                          onChange={(e) => setGstEnabled(e.target.checked)}
                          className="w-5 h-5 accent-emerald-500 rounded bg-white border-slate-200 cursor-pointer"
                        />
                        <span className="text-sm font-semibold text-slate-700">
                          Include GST on guest invoices
                        </span>
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-4 group">
                  <label className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] ml-2 group-focus-within:text-emerald-600 transition-colors">
                    Brand Vision Signature
                  </label>
                  <textarea
                    value={brandVision}
                    onChange={(e) => setBrandVision(e.target.value)}
                    placeholder="Briefly describe your property/fleet's soul..."
                    className="w-full h-32 bg-white/50 border border-slate-100 rounded-[32px] p-8 font-bold text-lg tracking-tight text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-100 shadow-sm resize-none"
                  />
                </div>
              </div>
              <Nav
                next={() => {
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
                  setStep(2);
                }}
              />
            </motion.div>
          )}

          {/* ── PHASE 02: LOCATION ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="space-y-16"
            >
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <span className="h-px w-12 bg-emerald-500" />
                  <span className="text-[11px] font-black uppercase tracking-[0.5em] text-emerald-600">
                    Phase 02: Deployment
                  </span>
                </div>
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 uppercase leading-[0.8]">
                  Operational <br />
                  <span className="lowercase">Location.</span>
                </h2>
                <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest leading-relaxed max-w-sm">
                  "Specify your geographic focus for guest discovery and route optimization."
                </p>
              </div>

              <div className="space-y-12">
                <FormInput
                  label="Primary Operation Hub"
                  required
                  value={location}
                  onChange={setLocation}
                  placeholder="E.G. VARKALA CLIFF, KERALA"
                  icon={<MapPin size={24} />}
                />

                {/* Coordinates (optional, for map discovery) */}
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Latitude (optional)"
                    value={listingLat}
                    onChange={setListingLat}
                    placeholder="8.7379"
                    type="number"
                    icon={<MapPin size={18} />}
                  />
                  <FormInput
                    label="Longitude (optional)"
                    value={listingLng}
                    onChange={setListingLng}
                    placeholder="76.7143"
                    type="number"
                    icon={<MapPin size={18} />}
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] ml-2">
                    Suggested Premium Hubs
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      'Varkala North Cliff',
                      'South Cliff Shore',
                      'Black Beach District',
                      'Edava Lakefront',
                    ].map((h) => (
                      <button
                        key={h}
                        onClick={() => setLocation(h)}
                        className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${location === h ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <Nav
                back={() => setStep(1)}
                next={() => {
                  if (!location) {
                    showToast('Please specify an operational location', 'error');
                    return;
                  }
                  setStep(3);
                }}
              />
            </motion.div>
          )}

          {/* ── PHASE 03: INVENTORY ── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="space-y-16"
            >
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <span className="h-px w-12 bg-emerald-500" />
                  <span className="text-[11px] font-black uppercase tracking-[0.5em] text-emerald-600">
                    Phase 03: Inventory
                  </span>
                </div>
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 uppercase leading-[0.8]">
                  Primary <br />
                  <span className="lowercase">Listing.</span>
                </h2>
                <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest leading-relaxed max-w-sm">
                  "Initial asset configuration. Complete asset-specific legal KYC logic."
                </p>
              </div>

              <div className="space-y-10">
                <FormInput
                  label="Listing Descriptor"
                  required
                  value={listingName}
                  onChange={setListingName}
                  placeholder={
                    mainSector === 'stays'
                      ? 'E.G. OCEAN FRONT SANCTUARY'
                      : 'E.G. ROYAL ENFIELD CLASSIC 350'
                  }
                  icon={mainSector === 'stays' ? <Building size={24} /> : <Bike size={24} />}
                />

                {/* Dynamic Asset selection */}
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] ml-2">
                    {mainSector === 'stays' ? 'Room Type' : 'Vehicle Type'}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {(mainSector === 'stays' ? stayRoomTypes : vehicleTypes).map((item) => {
                      const isActive =
                        mainSector === 'stays' ? roomType === item : vehicleType === item;
                      const setter = mainSector === 'stays' ? setRoomType : setVehicleType;
                      return (
                        <button
                          key={item}
                          onClick={() => setter(item)}
                          className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Legal Registration Category for Vehicles */}
                {mainSector === 'vehicles' && (
                  <div className="space-y-4 p-6 bg-rose-50/50 rounded-3xl border border-rose-100">
                    <label className="text-[11px] font-black text-rose-500 uppercase tracking-[0.5em] ml-2">
                      Registration Category (Liability)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {registrationCategories.map((item) => (
                        <button
                          key={item}
                          onClick={() => setRegistrationCategory(item)}
                          className={`p-4 rounded-[20px] border-2 transition-all text-left flex items-center gap-4 ${registrationCategory === item ? 'bg-rose-500 border-rose-500 text-white shadow-xl shadow-rose-500/20' : 'bg-white border-rose-100 text-slate-700 hover:border-rose-300'}`}
                        >
                          <ShieldCheck
                            size={16}
                            className={
                              registrationCategory === item ? 'text-white/60' : 'text-rose-400'
                            }
                          />
                          <p className="font-black uppercase tracking-widest text-[9px] leading-relaxed">
                            {item}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pricing & Net Payout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                  <FormInput
                    label="Base Access Rate (INR)"
                    value={price}
                    onChange={setPrice}
                    required
                    type="number"
                    placeholder="2500"
                    icon={<Wallet size={24} />}
                  />
                  <div className="h-16 bg-slate-900 rounded-[24px] px-6 flex items-center justify-between">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                      Est. Net Payout (88%)
                    </p>
                    <p className="text-xl font-black text-white tracking-tighter">
                      ₹{price ? (parseInt(price) * 0.88).toLocaleString() : '0'}
                    </p>
                  </div>
                </div>

                {/* Cancellation Policy */}
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] ml-2">
                    Cancellation Policy
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {cancellationPolicies.map((item) => (
                      <button
                        key={item}
                        onClick={() => setCancellationPolicy(item.toLowerCase())}
                        className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${cancellationPolicy === item.toLowerCase() ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <Nav
                back={() => setStep(2)}
                next={() => {
                  if (!listingName) {
                    showToast('Please define the listing name', 'error');
                    return;
                  }
                  if (!price) {
                    showToast('Base rate is required', 'error');
                    return;
                  }
                  setStep(4);
                }}
              />
            </motion.div>
          )}

          {/* ── PHASE 04: FINALIZE ── */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-16 text-center py-10"
            >
              <div className="w-24 h-24 bg-emerald-500 rounded-[40px] shadow-2xl shadow-emerald-500/30 flex items-center justify-center mx-auto mb-12">
                <CheckCircle size={48} className="text-white" />
              </div>
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-4">
                  Protocol Initialized
                </div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 uppercase leading-[0.85]">
                  Verification <br />
                  <span className="lowercase text-emerald-500">Pending.</span>
                </h2>
                <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest leading-relaxed max-w-sm mx-auto">
                  "Your partner profile and primary asset are configured. Wayzza Admin will review
                  your KYC and compliance documents."
                </p>
              </div>
              <div className="pt-8">
                <button
                  onClick={finishOnboarding}
                  disabled={loading}
                  className="w-full h-20 bg-slate-950 text-white rounded-[40px] font-black uppercase text-xs tracking-[0.4em] hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-900/20 active:scale-[0.98] flex items-center justify-center gap-6 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Authorize Final Configuration</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => setStep(3)}
                  className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                >
                  Go Back to Edit
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
