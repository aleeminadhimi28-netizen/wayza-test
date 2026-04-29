import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { WayzzaLayout } from '../../WayzzaUI.jsx';
import { Link } from 'react-router-dom';
import { Home, Navigation, MapPin, Loader2, Info, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { api } from '../../utils/api.js';
import {
  Waves,
  Palmtree,
  Gem,
  Tent,
  Building,
  History,
  Compass,
  Locate,
  Search,
} from 'lucide-react';
import SEO from '../../components/SEO.jsx';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom price marker icon creator
const createPriceIcon = (price) => {
  return L.divIcon({
    className: 'custom-price-marker',
    html: `<div style="background: #10b981; color: white; padding: 4px 8px; border-radius: 12px; font-weight: 800; font-size: 11px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.2); white-space: nowrap;">₹${price > 0 ? price.toLocaleString() : '—'}</div>`,
    iconSize: [60, 24],
    iconAnchor: [30, 12],
  });
};

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function ExploreMap() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [mapCenter, setMapCenter] = useState([8.7379, 76.7163]); // Varkala, Kerala
  const [mapZoom, setMapZoom] = useState(13);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const categories = [
    { id: 'all', label: 'All Stays', icon: <Compass size={16} /> },
    { id: 'beachfront', label: 'Beachfront', icon: <Waves size={16} /> },
    { id: 'luxury', label: 'Luxury', icon: <Gem size={16} /> },
    { id: 'resort', label: 'Resorts', icon: <Palmtree size={16} /> },
    { id: 'heritage', label: 'Heritage', icon: <History size={16} /> },
    { id: 'villa', label: 'Villas', icon: <Building size={16} /> },
    { id: 'glamping', label: 'Glamping', icon: <Tent size={16} /> },
  ];

  async function fetchData(params = {}) {
    try {
      setLoading(true);
      const query = { limit: 100, ...params };
      if (selectedCategory !== 'all') query.category = selectedCategory;

      const data = await api.getListings(query);
      if (data.ok) {
        const rows = data.rows || data.data || (Array.isArray(data) ? data : []);
        const withGps = rows.filter((r) => r.latitude && r.longitude);
        setListings(withGps);

        if (withGps.length > 0 && !params.lat) {
          // Only center if we're not doing a targeted search
          setMapCenter([withGps[0].latitude, withGps[0].longitude]);
          setMapZoom(12);
        }
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    } finally {
      setLoading(false);
      setShowSearchButton(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const handleNearMe = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapCenter([latitude, longitude]);
        setMapZoom(14);
        setIsLocating(false);
        fetchData({ lat: latitude, lng: longitude }); // Optional: could filter by distance here if backend supported it
      },
      () => {
        setIsLocating(false);
      }
    );
  };

  return (
    <WayzzaLayout noPadding>
      <SEO
        title="Explore Varkala Stays on Map"
        description="Discover and book the best clifftop villas and beach stays in Varkala using our interactive discovery map."
        breadcrumb={[
          { name: 'Home', url: 'https://wayza-app.vercel.app' },
          { name: 'Explore Map', url: 'https://wayza-app.vercel.app/explore-map' },
        ]}
      />
      <div className="h-screen flex flex-col pt-20 overflow-hidden font-sans">
        {/* Header Toolbar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Navigation size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Explore Varkala
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Discover curated stays and hidden gems
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="hidden sm:flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                  {listings.length} Properties found
                </span>
              </div>
            </div>
            <Link
              to="/listings"
              className="h-10 px-6 bg-slate-900 text-white rounded-xl flex items-center gap-2 font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
            >
              <Home size={14} /> Grid View
            </Link>
          </div>
        </div>

        {/* Category Filter Bar */}
        <div className="bg-white border-b border-slate-100 px-6 py-3 flex gap-3 overflow-x-auto no-scrollbar z-10 shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-105'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex-1 relative">
          <AnimatePresence>
            {showSearchButton && (
              <motion.div
                initial={{ y: -20, opacity: 0, x: '-50%' }}
                animate={{ y: 0, opacity: 1, x: '-50%' }}
                exit={{ y: -20, opacity: 0, x: '-50%' }}
                className="absolute top-6 left-1/2 z-[1001]"
              >
                <button
                  onClick={() => fetchData()}
                  className="bg-slate-900 text-white px-6 py-3 rounded-full flex items-center gap-2 font-bold text-xs uppercase tracking-widest shadow-2xl hover:bg-emerald-600 transition-all active:scale-95"
                >
                  <Search size={14} /> Search this area
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          {loading ? (
            <div className="absolute inset-0 z-[1001] bg-white/80 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin" />
                <p className="text-sm font-bold text-slate-700 tracking-tight uppercase tracking-widest">
                  Initializing Map...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 z-[1001] bg-white flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MapPin size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h3>
                <p className="text-sm text-slate-500 mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="h-11 px-8 bg-slate-900 text-white rounded-xl font-bold text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : null}

          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            className="w-full h-full z-0"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            <MapEventsHandler onMove={() => setShowSearchButton(true)} />
            <ChangeView center={mapCenter} zoom={mapZoom} />

            {listings.map((item) => (
              <Marker
                key={item._id}
                position={[item.latitude, item.longitude]}
                icon={createPriceIcon(item.price)}
                eventHandlers={{
                  click: () => setActiveItem(item),
                }}
              >
                <Popup className="wayzza-custom-popup">
                  <div className="w-64 overflow-hidden rounded-xl">
                    <div className="relative h-32 bg-slate-100">
                      {item.image ? (
                        <img
                          src={api.fixImg(item.image)}
                          className="w-full h-full object-cover"
                          alt={item.title}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Home size={32} />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg shadow-sm border border-black/5">
                        <span className="text-[11px] font-black tracking-tight text-slate-900 uppercase">
                          ₹{item.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-white">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                          New Property
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mb-1 truncate">
                        {item.title}
                      </h3>
                      <p className="text-[11px] font-medium text-slate-500 mb-4 flex items-center gap-1 uppercase tracking-wider">
                        <MapPin size={10} className="text-emerald-500" /> {item.location}
                      </p>
                      <Link
                        to={`/listings/${item._id}`}
                        className="block w-full text-center py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-[11px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-emerald-500/10"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Map Controls */}
          <div className="absolute right-6 top-6 flex flex-col gap-2 z-[1000]">
            <button
              onClick={() => setMapZoom((prev) => Math.min(prev + 1, 18))}
              className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-700 shadow-xl hover:bg-slate-50 transition-all font-bold text-lg"
            >
              +
            </button>
            <button
              onClick={() => setMapZoom((prev) => Math.max(prev - 1, 3))}
              className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-700 shadow-xl hover:bg-slate-50 transition-all font-bold text-lg"
            >
              âˆ’
            </button>
            <button
              onClick={handleNearMe}
              disabled={isLocating}
              className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-xl transition-all ${
                isLocating ? 'bg-emerald-50 text-emerald-600' : 'bg-white text-slate-700 hover:bg-slate-50'
              } border border-slate-200`}
            >
              <Locate size={20} className={isLocating ? 'animate-pulse' : ''} />
            </button>
          </div>

          {/* Quick List Tray */}
          <div className="absolute left-6 bottom-6 right-6 lg:right-auto lg:w-96 z-[1000]">
            <AnimatePresence>
              {activeItem ? (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  className="bg-white/95 backdrop-blur-xl border border-white/20 p-5 rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.12)]"
                >
                  <button
                    onClick={() => setActiveItem(null)}
                    className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-rose-500 transition-all"
                  >
                    <Loader2 size={12} className="hidden" />
                    <span className="text-xs font-bold">×</span>
                  </button>
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-black/5">
                      {activeItem.image ? (
                        <img src={activeItem.image} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                          <Home size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-1">
                        {activeItem.category || 'Property'}
                      </p>
                      <h3 className="text-lg font-bold text-slate-900 truncate mb-1">
                        {activeItem.title}
                      </h3>
                      <p className="text-xs text-slate-500 mb-3 flex items-center gap-1 font-medium truncate">
                        <MapPin size={10} className="text-slate-300" /> {activeItem.location}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            Price Starts
                          </span>
                          <span className="text-sm font-black text-slate-900">
                            ₹{activeItem.price.toLocaleString()}
                            <span className="text-[11px] font-bold text-slate-400">/night</span>
                          </span>
                        </div>
                        <Link
                          to={`/listings/${activeItem._id}`}
                          className="h-9 px-5 bg-slate-900 text-white rounded-xl flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-slate-950/20"
                        >
                          Details <ArrowUpRight size={12} className="hidden" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-slate-900/95 backdrop-blur-xl border border-white/5 p-4 rounded-2xl shadow-2xl flex items-center gap-4 text-white"
                >
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                    <Info size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold tracking-tight">
                      Click on a marker to see details
                    </p>
                    <p className="text-[11px] text-white/50 font-medium uppercase tracking-widest">
                      Explore available properties on the map
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        .wayzza-custom-popup .leaflet-popup-content-wrapper {
          border-radius: 20px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          border: 1px solid rgba(0,0,0,0.05);
        }
        .wayzza-custom-popup .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
        .wayzza-custom-popup .leaflet-popup-tip {
          background: white;
        }
        .custom-price-marker {
          background: transparent !important;
          border: none !important;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </WayzzaLayout>
  );
}

function MapEventsHandler({ onMove }) {
  const map = useMap();
  useEffect(() => {
    map.on('moveend', onMove);
    return () => map.off('moveend', onMove);
  }, [map, onMove]);
  return null;
}

function ArrowUpRight({ size, className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="7" y1="17" x2="17" y2="7"></line>
      <polyline points="7 7 17 7 17 17"></polyline>
    </svg>
  );
}
