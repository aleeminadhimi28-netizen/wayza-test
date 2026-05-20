import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Images } from 'lucide-react';

export default function ListingGallery({ images, title, priority = false }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const openAt = (i) => {
    setActiveIdx(i);
    setLightboxOpen(true);
  };
  const close = () => setLightboxOpen(false);
  const next = useCallback(() => setActiveIdx((i) => (i + 1) % images.length), [images.length]);
  const prev = useCallback(
    () => setActiveIdx((i) => (i - 1 + images.length) % images.length),
    [images.length]
  );

  /* Keyboard navigation */
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxOpen, next, prev]);

  /* Lock body scroll when lightbox open */
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxOpen]);

  return (
    <>
      {/* ── PHOTO GRID ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-2 h-[340px] md:h-[460px] lg:h-[540px] rounded-2xl lg:rounded-3xl overflow-hidden">
        {/* Hero image — spans 2 rows on desktop */}
        <div
          className="lg:col-span-2 lg:row-span-2 relative overflow-hidden cursor-pointer group"
          onClick={() => openAt(0)}
        >
          <img
            src={images[0]}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
            fetchPriority={priority ? 'high' : 'auto'}
            loading={priority ? 'eager' : 'lazy'}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
          {/* Mobile pill */}
          <div className="absolute bottom-3 left-3 lg:hidden bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full">
            1 / {images.length}
          </div>
        </div>

        {/* Top-right */}
        {images[1] && (
          <div
            className="hidden lg:block relative overflow-hidden cursor-pointer group"
            onClick={() => openAt(1)}
          >
            <img
              src={images[1]}
              alt="Photo 2"
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
          </div>
        )}

        {/* Top-far-right */}
        {images[2] && (
          <div
            className="hidden lg:block relative overflow-hidden cursor-pointer group"
            onClick={() => openAt(2)}
          >
            <img
              src={images[2]}
              alt="Photo 3"
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
          </div>
        )}

        {/* Bottom-right */}
        {images[3] && (
          <div
            className="hidden lg:block relative overflow-hidden cursor-pointer group"
            onClick={() => openAt(3)}
          >
            <img
              src={images[3]}
              alt="Photo 4"
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
          </div>
        )}

        {/* Bottom-far-right + "Show all" button */}
        {images[4] && (
          <div
            className="hidden lg:block relative overflow-hidden cursor-pointer group"
            onClick={() => openAt(4)}
          >
            <img
              src={images[4]}
              alt="Photo 5"
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            {/* Show all button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                openAt(0);
              }}
              className="absolute bottom-3 right-3 flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-slate-200 text-slate-900 px-4 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-lg hover:bg-slate-950 hover:text-white transition-all duration-300"
            >
              <Images size={13} />
              All {images.length} photos
            </button>
          </div>
        )}
      </div>

      {/* ── FULLSCREEN LIGHTBOX ─────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[99999] bg-black/97 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 shrink-0">
              <div>
                <p className="text-white font-bold text-sm">{title}</p>
                <p className="text-white/40 text-xs font-medium mt-0.5">
                  {activeIdx + 1} of {images.length}
                </p>
              </div>
              <button
                onClick={close}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                aria-label="Close gallery"
              >
                <X size={20} />
              </button>
            </div>

            {/* Main image area */}
            <div className="flex-1 relative flex items-center justify-center px-4 md:px-20 min-h-0">
              <button
                onClick={prev}
                className="absolute left-4 md:left-6 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all hover:scale-110"
                aria-label="Previous photo"
              >
                <ChevronLeft size={26} />
              </button>

              <AnimatePresence mode="wait">
                <motion.img
                  key={activeIdx}
                  src={images[activeIdx]}
                  alt={`${title} photo ${activeIdx + 1}`}
                  initial={{ opacity: 0, x: 40, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -40, scale: 0.97 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="max-h-full max-w-full object-contain rounded-2xl select-none"
                  draggable={false}
                />
              </AnimatePresence>

              <button
                onClick={next}
                className="absolute right-4 md:right-6 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all hover:scale-110"
                aria-label="Next photo"
              >
                <ChevronRight size={26} />
              </button>
            </div>

            {/* Thumbnail strip */}
            <div className="shrink-0 px-6 py-4 border-t border-white/10">
              <div className="flex gap-2 overflow-x-auto no-scrollbar justify-start md:justify-center">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    className={`relative w-16 h-12 md:w-20 md:h-14 rounded-xl overflow-hidden shrink-0 transition-all duration-200 ${
                      i === activeIdx
                        ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-black opacity-100 scale-105'
                        : 'opacity-40 hover:opacity-70'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
