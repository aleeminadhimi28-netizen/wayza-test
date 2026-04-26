import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { WayzzaLayout } from '../../WayzzaUI.jsx';
import { useAuth } from '../../AuthContext.jsx';
import {
  Search,
  Heart,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Hotel,
  Bike,
  Car,
  Anchor,
  Calendar,
  ChevronDown,
  Wifi,
  Coffee,
  Shield,
  Navigation,
  CheckCircle,
  X,
  Filter,
  ThumbsUp,
  Star,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

import { api } from '../../utils/api.js';
import SEO from '../../components/SEO.jsx';

const CATEGORIES = [
  { id: 'hotel', label: 'Stays', icon: Hotel },
  { id: 'bike', label: 'Bikes', icon: Bike },
  { id: 'car', label: 'Cars', icon: Car },
  { id: 'activity', label: 'Experiences', icon: Anchor },
];

const SORT_OPTIONS = [
  { value: '', label: 'Our Top Picks' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'new', label: 'Newest First' },
];

function getRatingLabel(score) {
  if (score >= 9.0) return 'Exceptional';
  if (score >= 8.5) return 'Excellent';
  if (score >= 7.5) return 'Very Good';
  if (score >= 6.5) return 'Good';
  return 'Pleasant';
}

export default function Listings() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const realToken = token || localStorage.getItem('token');

  const [rows, setRows] = useState([]);
  const [saved, setSaved] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState(params.get('sort') || '');
  const [category, setCategory] = useState(params.get('category') || 'hotel');

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [searchInput, setSearchInput] = useState(params.get('location') || '');
  const [checkInInput, setCheckInInput] = useState(params.get('start') || '');
  const [checkOutInput, setCheckOutInput] = useState(params.get('end') || '');

  const location = params.get('location') || '';
  const start = params.get('start') || '';
  const end = params.get('end') || '';

  const fixImg = (img) => {
    if (!img)
      return 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80';
    if (img.startsWith('http')) return img;
    // Use the base URL for uploads
    const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${BASE}/uploads/${img}`;
  };

  async function loadWishlist() {
    if (!realToken) return;
    try {
      const data = await api.getWishlist();
      if (data.ok) {
        setSaved(new Set(data.data?.map((x) => x.listingId) || []));
      }
    } catch { }
  }

  async function loadListings() {
    setLoading(true);
    try {
      const data = await api.getListings({
        location,
        minPrice,
        maxPrice,
        sort,
        category,
        start,
        end,
        page,
        limit: 10,
      });
      setRows(data.rows || []);
      setPages(data.pages || 1);
      setTotal(data.total || data.rows?.length || 0);
    } catch { }
    setLoading(false);
  }

  async function toggleWishlist(e, listingId) {
    e.preventDefault();
    e.stopPropagation();
    if (!realToken) {
      navigate('/login');
      return;
    }

    const data = await api.toggleWishlist({ listingId });
    if (data.ok) {
      setSaved((prev) => {
        const s = new Set(prev);
        if (s.has(listingId)) s.delete(listingId);
        else s.add(listingId);
        return s;
      });
    }
  }

  function handleSearch() {
    const p = new URLSearchParams(params);
    if (searchInput) p.set('location', searchInput);
    else p.delete('location');
    if (checkInInput) p.set('start', checkInInput);
    else p.delete('start');
    if (checkOutInput) p.set('end', checkOutInput);
    else p.delete('end');
    p.set('category', category);
    setParams(p);
  }

  useEffect(() => {
    loadListings();
    loadWishlist();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location, minPrice, maxPrice, sort, category, page, start, end]);

  useEffect(() => {
    setPage(1);
  }, [location, minPrice, maxPrice, sort, category]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const catLabel = CATEGORIES.find((c) => c.id === category)?.label || 'Properties';

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://wayza-app.vercel.app/listings';

  return (
    <WayzzaLayout noPadding>
      <SEO
        title={location ? `${catLabel} in ${location}` : `Explore ${catLabel}`}
        description={`Browse verified ${catLabel.toLowerCase()} directly from Wayzza.`}
        breadcrumb={[
          { name: 'Home', url: 'https://wayza-app.vercel.app' },
          { name: catLabel, url: currentUrl },
        ]}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: location ? `${catLabel} in ${location}` : `Browse ${catLabel}`,
          description: `Browse verified ${catLabel.toLowerCase()} directly from Wayzza.`,
          url: currentUrl,
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: rows.slice(0, 10).map((item, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: `https://wayza-app.vercel.app/listing/${item._id}`,
              name: item.title,
            })),
          },
        }}
      />
      <div className="bg-slate-50 min-h-screen font-sans selection:bg-emerald-100 selection:text-emerald-900">
        {/* ─── PREMIUM SEARCH BAR ─── */}
        <div className={`bg-white/95 backdrop-blur-xl border-b border-slate-200 sticky top-[64px] z-40 transition-all duration-300 ${scrolled ? 'py-2 shadow-md' : 'py-4'}`}>
          <div className="max-w-[1240px] mx-auto px-4">
            <div className={`bg-slate-50 border border-slate-200 rounded-2xl p-1.5 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center gap-1.5 transition-all ${scrolled ? 'lg:p-1' : 'p-2'}`}>
              {/* Location */}
              <div className="flex-1 relative group">
                <MapPin
                  className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors ${scrolled ? 'scale-90' : ''}`}
                  size={18}
                />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={scrolled ? "Search..." : "Explore your next destination..."}
                  className={`w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none placeholder:text-slate-400 placeholder:font-normal transition-all ${scrolled ? 'h-10 pl-11' : 'h-12 pl-12'}`}
                />
                <div className="absolute right-0 top-1/4 bottom-1/4 w-px bg-slate-200 hidden lg:block" />
              </div>

              {/* Dates - Hidden on mobile scrolled for compactness */}
              <div className={`flex items-center gap-1 flex-1 lg:max-w-[400px] ${scrolled ? 'hidden lg:flex' : 'flex'}`}>
                <div className="flex-1 relative group">
                  <Calendar
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="date"
                    value={checkInInput}
                    onChange={(e) => setCheckInInput(e.target.value)}
                    className="w-full h-10 lg:h-12 pl-12 pr-2 bg-transparent text-xs font-bold text-slate-900 focus:outline-none appearance-none cursor-pointer"
                  />
                  <div className="absolute right-0 top-1/4 bottom-1/4 w-px bg-slate-200 hidden lg:block" />
                </div>
                <div className="flex-1 relative group">
                  <Calendar
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="date"
                    value={checkOutInput}
                    onChange={(e) => setCheckOutInput(e.target.value)}
                    className="w-full h-10 lg:h-12 pl-12 pr-2 bg-transparent text-xs font-bold text-slate-900 focus:outline-none appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className={`flex items-center gap-2 pl-2 ${scrolled ? 'border-t-0 pt-0' : 'border-t lg:border-t-0 border-slate-200 pt-2 lg:pt-0'}`}>
                <button
                  onClick={handleSearch}
                  className={`bg-slate-900 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 ${scrolled ? 'h-10 px-4' : 'h-12 px-8'}`}
                >
                  <Search size={18} />
                  <span className={scrolled ? 'hidden lg:inline' : 'inline'}>Search</span>
                </button>
                {!scrolled && (
                  <Link
                    to="/explore-map"
                    className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-emerald-500 hover:border-emerald-200 hover:bg-emerald-50 transition-all shadow-sm group"
                  >
                    <Navigation size={20} className="transition-transform group-hover:scale-110" />
                  </Link>
                )}
              </div>
            </div>

            {/* Category Pills & Sort */}
            <div className={`flex items-center justify-between overflow-x-auto no-scrollbar scroll-smooth gap-4 transition-all ${scrolled ? 'mt-2' : 'mt-4'}`}>
              <div className="flex items-center gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`group relative flex items-center gap-2 rounded-full font-bold transition-all whitespace-nowrap ${category === cat.id
                      ? 'bg-slate-900 text-white shadow-xl translate-y-[-1px]'
                      : 'bg-slate-100 text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-md'
                      } ${scrolled ? 'px-4 py-1.5 text-xs' : 'px-5 py-2.5 text-sm'}`}
                  >
                    <cat.icon
                      size={scrolled ? 14 : 16}
                      className={`transition-transform group-hover:scale-110 ${category === cat.id ? 'text-emerald-400' : ''}`}
                    />
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                <div className="relative group">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="h-10 pl-4 pr-10 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer transition-all hover:bg-slate-50"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-all ${showFilters ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-inner' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <SlidersHorizontal size={18} />
                </button>
              </div>
            </div>

            {/* Filter Drawer */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="py-6 mt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Price Range
                      </p>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm font-bold">
                            ₹
                          </span>
                          <input
                            type="number"
                            placeholder="Min"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-full h-11 pl-7 pr-3 text-sm font-bold bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-emerald-500 transition-all"
                          />
                        </div>
                        <span className="hidden sm:block text-slate-200 self-center">/</span>
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm font-bold">
                            ₹
                          </span>
                          <input
                            type="number"
                            placeholder="Max"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full h-11 pl-7 pr-3 text-sm font-bold bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-emerald-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-end justify-start sm:justify-end sm:col-span-2">
                      {(minPrice || maxPrice) && (
                        <button
                          onClick={() => {
                            setMinPrice('');
                            setMaxPrice('');
                          }}
                          className="h-11 px-4 sm:px-6 text-sm font-bold text-rose-500 hover:text-rose-600 flex items-center gap-2 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <X size={16} /> Reset Filters
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ─── RESULTS ─── */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
          {/* Result summary */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {location ? (
                  <>
                    {location}: <span className="text-emerald-600">{loading ? '...' : total}</span>{' '}
                    {catLabel.toLowerCase()} found
                  </>
                ) : (
                  <>
                    {catLabel}: <span className="text-emerald-600">{loading ? '...' : total}</span>{' '}
                    available
                  </>
                )}
              </h1>
              {(start || end) && (
                <p className="text-sm text-slate-400 mt-0.5">
                  {start && `Check-in: ${start}`}
                  {start && end && ' · '}
                  {end && `Check-out: ${end}`}
                </p>
              )}
            </div>
            {!loading && total > 0 && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
                <CheckCircle size={16} className="text-emerald-500" />
                <span>All verified by Wayzza</span>
              </div>
            )}
          </div>

          {/* Cards */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex h-52 animate-pulse"
                  >
                    <div className="w-64 shrink-0 bg-slate-200" />
                    <div className="flex-1 p-5 space-y-3">
                      <div className="h-4 bg-slate-100 rounded-full w-16" />
                      <div className="h-5 bg-slate-100 rounded-full w-1/2" />
                      <div className="h-4 bg-slate-100 rounded-full w-1/3" />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : rows.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[32px] border border-slate-200 p-20 flex flex-col items-center justify-center text-center shadow-2xl shadow-slate-200/50 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                <div className="w-32 h-32 bg-slate-50 border-4 border-white rounded-full flex items-center justify-center mb-8 shadow-xl relative">
                  <div className="absolute inset-0 bg-emerald-500/5 rounded-full animate-ping" />
                  <Search size={48} className="text-slate-200" />
                </div>
                <div className="max-w-md space-y-4 relative z-10">
                  <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">
                    Empty <br />
                    <span className="text-emerald-500 lowercase">Space.</span>
                  </h3>
                  <p className="text-slate-400 font-medium text-sm leading-relaxed">
                    No properties matched your criteria in{' '}
                    <span className="text-slate-900 font-bold">{location || 'this area'}</span>.{' '}
                    <br />
                    Try adjusting your distance or refining your search tokens.
                  </p>
                  <div className="pt-8">
                    <button
                      onClick={() => {
                        setMinPrice('');
                        setMaxPrice('');
                        navigate(`/listings?category=${category}`);
                      }}
                      className="px-10 h-14 bg-slate-900 text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl active:scale-95 flex items-center gap-4 mx-auto"
                    >
                      Reset Filters <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {rows.map((l, i) => {
                  const score = l.avgRating || 0;
                  const reviewCount = l.reviewCount || 0;
                  const minVariantPrice = l.variants?.length
                    ? Math.min(...l.variants.map((v) => v.price || 0))
                    : l.price || 0;
                  const isSaved = saved.has(l._id);

                  return (
                    <motion.div
                      key={l._id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => navigate(`/listing/${l._id}`)}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col sm:flex-row hover:shadow-xl hover:shadow-slate-200/80 hover:border-emerald-200 transition-all duration-300 cursor-pointer group"
                    >
                      {/* Image */}
                      <div className="relative sm:w-72 h-56 sm:h-auto shrink-0 overflow-hidden">
                        <img
                          src={fixImg(l.image)}
                          alt={l.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        {/* Wishlist */}
                        <button
                          onClick={(e) => toggleWishlist(e, l._id)}
                          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:scale-110 transition-transform z-10"
                        >
                          <Heart
                            size={16}
                            className={
                              isSaved
                                ? 'fill-rose-500 text-rose-500'
                                : 'text-slate-400 group-hover:text-slate-600'
                            }
                          />
                        </button>
                        {/* Verified */}
                        {l.approved && (
                          <div className="absolute bottom-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
                            <CheckCircle size={11} /> Verified
                          </div>
                        )}
                        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                          {/* Category label */}
                          <div className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide w-max shadow-sm">
                            {CATEGORIES.find((c) => c.id === l.category)?.label || 'Stay'}
                          </div>
                          {/* Superhost */}
                          {score >= 8.5 && reviewCount > 50 && (
                            <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md w-max">
                              <Sparkles size={11} className="text-slate-900" /> Superhost
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 p-6 md:p-8 flex flex-col md:flex-row gap-8">
                        <div className="flex-1 space-y-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">
                                {l.category || 'Hotel'}
                              </span>
                              {l.price > 8000 && (
                                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-600">
                                  <Sparkles size={10} /> Signature Collection
                                </span>
                              )}
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 leading-[0.9] group-hover:text-emerald-600 transition-colors uppercase">
                              {l.title}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                            <MapPin size={14} className="text-emerald-500" />
                            <span>{l.location || 'Kerala, India'}</span>
                          </div>

                          <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 max-w-xl font-medium">
                            "
                            {l.description ||
                              "Experience the pinnacle of coastal luxury, where modern architecture harmonizes with Kerala's serene natural beauty."}
                            "
                          </p>

                          <div className="flex flex-wrap gap-2 pt-2">
                            {[
                              { icon: Wifi, text: 'Connectivity' },
                              { icon: Coffee, text: 'Breakfast' },
                              { icon: Shield, text: 'Secured' },
                            ].map((a, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest"
                              >
                                <a.icon size={12} />
                                {a.text}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="md:w-56 shrink-0 flex flex-row md:flex-col justify-between md:justify-center md:items-end items-center gap-6 md:border-l md:border-slate-100 md:pl-8 pt-6 md:pt-0 border-t md:border-t-0 border-slate-100">
                          <div className="flex flex-col md:items-end gap-1.5">
                            <div className="flex items-center gap-3">
                              <div className="text-right hidden md:block">
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                  {score > 0 ? getRatingLabel(score) : 'New'}
                                </p>
                                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                                  {reviewCount > 0
                                    ? `${reviewCount} Verified Reviews`
                                    : 'No Reviews Yet'}
                                </p>
                              </div>
                              <div className="w-12 h-12 bg-slate-950 text-white text-lg font-black rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/10">
                                {score.toFixed(1)}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            {minVariantPrice > 0 ? (
                              <>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">
                                  Nightly rate from
                                </p>
                                <p className="text-3xl font-black text-slate-900 tracking-tighter">
                                  ₹{minVariantPrice.toLocaleString()}
                                </p>
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">
                                  Inclusive of Access
                                </p>
                              </>
                            ) : (
                              <p className="text-sm font-black text-slate-900 uppercase">
                                Rate on Inquiry
                              </p>
                            )}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/listing/${l._id}`);
                            }}
                            className="h-14 px-8 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl shadow-2xl shadow-slate-900/10 transition-all active:scale-[0.98] group/btn flex items-center justify-center gap-3"
                          >
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                              Explore
                            </span>
                            <ArrowRight
                              size={16}
                              className="group-hover/btn:translate-x-1 transition-transform"
                            />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── PAGINATION ─── */}
          {!loading && pages > 1 && (
            <div className="mt-20 flex items-center justify-center gap-4">
              <button
                disabled={page <= 1}
                onClick={() => {
                  setPage((p) => p - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-14 h-14 flex items-center justify-center rounded-2xl border border-slate-200 text-slate-400 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-emerald-50"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                  const pg = i + 1;
                  return (
                    <button
                      key={pg}
                      onClick={() => {
                        setPage(pg);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-14 h-14 flex items-center justify-center rounded-2xl text-sm font-black transition-all ${pg === page ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20 scale-110' : 'bg-white border border-slate-100 text-slate-400 hover:border-emerald-200 hover:text-emerald-500'}`}
                    >
                      {pg}
                    </button>
                  );
                })}
              </div>
              <button
                disabled={page >= pages}
                onClick={() => {
                  setPage((p) => p + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-14 h-14 flex items-center justify-center rounded-2xl border border-slate-200 text-slate-400 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-emerald-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* ─── TRUST STRIP ─── */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  icon: Shield,
                  title: 'Secure Payments',
                  desc: 'Your payment is protected with end-to-end encryption.',
                },
                {
                  icon: CheckCircle,
                  title: 'Verified Listings',
                  desc: 'Every stay is reviewed and approved by our quality team.',
                },
                {
                  icon: ThumbsUp,
                  title: 'Free Cancellation',
                  desc: 'Flexible cancellation policies on most bookings.',
                },
              ].map((b, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm"
                >
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                    <b.icon size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{b.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </WayzzaLayout>
  );
}
