import { MapPin, Compass, Coffee, Utensils, Waves, Moon, Sparkles } from "lucide-react";

export default function NeighborhoodVibes({ location, category }) {
  // Heuristic vibes based on location/category
  const isVarkala = location?.toLowerCase().includes("varkala");
  const isMunnar = location?.toLowerCase().includes("munnar");
  
  const vibeTitle = isVarkala ? "Bohemian Seclusion" : isMunnar ? "Emerald Mist" : "Coastal Rhapsody";
  const vibeDesc = isVarkala 
    ? "A sanctuary of red cliffs and turquoise waters, where every sunset feels like a private exhibition of nature."
    : "Nested within the clouds and ancient tea trails, offering a serenity found only in the high ranges.";

  const hotSpots = [
    { name: "The Cliff Trail", icon: Compass, label: "Adventure" },
    { name: "Soul Food Cafe", icon: Coffee, label: "Gourmet" },
    { name: "Private Shore", icon: Waves, label: "Exclusive" },
    { name: "Luna Lounge", icon: Moon, label: "Nightlife" }
  ];

  return (
    <section className="space-y-12">
      <div className="flex items-center gap-4">
        <span className="h-px w-12 bg-emerald-500" />
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-600 italic">Local Soul</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic font-serif leading-none">
              {vibeTitle}.
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed font-medium italic">
              "{vibeDesc}"
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
          {hotSpots.map((spot, i) => (
            <div key={i} className="aspect-square bg-white border border-slate-100 rounded-[32px] p-8 flex flex-col justify-between group hover:border-emerald-500 transition-all hover:shadow-xl hover:shadow-emerald-500/5">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <spot.icon size={22} />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none">{spot.label}</p>
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{spot.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
