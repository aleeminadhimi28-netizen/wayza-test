import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { WayzzaLayout } from '../../WayzzaUI.jsx';
import { api } from '../../utils/api.js';
import SEO from '../../components/SEO.jsx';
import { Home, Bike, Sparkles, ArrowRight, CheckCircle2, Package, MapPin } from 'lucide-react';

const SOUTH_KERALA_LOCATIONS = [
  { name: 'Munroe Island', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80' },
  { name: 'Kaveri Elephant Park', img: 'https://images.unsplash.com/photo-1588336142586-36aff1c9e5e7?auto=format&fit=crop&w=800&q=80' },
  { name: 'Jatayu Earth Center', img: 'https://images.unsplash.com/photo-1643193498967-df1fb4284d72?auto=format&fit=crop&w=800&q=80' },
  { name: 'Varkala Cliff', img: '/images/varkala_cliff.webp' },
  { name: 'Kappil Beach', img: '/images/varkala_hero.webp' }
];

function PackageCard({ pkg, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="group relative bg-white rounded-[28px] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-slate-200 transition-all duration-500 overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={pkg.image || '/images/varkala_hero.webp'}
          alt={pkg.name}
          className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-lg">
          <Sparkles size={10} />
          Curated Package
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6 gap-4">
        <div>
          <h3 className="text-xl font-black tracking-tight text-slate-950 mb-1.5 leading-snug">
            {pkg.name}
          </h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">{pkg.description}</p>
        </div>

        {/* What's included */}
        {pkg.experienceDetails && (
          <div className="flex items-start gap-2 p-3 bg-emerald-50 rounded-2xl">
            <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-xs text-emerald-800 font-semibold leading-relaxed">
              {pkg.experienceDetails}
            </p>
          </div>
        )}

        {/* Features row */}
        <div className="flex items-center gap-2 flex-wrap">
          {pkg.hotelId && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-full text-[11px] font-bold text-slate-600">
              <Home size={10} /> Villa Stay
            </span>
          )}
          {pkg.vehicleId && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-full text-[11px] font-bold text-slate-600">
              <Bike size={10} /> Vehicle
            </span>
          )}
          {pkg.experienceDetails && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-full text-[11px] font-bold text-slate-600">
              <Sparkles size={10} /> Experience
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
          <div>
            <p className="text-[10px] uppercase font-black tracking-[0.25em] text-slate-400 mb-0.5">
              Package from
            </p>
            <p className="text-2xl font-black text-slate-950">
              ₹
              {pkg.price !== undefined && !isNaN(Number(pkg.price))
                ? Number(pkg.price).toLocaleString('en-IN')
                : '0'}
              <span className="text-sm font-semibold text-slate-400 ml-1">/ stay</span>
            </p>
          </div>
          <Link
            to={
              pkg.hotelId
                ? `/listing/${pkg.hotelId}`
                : `/listings?location=${encodeURIComponent(pkg.name)}`
            }
            state={
              pkg.hotelId
                ? { fromPackage: { id: pkg._id, name: pkg.name, price: pkg.price } }
                : undefined
            }
            className="flex items-center gap-2 bg-slate-950 text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.25em] hover:bg-emerald-600 transition-all duration-300 active:scale-95"
          >
            View Stay <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function PackageSkeleton() {
  return (
    <div className="bg-white rounded-[28px] border border-slate-100 overflow-hidden animate-pulse">
      <div className="h-56 bg-slate-100" />
      <div className="p-6 space-y-3">
        <div className="h-5 bg-slate-100 rounded-xl w-3/4" />
        <div className="h-4 bg-slate-100 rounded-xl w-full" />
        <div className="h-4 bg-slate-100 rounded-xl w-5/6" />
        <div className="h-10 bg-slate-100 rounded-2xl w-full mt-4" />
      </div>
    </div>
  );
}

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    api
      .getPackages()
      .then((data) => {
        if (!active) return;
        if (data.ok && Array.isArray(data.rows)) {
          setPackages(data.rows);
        } else {
          setError('Could not load packages.');
        }
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError('Network error. Please try again.');
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <WayzzaLayout>
      <SEO
        title="Curated Travel Packages — Varkala"
        description="Discover Wayzza's hand-crafted travel packages for Varkala. Combine a premium villa, vehicle, and local experience into one seamless booking."
      />

      {/* Hero */}
      <div className="relative bg-[#06110d] text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[5%] w-[45%] h-[65%] bg-emerald-500/10 blur-[130px] rounded-full" />
          <div className="absolute bottom-0 right-[12%] w-[38%] h-[45%] bg-emerald-700/10 blur-[110px] rounded-full" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[11px] uppercase tracking-[0.35em] text-emerald-300 font-black mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Wayzza Curated Packages
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl sm:text-6xl font-black tracking-tighter leading-tight text-white mb-4"
          >
            Everything you need, <span className="text-emerald-400 italic">bundled.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto"
          >
            Hand-crafted combinations of premium stays, vehicles, and unique experiences — one
            price, zero stress.
          </motion.p>
        </div>
      </div>

      {/* South Kerala Escape Featured Section */}
      <div className="bg-slate-50 py-20 px-4 sm:px-6 relative overflow-hidden border-b border-slate-200">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Text Content */}
          <div className="space-y-8">
            <div className="space-y-2">
              <p className="text-slate-500 font-bold tracking-[0.4em] uppercase text-sm">South</p>
              <h2 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none">
                Kerala <br />
                <span className="text-amber-500 italic font-serif font-medium text-5xl md:text-7xl">Escape</span>
              </h2>
            </div>
            
            <div className="w-12 h-1 bg-slate-900 rounded-full" />
            
            <div>
              <p className="text-slate-900 font-black tracking-[0.2em] uppercase text-sm mb-2">Five Experiences.</p>
              <p className="text-amber-600 font-bold tracking-[0.1em] uppercase text-sm">One unforgettable journey.</p>
            </div>
            
            <div className="pt-8">
              <h3 className="text-3xl md:text-4xl font-serif italic text-slate-800 leading-tight mb-6">
                From backwaters<br />
                to cliffside sunsets,
              </h3>
              <p className="text-slate-500 text-lg md:text-xl font-medium">
                every stop has<br />a story to tell.
              </p>
              <div className="w-16 h-1 bg-amber-500 rounded-full mt-8 opacity-60" />
            </div>
          </div>
          
          {/* Right Image Stack */}
          <div className="relative space-y-4">
            {SOUTH_KERALA_LOCATIONS.map((loc, i) => (
              <motion.div 
                key={loc.name}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="relative h-32 sm:h-40 lg:h-44 w-full rounded-2xl overflow-hidden shadow-xl group border-2 border-white"
              >
                <img 
                  src={loc.img} 
                  alt={loc.name} 
                  className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <MapPin size={18} className="text-white" />
                  <span className="text-white font-serif italic text-xl md:text-2xl tracking-wide">{loc.name}</span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>

      {/* Packages Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {error && (
          <div className="text-center py-20">
            <p className="text-slate-500 font-medium">{error}</p>
          </div>
        )}

        {!error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? [1, 2, 3].map((i) => <PackageSkeleton key={i} />)
              : packages.map((pkg, i) => <PackageCard key={pkg._id} pkg={pkg} index={i} />)}
          </div>
        )}

        {!loading && !error && packages.length === 0 && (
          <div className="text-center py-24">
            <Package size={40} className="text-slate-200 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-900 mb-2">No packages yet</h2>
            <p className="text-slate-400 font-medium">
              Our team is crafting exclusive packages for you. Check back soon!
            </p>
          </div>
        )}
      </div>
    </WayzzaLayout>
  );
}
