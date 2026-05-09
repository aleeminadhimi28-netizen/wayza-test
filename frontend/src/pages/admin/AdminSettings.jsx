import { useState, useEffect } from 'react';
import { DollarSign, Layers, ShieldCheck, Activity, Save } from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../../ToastContext';

export default function AdminSettings() {
  const { showToast } = useToast();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .getPlatformConfig()
      .then((res) => {
        if (res.ok) setConfig(res.data);
        setLoading(false);
      })
      .catch(() => {
        showToast('Failed to fetch platform config', 'error');
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await api.updatePlatformConfig({
        gstRate: parseFloat(config.gstRate),
        serviceFee: parseFloat(config.serviceFee),
        commissionRate: parseFloat(config.commissionRate),
      });
      if (res.ok) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message || 'Failed to update', 'error');
      }
    } catch (error) {
      showToast('Network error while saving', 'error');
    }
    setSaving(false);
  };

  if (loading)
    return (
      <div className="text-slate-500 p-12 text-center text-sm font-semibold">
        Loading platform configuration...
      </div>
    );
  if (!config) return <div className="text-rose-500 p-12 text-center">Failed to load config.</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Platform Economics</h1>
        <p className="text-sm text-slate-500">
          Live tune financial parameters across the global network.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Commission Rate */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full group-hover:bg-emerald-500/10 transition-all" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="text-slate-900 font-bold text-base">Partner Commission Rate</h3>
              <p className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">
                Platform Take-Home
              </p>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-slate-900">
                {(config.commissionRate * 100).toFixed(1)}
              </span>
              <span className="text-emerald-600 font-bold text-lg">%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={config.commissionRate}
              onChange={(e) => setConfig({ ...config, commissionRate: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500"
            />
            <p className="text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-100 rounded-xl p-3">
              Historical math is safely isolated from live rate updates.
            </p>
          </div>
        </div>

        {/* Service Fee */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] rounded-full group-hover:bg-indigo-500/10 transition-all" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
              <DollarSign size={24} />
            </div>
            <div>
              <h3 className="text-slate-900 font-bold text-base">Guest Service Fee</h3>
              <p className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">
                Flat Rate Booking Buffers
              </p>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-indigo-600 font-bold text-lg">₹</span>
              <span className="text-4xl font-bold text-slate-900">{config.serviceFee}</span>
            </div>
            <input
              type="number"
              value={config.serviceFee}
              onChange={(e) =>
                setConfig({ ...config, serviceFee: parseFloat(e.target.value) || 0 })
              }
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-bold transition-all"
            />
            <p className="text-xs text-indigo-600 font-medium bg-indigo-50 border border-indigo-100 rounded-xl p-3">
              Charged identically across all property tiers.
            </p>
          </div>
        </div>

        {/* GST Applicability */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[50px] rounded-full group-hover:bg-amber-500/10 transition-all" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100">
              <Layers size={24} />
            </div>
            <div>
              <h3 className="text-slate-900 font-bold text-base">GST Applicability</h3>
              <p className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">
                Local Value Tax
              </p>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-slate-900">
                {(config.gstRate * 100).toFixed(1)}
              </span>
              <span className="text-amber-600 font-bold text-lg">%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={config.gstRate}
              onChange={(e) => setConfig({ ...config, gstRate: parseFloat(e.target.value) })}
              className="w-full accent-amber-500"
            />
            <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-center gap-2 text-xs text-amber-700 font-medium">
              <ShieldCheck size={14} /> Legally mandated. Auto-waived for vehicles.
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-slate-900 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg active:scale-95 flex items-center gap-2.5 disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Deploying...' : 'Deploy Financial Configuration'}
        </button>
      </div>
    </div>
  );
}
