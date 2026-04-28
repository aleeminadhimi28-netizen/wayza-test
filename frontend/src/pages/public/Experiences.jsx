import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { WayzzaLayout, WayzzaSkeleton } from '../../WayzzaUI.jsx';
import {
  Anchor,
  Compass,
  Navigation,
  ArrowRight,
  PlayCircle,
  Star,
  Target,
  MapPin,
  Sparkles,
  Zap,
  Shield,
  Heart,
  Info,
  ChevronRight,
  Globe,
  Layers,
  Award,
  Music,
  Camera,
  Palmtree,
  Wind,
  Waves,
  Coffee,
} from 'lucide-react';
import { useCurrency } from '../../CurrencyContext.jsx';
import { api } from '../../utils/api.js';
import { fixImg } from '../../utils/image.js';

const CATEGORIES = [
  { id: 'all', label: 'All Secrets', icon: Globe },
  { id: 'culinary', label: 'Culinary Dives', icon: Coffee },
  { id: 'adventure', label: 'High Adrenaline', icon: Zap },
  { id: 'cultural', label: 'Native Heritage', icon: Music },
  { id: 'wellness', label: 'Soulful Retreats', icon: Wind },
  { id: 'maritime', label: 'Ocean Expeditions', icon: Waves },
];

export default function Experiences() {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('all');

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 1.1]);



  useEffect(() => {
    setLoading(true);
    api
      .getListings({ category: 'activity' })
      .then((data) => {
        const rows = data.rows || data;
        if (Array.isArray(rows)) setListings(rows);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = listings; // For now keeping it simple as specific subtypes aren't in model yet

  return (
    <WayzzaLayout noPadding hideFooter>
      <div className="bg-white font-sans text-slate-900 selection:bg-amber-100 selection:text-amber-900 overflow-hidden">
        {/* ════ CINEMATIC HERO ════ */}
        <section className="relative h-[90vh] min-h-[800px] flex items-center justify-center bg-slate-950 overflow-hidden">
          <motion.div
            style={{ opacity: heroOpacity, scale: heroScale }}
            className="absolute inset-0 z-0"
          >
            <img
              src="https://images.unsplash.com/photo-1626442651167-797745778a08?auto=format&fit=crop&w=2400&q=85"
              alt="Experience Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          </motion.div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-12"
            >
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-3xl border border-white/20 px-8 py-3 rounded-full text-white font-bold text-[10px] uppercase tracking-[0.4em] shadow-2xl">
                <Anchor size={14} className="text-amber-400" /> Beyond the Stay
              </div>

              <h1 className="text-7xl md:text-[160px] font-bold text-white tracking-tighter leading-[0.8] uppercase mb-4 drop-shadow-2xl">
                NATIVE <br />
                <span className="text-amber-400 lowercase drop-shadow-none">secrets.</span>
              </h1>

              <div className="flex flex-col items-center gap-8">
                <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto font-medium leading-relaxed border-l-2 border-amber-500/50 pl-10 py-2">
                  "Handpicked curated journeys, high-adrenaline adventures, and{' '}
                  <span className="text-white font-bold">deep cultural dives</span> designed for the
                  native explorer."
                </p>

                <div className="flex gap-4">
                  <button className="h-16 px-10 bg-amber-500 text-slate-950 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 flex items-center gap-3">
                    <PlayCircle size={18} /> Watch Discovery
                  </button>
                  <button
                    onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
                    className="h-16 px-10 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-white/20 transition-all"
                  >
                    Browse Grid
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 text-white/30">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-px h-16 bg-gradient-to-b from-amber-500 to-transparent"
            />
          </div>
        </section>

        {/* ════ CATEGORY STRIP ════ */}
        <div className="relative z-30 -mt-16 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[40px] p-4 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border border-slate-100 overflow-x-auto no-scrollbar"
          >
            <div className="flex gap-4 min-w-max p-2 justify-center">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  className={`px-8 py-5 rounded-[24px] font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-4 border-2 ${activeCat === cat.id ? 'bg-slate-950 border-slate-950 text-white shadow-2xl scale-105' : 'bg-transparent border-slate-50 text-slate-400 hover:border-slate-200 hover:text-slate-900'}`}
                >
                  <cat.icon size={16} className={activeCat === cat.id ? 'text-amber-400' : ''} />
                  {cat.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ════ THE GRID ════ */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
          <header className="mb-24 flex flex-col md:flex-row justify-between items-end gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-amber-600 font-bold text-[10px] uppercase tracking-[0.5em]">
                <Sparkles size={18} /> Top Rated Experiences
              </div>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none">
                Curated <br />
                <span className="text-amber-500 lowercase">extraordinary.</span>
              </h2>
            </div>
            <p className="text-slate-400 text-lg font-medium max-w-md border-l-2 border-slate-100 pl-8 pb-2">
              Showing <span className="text-slate-900 font-bold">{listings.length}</span> handpicked
              experiences verified for quality and authenticity.
            </p>
          </header>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <WayzzaSkeleton key={i} className="aspect-[3/4] rounded-[48px]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {listings.map((exp, i) => (
                <motion.div
                  key={exp._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/listing/${exp._id}`)}
                  className="group cursor-pointer relative"
                >
                  <div className="relative aspect-[3/4] rounded-[48px] overflow-hidden bg-slate-100 shadow-xl transition-all duration-700 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-2">
                    <img
                      src={fixImg(exp.image)}
                      alt={exp.title}
                      className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />

                    {/* Badges */}
                    <div className="absolute top-8 left-8 flex flex-col gap-2">
                      <span className="bg-white/95 backdrop-blur-md text-slate-950 text-[9px] font-bold px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">
                        Verified Experience
                      </span>
                      {exp.price > 10000 && (
                        <span className="bg-amber-500 text-slate-950 text-[9px] font-bold px-4 py-2 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                          <Award size={12} /> Elite Pick
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="absolute top-8 right-8 w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 text-white transition-all group-hover:bg-amber-500 group-hover:border-amber-500 group-hover:text-slate-950 group-hover:scale-110">
                      <ArrowRight
                        size={20}
                        className="-rotate-45 group-hover:rotate-0 transition-transform"
                      />
                    </div>

                    {/* Info Overlay */}
                    <div className="absolute bottom-10 left-10 right-10 space-y-4">
                      <div className="flex items-center gap-3">
                        <MapPin size={14} className="text-amber-500" />
                        <span className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em]">
                          {exp.location || 'Coastline'}
                        </span>
                      </div>
                      <h3 className="text-3xl font-bold text-white uppercase leading-tight line-clamp-2">
                        {exp.title}
                      </h3>
                      <div className="flex justify-between items-end pt-4 border-t border-white/10">
                        <div>
                          <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">
                            Starting From
                          </p>
                          <p className="text-2xl font-bold text-white">{formatPrice(exp.price)}</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-full font-bold text-xs border border-amber-500/20">
                          <Star size={12} className="fill-current" /> {exp.rating || 'New'}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ════ ADRENALINE FEEDS ════ */}
        <section className="py-48 bg-slate-950 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-amber-500/[0.03] blur-[150px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-24">
            <div className="flex-1 w-full relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="aspect-video rounded-[64px] overflow-hidden shadow-3xl border border-white/10 group bg-slate-900"
              >
                <img
                  src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80"
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[5s]"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-amber-500 rounded-full flex items-center justify-center text-slate-950 shadow-3xl cursor-pointer hover:scale-110 transition-transform">
                    <PlayCircle size={48} />
                  </div>
                </div>
              </motion.div>
            </div>
            <div className="flex-1 space-y-12">
              <div className="inline-flex items-center gap-4 bg-white/5 border border-white/10 text-amber-400 px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-[0.4em]">
                <Zap size={16} /> ADRENALINE PEAK
              </div>
              <h2 className="text-6xl md:text-9xl font-bold text-white tracking-tighter uppercase leading-[0.85]">
                FEEL THE <br />
                <span className="text-amber-500 lowercase">rush.</span>
              </h2>
              <p className="text-white/40 text-xl font-medium leading-relaxed border-l-4 border-amber-500/20 pl-10 py-2">
                "From paragliding over red cliffs to high-speed jet ski expeditions, our adrenaline
                portfolio is unmatched in the region."
              </p>
              <button className="h-24 px-16 bg-white text-slate-950 hover:bg-amber-500 hover:text-white rounded-[32px] font-bold text-[12px] uppercase tracking-[0.4em] transition-all flex items-center gap-8 active:scale-95 group">
                View Extreme Collection{' '}
                <ArrowRight size={20} className="group-hover:translate-x-3 transition-transform" />
              </button>
            </div>
          </div>
        </section>

        {/* ════ NATIVE SECRETS FOOTER CTA ════ */}
        <section className="py-48 px-6 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-amber-500 rounded-[80px] p-24 md:p-36 text-center relative overflow-hidden shadow-3xl group"
            >
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=2400&q=80')] bg-cover bg-center mix-blend-overlay opacity-20 grayscale group-hover:grayscale-0 transition-all duration-[3s]" />
              <div className="relative z-10 space-y-12">
                <span className="inline-flex items-center gap-4 bg-slate-950 text-white px-8 py-3 rounded-full font-bold text-[11px] uppercase tracking-[0.4em] shadow-2xl">
                  <Target size={20} className="text-amber-400" /> NATIVE EXPLORATION PROGRAM
                </span>
                <h2 className="text-7xl md:text-[110px] font-bold text-slate-950 tracking-tighter leading-[0.8] uppercase">
                  UNLOCK THE <br />
                  <span className="lowercase text-white mt-4 block">unindexed.</span>
                </h2>
                <p className="text-slate-950/60 text-2xl md:text-3xl font-medium max-w-3xl mx-auto leading-relaxed border-t border-b border-slate-950/10 py-12">
                  "Our Native Secrets collection includes private tours and entries not found on any
                  global travel index."
                </p>
                <div className="flex flex-col md:flex-row justify-center gap-6">
                  <button
                    onClick={() => navigate('/listings?category=activity')}
                    className="h-24 px-16 bg-slate-950 text-white hover:bg-slate-800 rounded-3xl font-bold uppercase text-[12px] tracking-[0.4em] transition-all shadow-3xl active:scale-95"
                  >
                    Start Your Discovery
                  </button>
                  <button
                    onClick={() => navigate('/support')}
                    className="h-24 px-16 bg-white/20 backdrop-blur-md border-2 border-slate-950/10 text-slate-950 hover:bg-white/30 rounded-3xl font-bold uppercase text-[12px] tracking-[0.4em] transition-all"
                  >
                    Talk to an Expert
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ════ REFINED FOOTER ════ */}
        <footer className="bg-white py-48 px-6 md:px-12 border-t border-slate-100 relative">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-32">
            <div className="md:col-span-6 space-y-16">
              <div className="space-y-8">
                <h1 className="text-6xl font-bold tracking-tighter text-slate-950 uppercase m-0 leading-none">
                  Wayzza<span className="text-amber-500">.</span>
                </h1>
                <p className="text-slate-400 font-medium text-2xl leading-relaxed max-w-lg">
                  "Curating the extraordinary for those who seek the unindexed."
                </p>
              </div>
              <div className="flex gap-4">
                {[Globe, Shield, Zap, Music].map((Icon, i) => (
                  <div
                    key={i}
                    className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all duration-500 cursor-pointer shadow-sm group"
                  >
                    <Icon size={20} className="group-hover:scale-110 transition-transform" />
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-3 space-y-8">
              <h3 className="text-slate-950 font-bold uppercase text-[11px] tracking-[0.6em] border-l-2 border-amber-500 pl-4">
                NAVIGATE
              </h3>
              <ul className="space-y-6">
                {['Native Secrets', 'Interactive Map', 'Our Stays', 'Partner Program'].map((l) => (
                  <li key={l}>
                    <Link
                      to="/listings"
                      className="text-slate-400 font-bold text-lg hover:text-amber-600 transition-all uppercase tracking-tighter flex items-center gap-3"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-3 space-y-8">
              <h3 className="text-slate-950 font-bold uppercase text-[11px] tracking-[0.6em] border-l-2 border-amber-500 pl-4">
                HELP
              </h3>
              <ul className="space-y-6">
                {['Support Center', 'Privacy', 'Terms', 'About'].map((l) => (
                  <li key={l}>
                    <Link
                      to="/support"
                      className="text-slate-400 font-bold text-lg hover:text-amber-600 transition-all uppercase tracking-tighter flex items-center gap-3"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </footer>
      </div>
    </WayzzaLayout>
  );
}
