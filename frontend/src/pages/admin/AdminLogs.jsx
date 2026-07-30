import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, Server, Globe } from 'lucide-react';
import { api } from '../../utils/api.js';
import { useToast } from '../../ToastContext.jsx';

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadLogs = useCallback(async () => {
    try {
      const d = await api.adminGetLogs();
      if (d.ok) setLogs(d.data || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load logs', 'error');
    }
    setLoading(false);
  }, [showToast]);

  useEffect(() => {
    loadLogs();
    const t = setInterval(loadLogs, 15000);
    return () => clearInterval(t);
  }, [loadLogs]);

  function translateAction(method, url) {
    method = method.toUpperCase();
    if (url.includes('/admin/coupons') && method === 'POST')
      return { text: 'Minted new promo code', type: 'system' };
    if (url.includes('/admin/coupons') && method === 'DELETE')
      return { text: 'Revoked a promo code', type: 'system' };
    if (url.includes('/bookings/book') && method === 'POST')
      return { text: 'Created a reservation', type: 'business' };
    if (url.includes('/bookings/confirm') && method === 'POST')
      return { text: 'Confirmed payment', type: 'business' };
    if (url.includes('/auth/login') && method === 'POST')
      return { text: 'User authenticated', type: 'auth' };
    if (url.includes('/auth/signup') && method === 'POST')
      return { text: 'Registered new account', type: 'auth' };
    if (url.includes('/listings') && method === 'POST')
      return { text: 'Submitted new listing', type: 'content' };
    if (url.includes('/admin/listings/') && url.includes('/approve'))
      return { text: 'Moderated a property', type: 'system' };
    if (url.includes('/partner/withdraw') && method === 'POST')
      return { text: 'Requested withdrawal', type: 'business' };
    if (url.includes('/admin/users') && method === 'DELETE')
      return { text: 'Deleted a user', type: 'system' };
    if (url.includes('/admin/partners/') && url.includes('/approve'))
      return { text: 'Approved a partner', type: 'system' };
    if (url.includes('/support/tickets')) return { text: 'Managed support ticket', type: 'system' };
    return { text: `${method} ${url}`, type: 'other' };
  }

  const typeBadge = {
    system: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25',
    business: 'bg-blue-500/15 text-blue-300 border border-blue-500/25',
    auth: 'bg-amber-500/15 text-amber-300 border border-amber-500/25',
    content: 'bg-purple-500/15 text-purple-300 border border-purple-500/25',
    other: 'bg-white/[0.05] text-white/50 border border-white/10',
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-white/10 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-card-border)' }}
      >
        {/* Header */}
        <div
          className="px-7 py-5 flex items-center gap-4"
          style={{ borderBottom: '1px solid var(--dash-divider)' }}
        >
          <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center border border-emerald-500/25">
            <Activity size={18} className="text-emerald-400" />
          </div>
          <div>
            <h2
              className="text-base font-black uppercase tracking-tight"
              style={{ color: 'var(--dash-text-1)' }}
            >
              Activity &amp; Audit Logs
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--dash-text-2)' }}>
              Real-time surveillance of all mutations across the platform.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              Live
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--dash-divider)',
                  background: 'rgba(128,128,128,0.03)',
                }}
              >
                {['Timestamp', 'Originator', 'Activity', 'Network Node'].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em]"
                    style={{ color: 'var(--dash-text-3)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const { text, type } = translateAction(log.method, log.url);
                const d = new Date(log.createdAt);
                return (
                  <tr
                    key={log._id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid var(--dash-divider)' }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = 'rgba(128,128,128,0.04)')
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <Clock size={13} style={{ color: 'var(--dash-text-3)' }} />
                        <span
                          className="text-xs font-semibold"
                          style={{ color: 'var(--dash-text-2)' }}
                        >
                          {d.toLocaleDateString()}
                        </span>
                        <span
                          className="text-[11px] font-mono"
                          style={{ color: 'var(--dash-text-3)' }}
                        >
                          {d.toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                          style={{
                            background: 'rgba(128,128,128,0.1)',
                            color: 'var(--dash-text-2)',
                          }}
                        >
                          {(log.actor || '?').charAt(0).toUpperCase()}
                        </div>
                        <span
                          className="text-sm font-semibold truncate max-w-[180px]"
                          title={log.actor}
                          style={{ color: 'var(--dash-text-1)' }}
                        >
                          {log.actor}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${typeBadge[type] || typeBadge.other}`}
                        >
                          {text}
                        </span>
                        {type === 'other' && (
                          <span
                            className="text-[10px] font-mono truncate max-w-xs"
                            style={{ color: 'var(--dash-text-3)' }}
                          >
                            {log.method} {log.url}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium px-2.5 py-1 rounded-lg"
                        style={{
                          background: 'rgba(128,128,128,0.08)',
                          color: 'var(--dash-text-2)',
                        }}
                      >
                        <Globe size={11} style={{ color: 'var(--dash-text-3)' }} />
                        {log.ip || '0.0.0.0'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {logs.length === 0 && (
            <div className="py-20 text-center">
              <Server size={32} className="mx-auto mb-3" style={{ color: 'var(--dash-text-3)' }} />
              <h3 className="text-base font-black mb-1" style={{ color: 'var(--dash-text-1)' }}>
                No Activity Detected
              </h3>
              <p className="text-sm" style={{ color: 'var(--dash-text-2)' }}>
                The log buffer is currently empty.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
