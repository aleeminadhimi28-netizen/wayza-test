import { Link } from 'react-router-dom';
import { useCurrency } from '../../CurrencyContext.jsx';
import { Wifi } from 'lucide-react';

export function HotelItem({ hotel, isSaved, onToggleWishlist }) {
  const { formatPrice } = useCurrency();
  const isRare = hotel.price > 5000;

  return (
    <div className="group relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleWishlist?.(e, hotel.id);
        }}
        className={`absolute top-4 right-4 md:top-6 md:right-6 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl backdrop-blur-md ${isSaved ? 'bg-rose-500 text-white shadow-rose-500/10' : 'bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white shadow-black/5'}`}
      >
        <svg
          className={`w-4 h-4 md:w-5 md:h-5 ${isSaved ? 'fill-current' : 'fill-none stroke-current stroke-2'}`}
          viewBox="0 0 24 24"
        >
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 000-7.78v0z" />
        </svg>
      </button>

      <Link to={`/listing/${hotel.id}`} className="block">
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="relative aspect-square md:aspect-[4/5] overflow-hidden rounded-[24px] md:rounded-[32px] shadow-sm bg-slate-100">
            <img
              src={hotel.image}
              alt={hotel.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Agoda-style Carousel Dots */}
            <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-white shadow-sm" />
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-white/40 backdrop-blur-md" />
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-white/40 backdrop-blur-md" />
            </div>

            <div className="absolute top-4 left-4 md:top-6 md:left-6 flex flex-col gap-1.5 md:gap-2">
              {isRare && (
                <span className="bg-white/95 backdrop-blur-md text-slate-950 text-[8px] md:text-[9px] font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-full uppercase tracking-widest border border-white shadow-md">
                  Rare Find
                </span>
              )}
              {hotel.price > 8000 && (
                <span className="bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 text-[8px] md:text-[9px] font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1 w-max">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" />
                  </svg>
                  Superhost
                </span>
              )}
              {!isRare && hotel.price <= 8000 && (
                <span className="bg-emerald-500 text-white text-[8px] md:text-[9px] font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/10">
                  Trending
                </span>
              )}
            </div>
          </div>
          <div className="px-0.5">
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-lg md:text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight truncate pr-4">
                {hotel.name}
              </h3>
              <div className="flex items-center gap-1 font-bold text-slate-900 text-xs md:text-sm">
                <svg className="w-3 h-3 md:w-4 md:h-4 fill-amber-400" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                4.9
              </div>
            </div>
            <div className="flex justify-between items-center mb-3">
              <p className="text-slate-400 font-bold text-[9px] md:text-[10px] uppercase tracking-widest truncate pr-2">
                {hotel.location}
              </p>
              {hotel.wifiSpeed > 0 && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 md:px-2 md:py-1 bg-emerald-50 rounded-lg border border-emerald-100/50 shadow-sm shrink-0">
                  <Wifi size={8} className="text-emerald-500 md:w-[10px] md:h-[10px]" />
                  <span className="text-[8px] md:text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                    {hotel.wifiSpeed} Mbps
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-baseline gap-1.5 md:gap-2">
              <div className="flex flex-col">
                <span className="text-[8px] md:text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                  Starting from
                </span>
                <span className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  {formatPrice(hotel.price)}
                </span>
              </div>
              <span className="text-[10px] md:text-xs font-bold text-slate-300">/ night</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export const WayzzaHotelItem = HotelItem;
