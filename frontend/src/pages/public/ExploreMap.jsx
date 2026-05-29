import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { WayzzaLayout } from '../../WayzzaUI.jsx';
import { Link } from 'react-router-dom';
import { Home, Navigation, MapPin, Loader2, Info, Star, Sun, Moon } from 'lucide-react';
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
  Bike,
  Car,
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
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [center, zoom, map]);
  return null;
}

// Simple client-side coordinate clustering helper
const clusterListings = (items, zoom) => {
  if (zoom >= 14) {
    return items.map((item) => ({ ...item, isCluster: false }));
  }

  const gridSize = 0.04 / Math.pow(2, zoom - 10);
  const clusters = [];

  items.forEach((item) => {
    let added = false;
    for (const cluster of clusters) {
      const distLat = Math.abs(cluster.latitude - item.latitude);
      const distLng = Math.abs(cluster.longitude - item.longitude);
      if (distLat < gridSize && distLng < gridSize) {
        cluster.listings.push(item);
        cluster.latitude =
          (cluster.latitude * (cluster.listings.length - 1) + item.latitude) /
          cluster.listings.length;
        cluster.longitude =
          (cluster.longitude * (cluster.listings.length - 1) + item.longitude) /
          cluster.listings.length;
        added = true;
        break;
      }
    }
    if (!added) {
      clusters.push({
        _id: `cluster-${item._id}`,
        latitude: item.latitude,
        longitude: item.longitude,
        listings: [item],
        isCluster: true,
      });
    }
  });

  return clusters.map((c) => {
    if (c.listings.length === 1) {
      return { ...c.listings[0], isCluster: false };
    }
    return c;
  });
};

export default function ExploreMap() {
  const [allListings, setAllListings] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [mapCenter, setMapCenter] = useState([8.7379, 76.7163]); // Varkala, Kerala
  const [mapZoom, setMapZoom] = useState(13);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mapBounds, setMapBounds] = useState(null);
  const [mapTheme, setMapTheme] = useState('light');

  const categories = [
    { id: 'all', label: 'All Stays', icon: <Compass size={16} /> },
    { id: 'beachfront', label: 'Beachfront', icon: <Waves size={16} /> },
    { id: 'luxury', label: 'Luxury', icon: <Gem size={16} /> },
    { id: 'resort', label: 'Resorts', icon: <Palmtree size={16} /> },
    { id: 'heritage', label: 'Heritage', icon: <History size={16} /> },
    { id: 'villa', label: 'Villas', icon: <Building size={16} /> },
    { id: 'glamping', label: 'Glamping', icon: <Tent size={16} /> },
    { id: 'bike', label: 'Bikes', icon: <Bike size={16} /> },
    { id: 'car', label: 'Cars', icon: <Car size={16} /> },
  ];

  const fetchData = useCallback(
    async (params = {}) => {
      try {
        setLoading(true);
        const query = { limit: 100, ...params };
        if (selectedCategory !== 'all') query.category = selectedCategory;

        const data = await api.getListings(query);
        if (data.ok) {
          const rows = data.rows || data.data || (Array.isArray(data) ? data : []);
          const withGps = rows.map((r, index) => {
            let lat = parseFloat(r.latitude);
            let lng = parseFloat(r.longitude);

            // If coordinates are missing or invalid, assign fallback demo coordinates based on location name
            if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
              const isMumbai = r.location && r.location.toLowerCase().includes('mumbai');
              const baseLat = isMumbai ? 19.076 : 8.7379;
              const baseLng = isMumbai ? 72.8777 : 76.7163;

              // Jitter offset so multiple properties don't stack on the exact same location
              const offsetAngle = index * 0.6;
              const radius = 0.004 + index * 0.0006;
              lat = baseLat + Math.sin(offsetAngle) * radius;
              lng = baseLng + Math.cos(offsetAngle) * radius;
            }

            return {
              ...r,
              latitude: lat,
              longitude: lng,
            };
          });
          setAllListings(withGps);
          setListings(withGps);

          if (params.lat && params.lng) {
            setMapCenter([params.lat, params.lng]);
            setMapZoom(14);
          } else {
            // Default center is always Varkala when opened
            setMapCenter([8.7379, 76.7163]);
            setMapZoom(13);
          }
        }
      } catch (err) {
        setError('Failed to connect to the server.');
      } finally {
        setLoading(false);
        setShowSearchButton(false);
      }
    },
    [selectedCategory]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearchThisArea = () => {
    if (mapBounds) {
      const filtered = allListings.filter((item) =>
        mapBounds.contains([item.latitude, item.longitude])
      );
      setListings(filtered);
      setShowSearchButton(false);
    }
  };

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
        title="Explore Varkala on Map"
        description="Discover and book stays, bikes, and cars in Varkala using our interactive discovery map."
        noindex={true}
        breadcrumb={[
          { name: 'Home', url: 'https://wayzza.live' },
          { name: 'Explore Map', url: 'https://wayzza.live/explore-map' },
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
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Explore Varkala</h1>
              <p className="text-xs text-slate-500 font-medium">
                Discover curated stays, bikes, and cars
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="hidden sm:flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                  {listings.length} Listings found
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
                  onClick={handleSearchThisArea}
                  className="bg-slate-900 text-white px-6 py-3 rounded-full flex items-center gap-2 font-bold text-xs uppercase tracking-widest shadow-2xl hover:bg-emerald-600 transition-all active:scale-95"
                >
                  <Search size={14} /> Search this area
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          {loading ? (
            <div className="absolute inset-0 z-[1001] bg-slate-950/40 backdrop-blur-md flex items-center justify-center">
              <div className="bg-[#0b1311]/90 border border-white/10 p-8 rounded-3xl flex flex-col items-center gap-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="relative">
                  <div className="w-14 h-14 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 w-14 h-14 border-4 border-transparent border-b-emerald-400 rounded-full animate-ping opacity-40" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs font-black tracking-widest text-emerald-400 uppercase">
                    Syncing Wayzza Explorer
                  </p>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                    Loading local coordinates...
                  </p>
                </div>
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
              url={
                mapTheme === 'dark'
                  ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                  : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
              }
            />

            <MapEventsHandler
              onMove={() => setShowSearchButton(true)}
              onBoundsChange={setMapBounds}
              onZoomChange={setMapZoom}
            />
            <ChangeView center={mapCenter} zoom={mapZoom} />

            {clusterListings(listings, mapZoom).map((item) => {
              if (item.isCluster) {
                return (
                  <Marker
                    key={item._id}
                    position={[item.latitude, item.longitude]}
                    icon={L.divIcon({
                      className: 'custom-cluster-marker',
                      html: `<div style="background: #10b981; color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 13px; box-shadow: 0 4px 16px rgba(16,185,129,0.3); border: 2px solid white;">${item.listings.length}</div>`,
                      iconSize: [42, 42],
                      iconAnchor: [21, 21],
                    })}
                    eventHandlers={{
                      click: () => {
                        setMapCenter([item.latitude, item.longitude]);
                        setMapZoom((prev) => Math.min(prev + 2, 16));
                      },
                    }}
                  />
                );
              }

              return (
                <Marker
                  key={item._id}
                  position={[item.latitude, item.longitude]}
                  icon={createPriceIcon(item.price)}
                  eventHandlers={{
                    click: () => {
                      setActiveItem(item);
                      setMapCenter([item.latitude, item.longitude]);
                    },
                  }}
                >
                  <Tooltip
                    direction="top"
                    offset={[0, -10]}
                    opacity={0.95}
                    className="custom-tooltip"
                  >
                    <div className="p-2.5 text-xs font-semibold text-slate-800 bg-white rounded-xl shadow-xl border border-slate-100 flex flex-col gap-1 min-w-[130px]">
                      <div className="font-extrabold truncate max-w-[150px] text-slate-900">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider">
                        ₹{item.price.toLocaleString()}{' '}
                        {item.category === 'bike' || item.category === 'car' ? '/ day' : '/ night'}
                      </div>
                    </div>
                  </Tooltip>
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
                            {item.category === 'bike'
                              ? 'New Bike'
                              : item.category === 'car'
                                ? 'New Car'
                                : 'New Property'}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mb-1 truncate">
                          {item.title}
                        </h3>
                        <p className="text-[11px] font-medium text-slate-500 mb-4 flex items-center justify-between gap-1 uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <MapPin size={10} className="text-emerald-500" /> {item.location}
                          </span>
                          <a
                            href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] font-black text-emerald-600 hover:underline"
                          >
                            Maps ↗
                          </a>
                        </p>
                        <Link
                          to={`/listing/${item._id}`}
                          className="block w-full text-center py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-[11px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-emerald-500/10"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Map Controls */}
          <div className="absolute right-6 top-6 flex flex-col gap-2 z-[1000]">
            {/* Map Theme Toggle */}
            <button
              onClick={() => setMapTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
              className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-700 shadow-xl hover:bg-slate-50 transition-all"
              title={`Switch to ${mapTheme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {mapTheme === 'light' ? (
                <Moon size={20} className="text-slate-700" />
              ) : (
                <Sun size={20} className="text-amber-500" />
              )}
            </button>
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
              −
            </button>
            <button
              onClick={handleNearMe}
              disabled={isLocating}
              className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-xl transition-all ${
                isLocating
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
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
                        <img
                          src={api.fixImg(activeItem.image)}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                          <Home size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-1">
                        {activeItem.category === 'bike'
                          ? 'Bike'
                          : activeItem.category === 'car'
                            ? 'Car'
                            : activeItem.category || 'Property'}
                      </p>
                      <h3 className="text-lg font-bold text-slate-900 truncate mb-1">
                        {activeItem.title}
                      </h3>
                      <div className="flex items-center justify-between mb-3 text-xs">
                        <p className="text-slate-500 flex items-center gap-1 font-medium truncate">
                          <MapPin size={10} className="text-slate-300" /> {activeItem.location}
                        </p>
                        <a
                          href={`https://www.google.com/maps?q=${activeItem.latitude},${activeItem.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5"
                        >
                          Open Maps ↗
                        </a>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            Price Starts
                          </span>
                          <span className="text-sm font-black text-slate-900">
                            ₹{activeItem.price.toLocaleString()}
                            <span className="text-[11px] font-bold text-slate-400">
                              {activeItem.category === 'bike' || activeItem.category === 'car'
                                ? '/day'
                                : '/night'}
                            </span>
                          </span>
                        </div>
                        <Link
                          to={`/listing/${activeItem._id}`}
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
        .custom-price-marker, .custom-cluster-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-tooltip.custom-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-tooltip-top:before {
          border-top-color: #ffffff !important;
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

function MapEventsHandler({ onMove, onBoundsChange, onZoomChange }) {
  const map = useMap();
  useEffect(() => {
    const handleMoveEnd = () => {
      onMove();
      if (onBoundsChange) onBoundsChange(map.getBounds());
      if (onZoomChange) onZoomChange(map.getZoom());
    };
    // Initial bounds / zoom
    if (onBoundsChange) onBoundsChange(map.getBounds());
    if (onZoomChange) onZoomChange(map.getZoom());

    map.on('moveend', handleMoveEnd);
    return () => map.off('moveend', handleMoveEnd);
  }, [map, onMove, onBoundsChange, onZoomChange]);
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
