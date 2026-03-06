import React from "react";
import { Link } from "react-router-dom";

export function HotelItem({ hotel, isSaved, onToggleWishlist }) {
    const isRare = hotel.price > 5000;

    return (
        <div className="group relative">
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleWishlist?.(e, hotel.id);
                }}
                className={`absolute top-6 right-6 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl backdrop-blur-md ${isSaved ? 'bg-rose-500 text-white shadow-rose-500/10' : 'bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white shadow-black/5'}`}
            >
                <svg className={`w-5 h-5 ${isSaved ? 'fill-current' : 'fill-none stroke-current stroke-2'}`} viewBox="0 0 24 24">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 000-7.78v0z" />
                </svg>
            </button>

            <Link to={`/listing/${hotel.id}`} className="block">
                <div className="flex flex-col gap-6">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] shadow-sm bg-slate-100">
                        <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                            {isRare ? (
                                <span className="bg-white/95 backdrop-blur-md text-slate-950 text-[9px] font-bold px-4 py-2 rounded-full uppercase tracking-widest border border-white shadow-md">Rare Find</span>
                            ) : (
                                <span className="bg-emerald-500 text-white text-[9px] font-bold px-4 py-2 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/10">Trending</span>
                            )}
                        </div>
                    </div>
                    <div className="px-1">
                        <div className="flex justify-between items-start mb-1.5">
                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight truncate pr-4">{hotel.name}</h3>
                            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                                <svg className="w-4 h-4 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                4.9
                            </div>
                        </div>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-4">{hotel.location}</p>
                        <div className="flex items-baseline gap-2">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Starting from</span>
                                <span className="text-2xl font-bold text-slate-900 tracking-tight">₹{hotel.price.toLocaleString()}</span>
                            </div>
                            <span className="text-xs font-bold text-slate-300">/ night</span>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}

export const WayzaHotelItem = HotelItem;
