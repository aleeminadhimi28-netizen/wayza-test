import { useState, useEffect } from 'react';
import {
  DollarSign,
  Layers,
  Activity,
  ShieldCheck,
  Save,
  Tag,
  Sparkles,
  Image as ImageIcon,
  ToggleLeft,
  ToggleRight,
  Upload,
  Phone,
  Mail,
  MessageSquare,
} from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../../ToastContext';
import { motion } from 'framer-motion';

export default function AdminSettings() {
  const { showToast } = useToast();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('economics');

  // Promo offer state
  const [promoOffer, setPromoOffer] = useState({
    title: 'Offers',
    subtitle: 'Promotions, deals and special offers for you',
    label: 'No catch. Just getaways.',
    heading: 'Book a Getaway Deal',
    text: 'At least 15% off select stays.',
    button: 'Save on your next trip',
    image: '/images/varkala_cliff.webp',
    isActive: true,
  });
  const [savingPromo, setSavingPromo] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  useEffect(() => {
    Promise.all([api.getPlatformConfig(), api.getPromoOffer()])
      .then(([configRes, promoRes]) => {
        if (configRes.ok) setConfig(configRes.data);
        if (promoRes.ok && promoRes.data) setPromoOffer(promoRes.data);
        setLoading(false);
      })
      .catch(() => {
        showToast('Failed to fetch platform config', 'error');
        setLoading(false);
      });
  }, [showToast]);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await api.updatePlatformConfig({
        gstRate: parseFloat(config.gstRate),
        serviceFee: parseFloat(config.serviceFee),
        commissionRate: parseFloat(config.commissionRate),
        supportPhone: config.supportPhone || '',
        supportWhatsApp: config.supportWhatsApp || '',
        supportEmail: config.supportEmail || '',
      });
      if (res.ok) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message || 'Failed to update', 'error');
      }
    } catch {
      showToast('Network error while saving', 'error');
    }
    setSaving(false);
  };

  const handleSavePromo = async () => {
    setSavingPromo(true);
    try {
      const res = await api.updatePromoOffer(promoOffer);
      if (res.ok) {
        showToast('Promo Offer banner updated successfully!', 'success');
      } else {
        showToast(res.message || 'Failed to update promo offer banner', 'error');
      }
    } catch {
      showToast('Network error while saving promo offer', 'error');
    }
    setSavingPromo(false);
  };

  const togglePromoActive = async () => {
    const newActive = !promoOffer.isActive;
    const updated = { ...promoOffer, isActive: newActive };
    setPromoOffer(updated);
    try {
      const res = await api.updatePromoOffer(updated);
      if (res.ok) {
        showToast(
          newActive
            ? 'Promo offer banner activated on homepage!'
            : 'Promo offer banner hidden from homepage!',
          'success'
        );
      } else {
        showToast(res.message || 'Failed to update visibility', 'error');
      }
    } catch {
      showToast('Network error while updating banner status', 'error');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.uploadImage(formData);
      if (res.ok && res.url) {
        setPromoOffer((prev) => ({ ...prev, image: res.url }));
        showToast('Image uploaded successfully!', 'success');
      } else {
        showToast(res.message || 'Failed to upload image', 'error');
      }
    } catch {
      showToast('Image upload failed', 'error');
    }
    setUploadingImg(false);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-2 border-white/10 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );

  if (!config)
    return (
      <div className="text-rose-400 p-12 text-center font-semibold">Failed to load config.</div>
    );

  const cards = [
    {
      key: 'commissionRate',
      label: 'Partner Commission Rate',
      sub: 'Platform Take-Home',
      icon: Activity,
      accent: 'emerald',
      type: 'range',
      min: 0,
      max: 1,
      step: 0.01,
      displayValue: `${(config.commissionRate * 100).toFixed(1)}%`,
      ticks: ['0%', '10%', '25%', '50%', '75%', '100%'],
      note: '⚠️ Changes apply to future bookings only. Existing confirmed bookings use their frozen commission snapshot.',
      noteColor: 'emerald',
    },
    {
      key: 'serviceFee',
      label: 'Guest Service Fee',
      sub: 'Flat Rate Booking Buffers',
      icon: DollarSign,
      accent: 'teal',
      type: 'number',
      displayValue: `₹ ${config.serviceFee}`,
      note: 'Charged identically across all property tiers.',
      noteColor: 'teal',
    },
    {
      key: 'gstRate',
      label: 'GST Applicability',
      sub: 'Local Value Tax',
      icon: Layers,
      accent: 'amber',
      type: 'range',
      min: 0,
      max: 0.5,
      step: 0.01,
      displayValue: `${(config.gstRate * 100).toFixed(1)}%`,
      ticks: ['0%', '10%', '25%', '35%', '50%'],
      noteEl: (
        <div className="flex items-center gap-2 text-xs text-amber-300 font-medium">
          <ShieldCheck size={13} /> Legally mandated. Auto-waived for vehicles.
        </div>
      ),
      noteColor: 'amber',
    },
  ];

  const accentMap = {
    emerald: {
      ring: 'ring-emerald-500/40',
      glow: 'bg-emerald-500/8',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      note: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
      icon: 'bg-emerald-500/15 text-emerald-400',
    },
    teal: {
      ring: 'ring-teal-500/40',
      glow: 'bg-teal-500/8',
      text: 'text-teal-400',
      border: 'border-teal-500/20',
      note: 'bg-teal-500/10 border-teal-500/20 text-teal-300',
      icon: 'bg-teal-500/15 text-teal-400',
    },
    amber: {
      ring: 'ring-amber-500/40',
      glow: 'bg-amber-500/8',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      note: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
      icon: 'bg-amber-500/15 text-amber-400',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* ── SETTINGS PAGE HEADER & NAVIGATION TABS ── */}
      <div className="space-y-4">
        <div>
          <h1
            className="text-2xl font-black uppercase tracking-tight"
            style={{ color: 'var(--dash-text-1)' }}
          >
            Settings Management
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--dash-text-2)' }}>
            Configure financial parameters, support contact numbers, and homepage promo banners.
          </p>
        </div>

        {/* Tab Navigation Bar */}
        <div
          className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl max-w-fit"
          style={{
            background: 'rgba(128,128,128,0.08)',
            border: '1px solid var(--dash-card-border)',
          }}
        >
          {[
            { id: 'economics', label: 'Platform Economics', icon: DollarSign },
            { id: 'contacts', label: 'Support & Concierge', icon: Phone },
            { id: 'promo', label: 'Promo Offer Banner', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  isSel
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'hover:opacity-100 opacity-60'
                }`}
                style={isSel ? {} : { color: 'var(--dash-text-1)' }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── PLATFORM ECONOMICS ── */}
      {activeTab === 'economics' && (
        <div className="space-y-6">
          <div>
            <h2
              className="text-xl font-black uppercase tracking-tight"
              style={{ color: 'var(--dash-text-1)' }}
            >
              Platform Economics
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--dash-text-2)' }}>
              Live tune financial parameters across the global network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cards.map(
            ({
              key,
              label,
              sub,
              icon: Icon,
              accent,
              type,
              min,
              max,
              step,
              displayValue,
              ticks,
              note,
              noteEl,
            }) => {
              const a = accentMap[accent];
              return (
                <div
                  key={key}
                  className="rounded-2xl p-7 space-y-5 relative overflow-hidden transition-all hover:scale-[1.01]"
                  style={{
                    background: 'var(--dash-card)',
                    border: '1px solid var(--dash-card-border)',
                  }}
                >
                  {/* Glow blob */}
                  <div
                    className={`absolute top-0 right-0 w-40 h-40 ${a.glow} blur-[60px] rounded-full pointer-events-none`}
                  />

                  <div className="flex items-center gap-4 relative z-10">
                    <div
                      className={`w-11 h-11 rounded-xl ${a.icon} flex items-center justify-center border ${a.border}`}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-sm" style={{ color: 'var(--dash-text-1)' }}>
                        {label}
                      </h3>
                      <p
                        className="text-[10px] uppercase tracking-[0.2em] mt-0.5 font-bold"
                        style={{ color: 'var(--dash-text-3)' }}
                      >
                        {sub}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                    <p className={`text-4xl font-black ${a.text} tabular-nums`}>{displayValue}</p>

                    {type === 'range' ? (
                      <>
                        <input
                          type="range"
                          min={min}
                          max={max}
                          step={step}
                          value={config[key]}
                          onChange={(e) =>
                            setConfig({ ...config, [key]: parseFloat(e.target.value) })
                          }
                          className={`w-full accent-${accent}-500 cursor-pointer`}
                        />
                        <div
                          className="flex justify-between text-[10px] font-bold px-0.5"
                          style={{ color: 'var(--dash-text-3)' }}
                        >
                          {ticks.map((t) => (
                            <span key={t}>{t}</span>
                          ))}
                        </div>
                      </>
                    ) : (
                      <input
                        type="number"
                        value={config[key]}
                        onChange={(e) =>
                          setConfig({ ...config, [key]: parseFloat(e.target.value) || 0 })
                        }
                        className={`w-full rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all focus:ring-2 ${a.ring}`}
                        style={{
                          background: 'rgba(128,128,128,0.06)',
                          border: '1px solid var(--dash-divider)',
                          color: 'var(--dash-text-1)',
                        }}
                      />
                    )}

                    {noteEl ? (
                      <div className={`p-3 rounded-xl border ${a.note}`}>{noteEl}</div>
                    ) : note ? (
                      <p
                        className={`text-xs font-medium p-3 rounded-xl border leading-relaxed ${a.note}`}
                      >
                        {note}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            }
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2.5 px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-[#050a08] rounded-xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
          >
            <Save size={15} strokeWidth={2.5} />
            {saving ? 'Deploying...' : 'Deploy Financial Configuration'}
          </button>
        </div>
      </div>
      )}

      {/* ── SUPPORT & CONCIERGE CONTACT SETTINGS ── */}
      {activeTab === 'contacts' && (
      <div className="space-y-6">
        <div>
          <h2
            className="text-2xl font-black uppercase tracking-tight"
            style={{ color: 'var(--dash-text-1)' }}
          >
            Support & Concierge Contact Details
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--dash-text-2)' }}>
            Manage official contact numbers and WhatsApp details used across AI Trip Planner and site support links.
          </p>
        </div>

        <div
          className="rounded-2xl p-7 space-y-6"
          style={{
            background: 'var(--dash-card)',
            border: '1px solid var(--dash-card-border)',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--dash-text-2)' }}>
                WhatsApp Concierge Number
              </label>
              <div className="relative">
                <MessageSquare size={16} className="absolute left-3.5 top-3.5 text-emerald-400" />
                <input
                  type="text"
                  placeholder="e.g. 919876543210 (Country code + number)"
                  value={config.supportWhatsApp || ''}
                  onChange={(e) => setConfig({ ...config, supportWhatsApp: e.target.value })}
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm font-bold outline-none transition-all focus:ring-2 ring-emerald-500/40"
                  style={{
                    background: 'rgba(128,128,128,0.06)',
                    border: '1px solid var(--dash-divider)',
                    color: 'var(--dash-text-1)',
                  }}
                />
              </div>
              <p className="text-[11px] mt-1.5" style={{ color: 'var(--dash-text-3)' }}>
                Used for WhatsApp chat in AI Trip Planner & Concierge. Digits only.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--dash-text-2)' }}>
                Support Phone Number
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-3.5 text-teal-400" />
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={config.supportPhone || ''}
                  onChange={(e) => setConfig({ ...config, supportPhone: e.target.value })}
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm font-bold outline-none transition-all focus:ring-2 ring-teal-500/40"
                  style={{
                    background: 'rgba(128,128,128,0.06)',
                    border: '1px solid var(--dash-divider)',
                    color: 'var(--dash-text-1)',
                  }}
                />
              </div>
              <p className="text-[11px] mt-1.5" style={{ color: 'var(--dash-text-3)' }}>
                Displayed on FAQ and Contact Support sections.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--dash-text-2)' }}>
                Support Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-amber-400" />
                <input
                  type="email"
                  placeholder="e.g. stay@wayzza.live"
                  value={config.supportEmail || ''}
                  onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })}
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm font-bold outline-none transition-all focus:ring-2 ring-amber-500/40"
                  style={{
                    background: 'rgba(128,128,128,0.06)',
                    border: '1px solid var(--dash-divider)',
                    color: 'var(--dash-text-1)',
                  }}
                />
              </div>
              <p className="text-[11px] mt-1.5" style={{ color: 'var(--dash-text-3)' }}>
                Primary contact email address for customer enquiries.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2.5 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-[#050a08] rounded-xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
            >
              <Save size={15} strokeWidth={2.5} />
              {saving ? 'Saving...' : 'Save Contact Settings'}
            </button>
          </div>
        </div>
      </div>
      )}

      {/* ── GETAWAY DEAL / PROMO OFFER BANNER MANAGEMENT ── */}
      {activeTab === 'promo' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-2">
              <Sparkles size={12} />
              Homepage Marketing Banner
            </div>
            <h2
              className="text-2xl font-black uppercase tracking-tight"
              style={{ color: 'var(--dash-text-1)' }}
            >
              Getaway Deal / Promo Banner
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--dash-text-2)' }}>
              Customize the offer badge, discount text, CTA button, image, and banner visibility on
              the Landing Page.
            </p>
          </div>

          <button
            type="button"
            onClick={togglePromoActive}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all border ${
              promoOffer.isActive
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25'
            }`}
          >
            {promoOffer.isActive ? (
              <>
                <ToggleRight size={20} className="text-emerald-400" />
                Banner Active
              </>
            ) : (
              <>
                <ToggleLeft size={20} className="text-rose-400" />
                Banner Hidden
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Edit Form */}
          <div
            className="rounded-2xl p-6 md:p-8 space-y-5 relative overflow-hidden"
            style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-card-border)' }}
          >
            <div
              className="flex items-center gap-3 pb-3 border-b"
              style={{ borderColor: 'var(--dash-divider)' }}
            >
              <Tag size={18} className="text-emerald-400" />
              <h3
                className="font-black text-sm uppercase tracking-wider"
                style={{ color: 'var(--dash-text-1)' }}
              >
                Banner Content Settings
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-[10px] font-black uppercase tracking-widest mb-1.5"
                  style={{ color: 'var(--dash-text-3)' }}
                >
                  Section Badge Title
                </label>
                <input
                  type="text"
                  value={promoOffer.title || ''}
                  onChange={(e) => setPromoOffer({ ...promoOffer, title: e.target.value })}
                  placeholder="e.g. OFFERS"
                  className="w-full rounded-xl px-4 py-3 text-sm font-bold outline-none"
                  style={{
                    background: 'rgba(128,128,128,0.06)',
                    border: '1px solid var(--dash-divider)',
                    color: 'var(--dash-text-1)',
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-[10px] font-black uppercase tracking-widest mb-1.5"
                  style={{ color: 'var(--dash-text-3)' }}
                >
                  Sub-label Badge
                </label>
                <input
                  type="text"
                  value={promoOffer.label || ''}
                  onChange={(e) => setPromoOffer({ ...promoOffer, label: e.target.value })}
                  placeholder="e.g. NO CATCH. JUST GETAWAYS."
                  className="w-full rounded-xl px-4 py-3 text-sm font-bold outline-none"
                  style={{
                    background: 'rgba(128,128,128,0.06)',
                    border: '1px solid var(--dash-divider)',
                    color: 'var(--dash-text-1)',
                  }}
                />
              </div>
            </div>

            <div>
              <label
                className="block text-[10px] font-black uppercase tracking-widest mb-1.5"
                style={{ color: 'var(--dash-text-3)' }}
              >
                Main Heading
              </label>
              <input
                type="text"
                value={promoOffer.heading || ''}
                onChange={(e) => setPromoOffer({ ...promoOffer, heading: e.target.value })}
                placeholder="e.g. Book a Getaway Deal"
                className="w-full rounded-xl px-4 py-3 text-sm font-bold outline-none"
                style={{
                  background: 'rgba(128,128,128,0.06)',
                  border: '1px solid var(--dash-divider)',
                  color: 'var(--dash-text-1)',
                }}
              />
            </div>

            <div>
              <label
                className="block text-[10px] font-black uppercase tracking-widest mb-1.5"
                style={{ color: 'var(--dash-text-3)' }}
              >
                Discount / Offer Description
              </label>
              <input
                type="text"
                value={promoOffer.text || ''}
                onChange={(e) => setPromoOffer({ ...promoOffer, text: e.target.value })}
                placeholder="e.g. At least 15% off select stays."
                className="w-full rounded-xl px-4 py-3 text-sm font-bold outline-none"
                style={{
                  background: 'rgba(128,128,128,0.06)',
                  border: '1px solid var(--dash-divider)',
                  color: 'var(--dash-text-1)',
                }}
              />
            </div>

            <div>
              <label
                className="block text-[10px] font-black uppercase tracking-widest mb-1.5"
                style={{ color: 'var(--dash-text-3)' }}
              >
                Button CTA Text
              </label>
              <input
                type="text"
                value={promoOffer.button || ''}
                onChange={(e) => setPromoOffer({ ...promoOffer, button: e.target.value })}
                placeholder="e.g. SAVE ON YOUR NEXT TRIP"
                className="w-full rounded-xl px-4 py-3 text-sm font-bold outline-none"
                style={{
                  background: 'rgba(128,128,128,0.06)',
                  border: '1px solid var(--dash-divider)',
                  color: 'var(--dash-text-1)',
                }}
              />
            </div>

            <div>
              <label
                className="block text-[10px] font-black uppercase tracking-widest mb-1.5"
                style={{ color: 'var(--dash-text-3)' }}
              >
                Banner Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoOffer.image || ''}
                  onChange={(e) => setPromoOffer({ ...promoOffer, image: e.target.value })}
                  placeholder="/images/varkala_cliff.webp or https://..."
                  className="flex-1 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                  style={{
                    background: 'rgba(128,128,128,0.06)',
                    border: '1px solid var(--dash-divider)',
                    color: 'var(--dash-text-1)',
                  }}
                />
                <label className="flex items-center gap-2 px-4 py-3 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 rounded-xl cursor-pointer text-xs font-bold transition-all border border-emerald-500/30">
                  <Upload size={14} />
                  {uploadingImg ? 'Uploading...' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImg}
                  />
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSavePromo}
                disabled={savingPromo}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-[#050a08] rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
              >
                <Save size={15} strokeWidth={2.5} />
                {savingPromo ? 'Saving Changes...' : 'Save Promo Banner Settings'}
              </button>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <ImageIcon size={14} /> Live Landing Page Preview
              </h3>
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${promoOffer.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}
              >
                {promoOffer.isActive ? 'Visible to Users' : 'Hidden from Users'}
              </span>
            </div>

            <div
              className={`transition-all ${!promoOffer.isActive ? 'opacity-40 grayscale pointer-events-none' : ''}`}
            >
              <div className="bg-white rounded-[24px] border border-slate-200 shadow-xl overflow-hidden text-slate-900 p-5">
                <div className="flex flex-col sm:flex-row items-stretch gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-emerald-500 uppercase tracking-[0.35em] text-[11px] font-black mb-2">
                      {promoOffer.title || 'OFFERS'}
                    </p>
                    <h2 className="text-2xl font-black tracking-tight text-slate-950 mb-2 leading-tight">
                      {promoOffer.heading || 'Book a Getaway Deal'}
                    </h2>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-3">
                      {promoOffer.text || 'At least 15% off select stays.'}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400 mb-4">
                      {promoOffer.label || 'NO CATCH. JUST GETAWAYS.'}
                    </p>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-2xl bg-slate-950 text-white px-5 py-3 text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-950/10"
                    >
                      {promoOffer.button || 'SAVE ON YOUR NEXT TRIP'}
                    </button>
                  </div>
                  <div className="w-full sm:w-48 h-36 sm:h-auto rounded-[20px] overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={api.fixImg(promoOffer.image)}
                      alt="Promo preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </motion.div>
  );
}
