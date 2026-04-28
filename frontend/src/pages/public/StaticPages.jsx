import { WayzzaLayout } from '../../WayzzaUI.jsx';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  FileText,
  Globe,
  Zap,
  Compass,
  Activity,
  Server,
  Sparkles,
  CheckCircle,
  Heart,
  Star,
} from 'lucide-react';

export default function StaticPage({ title, children, icon }) {
  return (
    <WayzzaLayout noPadding>
      <div className="min-h-screen bg-slate-50 font-sans overflow-hidden">
        {/* REFINED HERO */}
        <header className="bg-white py-20 md:py-32 px-6 relative overflow-hidden border-b border-slate-200">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] -mr-32 -mt-32" />
          <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 text-emerald-600 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-inner border-4 border-white"
            >
              {icon || <FileText size={28} strokeWidth={1.5} />}
            </motion.div>
            <div className="space-y-4">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-emerald-600 font-bold text-[11px] md:text-[11px] uppercase tracking-[0.3em] block"
              >
                Information & Transparency
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-7xl font-black text-slate-900 tracking-tight uppercase leading-none"
              >
                {title}
                <span className="text-emerald-500">.</span>
              </motion.h1>
            </div>
          </div>
        </header>

        {/* CONTENT MODULE */}
        <main className="max-w-5xl mx-auto px-6 -mt-12 md:-mt-16 pb-24 md:pb-40 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[32px] md:rounded-[48px] p-8 md:p-20 shadow-2xl border border-slate-100 relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 blur-3xl -ml-16 -mt-16 pointer-events-none" />

            <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-p:text-slate-600 prose-p:font-medium prose-headings:text-slate-900 prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-tight prose-strong:text-slate-900 prose-li:text-slate-600 prose-li:font-medium">
              {children}
            </div>

            {/* FOOTER ACCENT */}
            <div className="mt-32 pt-16 border-t border-slate-100 flex flex-wrap gap-12 justify-center">
              <div className="flex flex-col items-center gap-2 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-default group">
                <Shield
                  size={24}
                  className="text-emerald-600 group-hover:scale-110 transition-transform"
                />
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-900">
                  Secure
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-default group">
                <Activity
                  size={24}
                  className="text-emerald-600 group-hover:scale-110 transition-transform"
                />
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-900">
                  Verified
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-default group">
                <Globe
                  size={24}
                  className="text-emerald-600 group-hover:scale-110 transition-transform"
                />
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-900">
                  Global
                </span>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </WayzzaLayout>
  );
}

export function PrivacyPolicy() {
  return (
    <StaticPage title="Privacy Policy" icon={<Lock size={32} />}>
      <p className="text-xl text-slate-900 font-bold mb-10">
        Last Updated: {new Date().toLocaleDateString()}
      </p>
      <p>
        At Wayzza, we value your privacy and are committed to protecting your personal information.
        This policy outlines how we collect, use, and safeguard your data to provide a seamless
        travel experience.
      </p>

      <h2 className="text-2xl mt-16 mb-8 flex items-center gap-4">
        <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
        Information We Collect
      </h2>
      <p>
        We only collect and process information that is necessary to provide our services and ensure
        a secure environment for all users:
      </p>
      <ul>
        <li>
          <strong>Profile Information:</strong> Your name, email, and profile details provided
          during account creation.
        </li>
        <li>
          <strong>Contact Information:</strong> Details used to communicate with you regarding
          bookings and updates.
        </li>
        <li>
          <strong>Booking History:</strong> Records of your completed and upcoming stays and
          experiences.
        </li>
      </ul>

      <h2 className="text-2xl mt-16 mb-8 flex items-center gap-4">
        <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
        How We Use Data
      </h2>
      <p>
        Your data is used strictly for provide our services, including: Confirming bookings,
        protecting your account, and providing personalized travel recommendations to enhance your
        journey.
      </p>

      <h2 className="text-2xl mt-16 mb-8 flex items-center gap-4">
        <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
        Data Security
      </h2>
      <p>
        We use industry-standard encryption and security protocols to prevent unauthorized access.
        Your data is protected throughout its transit and storage within our platform.
      </p>
    </StaticPage>
  );
}

export function TermsOfService() {
  return (
    <StaticPage title="Terms of Service" icon={<Shield size={32} />}>
      <p className="text-xl text-slate-900 font-bold mb-10">
        Effective Date: {new Date().toLocaleDateString()}
      </p>
      <p>
        The following guidelines define the usage of the Wayzza platform. By using our services, you
        agree to adhere to these terms and conditions.
      </p>

      <h2 className="text-2xl mt-16 mb-8 flex items-center gap-4">
        <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
        User Registration
      </h2>
      <p>
        To use Wayzza, you must provide accurate and current information. Maintaining the security
        of your account credentials is your responsibility.
      </p>

      <h2 className="text-2xl mt-16 mb-8 flex items-center gap-4">
        <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
        Property Care
      </h2>
      <p>
        During your stay at our partner properties, we ask that you respect the property rules and
        maintain the space. Any damage incurred may be subject to our resolution process.
      </p>

      <h2 className="text-2xl mt-16 mb-8 flex items-center gap-4">
        <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
        Service Termination
      </h2>
      <p>
        Wayzza reserves the right to suspend or terminate accounts that violate our terms or exhibit
        inappropriate conduct within our community.
      </p>
    </StaticPage>
  );
}

export function AboutUs() {
  return (
    <WayzzaLayout noPadding>
      <div className="bg-white font-sans text-slate-900 selection:bg-emerald-50 leading-relaxed antialiased overflow-hidden">
        {/* â•â•â•â• SECTION: CINEMATIC HERO â•â•â•â• */}
        <header className="relative h-[60vh] md:h-[70vh] min-h-[500px] md:min-h-[600px] flex items-center justify-center overflow-hidden bg-slate-950">
          <div className="absolute inset-0 z-0">
            <motion.div
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="w-full h-full"
            >
              <img
                src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2000"
                alt="Luxury Sanctuary"
                className="w-full h-full object-cover opacity-50 grayscale-[0.3]"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" />
          </div>

          <div className="relative z-10 text-center space-y-6 md:space-y-8 px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 rounded-full text-emerald-400 text-[11px] md:text-[11px] font-black uppercase tracking-[0.3em]"
            >
              <Compass size={12} /> The Wayzza Manifesto
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] md:leading-none uppercase"
            >
              Escape the <br />
              <span className="text-emerald-500 italic font-light">Ordinary.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-base md:text-xl font-medium text-white/60 max-w-2xl mx-auto leading-relaxed"
            >
              Wayzza is not just a booking engine. It is a curator of sanctuaries, verified for the
              modern explorer who demands soul, security, and style.
            </motion.p>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
            <div className="w-px h-16 bg-gradient-to-b from-emerald-500/0 to-emerald-500" />
          </div>
        </header>

        {/* â•â•â•â• SECTION: OUR MISSION (SPLIT) â•â•â•â• */}
        <section className="py-20 md:py-32 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6 md:space-y-8"
            >
              <div className="space-y-3 md:space-y-4">
                <span className="text-emerald-500 font-black uppercase tracking-[0.4em] text-[11px]">
                  The Mission
                </span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-[1.1] uppercase">
                  Defining the new standard for{' '}
                  <span className="italic text-emerald-600">verified inventory.</span>
                </h2>
              </div>
              <p className="text-slate-500 text-base md:text-lg leading-relaxed font-medium">
                We realized that the biggest problem for digital nomads and luxury travelers wasn't
                finding a place to stay—it was finding a place they could trust.
              </p>
              <p className="text-slate-500 text-base md:text-lg leading-relaxed font-medium">
                Wayzza was founded to bridge that gap. We personally verify every clifftop villa,
                every Royal Enfield, and every local experience to ensure it meets our rigorous
                standards of quality and soul.
              </p>
              <div className="flex gap-10 pt-4 md:pt-6">
                <div>
                  <p className="text-2xl md:text-3xl font-black text-slate-900">100%</p>
                  <p className="text-[11px] md:text-[11px] text-slate-400 uppercase font-black tracking-widest mt-1">
                    Verified Stays
                  </p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-black text-slate-900">24/7</p>
                  <p className="text-[11px] md:text-[11px] text-slate-400 uppercase font-black tracking-widest mt-1">
                    Nomad Support
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-[32px] md:rounded-[64px] overflow-hidden shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&q=80&w=1200"
                alt="Varkala View"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-emerald-600/10 mix-blend-overlay" />
            </motion.div>
          </div>
        </section>

        {/* â•â•â•â• SECTION: CORE VALUES (CARDS) â•â•â•â• */}
        <section className="py-20 md:py-32 bg-slate-50 px-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent" />
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 md:mb-20 space-y-3 md:space-y-4">
              <span className="text-emerald-500 font-black uppercase tracking-[0.4em] text-[11px]">
                The Wayzza Code
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 uppercase">
                What we stand for.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {[
                {
                  icon: Star,
                  title: 'Curated Soul',
                  desc: 'No generic listings. Only sanctuaries that pass our rigorous vibe and quality check.',
                },
                {
                  icon: Shield,
                  title: 'Ironclad Security',
                  desc: 'Your data and payments are secured with industry-leading encryption protocols.',
                },
                {
                  icon: Sparkles,
                  title: 'Honest Pricing',
                  desc: 'Zero hidden fees. What you see is exactly what you pay. Transparent & fair.',
                },
                {
                  icon: Heart,
                  title: 'Native Care',
                  desc: 'Our team lives where you stay. We provide authentic, round-the-clock local support.',
                },
              ].map((v, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 md:p-10 bg-white rounded-[32px] md:rounded-[40px] border border-slate-100 hover:border-emerald-500 hover:shadow-2xl-soft transition-all duration-500 group"
                >
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center mb-6 md:mb-8 group-hover:scale-110 transition-transform duration-500">
                    <v.icon
                      size={24}
                      className="text-slate-900 group-hover:text-emerald-500 transition-colors"
                    />
                  </div>
                  <h3 className="text-lg md:text-xl font-black text-slate-900 mb-3 md:mb-4 tracking-tight uppercase">
                    {v.title}
                  </h3>
                  <p className="text-slate-400 font-bold uppercase text-[11px] md:text-xs leading-relaxed">
                    {v.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* â•â•â•â• SECTION: FINAL CTA â•â•â•â• */}
        <section className="py-24 md:py-40 px-6 text-center bg-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-10 md:space-y-12"
          >
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.9] uppercase">
              Ready to see the <br />
              <span className="text-emerald-500 italic">other side?</span>
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={() => (window.location.href = '/listings')}
                className="w-full sm:w-auto h-16 px-12 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-900/20 active:scale-95"
              >
                Explore Sanctuaries
              </button>
            </div>
          </motion.div>
        </section>
      </div>
    </WayzzaLayout>
  );
}
