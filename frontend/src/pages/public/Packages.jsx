import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { WayzzaLayout } from '../../WayzzaUI.jsx';
import { api } from '../../utils/api.js';
import SEO from '../../components/SEO.jsx';
import {
  Home,
  Bike,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Package,
} from 'lucide-react';

const ICONS = { hotel: Home, bike: Bike, experience: Sparkles, default: Package };

function PackageCard({ pkg, index }) {
  const navigate = useNavigate();
  const Icon = ICONS.default;

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
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            {pkg.description}
          </p>
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
              ₹{Number(pkg.price).toLocaleString('en-IN')}
              <span className="text-sm font-semibold text-slate-400 ml-1">/ stay</span>
            </p>
          </div>
          <button
            onClick={() => navigate('/listings')}
            className="flex items-center gap-2 bg-slate-950 text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.25em] hover:bg-emerald-600 transition-all duration-300 active:scale-95"
          >
            Book <ArrowRight size={13} />
          </button>
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
    api
      .getPackages()
      .then((data) => {
        if (data.ok && Array.isArray(data.rows)) {
          setPackages(data.rows);
        } else {
          setError('Could not load packages.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Network error. Please try again.');
        setLoading(false);
      });
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
            Everything you need,{' '}
            <span className="text-emerald-400 italic">bundled.</span>
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
              : packages.map((pkg, i) => (
                  <PackageCard key={pkg._id} pkg={pkg} index={i} />
                ))}
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
