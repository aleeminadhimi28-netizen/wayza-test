import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Home, Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api.js';

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

export default function MapView({
  lat,
  lng,
  title,
  markers,
  theme = 'light',
  activeId,
  onMarkerClick,
}) {
  // default center
  const [mapCenter, setMapCenter] = useState([8.7379, 76.7163]);
  const [mapZoom, setMapZoom] = useState(13);

  useEffect(() => {
    if (lat && lng) {
      setMapCenter([lat, lng]);
      setMapZoom(14);
    } else if (activeId && markers) {
      const activeMarker = markers.find((m) => m.id === activeId);
      if (activeMarker) {
        setMapCenter([activeMarker.lat, activeMarker.lng]);
        setMapZoom(14);
      }
    } else if (markers && markers.length > 0) {
      setMapCenter([markers[0].lat, markers[0].lng]);
      setMapZoom(12);
    }
  }, [lat, lng, activeId, markers]);

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={
            theme === 'dark'
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
          }
        />

        <ChangeView center={mapCenter} zoom={mapZoom} />

        {/* SINGLE MARKER (Listing details page fallback / other) */}
        {lat && lng && (
          <Marker position={[lat, lng]}>
            <Popup>{title}</Popup>
          </Marker>
        )}

        {/* MULTIPLE MARKERS (Map search page) */}
        {markers &&
          markers.map((m) => (
            <Marker
              key={m.id}
              position={[m.lat, m.lng]}
              icon={createPriceIcon(m.price)}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) onMarkerClick(m.id);
                  setMapCenter([m.lat, m.lng]);
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.95} className="custom-tooltip">
                <div className="p-2.5 text-xs font-semibold text-slate-800 bg-white rounded-xl shadow-xl border border-slate-100 flex flex-col gap-1 min-w-[130px]">
                  <div className="font-extrabold truncate max-w-[150px] text-slate-900">
                    {m.title}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider">
                    ₹{m.price.toLocaleString()} / night
                  </div>
                </div>
              </Tooltip>
              <Popup className="wayzza-custom-popup">
                <div className="w-64 overflow-hidden rounded-xl">
                  <div className="relative h-32 bg-slate-100">
                    {m.image ? (
                      <img
                        src={api.fixImg(m.image)}
                        className="w-full h-full object-cover"
                        alt={m.title}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Home size={32} />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg shadow-sm border border-black/5">
                      <span className="text-[11px] font-black tracking-tight text-slate-900 uppercase">
                        ₹{m.price.toLocaleString()}
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
                    <h3 className="text-sm font-bold text-slate-900 mb-1 truncate">{m.title}</h3>
                    <p className="text-[11px] font-medium text-slate-500 mb-4 flex items-center justify-between gap-1 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <MapPin size={10} className="text-emerald-500" /> {m.location || 'Varkala'}
                      </span>
                      <a
                        href={`https://www.google.com/maps?q=${m.lat},${m.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-black text-emerald-600 hover:underline"
                      >
                        Maps ↗
                      </a>
                    </p>
                    <Link
                      to={`/listings/${m.id}`}
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

      {/* Styles */}
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
        .leaflet-tooltip.custom-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-tooltip-top:before {
          border-top-color: #ffffff !important;
        }
      `}</style>
    </div>
  );
}
