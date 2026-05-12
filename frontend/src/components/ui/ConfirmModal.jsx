import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  confirmVariant = 'emerald',
  isLoading = false,
}) {
  if (!isOpen) return null;

  const variants = {
    emerald: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200',
    rose: 'bg-rose-600 hover:bg-rose-700 shadow-rose-200',
    slate: 'bg-slate-900 hover:bg-slate-800 shadow-slate-200',
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!isLoading ? onClose : undefined}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100"
        >
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  confirmVariant === 'rose'
                    ? 'bg-rose-50 text-rose-500'
                    : 'bg-emerald-50 text-emerald-500'
                }`}
              >
                <AlertCircle size={28} />
              </div>
              {!isLoading && (
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">{message}</p>

            <div className="flex gap-3">
              <button
                disabled={isLoading}
                onClick={onClose}
                className="flex-1 h-12 rounded-2xl border border-slate-200 font-bold text-sm text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isLoading}
                onClick={onConfirm}
                className={`flex-1 h-12 rounded-2xl text-white font-bold text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${variants[confirmVariant]} disabled:opacity-50`}
              >
                {isLoading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
