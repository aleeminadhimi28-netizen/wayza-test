import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Grid3x3 } from 'lucide-react';

export default function ListingGallery({ images, title }) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const next = () => setGalleryIndex((galleryIndex + 1) % images.length);
  const prev = () => setGalleryIndex((galleryIndex - 1 + images.length) % images.length);

  return (
    <>
      <div className="lg:grid lg:grid-cols-[3fr_2fr] lg:grid-rows-2 gap-2 h-[350px] md:h-[480px] lg:h-[560px] rounded-2xl lg:rounded-3xl overflow-hidden relative mb-12 lg:mb-20">
        {/* Mobile View: Single image carousel simulation */}
        <div
          className="lg:row-span-2 relative h-full w-full overflow-hidden group cursor-pointer"
          onClick={() => {
            setGalleryIndex(0);
            setGalleryOpen(true);
          }}
        >
          <img
            src={images[0]}
            alt="Main"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white text-[11px] font-black px-3 py-1.5 rounded-full lg:hidden">
            1 / {images.length}
          </div>
        </div>

        {/* Top thumbnail (desktop only) */}
        {images[1] && (
          <div
            className="hidden lg:block relative overflow-hidden group cursor-pointer"
            onClick={() => {
              setGalleryIndex(1);
              setGalleryOpen(true);
            }}
          >
            <img
              src={images[1]}
              alt="Photo 2"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        )}

        {/* Bottom thumbnail + Show all button (desktop only) */}
        {images[2] && (
          <div
            className="hidden lg:block relative overflow-hidden group cursor-pointer"
            onClick={() => {
              setGalleryIndex(2);
              setGalleryOpen(true);
            }}
          >
            <img
              src={images[2]}
              alt="Photo 3"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setGalleryIndex(0);
                setGalleryOpen(true);
              }}
              className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-900 px-4 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-950 hover:text-white transition-all shadow-md"
            >
              <Grid3x3 size={12} />
              Show all photos ({images.length})
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {galleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[99999] flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <p className="text-white font-bold">{title}</p>
                <p className="text-white/40 text-xs">
                  {galleryIndex + 1} / {images.length}
                </p>
              </div>
              <button
                onClick={() => setGalleryOpen(false)}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center relative px-16 py-4">
              <button
                onClick={prev}
                className="absolute left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-10"
              >
                <ChevronLeft size={28} />
              </button>
              <motion.img
                key={galleryIndex}
                src={images[galleryIndex]}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="max-h-full max-w-full object-contain rounded-xl"
                alt={`Photo ${galleryIndex + 1}`}
              />
              <button
                onClick={next}
                className="absolute right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-10"
              >
                <ChevronRight size={28} />
              </button>
            </div>

            <div className="flex gap-2 px-6 py-4 overflow-x-auto no-scrollbar border-t border-white/10">
              {images.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setGalleryIndex(i)}
                  className={`w-20 h-14 rounded-lg overflow-hidden shrink-0 cursor-pointer border-2 transition-all ${i === galleryIndex ? 'border-emerald-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-75'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
