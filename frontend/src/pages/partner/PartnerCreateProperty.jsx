import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext.jsx';
import { useToast } from '../../ToastContext.jsx';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  Building,
  MapPin,
  X,
  Wifi,
  Plus,
  Info,
  ArrowRight,
  CheckCircle,
  Crosshair,
  Car,
} from 'lucide-react';

import { api } from '../../utils/api.js';
import { AMENITY_CATEGORIES, VEHICLE_AMENITY_CATEGORIES } from '../../utils/amenities.js';

const CATEGORIES = [
  { value: 'hotel', label: '🏨 Stays (Hotels, Villas, Houses)' },
  { value: 'bike', label: '🏍️ Bikes (Rentals, Scooters)' },
  { value: 'car', label: '🚗 Cars (Luxury, Daily, SUVs)' },
  { value: 'activity', label: '🎯 Activities (Surfing, Tours, Yoga)' },
];

export default function PartnerCreateProperty() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [mainSector] = useState(() => {
    return sessionStorage.getItem('partner_main_sector') || 'stays';
  });

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState(() => {
    return (sessionStorage.getItem('partner_main_sector') || 'stays') === 'vehicles'
      ? 'car'
      : 'hotel';
  });
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [walkthroughVideo, setWalkthroughVideo] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationLocked, setLocationLocked] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [wifiSpeed, setWifiSpeed] = useState('');
  // Vehicle fields
  const [licensePlate, setLicensePlate] = useState('');
  const [registrationDate, setRegistrationDate] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [registrationCategory, setRegistrationCategory] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState('moderate');
  const [rcDoc, setRcDoc] = useState(null);
  const [rcDocPreview, setRcDocPreview] = useState(null);
  const [insuranceDoc, setInsuranceDoc] = useState(null);
  const [insuranceDocPreview, setInsuranceDocPreview] = useState(null);
  const [pucDoc, setPucDoc] = useState(null);
  const [pucDocPreview, setPucDocPreview] = useState(null);
  const isVehicle = category === 'bike' || category === 'car';

  const fetchGPSLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      showToast('GPS is not supported by your browser.', 'error');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat.toFixed(6));
        setLongitude(lng.toFixed(6));
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
            {
              headers: { 'Accept-Language': 'en' },
            }
          );
          const data = await res.json();
          const addr = data.address || {};
          const parts = [
            addr.village || addr.town || addr.city || addr.county,
            addr.state,
            addr.country,
          ].filter(Boolean);
          setLocation(
            parts.join(', ') || data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
          );
          setLocationLocked(true);
          showToast('GPS location captured successfully!', 'success');
        } catch (err) {
          // #97: Distinguish geocoding failure from GPS failure — coordinates still valid
          setLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          setLocationLocked(true);
          showToast(
            'GPS coordinates captured. Address lookup failed — coordinates are still saved.',
            'warning'
          );
        }
        setLocationLoading(false);
      },
      (error) => {
        setLocationLoading(false);
        if (error.code === 1)
          showToast('Location access denied. Please enable GPS permissions.', 'error');
        else if (error.code === 2) showToast('GPS unavailable. Please try again.', 'error');
        else showToast('GPS timed out. Please try again.', 'error');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [showToast]);

  function clearLocation() {
    setLocation('');
    setLatitude('');
    setLongitude('');
    setLocationLocked(false);
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImage(null);
    setPreview(null);
  }

  async function create(e) {
    e.preventDefault();
    if (!title || !location) {
      return showToast('Please fill in all required fields.', 'warning');
    }

    if (!latitude || isNaN(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90) {
      return showToast('Please enter a valid Latitude between -90 and 90.', 'warning');
    }
    if (
      !longitude ||
      isNaN(Number(longitude)) ||
      Number(longitude) < -180 ||
      Number(longitude) > 180
    ) {
      return showToast('Please enter a valid Longitude between -180 and 180.', 'warning');
    }

    // #96: Validate vehicle-specific required fields before submission
    if (isVehicle) {
      if (!licensePlate.trim()) return showToast('License plate number is required.', 'warning');
      if (!vehicleType) return showToast('Please select a vehicle type.', 'warning');
      if (!registrationCategory)
        return showToast('Please select a registration category.', 'warning');
      if (!rcDoc)
        return showToast('Registration Certificate (RC) document is required.', 'warning');
      if (!insuranceDoc) return showToast('Insurance Policy document is required.', 'warning');
      if (!pucDoc) return showToast('PUC Certificate is required.', 'warning');
    }

    setLoading(true);
    let filename = null;
    let rcPath = '';
    let insPath = '';
    let pucPath = '';

    try {
      if (image) {
        const form = new FormData();
        form.append('image', image);
        const uploadRes = await api.uploadImage(form);
        if (uploadRes.ok) {
          filename = uploadRes.filename;
        }
      }

      if (isVehicle) {
        if (rcDoc) {
          const form = new FormData();
          form.append('image', rcDoc);
          const uploadRes = await api.uploadImage(form);
          if (uploadRes.ok) {
            rcPath = uploadRes.filename;
          }
        }
        if (insuranceDoc) {
          const form = new FormData();
          form.append('image', insuranceDoc);
          const uploadRes = await api.uploadImage(form);
          if (uploadRes.ok) {
            insPath = uploadRes.filename;
          }
        }
        if (pucDoc) {
          const form = new FormData();
          form.append('image', pucDoc);
          const uploadRes = await api.uploadImage(form);
          if (uploadRes.ok) {
            pucPath = uploadRes.filename;
          }
        }
      }

      const data = await api.createListing({
        title,
        location,
        category,
        price: 0,
        image: filename,
        ownerEmail: user?.email,
        latitude: Number(latitude),
        longitude: Number(longitude),
        walkthroughVideo,
        amenities: selectedAmenities,
        wifiSpeed: isVehicle ? 0 : Number(wifiSpeed) || 0,
        licensePlate: isVehicle ? licensePlate : undefined,
        registrationDate: isVehicle ? registrationDate : undefined,
        vehicleType: isVehicle ? vehicleType : undefined,
        registrationCategory: isVehicle ? registrationCategory : undefined,
        cancellationPolicy: isVehicle ? cancellationPolicy : undefined,
        rcDoc: isVehicle ? rcPath : undefined,
        insuranceDoc: isVehicle ? insPath : undefined,
        pucDoc: isVehicle ? pucPath : undefined,
      });

      if (data.ok) {
        showToast(
          isVehicle
            ? 'Vehicle listing created! It will go live after admin approval. Configure details and pricing now.'
            : 'Property created! It will go live after admin approval. Add your room variants now.',
          'success'
        );
        navigate(`/partner/property/${data.id}`);
      } else {
        showToast(
          data.message || `Failed to create ${isVehicle ? 'vehicle' : 'property'}.`,
          'error'
        );
      }
    } catch (error) {
      console.error('Listing error:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 font-sans pb-20"
    >
      {/* HEADER */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide mb-1">
          <Plus size={14} /> {isVehicle ? 'New Vehicle' : 'New Property'}
        </div>
        <h1 className="text-3xl font-bold text-slate-900">
          Create a <span className="text-emerald-500">New Listing</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {isVehicle
            ? 'Add your vehicle to the Wayzza platform. You can define details and pricing after creation.'
            : 'Add your property to the Wayzza platform. You can add room types and variants after creation.'}
        </p>
      </div>

      {/* FORM */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden"
      >
        <form onSubmit={create} className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* LEFT: Basic Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-0.5">
                  {isVehicle ? 'Vehicle Details' : 'Property Details'}
                </h3>
                <p className="text-sm text-slate-500">
                  {isVehicle
                    ? 'Name, hub location, and category of your vehicle.'
                    : 'Name, location, and category of your property.'}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    {isVehicle ? 'Vehicle Name' : 'Property Name'}{' '}
                    <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    {isVehicle ? (
                      <Car
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={16}
                      />
                    ) : (
                      <Building
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={16}
                      />
                    )}
                    <input
                      required
                      type="text"
                      placeholder={
                        isVehicle ? 'e.g. Royal Enfield Himalayan' : 'e.g. Ocean View Villa'
                      }
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-11 w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    {isVehicle ? 'Operational Hub Location' : 'Property Location'}{' '}
                    <span className="text-rose-400">*</span>
                  </label>

                  <div className="relative">
                    <MapPin
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      required
                      type="text"
                      placeholder={
                        isVehicle ? 'e.g. Varkala Cliff, Kerala' : 'e.g. Kovalam, Kerala'
                      }
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="h-11 w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* GPS Coordinates */}
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center border border-slate-100">
                        <MapPin size={12} className="text-slate-400" />
                      </div>
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                        GPS Coordinates <span className="text-rose-500 font-bold">*</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={fetchGPSLocation}
                      disabled={locationLoading}
                      className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 disabled:opacity-50 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-200/50 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {locationLoading ? (
                        <div className="w-3 h-3 border-2 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin" />
                      ) : (
                        <Crosshair size={10} />
                      )}
                      <span>{locationLoading ? 'Detecting...' : 'Detect GPS'}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Latitude *
                      </label>
                      <input
                        required
                        type="number"
                        step="any"
                        placeholder="e.g. 8.7379"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        className="h-10 w-full bg-white border border-slate-200 rounded-lg px-3 text-sm font-medium text-slate-900 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Longitude *
                      </label>
                      <input
                        required
                        type="number"
                        step="any"
                        placeholder="e.g. 76.7163"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        className="h-10 w-full bg-white border border-slate-200 rounded-lg px-3 text-sm font-medium text-slate-900 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-11 w-full bg-slate-50 border border-slate-200 rounded-lg px-4 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {isVehicle && (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                      Vehicle Specifications & Verification
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 block">
                          License Plate <span className="text-rose-400">*</span>
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. KL-01-CA-1234"
                          value={licensePlate}
                          onChange={(e) => setLicensePlate(e.target.value)}
                          className="h-10 w-full bg-white border border-slate-200 rounded-lg px-3 text-sm font-medium text-slate-900 focus:border-emerald-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 block">
                          Registration Date <span className="text-rose-400">*</span>
                        </label>
                        <input
                          required
                          type="date"
                          value={registrationDate}
                          onChange={(e) => setRegistrationDate(e.target.value)}
                          className="h-10 w-full bg-white border border-slate-200 rounded-lg px-3 text-sm font-medium text-slate-900 focus:border-emerald-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Vehicle Type <span className="text-rose-400">*</span>
                      </label>
                      <select
                        required
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="h-10 w-full bg-white border border-slate-200 rounded-lg px-3 text-sm font-medium text-slate-900 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select Sub-Type</option>
                        {category === 'bike' ? (
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
                      <label className="text-xs font-semibold text-slate-700 block">
                        Registration Category / Permit <span className="text-rose-400">*</span>
                      </label>
                      <select
                        required
                        value={registrationCategory}
                        onChange={(e) => setRegistrationCategory(e.target.value)}
                        className="h-10 w-full bg-white border border-slate-200 rounded-lg px-3 text-sm font-medium text-slate-900 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
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

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Cancellation Policy <span className="text-rose-400">*</span>
                      </label>
                      <select
                        required
                        value={cancellationPolicy}
                        onChange={(e) => setCancellationPolicy(e.target.value)}
                        className="h-10 w-full bg-white border border-slate-200 rounded-lg px-3 text-sm font-medium text-slate-900 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="flexible">Flexible</option>
                        <option value="moderate">Moderate</option>
                        <option value="strict">Strict</option>
                      </select>
                    </div>

                    <div className="pt-4 border-t border-slate-200 space-y-4 col-span-1 sm:col-span-2">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Required Verification Documents
                      </h5>

                      {/* RC Document */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 block">
                          Registration Certificate (RC) <span className="text-rose-400">*</span>
                        </label>
                        {rcDocPreview ? (
                          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-2.5">
                            <span className="text-xs text-slate-600 truncate max-w-[250px]">
                              {rcDoc?.name || 'Uploaded Document'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setRcDoc(null);
                                setRcDocPreview(null);
                              }}
                              className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <input
                            required
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setRcDoc(file);
                                setRcDocPreview(URL.createObjectURL(file));
                              }
                            }}
                            className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer w-full"
                          />
                        )}
                      </div>

                      {/* Insurance Policy */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 block">
                          Insurance Policy <span className="text-rose-400">*</span>
                        </label>
                        {insuranceDocPreview ? (
                          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-2.5">
                            <span className="text-xs text-slate-600 truncate max-w-[250px]">
                              {insuranceDoc?.name || 'Uploaded Document'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setInsuranceDoc(null);
                                setInsuranceDocPreview(null);
                              }}
                              className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <input
                            required
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setInsuranceDoc(file);
                                setInsuranceDocPreview(URL.createObjectURL(file));
                              }
                            }}
                            className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer w-full"
                          />
                        )}
                      </div>

                      {/* PUC Certificate */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 block">
                          PUC Certificate (Pollution Control){' '}
                          <span className="text-rose-400">*</span>
                        </label>
                        {pucDocPreview ? (
                          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-2.5">
                            <span className="text-xs text-slate-600 truncate max-w-[250px]">
                              {pucDoc?.name || 'Uploaded Document'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setPucDoc(null);
                                setPucDocPreview(null);
                              }}
                              className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <input
                            required
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setPucDoc(file);
                                setPucDocPreview(URL.createObjectURL(file));
                              }
                            }}
                            className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer w-full"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Walkthrough Video URL (YouTube)
                  </label>
                  <div className="relative">
                    <Plus
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/embed/..."
                      value={walkthroughVideo}
                      onChange={(e) => setWalkthroughVideo(e.target.value)}
                      className="h-11 w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium ml-1">
                    Optional: Paste an 'embed' link for a high-fidelity virtual tour.
                  </p>
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {isVehicle ? 'Vehicle Inclusions & Features' : 'Available Utilities'}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                        Professional Inventory Management
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-widest">
                      {selectedAmenities.length} selected
                    </span>
                  </div>

                  {/* Wifi Speed Input */}
                  {!isVehicle && (
                    <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block ml-1">
                        Verified Wi-Fi Speed (Mbps)
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                          <Wifi size={16} className="text-emerald-500" />
                        </div>
                        <input
                          type="number"
                          placeholder="e.g. 100"
                          value={wifiSpeed}
                          onChange={(e) => setWifiSpeed(e.target.value)}
                          className="h-10 flex-1 bg-white border border-slate-200 rounded-lg px-4 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 transition-all"
                        />
                        <span className="text-[11px] font-black text-slate-400">MBPS</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-8">
                    {(isVehicle ? VEHICLE_AMENITY_CATEGORIES : AMENITY_CATEGORIES).map((cat) => (
                      <div key={cat.id} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="h-px w-4 bg-slate-200" />
                          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                            {cat.label}
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {cat.amenities.map((a) => (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => {
                                if (selectedAmenities.includes(a.label)) {
                                  setSelectedAmenities(
                                    selectedAmenities.filter((x) => x !== a.label)
                                  );
                                } else {
                                  setSelectedAmenities([...selectedAmenities, a.label]);
                                }
                              }}
                              className={`h-11 px-4 rounded-xl text-[11px] font-bold uppercase tracking-widest border transition-all flex items-center gap-3 ${
                                selectedAmenities.includes(a.label)
                                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                  : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-200 hover:text-emerald-600 shadow-sm'
                              }`}
                            >
                              <a.icon
                                size={14}
                                className={
                                  selectedAmenities.includes(a.label)
                                    ? 'text-white'
                                    : 'text-slate-400'
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
            </div>

            {/* RIGHT: Cover Image */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-0.5">Cover Photo</h3>
                <p className="text-sm text-slate-500">
                  Upload a high-quality image for your {isVehicle ? 'vehicle' : 'property'} listing.
                </p>
              </div>

              {!preview ? (
                <div className="relative aspect-[4/3] bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group/upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md mb-3 group-hover/upload:scale-110 transition-transform">
                    <UploadCloud
                      className="text-slate-400 group-hover/upload:text-emerald-500 transition-colors"
                      size={24}
                    />
                  </div>
                  <p className="font-semibold text-slate-700 text-sm">Click to upload a photo</p>
                  <p className="text-xs text-slate-400 mt-1">JPEG, PNG or WebP — up to 10MB</p>
                </div>
              ) : (
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg border border-slate-200 group/preview">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover group-hover/preview:scale-105 transition-transform duration-500"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-3 right-3 w-9 h-9 bg-white text-rose-500 rounded-xl flex items-center justify-center shadow-md hover:bg-rose-500 hover:text-white transition-all z-20"
                  >
                    <X size={16} />
                  </button>
                  <div className="absolute bottom-3 left-3 bg-emerald-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-semibold shadow-md">
                    <CheckCircle size={13} /> Photo uploaded
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* INFO NOTE */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-700 font-medium">
              {isVehicle
                ? 'After creating the vehicle listing, you can define rental pricing rules. Your listing will be reviewed by our team before going live.'
                : 'After creating the listing, you can add room types, set pricing, and upload variant photos. Your listing will be reviewed by our team before going live.'}
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/partner/properties')}
              className="text-sm font-semibold text-slate-500 hover:text-rose-500 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`h-11 px-8 bg-slate-900 text-white rounded-xl font-semibold text-sm flex items-center gap-2 transition-all active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-600'}`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isVehicle ? 'Create Vehicle Listing' : 'Create Property'}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
