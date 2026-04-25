import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Navigation } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function VerificationSpinner({
  message = 'Verifying Authority...',
  subtext = 'Synchronizing Oversight Registry',
  fullScreen = true,
}) {
  const [statusIndex, setStatusIndex] = useState(0);
  const statuses = [
    'Initializing Connection Protocol...',
    'Authenticating Identity Signature...',
    'Synchronizing Registry Access...',
    'Validating Network Integrity...',
    'Establishing Authorized Link...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [statuses.length]);

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white'
    : 'flex flex-col items-center justify-center py-20 gap-10 w-full';

  return (
    <div className={containerClasses}>
      {/* AMBIENT BACKGROUND DECOR */}
      {fullScreen && (
        <>
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/[0.03] blur-[150px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-900/[0.02] blur-3xl pointer-events-none" />
        </>
      )}

      <div className="relative flex items-center justify-center">
        {/* CONCENTRIC RINGS */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="w-48 h-48 border-2 border-slate-50 border-t-emerald-500 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="absolute w-36 h-36 border border-slate-100 border-b-emerald-600 rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center border border-slate-100 shadow-inner"
        >
          <ShieldCheck size={32} className="text-emerald-500" />
        </motion.div>

        {/* ORBITING PARTICLES - PURE CSS ANIMATION VIA INLINE STYLES FOR SIMPLICITY */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ rotate: 360 }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: 'linear' }}
            className="absolute w-64 h-64 pointer-events-none"
          >
            <div
              className="w-1.5 h-1.5 bg-emerald-500/40 rounded-full"
              style={{ position: 'absolute', top: 0, left: '50%' }}
            />
          </motion.div>
        ))}
      </div>

      <div className="text-center space-y-6 relative z-10 max-w-sm px-6">
        <div className="space-y-2">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-300"
          >
            {subtext}
          </motion.p>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tighter uppercase leading-none">
            {message}
          </h3>
        </div>

        <div className="h-4 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={statusIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest"
            >
              {statuses[statusIndex]}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* AUTH STATUS INDICATORS */}
        <div className="flex justify-center gap-3 pt-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-700 ${statusIndex >= i ? 'bg-emerald-500 scale-125 shadow-lg shadow-emerald-500/40' : 'bg-slate-100'}`}
            />
          ))}
        </div>
      </div>

      {/* PROTOCOL LABEL */}
      <div className="absolute bottom-12 flex flex-col items-center gap-4 opacity-20 pointer-events-none">
        <div className="flex items-center gap-4 font-bold text-[9px] uppercase tracking-[0.8em] text-slate-400">
          <Navigation size={14} /> SECURE_PROTOCOL // AUTHORIZATION_GRID_V.4
        </div>
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-300">
            SYSTEM_HANDSHAKE_NOMINAL
          </span>
        </div>
      </div>
    </div>
  );
}
