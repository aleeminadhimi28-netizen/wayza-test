import { WayzzaLayout } from '../../WayzzaUI.jsx';
import { motion } from 'framer-motion';
import SEO from '../../components/SEO.jsx';
import {
  Shield,
  Lock,
  FileText,
  Globe,
  Compass,
  Activity,
  Sparkles,
  Heart,
  Star,
} from 'lucide-react';

export default function StaticPage({ title, children, icon }) {
  return (
    <WayzzaLayout noPadding>
      <SEO
        title={title}
        breadcrumb={[
          { name: 'Home', url: 'https://wayza-app.vercel.app' },
          { name: title, url: window.location.href },
        ]}
      />
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
        1. Information We Collect
      </h2>
      <p>
        We collect information that you provide directly to us, such as when you create or modify
        your account, request services, contact customer support, or otherwise communicate with us.
      </p>
      <ul>
        <li>
          <strong>Personal Information:</strong> Name, email address, phone number, and profile
          picture.
        </li>
        <li>
          <strong>Payment Information:</strong> We use third-party payment processors (Razorpay) to
          process payments. We do not store your full credit card details.
        </li>
        <li>
          <strong>Usage Information:</strong> We collect information about how you interact with our
          services using PostHog, including page views and interaction data.
        </li>
      </ul>

      <h2 className="text-2xl mt-16 mb-8 flex items-center gap-4">
        <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
        2. How We Use Your Information
      </h2>
      <p>
        We use the information we collect to provide, maintain, and improve our services, including:
      </p>
      <ul>
        <li>Processing bookings and payments.</li>
        <li>Sending you technical notices, updates, and support messages.</li>
        <li>Responding to your comments and questions.</li>
        <li>
          Monitoring and analyzing trends, usage, and activities in connection with our services.
        </li>
      </ul>

      <h2 className="text-2xl mt-16 mb-8 flex items-center gap-4">
        <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
        3. Sharing of Information
      </h2>
      <p>We do not sell your personal information. We may share your information with:</p>
      <ul>
        <li>
          <strong>Partner Hosts:</strong> To facilitate your bookings and provide necessary
          information for your stay.
        </li>
        <li>
          <strong>Service Providers:</strong> Third-party vendors who perform services on our
          behalf, such as payment processing (Razorpay) and analytics (PostHog).
        </li>
        <li>
          <strong>Legal Obligations:</strong> If required by law or in response to legal processes.
        </li>
      </ul>

      <h2 className="text-2xl mt-16 mb-8 flex items-center gap-4">
        <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
        4. Your Rights
      </h2>
      <p>
        Depending on your location, you may have the right to access, correct, or delete your
        personal data. You can manage your profile settings or contact us directly to exercise these
        rights.
      </p>
    </StaticPage>
  );
}

export function TermsOfService() {
  return (
    <StaticPage title="Terms of Use & Service" icon={<Shield size={32} />}>
      <p className="text-xl text-slate-900 font-bold mb-10">
        Effective Date: {new Date().toLocaleDateString()}
      </p>
      <p>
        The following guidelines define the usage of the Wayzza platform. By using our services, you
        agree to adhere to these terms and conditions.
      </p>

      <h2 className="text-2xl mt-16 mb-8 flex items-center gap-4">
        <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
        1. Booking and Payments
      </h2>
      <p>
        All bookings made through Wayzza are subject to availability. Payments are processed through
        Razorpay. By confirming a booking, you agree to the price and specific terms mentioned in
        the listing.
      </p>

      <h2 className="text-2xl mt-16 mb-8 flex items-center gap-4">
        <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
        2. Cancellation and Refunds
      </h2>
      <p>
        Cancellation policies vary by property. Please review the specific cancellation policy of
        the sanctuary you are booking. Refunds, if applicable, will be processed via the original
        payment method within standard banking timelines.
      </p>

      <h2 className="text-2xl mt-16 mb-8 flex items-center gap-4">
        <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
        3. User Conduct
      </h2>
      <p>
        Users are expected to behave responsibly. Any damage to partner properties or violation of
        local laws during your stay may result in account termination and legal action.
      </p>

      <h2 className="text-2xl mt-16 mb-8 flex items-center gap-4">
        <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
        4. Limitation of Liability
      </h2>
      <p>
        Wayzza acts as a marketplace between travelers and hosts. We are not liable for direct or
        indirect damages arising from your stay, although we facilitate resolution through our
        verified standards.
      </p>
    </StaticPage>
  );
}

export function DataCompliance() {
  return (
    <StaticPage title="Data Compliance" icon={<Activity size={32} />}>
      <p className="text-xl text-slate-900 font-bold mb-10">
        Last Verified: {new Date().toLocaleDateString()}
      </p>
      <p>
        Wayzza is built with a "security-first" architecture. We adhere to global data protection
        standards to ensure your information remains yours.
      </p>

      <h2 className="text-2xl mt-16 mb-8 flex items-center gap-4">
        <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
        Security Standards
      </h2>
      <p>Our platform employs several layers of security:</p>
      <ul>
        <li>
          <strong>Encryption:</strong> All data in transit is encrypted using TLS 1.3.
        </li>
        <li>
          <strong>Authentication:</strong> Secure session management and JWT-based authentication.
        </li>
        <li>
          <strong>Infrastructure:</strong> Hosted on secured cloud environments with regular
          security audits.
        </li>
      </ul>

      <h2 className="text-2xl mt-16 mb-8 flex items-center gap-4">
        <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
        Regulatory Compliance
      </h2>
      <p>We work to ensure compliance with the following frameworks:</p>
      <ul>
        <li>
          <strong>India IT Act:</strong> Compliance with Indian data protection regulations.
        </li>
        <li>
          <strong>GDPR Ready:</strong> Principles of data minimization and purpose limitation are
          core to our design.
        </li>
        <li>
          <strong>PCI DSS:</strong> Our payment flows (via Razorpay) are PCI compliant.
        </li>
      </ul>
    </StaticPage>
  );
}

export function AboutUs() {
  return (
    <WayzzaLayout noPadding>
      <div className="bg-white font-sans text-slate-900 selection:bg-emerald-50 leading-relaxed antialiased overflow-hidden">
        {/* ════ SECTION: ════ */}
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
              Discover the <br />
              <span className="text-emerald-500 italic font-light">Soul of Varkala.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-base md:text-xl font-medium text-white/60 max-w-2xl mx-auto leading-relaxed"
            >
              Wayzza is not just a booking engine. It is your exclusive, hyper-local concierge to
              Varkala's most premium sanctuaries, verified for the modern explorer.
            </motion.p>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
            <div className="w-px h-16 bg-gradient-to-b from-emerald-500/0 to-emerald-500" />
          </div>
        </header>

        {/* ════ SECTION: ════ */}
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
                  Redefining luxury in <span className="italic text-emerald-600">Varkala.</span>
                </h2>
              </div>
              <p className="text-slate-500 text-base md:text-lg leading-relaxed font-medium">
                We realized that experiencing the true magic of Varkala required more than just
                finding a place to stay—it required finding a sanctuary you could trust, curated by
                locals who understand premium hospitality.
              </p>
              <p className="text-slate-500 text-base md:text-lg leading-relaxed font-medium">
                Wayzza was born from a deep love for Varkala's cliffs, shores, and culture. We
                personally verify every clifftop villa, every premium Royal Enfield, and every
                bespoke local experience to ensure it meets our rigorous standards of quality and
                soul.
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

        {/* ════ SECTION: ════ */}
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
                  desc: 'No generic listings. Only Varkala sanctuaries that pass our rigorous vibe and quality check.',
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
                  desc: 'Our team lives right here on the cliffs. We provide authentic, round-the-clock local Varkala support.',
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

        {/* ════ SECTION: ════ */}
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
