import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  X,
  Wifi,
  Settings2,
  Activity,
  Database,
  Zap,
  Layers,
  ChevronLeft,
  Target,
  Cpu,
  Sparkles,
  History,
  Car,
} from 'lucide-react';
import { useToast } from '../../ToastContext.jsx';

import { api, BASE_URL } from '../../utils/api.js';
import { fixImg } from '../../utils/image.js';
import {
  AMENITY_CATEGORIES,
  VEHICLE_AMENITY_CATEGORIES,
  ALL_AMENITIES,
} from '../../utils/amenities.js';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';

const ROOM_NAME_OPTIONS = [
  'Standard Room',
  'Deluxe Room',
  'Super Deluxe Room',
  'Premium Room',
  'Suite',
  'Executive Suite',
  'Family Suite',
  'Presidential Suite',
  'Studio Room',
  'Penthouse',
  'Villa',
  'Cottage',
  'Cabin',
  'Dorm Bed',
];

const VEHICLE_NAME_OPTIONS = [
  'Scooter',
  'Cruiser Bike',
  'Sport Bike',
  'Royal Enfield',
  'Hatchback Car',
  'Sedan Car',
  'SUV Car',
  'Luxury Car',
  'Convertible Car',
  'Off-road Vehicle',
];

const OTHER_NAME_OPTIONS = ['Standard Package', 'Premium Tour', 'Custom Entry'];

export default function PartnerProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [listing, setListing] = useState(null);
  const [loadError, setLoadError] = useState(false);

  const [type, setType] = useState('Room');
  const [name, setName] = useState('');
  const [selectedNameOption, setSelectedNameOption] = useState('');
  const [variantAmenities, setVariantAmenities] = useState([]);
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [available, setAvailable] = useState(true);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');

  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  // Listing editing
  const [isEditingMain, setIsEditingMain] = useState(false);
  const [mainTitle, setMainTitle] = useState('');
  const [mainVideo, setMainVideo] = useState('');
  const [mainAmenities, setMainAmenities] = useState([]);
  const [mainWifiSpeed, setMainWifiSpeed] = useState('');
  const [mainLicensePlate, setMainLicensePlate] = useState('');
  const [mainRegistrationDate, setMainRegistrationDate] = useState('');
  const [mainVehicleType, setMainVehicleType] = useState('');
  const [mainRegistrationCategory, setMainRegistrationCategory] = useState('');
  const [mainCancellationPolicy, setMainCancellationPolicy] = useState('moderate');
  const [mainRcDoc, setMainRcDoc] = useState('');
  const [mainInsuranceDoc, setMainInsuranceDoc] = useState('');
  const [mainPucDoc, setMainPucDoc] = useState('');

  const [rcFile, setRcFile] = useState(null);
  const [rcPreview, setRcPreview] = useState('');
  const [insFile, setInsFile] = useState(null);
  const [insPreview, setInsPreview] = useState('');
  const [pucFile, setPucFile] = useState(null);
  const [pucPreview, setPucPreview] = useState('');

  const [mainLoading, setMainLoading] = useState(false);
  const isVehicle = listing?.category === 'bike' || listing?.category === 'car';

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, onConfirm: () => {} });

  // FIX #98: Remove editIndex from deps — editing a variant should NOT re-fetch and
  // overwrite form state. load() only needs to re-run when id or showToast changes.
  const load = useCallback(async () => {
    try {
      const data = await api.getListing(id);
      const l = data.data || data;
      setListing(l);
      setLoadError(false);
      setMainTitle(l.title || '');
      setMainVideo(l.walkthroughVideo || '');
      setMainAmenities(l.amenities || []);
      setMainWifiSpeed(l.wifiSpeed || '');
      setMainLicensePlate(l.licensePlate || '');
      setMainRegistrationDate(l.registrationDate || '');
      setMainVehicleType(l.vehicleType || '');
      setMainRegistrationCategory(l.registrationCategory || '');
      setMainCancellationPolicy(l.cancellationPolicy || 'moderate');
      setMainRcDoc(l.rcDoc || '');
      setMainInsuranceDoc(l.insuranceDoc || '');
      setMainPucDoc(l.pucDoc || '');

      setRcFile(null);
      setRcPreview('');
      setInsFile(null);
      setInsPreview('');
      setPucFile(null);
      setPucPreview('');

      // Only reset the variant type when not in edit mode
      if (editIndex === null) {
        setType(l.category === 'bike' || l.category === 'car' ? 'Vehicle' : 'Room');
      }
    } catch (err) {
      setLoadError(true);
      showToast('Failed to load property. Please try again.', 'error');
    }
  }, [id, showToast]); // editIndex intentionally removed from deps

  useEffect(() => {
    load();
  }, [load]);

  function resetForm() {
    setType(listing?.category === 'bike' || listing?.category === 'car' ? 'Vehicle' : 'Room');
    setName('');
    setSelectedNameOption('');
    setVariantAmenities([]);
    setPrice('');
    setDesc('');
    setAvailable(true);
    setFile(null);
    setPreview('');
    setEditIndex(null);
  }

  function handleFile(e) {
    const f = e.target.files[0];
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  }

  function removeImage() {
    setFile(null);
    setPreview('');
  }

  async function uploadImage() {
    if (!file) return null;
    const fd = new FormData();
    fd.append('image', file);
    const d = await api.uploadImage(fd);
    // FIX #99: Return null on failure instead of undefined to avoid overwriting existing images
    if (!d.ok || !d.filename) return null;
    return d.filename;
  }

  async function save(e) {
    e.preventDefault();
    if (!name || !price) {
      showToast('Please fill in the name and price fields.', 'warning');
      return;
    }

    setLoading(true);
    try {
      let image = null;
      if (file) {
        const uploaded = await uploadImage();
        if (uploaded) image = uploaded;
      }

      const payload = {
        type,
        name,
        price: Number(price) || 0,
        desc,
        available,
        amenities: variantAmenities,
        ...(image ? { image } : {}),
      };

      if (editIndex === null) {
        const data = await api.addVariant(id, payload);
        if (data.ok)
          showToast(
            isVehicle ? 'Unit added successfully.' : 'Variant added successfully.',
            'success'
          );
        else showToast(isVehicle ? 'Failed to add unit.' : 'Failed to add variant.', 'error');
      } else {
        const data = await api.updateVariant(id, editIndex, payload);
        if (data.ok)
          showToast(
            isVehicle ? 'Unit updated successfully.' : 'Variant updated successfully.',
            'success'
          );
        else showToast(isVehicle ? 'Failed to update unit.' : 'Failed to update variant.', 'error');
      }

      resetForm();
      load();
    } catch {
      showToast('Failed to save. Please check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(v, i) {
    setEditIndex(i);
    const typeVal = v.type || 'Room';
    setType(typeVal);
    const nameVal = v.name || '';
    setName(nameVal);

    const options =
      typeVal === 'Vehicle'
        ? VEHICLE_NAME_OPTIONS
        : typeVal === 'Room'
          ? ROOM_NAME_OPTIONS
          : OTHER_NAME_OPTIONS;
    if (options.includes(nameVal)) {
      setSelectedNameOption(nameVal);
    } else {
      setSelectedNameOption(nameVal ? 'Custom' : '');
    }

    setVariantAmenities(v.amenities || []);
    setPrice(v.price || '');
    setDesc(v.desc || '');
    setAvailable(v.available !== false);
    const BASE = BASE_URL;
    setPreview(v.image ? (v.image.startsWith('http') ? v.image : `${BASE}/${v.image}`) : '');
    setFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function remove(i) {
    setConfirmModal({
      isOpen: true,
      onConfirm: () => executeRemove(i),
    });
  }

  async function executeRemove(i) {
    try {
      const data = await api.deleteVariant(id, i);
      if (data.ok) {
        showToast(isVehicle ? 'Unit removed.' : 'Variant removed.', 'success');
        load();
      } else {
        showToast(isVehicle ? 'Failed to delete unit.' : 'Failed to delete variant.', 'error');
      }
    } catch {
      showToast('Connection error. Please try again.', 'error');
    }
  }

  async function toggleAvailable(i, current) {
    try {
      const updated = { ...listing.variants[i], available: !current };
      await api.updateVariant(id, i, updated);
      load();
    } catch {
      showToast('Failed to update availability.', 'error');
    }
  }

  async function updateMainDetails() {
    setMainLoading(true);
    try {
      let rcPath = mainRcDoc;
      let insPath = mainInsuranceDoc;
      let pucPath = mainPucDoc;

      if (rcFile) {
        const fd = new FormData();
        fd.append('image', rcFile);
        const res = await api.uploadImage(fd);
        if (res.ok) rcPath = res.filename;
      }
      if (insFile) {
        const fd = new FormData();
        fd.append('image', insFile);
        const res = await api.uploadImage(fd);
        if (res.ok) insPath = res.filename;
      }
      if (pucFile) {
        const fd = new FormData();
        fd.append('image', pucFile);
        const res = await api.uploadImage(fd);
        if (res.ok) pucPath = res.filename;
      }

      const payload = {
        title: mainTitle,
        walkthroughVideo: mainVideo,
        amenities: mainAmenities,
        ...(isVehicle
          ? {
              licensePlate: mainLicensePlate,
              registrationDate: mainRegistrationDate,
              vehicleType: mainVehicleType,
              registrationCategory: mainRegistrationCategory,
              cancellationPolicy: mainCancellationPolicy,
              rcDoc: rcPath,
              insuranceDoc: insPath,
              pucDoc: pucPath,
            }
          : {
              wifiSpeed: Number(mainWifiSpeed) || 0,
            }),
      };

      const data = await api.updateListing(id, payload);
      if (data.ok) {
        showToast(isVehicle ? 'Vehicle details updated.' : 'Property details updated.', 'success');
        setIsEditingMain(false);
        load();
      } else {
        showToast(
          isVehicle ? 'Failed to update vehicle details.' : 'Failed to update property details.',
          'error'
        );
      }
    } catch {
      showToast('Connection error. Please try again.', 'error');
    }
    setMainLoading(false);
  }

  const cachedSector = sessionStorage.getItem('partner_main_sector');
  const isSectorVehicle = cachedSector === 'vehicles';

  // FIX #101: Show error state instead of infinite spinner when listing fails to load
  if (!listing)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-[#050a08]">
        {loadError ? (
          <>
            <p className="text-sm font-bold text-rose-400 uppercase tracking-widest">
              Failed to load {isSectorVehicle ? 'vehicle' : 'property'}.
            </p>
            <button
              onClick={load}
              className="h-10 px-6 bg-emerald-500 text-slate-950 rounded-xl font-bold text-sm hover:bg-emerald-400 transition-all"
            >
              Retry
            </button>
          </>
        ) : (
          <>
            <div className="w-10 h-10 border-2 border-white/10 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-sm font-bold text-white/30 uppercase tracking-widest">
              Loading {isSectorVehicle ? 'vehicle' : 'property'}...
            </p>
          </>
        )}
      </div>
    );

  return (
    <div className="min-h-screen bg-[#050a08] font-sans text-white selection:bg-emerald-900/50 selection:text-emerald-200 pb-20">
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-10 space-y-8">
        {/* PENDING APPROVAL BANNER */}
        {!listing.approved && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
              <Activity size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-amber-900">Pending Admin Approval</h3>
              <p className="text-xs text-amber-700 mt-0.5">
                This {isVehicle ? 'vehicle' : 'property'} is awaiting review by the Wayzza team. It
                will not appear in public listings until approved. You can still add variants and
                configure details while you wait.
              </p>
            </div>
          </div>
        )}

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide">
              {isVehicle ? <Car size={14} /> : <Settings2 size={14} />}{' '}
              {isVehicle ? 'Vehicle' : 'Property'} Configuration
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              {listing.title} <span className="text-emerald-500">Variants</span>
            </h1>
            <p className="text-slate-500 text-sm">
              Manage variants, options, or pricing tiers for this{' '}
              {isVehicle ? 'vehicle' : 'property'}.
            </p>
          </div>

          <button
            onClick={() => navigate('/partner/properties')}
            className="h-11 px-6 bg-slate-100 text-slate-900 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors shadow-sm active:scale-95 whitespace-nowrap"
          >
            <ChevronLeft size={16} />
            <span>Back to {isVehicle ? 'Inventory' : 'Properties'}</span>
          </button>
        </div>

        {/* MAIN DETAILS EDIT PANEL */}
        <AnimatePresence>
          {isEditingMain ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-900 rounded-3xl p-8 border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 text-emerald-400 font-black text-[11px] uppercase tracking-[0.4em] mb-6">
                <Cpu size={14} /> Update Core Manifest
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-white/40 ml-2">
                    {isVehicle ? 'Vehicle Identity' : 'Property Identity'}
                  </label>
                  <input
                    type="text"
                    value={mainTitle}
                    onChange={(e) => setMainTitle(e.target.value)}
                    placeholder={
                      isVehicle ? 'e.g. Royal Enfield Himalayan' : 'e.g. Ocean View Villa'
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 px-6 text-white font-bold text-sm outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-white/40 ml-2">
                    Walkthrough Intelligence (URL)
                  </label>
                  <input
                    type="url"
                    value={mainVideo}
                    onChange={(e) => setMainVideo(e.target.value)}
                    placeholder="https://www.youtube.com/embed/..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 px-6 text-white font-bold text-sm outline-none focus:border-emerald-500 transition-all font-mono"
                  />
                </div>

                <div className="md:col-span-2 space-y-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40">
                      Available Utilities
                    </h3>
                    <span className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">
                      {mainAmenities.length} Active
                    </span>
                  </div>

                  {/* Wifi Speed Edit */}
                  {!isVehicle && (
                    <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10 max-w-xs">
                      <label className="text-[11px] font-black uppercase tracking-widest text-white/30 block ml-1">
                        Verified Wi-Fi Speed (Mbps)
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                          <Wifi size={16} className="text-emerald-500" />
                        </div>
                        <input
                          type="number"
                          placeholder="e.g. 100"
                          value={mainWifiSpeed}
                          onChange={(e) => setMainWifiSpeed(e.target.value)}
                          className="h-10 flex-1 bg-transparent border-b border-white/10 px-2 text-sm font-bold text-white outline-none focus:border-emerald-500 transition-all"
                        />
                        <span className="text-[11px] font-black text-white/20 uppercase">MBPS</span>
                      </div>
                    </div>
                  )}

                  {isVehicle && (
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-6 rounded-2xl border border-white/10">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-white/40 ml-2">
                          License Plate
                        </label>
                        <input
                          type="text"
                          value={mainLicensePlate}
                          onChange={(e) => setMainLicensePlate(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white font-bold text-sm outline-none focus:border-emerald-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-white/40 ml-2">
                          Registration Date
                        </label>
                        <input
                          type="date"
                          value={mainRegistrationDate}
                          onChange={(e) => setMainRegistrationDate(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white font-bold text-sm outline-none focus:border-emerald-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-white/40 ml-2">
                          Vehicle Type
                        </label>
                        <select
                          value={mainVehicleType}
                          onChange={(e) => setMainVehicleType(e.target.value)}
                          className="w-full bg-[#050a08] border border-white/10 rounded-xl h-12 px-4 text-white font-bold text-sm outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                        >
                          <option value="">Select Sub-Type</option>
                          {/* FIX #102: Standardised vehicle sub-type options to match PartnerCreateProperty */}
                          {listing?.category === 'bike' ? (
                            <>
                              <option value="Scooter (Activa, Ntorq, etc.)">
                                Scooter (Activa, Ntorq, etc.)
                              </option>
                              <option value="Cruiser (Royal Enfield, etc.)">
                                Cruiser (Royal Enfield, etc.)
                              </option>
                              <option value="Adventure / Tourer">Adventure / Tourer</option>
                              <option value="Premium / Sports Bike">Premium / Sports Bike</option>
                            </>
                          ) : (
                            <>
                              <option value="Hatchback / Sedan">Hatchback / Sedan</option>
                              <option value="SUV / MUV">SUV / MUV</option>
                              <option value="Luxury Sedan">Luxury Sedan</option>
                              <option value="Off-Roader / 4x4">Off-Roader / 4x4</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-white/40 ml-2">
                          Registration Category / Permit
                        </label>
                        <select
                          value={mainRegistrationCategory}
                          onChange={(e) => setMainRegistrationCategory(e.target.value)}
                          className="w-full bg-[#050a08] border border-white/10 rounded-xl h-12 px-4 text-white font-bold text-sm outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                        >
                          <option value="">Select Category</option>
                          <option value="Commercial Self-Drive (Black Plate / Yellow Text)">
                            Commercial Self-Drive (Black Plate / Yellow Text)
                          </option>
                          <option value="Private Registration (White Plate / Black Text)">
                            Private Registration (White Plate / Black Text)
                          </option>
                          <option value="Commercial Transport (Yellow Plate / Black Text)">
                            Commercial Transport (Yellow Plate / Black Text)
                          </option>
                        </select>
                      </div>
                      <div className="space-y-2 col-span-1 md:col-span-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-white/40 ml-2">
                          Cancellation Policy
                        </label>
                        <select
                          value={mainCancellationPolicy}
                          onChange={(e) => setMainCancellationPolicy(e.target.value)}
                          className="w-full bg-[#050a08] border border-white/10 rounded-xl h-12 px-4 text-white font-bold text-sm outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                        >
                          <option value="flexible">Flexible</option>
                          <option value="moderate">Moderate</option>
                          <option value="strict">Strict</option>
                        </select>
                      </div>

                      <div className="md:col-span-2 pt-4 border-t border-white/10 space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Required Verification Documents
                        </h4>

                        {/* RC Document */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300 block">
                            Registration Certificate (RC)
                          </label>
                          {mainRcDoc && !rcPreview && (
                            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-2.5">
                              <span className="text-xs text-slate-400 truncate max-w-[250px]">
                                Existing RC File:{' '}
                                <a
                                  href={fixImg(mainRcDoc)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-400 hover:underline"
                                >
                                  {mainRcDoc.split('/').pop()}
                                </a>
                              </span>
                            </div>
                          )}
                          {rcPreview ? (
                            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-2.5">
                              <span className="text-xs text-slate-300 truncate max-w-[250px]">
                                {rcFile?.name || 'New Document Selected'}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setRcFile(null);
                                  setRcPreview('');
                                }}
                                className="text-rose-400 hover:text-rose-500 text-xs font-bold"
                              >
                                Clear
                              </button>
                            </div>
                          ) : (
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setRcFile(file);
                                  setRcPreview(URL.createObjectURL(file));
                                }
                              }}
                              className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer w-full"
                            />
                          )}
                        </div>

                        {/* Insurance Document */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300 block">
                            Insurance Policy
                          </label>
                          {mainInsuranceDoc && !insPreview && (
                            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-2.5">
                              <span className="text-xs text-slate-400 truncate max-w-[250px]">
                                Existing Insurance:{' '}
                                <a
                                  href={fixImg(mainInsuranceDoc)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-400 hover:underline"
                                >
                                  {mainInsuranceDoc.split('/').pop()}
                                </a>
                              </span>
                            </div>
                          )}
                          {insPreview ? (
                            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-2.5">
                              <span className="text-xs text-slate-300 truncate max-w-[250px]">
                                {insFile?.name || 'New Document Selected'}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setInsFile(null);
                                  setInsPreview('');
                                }}
                                className="text-rose-400 hover:text-rose-500 text-xs font-bold"
                              >
                                Clear
                              </button>
                            </div>
                          ) : (
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setInsFile(file);
                                  setInsPreview(URL.createObjectURL(file));
                                }
                              }}
                              className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer w-full"
                            />
                          )}
                        </div>

                        {/* PUC Certificate */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300 block">
                            PUC Certificate
                          </label>
                          {mainPucDoc && !pucPreview && (
                            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-2.5">
                              <span className="text-xs text-slate-400 truncate max-w-[250px]">
                                Existing PUC:{' '}
                                <a
                                  href={fixImg(mainPucDoc)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-400 hover:underline"
                                >
                                  {mainPucDoc.split('/').pop()}
                                </a>
                              </span>
                            </div>
                          )}
                          {pucPreview ? (
                            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-2.5">
                              <span className="text-xs text-slate-300 truncate max-w-[250px]">
                                {pucFile?.name || 'New Document Selected'}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setPucFile(null);
                                  setPucPreview('');
                                }}
                                className="text-rose-400 hover:text-rose-500 text-xs font-bold"
                              >
                                Clear
                              </button>
                            </div>
                          ) : (
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setPucFile(file);
                                  setPucPreview(URL.createObjectURL(file));
                                }
                              }}
                              className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer w-full"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-8">
                    {(isVehicle ? VEHICLE_AMENITY_CATEGORIES : AMENITY_CATEGORIES).map((cat) => (
                      <div key={cat.id} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="h-[1px] w-4 bg-white/10" />
                          <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20">
                            {cat.label}
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                          {cat.amenities.map((a) => (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => {
                                if (mainAmenities.includes(a.label)) {
                                  setMainAmenities(mainAmenities.filter((x) => x !== a.label));
                                } else {
                                  setMainAmenities([...mainAmenities, a.label]);
                                }
                              }}
                              className={`h-11 px-4 rounded-xl text-[11px] font-bold uppercase tracking-widest border transition-all flex items-center gap-3 ${
                                mainAmenities.includes(a.label)
                                  ? 'bg-emerald-500 border-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20'
                                  : 'bg-white/5 border-white/10 text-white/40 hover:border-emerald-500/50 hover:text-emerald-500 shadow-sm'
                              }`}
                            >
                              <a.icon
                                size={13}
                                className={
                                  mainAmenities.includes(a.label)
                                    ? 'text-slate-900'
                                    : 'text-white/20'
                                }
                              />
                              <span className="truncate">{a.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={() => setIsEditingMain(false)}
                  className="h-12 px-6 text-white/40 font-black uppercase text-[11px] tracking-widest hover:text-white transition-colors"
                >
                  Abort
                </button>
                <button
                  onClick={updateMainDetails}
                  disabled={mainLoading}
                  className="h-12 px-10 bg-emerald-500 text-slate-950 font-black uppercase text-[11px] tracking-[0.3em] rounded-xl flex items-center gap-2 hover:bg-emerald-400 transition-all disabled:opacity-50"
                >
                  {mainLoading ? (
                    <Activity size={14} className="animate-spin" />
                  ) : (
                    <>
                      <Sparkles size={14} /> Commit Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <div
              className="bg-white border border-slate-100 rounded-3xl p-6 flex items-center justify-between group cursor-pointer hover:border-emerald-200 transition-all shadow-sm"
              onClick={() => setIsEditingMain(true)}
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all">
                  {isVehicle ? <Car size={24} /> : <Target size={24} />}
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-300">
                    {isVehicle ? 'Vehicle Identity' : 'Property Identity'}
                  </p>
                  <h2 className="text-xl font-bold text-slate-900">{listing.title}</h2>
                  {listing.walkthroughVideo ? (
                    <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
                      <Zap size={10} /> Neural Walkthrough Active
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
                      <History size={10} /> Using Default Sensory Link
                    </p>
                  )}
                </div>
              </div>
              <button className="h-10 px-6 border border-slate-100 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-emerald-600 group-hover:border-emerald-100 transition-all">
                Configure Core
              </button>
            </div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* FORM PANEL */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden sticky top-32 z-20"
          >
            <header className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                {editIndex === null ? (
                  <>
                    <Plus size={16} className="text-emerald-600" /> <span>Add New Variant</span>
                  </>
                ) : (
                  <>
                    <Cpu size={16} className="text-emerald-600" /> <span>Edit Variant</span>
                  </>
                )}
              </div>
              {editIndex !== null && (
                <button
                  onClick={resetForm}
                  className="text-xs font-semibold text-slate-400 hover:text-rose-500 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 transition-colors"
                >
                  Cancel
                </button>
              )}
            </header>

            <form onSubmit={save} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">Class</label>
                  <div className="relative">
                    <Layers
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <select
                      value={type}
                      onChange={(e) => {
                        const val = e.target.value;
                        setType(val);
                        setName('');
                        setSelectedNameOption('');
                      }}
                      className="h-10 w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-8 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-colors appearance-none cursor-pointer"
                    >
                      {listing.category === 'bike' || listing.category === 'car' ? (
                        <option value="Vehicle">Vehicle Unit</option>
                      ) : (
                        <option value="Room">Room</option>
                      )}
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">Price (₹)</label>
                  <div className="relative">
                    <Target
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="number"
                      required
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="h-10 w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">Name</label>
                  <select
                    value={selectedNameOption}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedNameOption(val);
                      if (val === 'Custom') {
                        setName('');
                      } else {
                        setName(val);
                      }
                    }}
                    className="h-10 w-full bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-colors cursor-pointer"
                  >
                    <option value="">Select {isVehicle ? 'vehicle' : 'room'} name...</option>
                    {(type === 'Vehicle'
                      ? VEHICLE_NAME_OPTIONS
                      : type === 'Room'
                        ? ROOM_NAME_OPTIONS
                        : OTHER_NAME_OPTIONS
                    ).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                    <option value="Custom">Custom Name...</option>
                  </select>
                </div>

                {selectedNameOption === 'Custom' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Custom Name
                    </label>
                    <input
                      required
                      placeholder={
                        type === 'Vehicle'
                          ? 'e.g. Royal Enfield Himalayan'
                          : 'e.g. Deluxe Double Room'
                      }
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-10 w-full bg-slate-50 border border-slate-200 rounded-lg px-4 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-colors"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">Description</label>
                <textarea
                  placeholder="Features, amenities..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-colors resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  {isVehicle ? 'Vehicle' : 'Room'} Amenities
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  {ALL_AMENITIES.map((a) => {
                    const isSelected = variantAmenities.includes(a.label);
                    return (
                      <button
                        type="button"
                        key={a.id}
                        onClick={() => {
                          if (isSelected) {
                            setVariantAmenities(variantAmenities.filter((x) => x !== a.label));
                          } else {
                            setVariantAmenities([...variantAmenities, a.label]);
                          }
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-500 border border-emerald-500 text-white shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600'
                        }`}
                      >
                        <a.icon size={12} />
                        <span>{a.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">Image</label>
                {!preview ? (
                  <div className="relative h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center group/upload cursor-pointer hover:border-emerald-500/30 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFile}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <ImageIcon
                      className="text-slate-400 group-hover/upload:text-emerald-500 transition-colors mb-2"
                      size={24}
                    />
                    <p className="text-xs font-semibold text-slate-500 group-hover/upload:text-emerald-600 transition-colors">
                      Click to upload image
                    </p>
                  </div>
                ) : (
                  <div className="relative h-40 group/preview rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-md text-rose-500 flex items-center justify-center rounded-lg shadow-md hover:bg-rose-500 hover:text-white transition-colors z-20"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              <label className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50 cursor-pointer hover:bg-white hover:border-emerald-200 transition-colors">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={available}
                    onChange={(e) => setAvailable(e.target.checked)}
                    className="hidden"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${available ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${available ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-sm font-semibold transition-colors ${available ? 'text-slate-900' : 'text-slate-500'}`}
                  >
                    Availability
                  </span>
                  <span className="text-xs text-slate-500">Show variant to customers</span>
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className={`w-full h-11 bg-slate-900 border border-slate-900 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 group/btn ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-emerald-600 hover:border-emerald-600 active:scale-95'}`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{editIndex === null ? 'Save Variant' : 'Update Variant'}</span>
                    <Zap size={16} />
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* VARIANTS LIST */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white p-6 border border-slate-200 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <Database size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Current Variants</h3>
                  <p className="text-sm text-slate-500">
                    {listing.variants?.length || 0} active variants managing inventory
                  </p>
                </div>
              </div>
            </div>

            {!listing.variants || listing.variants.length === 0 ? (
              <div className="bg-white border text-center border-slate-200 border-dashed rounded-3xl py-24 px-6 flex flex-col items-center justify-center">
                <Database className="text-slate-300 mb-4" size={48} />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Variants found</h3>
                <p className="text-sm text-slate-500 max-w-sm">
                  You haven't added any specific{' '}
                  {isVehicle ? 'vehicles, tiers, or options' : 'rooms, tiers, or options'}. Add your
                  first {isVehicle ? 'unit' : 'variant'} using the panel on the left.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                  {listing.variants.map((v, i) => (
                    <motion.div
                      key={i}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className={`bg-white rounded-2xl border border-slate-200 transition-all overflow-hidden flex flex-col md:flex-row ${!v.available ? 'opacity-70' : 'shadow-sm hover:border-emerald-200'}`}
                    >
                      <div className="w-full md:w-64 h-48 md:h-auto shrink-0 relative">
                        <img
                          src={fixImg(v.image)}
                          className="w-full h-full object-cover"
                          alt={v.name}
                        />
                        <div className="absolute top-4 left-4">
                          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-white font-bold text-xs uppercase shadow-md">
                            {v.type}
                          </div>
                        </div>
                        {!v.available && (
                          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px] flex items-center justify-center">
                            <div className="bg-rose-500 text-white px-3 py-1 rounded-full font-bold text-xs">
                              UNAVAILABLE
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-2 mb-6">
                          <div className="flex justify-between items-start gap-4">
                            <h4 className="text-xl font-bold text-slate-900">{v.name}</h4>
                            <div className="text-right">
                              <div className="text-xl font-bold text-emerald-600">
                                ₹{v.price.toLocaleString()}
                              </div>
                              <div className="text-xs font-semibold text-slate-500">
                                {listing.category === 'bike' || listing.category === 'car'
                                  ? '/ day'
                                  : '/ night'}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                            {v.desc || (
                              <span className="text-slate-400">No description provided.</span>
                            )}
                          </p>
                          {v.amenities && v.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {v.amenities.map((amenityLabel, idx) => {
                                const amenityObj = ALL_AMENITIES.find(
                                  (a) => a.label === amenityLabel
                                );
                                if (!amenityObj) return null;
                                return (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                                  >
                                    <amenityObj.icon size={10} className="text-emerald-500" />
                                    {amenityLabel}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 gap-4 mt-auto">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <div className="relative">
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={v.available !== false}
                                onChange={() => toggleAvailable(i, v.available !== false)}
                              />
                              <div
                                className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${v.available ? 'bg-emerald-500' : 'bg-slate-300'}`}
                              >
                                <div
                                  className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${v.available ? 'translate-x-5' : 'translate-x-0'}`}
                                />
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-slate-700">
                              {v.available ? 'Available' : 'Hidden'}
                            </span>
                          </label>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEdit(v, i)}
                              className="h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs flex items-center gap-2 transition-colors"
                            >
                              <Edit2 size={14} /> Edit
                            </button>
                            <button
                              onClick={() => remove(i)}
                              className="h-9 w-9 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg flex items-center justify-center transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={confirmModal.onConfirm}
          title={isVehicle ? 'Delete Unit' : 'Delete Variant'}
          message={
            isVehicle
              ? 'Are you sure you want to delete this unit? This action cannot be undone.'
              : 'Are you sure you want to delete this variant? This action cannot be undone.'
          }
          confirmText="Delete"
          confirmVariant="rose"
        />
      </div>
    </div>
  );
}
