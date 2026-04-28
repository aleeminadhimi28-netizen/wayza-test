import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, X, Copy, Check, Loader2, Smartphone } from 'lucide-react';
import { api } from '../utils/api.js';
import { useToast } from '../ToastContext.jsx';

export default function TwoFactorSetup({ isOpen, onClose, onComplete }) {
  const { showToast } = useToast();
  const [step, setStep] = useState(1); // 1: QR, 2: Verification
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [token, setToken] = useState('');
  const [copied, setCopied] = useState(false);

  const loadSetup = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.setup2FA();
      if (res.ok) setSetupData(res.data);
      else showToast(res.message || 'Failed to load 2FA setup', 'error');
    } catch (err) {
      showToast('Server connection error', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isOpen) {
      loadSetup();
      setStep(1);
      setToken('');
    }
  }, [isOpen, loadSetup]);

  const handleCopy = () => {
    navigator.clipboard.writeText(setupData.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    if (token.length !== 6) return;
    setLoading(true);
    try {
      const res = await api.enable2FA(token);
      if (res.ok) {
        showToast('Two-factor authentication enabled!', 'success');
        onComplete();
        onClose();
      } else {
        showToast(res.message || 'Invalid code', 'error');
      }
    } catch (err) {
      showToast('Server connection error', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <Shield size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">2FA Setup</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {loading && !setupData ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">
                Generating Keys...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {step === 1 ? (
                <>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <Smartphone className="shrink-0 text-emerald-500 mt-0.5" size={18} />
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        Scan this QR code with your authenticator app (Google Authenticator, Authy,
                        etc.) to set up your account.
                      </p>
                    </div>

                    <div className="flex justify-center p-4 bg-white border border-slate-200 rounded-2xl shadow-inner">
                      {setupData?.qrCode && (
                        <img src={setupData.qrCode} alt="Setup QR Code" className="w-48 h-48" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                        Manual Entry Key
                      </label>
                      <div className="flex gap-2">
                        <div className="flex-1 h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 flex items-center font-mono text-sm text-slate-600 overflow-hidden truncate italic">
                          {setupData?.secret}
                        </div>
                        <button
                          onClick={handleCopy}
                          className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all"
                        >
                          {copied ? (
                            <Check size={18} className="text-emerald-500" />
                          ) : (
                            <Copy size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95"
                  >
                    I&apos;ve Scanned It <ArrowRight size={18} />
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 text-emerald-700">
                      <CheckCircle className="shrink-0 mt-0.5" size={18} />
                      <p className="text-xs leading-relaxed font-semibold">
                        Final Step: Enter the 6-digit verification code from your authenticator app
                        to confirm the setup.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={token}
                        onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                        placeholder="000 000"
                        className="w-full h-18 bg-slate-50 border border-slate-200 rounded-2xl text-center text-3xl font-black tracking-[0.5em] text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="h-14 px-6 bg-slate-100 text-slate-500 rounded-2xl font-bold uppercase text-[11px] tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleVerify}
                      disabled={loading || token.length !== 6}
                      className="flex-1 h-14 bg-slate-900 text-white rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 disabled:opacity-20"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Enable'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ArrowRight({ size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function CheckCircle({ size, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
