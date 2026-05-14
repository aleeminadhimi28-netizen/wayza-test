import { Star } from 'lucide-react';

export default function ListingReviews({ reviews, avgRating }) {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section className="space-y-12">
      <header className="flex items-center justify-between">
        <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-300">
          Guest Reviews
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-5xl font-black text-slate-900 tabular-nums">
            {avgRating || '—'}
          </span>
          <div className="h-10 w-px bg-slate-200" />
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
          </span>
        </div>
      </header>

      <div className="grid gap-8">
        {reviews.slice(0, 3).map((r, i) => (
          <div
            key={i}
            className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-sm space-y-6"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black">
                  {(r.guestEmail || 'G').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-widest text-slate-900">
                    {r.guestEmail?.split('@')?.[0]}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-widest leading-none mt-1">
                    Verified Stay
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={10}
                    className={
                      s <= r.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-slate-100 text-slate-100'
                    }
                  />
                ))}
              </div>
            </div>
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              "{r.comment || 'An absolutely wonderful stay. Everything was exactly as described.'}"
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
