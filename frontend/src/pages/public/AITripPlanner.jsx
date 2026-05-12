import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WayzzaLayout } from '../../WayzzaUI.jsx';
import { Sparkles, MapPin, Compass } from 'lucide-react';
import { useCurrency } from '../../CurrencyContext.jsx';
import { api } from '../../utils/api.js';
import SEO from '../../components/SEO.jsx';
import { useToast } from '../../ToastContext.jsx';

export default function AITripPlanner() {
  const [destination, setDestination] = useState('');
  const [vibe, setVibe] = useState('chill');
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();

  const generateTrip = async () => {
    if (!destination) return;
    setIsGenerating(true);
    setItinerary(null);

    try {
      const res = await api.generateTrip({ destination, vibe });
      if (res.ok) {
        // Formatting price on the frontend to match context
        const formattedData = {
          ...res.data,
          totalPrice: formatPrice(res.data.totalPrice),
        };
        setItinerary(formattedData);
      } else {
        showToast(
          res.message || "Could not generate trip. Try a broader destination like 'Varkala'.",
          'error'
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <WayzzaLayout noPadding>
      <SEO
        title="AI Trip Architect | Bespoke Varkala Itineraries"
        description="Let Wayzza Intelligence orchestrate your perfect Varkala escape. Personalized itineraries combining premium clifftop stays, high-performance mobility, and native secrets."
        breadcrumb={[
          { name: 'Home', url: 'https://wayzza.live' },
          { name: 'AI Planner', url: 'https://wayzza.live/ai-planner' },
        ]}
      />
      <div className="min-h-screen bg-slate-50 font-sans pb-24">
        {/* Hero Header */}
        <header className="relative overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),transparent_40%)]" />
          <div className="absolute -top-20 left-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2" />
          <div className="absolute bottom-0 right-[-10%] w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="relative max-w-6xl mx-auto px-6 py-24 sm:py-32">
            <div className="mx-auto max-w-3xl space-y-6 text-center">
              <div className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-emerald-300 shadow-sm">
                <Sparkles size={14} /> Wayzza Intelligence
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
                AI Trip
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 mt-2 lowercase">
                  Architect.
                </span>
              </h1>
              <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-300 leading-8">
                Tell us where you want to go and how you want to feel. Wayzza instantly orchestrates
                the perfect stay, mobility, and local experiences.
              </p>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 -mt-20 relative z-10">
          <div className="grid gap-6">
            <section className="rounded-[32px] border border-slate-200/80 bg-white p-6 sm:p-8 shadow-[0_35px_80px_-35px_rgba(15,23,42,0.25)]">
              <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
                <div className="space-y-4">
                  <div className="text-sm uppercase tracking-[0.35em] text-slate-500 font-bold">
                    Build your travel prompt
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Enter a destination and choose your vibe. Our AI will assemble a bespoke travel
                    plan with verified stays, local vehicles, and curated experiences.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs uppercase tracking-[0.35em] text-slate-500 font-semibold">
                        Popular
                      </div>
                      <div className="mt-2 text-lg font-bold text-slate-900">Varkala</div>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs uppercase tracking-[0.35em] text-slate-500 font-semibold">
                        First step
                      </div>
                      <div className="mt-2 text-lg font-bold text-slate-900">Set the mood</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_auto] items-end">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-[0.35em] text-slate-500">
                      Where to?
                    </label>
                    <div className="relative">
                      <MapPin
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="e.g. Varkala, Kovalam, Munnar..."
                        className="w-full h-14 rounded-3xl border border-slate-200 bg-slate-50 px-4 pl-12 text-slate-900 font-semibold outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-[0.35em] text-slate-500">
                      The vibe
                    </label>
                    <div className="relative">
                      <Compass
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <select
                        value={vibe}
                        onChange={(e) => setVibe(e.target.value)}
                        className="w-full h-14 rounded-3xl border border-slate-200 bg-slate-50 px-4 pl-12 text-slate-900 font-semibold outline-none transition focus:border-emerald-500"
                      >
                        <option value="chill">Relaxing & Chill</option>
                        <option value="adventure">High Adrenaline Adventure</option>
                        <option value="culture">Cultural Deep Dive</option>
                        <option value="luxury">Ultra Luxury & Pampering</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={generateTrip}
                  disabled={isGenerating || !destination}
                  title={!destination ? 'Enter a destination first' : ''}
                  className={`rounded-3xl px-6 py-4 text-sm font-black uppercase tracking-[0.35em] transition-all ${
                    !destination || isGenerating
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
                  }`}
                >
                  {isGenerating ? 'Manifesting...' : 'Generate magic'}
                </button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {['Beachfront villa', 'Budget under ₹5k', 'Couples getaway', 'Solo adventure'].map(
                  (label) => (
                    <div
                      key={label}
                      className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
                    >
                      {label}
                    </div>
                  )
                )}
              </div>
            </section>

            <section>
              <AnimatePresence mode="wait">
                {isGenerating && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-[32px] border border-slate-200 bg-white p-12 text-center shadow-sm"
                  >
                    <div className="relative mx-auto mb-8 h-24 w-24">
                      <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                      <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                      <Sparkles className="absolute inset-0 m-auto text-emerald-500" size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">
                      Curating perfection...
                    </h3>
                    <p className="text-slate-500">
                      Scouring thousands of verified Stays, Cars, and Experiences for {destination}.
                    </p>
                  </motion.div>
                )}

                {itinerary && !isGenerating && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
                        <div className="text-[11px] uppercase tracking-[0.35em] text-emerald-600 font-bold">
                          Generated itinerary
                        </div>
                        <h2 className="mt-4 text-4xl font-black text-slate-900 uppercase">
                          {itinerary.destination}
                        </h2>
                        <p className="mt-3 text-lg font-medium text-slate-500 capitalize">
                          {itinerary.vibe} experience
                        </p>

                        <div className="mt-8 grid gap-4 sm:grid-cols-3">
                          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                            <p className="text-xs uppercase tracking-[0.35em] text-slate-500 font-semibold">
                              Days
                            </p>
                            <p className="mt-3 text-3xl font-black text-slate-900">
                              {itinerary.days.length}
                            </p>
                          </div>
                          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                            <p className="text-xs uppercase tracking-[0.35em] text-slate-500 font-semibold">
                              Vibe
                            </p>
                            <p className="mt-3 text-3xl font-black text-slate-900 capitalize">
                              {vibe}
                            </p>
                          </div>
                          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                            <p className="text-xs uppercase tracking-[0.35em] text-slate-500 font-semibold">
                              Theme
                            </p>
                            <p className="mt-3 text-3xl font-black text-slate-900">AI curated</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[32px] bg-gradient-to-br from-emerald-500 to-teal-400 p-8 text-white shadow-xl">
                        <div className="text-sm uppercase tracking-[0.35em] text-emerald-100/80 font-bold">
                          Estimated package
                        </div>
                        <div className="mt-6 text-5xl font-black tracking-tight">
                          {itinerary.totalPrice}
                        </div>
                        <p className="mt-3 text-slate-100/85 leading-relaxed">
                          Total cost across stays, vehicles, and curated local experiences. Instant
                          recommendations, no guesswork.
                        </p>
                        <button className="mt-8 w-full rounded-3xl bg-slate-950/95 py-4 text-sm font-black uppercase tracking-[0.35em] text-white shadow-lg shadow-slate-950/30 transition hover:bg-slate-900">
                          Book entire package
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {itinerary.days.map((day, idx) => (
                        <div
                          key={idx}
                          className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                            <div className="flex items-center gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 text-lg font-black">
                                {day.day}
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold text-slate-900">{day.title}</h3>
                                <p className="text-sm text-slate-500">
                                  Daily highlights and timing.
                                </p>
                              </div>
                            </div>
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                              {day.items.length} stops
                            </div>
                          </div>

                          <div className="space-y-6">
                            {day.items.map((item, itemIdx) => (
                              <div
                                key={itemIdx}
                                className="grid gap-4 sm:grid-cols-[auto_1fr] items-start"
                              >
                                <div className="relative">
                                  <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-slate-100 text-emerald-500 text-lg font-bold shadow-sm">
                                    {item.type === 'hotel'
                                      ? 'ðŸ¨'
                                      : item.type === 'car'
                                        ? 'ðŸï¸'
                                        : '☕'}
                                  </div>
                                  <div className="absolute left-5 top-full h-[calc(100%+0.5rem)] w-px bg-slate-200"></div>
                                </div>
                                <div className="space-y-3 pb-4">
                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                      <div className="text-xs uppercase tracking-[0.35em] text-slate-400 font-bold">
                                        {item.time}
                                      </div>
                                      <div className="text-lg font-bold text-slate-900">
                                        {item.title}
                                      </div>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-500">
                                      {item.type === 'hotel'
                                        ? 'Stay'
                                        : item.type === 'car'
                                          ? 'Mobility'
                                          : 'Experience'}
                                    </span>
                                  </div>
                                  <p className="text-slate-500">{item.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>
        </main>
      </div>
    </WayzzaLayout>
  );
}
