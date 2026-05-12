import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function NotificationDropdown({ showNotifs, setShowNotifs, notifs }) {
  return (
    <AnimatePresence>
      {showNotifs && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="absolute right-0 mt-4 w-[320px] min-w-[320px] bg-white rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden z-[120] flex flex-col max-h-[420px]"
        >
          <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <span className="font-bold text-xs text-slate-900 uppercase tracking-widest">
              Notifications
            </span>
            <button
              onClick={() => setShowNotifs(false)}
              className="text-slate-400 hover:text-slate-900"
            >
              <X size={16} />
            </button>
          </div>
          <div className="overflow-y-auto p-4 flex-1">
            {notifs.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-6">No new notifications</p>
            ) : (
              notifs.map((n) => (
                <div
                  key={n._id}
                  className={`p-4 rounded-2xl mb-2 flex flex-col gap-1.5 text-sm ${
                    n.read
                      ? 'bg-white text-slate-500 border border-slate-50'
                      : 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-100/50'
                  }`}
                >
                  <span className="leading-snug">{n.message}</span>
                  <span className="text-[11px] uppercase tracking-widest opacity-40">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
