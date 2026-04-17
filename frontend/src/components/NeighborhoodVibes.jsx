import { useState, useEffect } from "react";
import { MapPin, Compass, Coffee, Utensils, Waves, Moon, Sparkles, Loader2 } from "lucide-react";

const ICON_MAP = { Compass, Coffee, Waves, Moon, Utensils, MapPin };

export default function NeighborhoodVibes({ location, category }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVibe = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/v1/misc/neighborhood-vibe?location=${encodeURIComponent(location)}&category=${encodeURIComponent(category)}`);
        const json = await res.json();
        if (json.ok) setData(json.data);
      } catch (err) {
        console.error("Failed to fetch vibe", err);
      } finally {
        setLoading(false);
      }
    };
    if (location) fetchVibe();
  }, [location, category]);

  if (loading) return (
    <div className="h-[300px] bg-slate-50 rounded-[48px] flex flex-col items-center justify-center gap-4 animate-pulse">
      <Loader2 size={24} className="text-emerald-500 animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Architecting Neighbourhood Soul...</p>
    </div>
  );

  if (!data) return null;

  return (
    <section className="space-y-12">
      <div className="flex items-center gap-4">
        <span className="h-px w-12 bg-emerald-500" />
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-600">Local Soul</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              {data.vibeTitle}.
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed font-medium">
              "{data.vibeDesc}"
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="px-4 py-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2">
              <Sparkles size={12} className="text-emerald-400" /> High Vibe Area
            </div>
            <div className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2">
              <MapPin size={12} /> Prime Connectivity
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {data.hotspots.map((spot, i) => {
            const Icon = ICON_MAP[spot.iconLabel] || MapPin;
            return (
              <div key={i} className="aspect-square bg-white border border-slate-100 rounded-[32px] p-8 flex flex-col justify-between group hover:border-emerald-500 transition-all hover:shadow-xl hover:shadow-emerald-500/5">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <Icon size={22} />
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none">{spot.label}</p>
                  <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{spot.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
