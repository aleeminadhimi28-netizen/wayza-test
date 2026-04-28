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
  Navigation,
  Crosshair,
  Loader2,
  Check,
} from 'lucide-react';

import { api } from '../../utils/api.js';
import { AMENITY_CATEGORIES } from '../../utils/amenities.js';

const CATEGORIES = [
  { value: 'hotel', label: 'ðŸ¨ Stays (Hotels, Villas, Houses)' },
  { value: 'bike', label: 'ðŸï¸ Bikes (Rentals, Scooters)' },
  { value: 'car', label: 'ðŸŽï¸ Cars (Luxury, Daily, SUVs)' },
  { value: 'activity', label: 'ðŸŽ¯ Activities (Surfing, Tours, Yoga)' },
];

export default function PartnerCreateProperty() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('hotel');
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
          setLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          setLocationLocked(true);
          showToast("Got coordinates, but couldn't resolve address.", 'warning');
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

    setLoading(true);
    let filename = null;

    try {
      if (image) {
        const form = new FormData();
        form.append('image', image);
        const uploadRes = await api.uploadImage(form);
        if (uploadRes.ok) {
          filename = uploadRes.filename;
        }
      }

      const data = await api.createListing({
        title,
        location,
        category,
        price: 0,
        image: filename,
        ownerEmail: user?.email,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        walkthroughVideo,
        amenities: selectedAmenities,
        wifiSpeed: Number(wifiSpeed) || 0,
      });

      if (data.ok) {
        showToast(
          'Property created! It will go live after admin approval. Add your room variants now.',
          'success'
        );
        navigate(`/partner/property/${data.id}`);
      } else {
        showToast(data.message || 'Failed to create property.', 'error');
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
          <Plus size={14} /> New Property
        </div>
        <h1 className="text-3xl font-bold text-slate-900">
          Create a <span className="text-emerald-500">New Listing</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Add your property to the Wayzza platform. You can add room types and variants after
          creation.
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
                <h3 className="text-lg font-bold text-slate-900 mb-0.5">Property Details</h3>
                <p className="text-sm text-slate-500">
                  Name, location, and category of your property.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Property Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Building
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      required
                      type="text"
                      placeholder="e.g. Ocean View Villa"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-11 w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Property Location <span className="text-rose-400">*</span>
                  </label>

                  {!locationLocked ? (
                    <>
                      <button
                        type="button"
                        onClick={fetchGPSLocation}
                        disabled={locationLoading}
                        className="w-full h-20 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-200 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-emerald-400 hover:from-emerald-100 hover:to-teal-100 transition-all group active:scale-[0.98] disabled:opacity-60 disabled:cursor-wait"
                      >
                        {locationLoading ? (
                          <>
                            <Loader2 size={20} className="text-emerald-600 animate-spin" />
                            <span className="text-xs font-semibold text-emerald-700">
                              Fetching GPS location...
                            </span>
                          </>
                        ) : (
                          <>
                            <Crosshair
                              size={20}
                              className="text-emerald-600 group-hover:scale-110 transition-transform"
                            />
                            <span className="text-xs font-bold text-emerald-700">
                              Use My GPS Location
                            </span>
                            <span className="text-[11px] text-emerald-500">
                              Auto-detect your exact property coordinates
                            </span>
                          </>
                        )}
                      </button>
                      <div className="relative flex items-center gap-3 my-1">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">
                          or type manually
                        </span>
                        <div className="flex-1 h-px bg-slate-200" />
                      </div>
                      <div className="relative">
                        <MapPin
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          size={16}
                        />
                        <input
                          type="text"
                          placeholder="e.g. Kovalam, Kerala"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="h-11 w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                            <Check size={16} strokeWidth={3} />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-emerald-900">{location}</p>
                            <p className="text-xs text-emerald-600 mt-0.5 font-mono">
                              {latitude}, {longitude}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={clearLocation}
                          className="text-xs font-semibold text-emerald-700 hover:text-rose-500 transition-colors whitespace-nowrap"
                        >
                          Change
                        </button>
                      </div>
                      <p className="text-[11px] text-emerald-600 flex items-center gap-1.5">
                        <Crosshair size={11} /> GPS coordinates locked â€” your property will appear
                        on the map
                      </p>
                    </div>
                  )}
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
                      <h3 className="text-sm font-bold text-slate-900">Available Utilities</h3>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                        Professional Inventory Management
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-widest">
                      {selectedAmenities.length} selected
                    </span>
                  </div>

                  {/* Wifi Speed Input */}
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

                  <div className="space-y-8">
                    {AMENITY_CATEGORIES.map((cat) => (
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
                  Upload a high-quality image for your property listing.
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
                  <p className="text-xs text-slate-400 mt-1">JPEG, PNG or WebP â€” up to 10MB</p>
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
              After creating the listing, you can add room types, set pricing, and upload variant
              photos. Your listing will be reviewed by our team before going live.
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
                  <span>Create Property</span>
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
