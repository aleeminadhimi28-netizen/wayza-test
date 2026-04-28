import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Sparkles, X, User, Bot, Loader2 } from 'lucide-react';
import { BASE_URL } from '../utils/api.js';

export default function ListingConcierge({ listingId, listingTitle }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: `Welcome. I am the Wayzza Concierge for ${listingTitle}. How may I assist you with your stay today?`,
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = async (quickQuery = null) => {
    const textToSend = quickQuery || query.trim();
    if (!textToSend || isThinking) return;

    setMessages((prev) => [...prev, { role: 'user', text: textToSend }]);
    setQuery('');
    setIsThinking(true);

    try {
      const response = await fetch(`${BASE_URL}/api/v1/misc/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, query: textToSend }),
      });
      const data = await response.json();

      if (data.ok) {
        setMessages((prev) => [...prev, { role: 'bot', text: data.answer }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            text: 'I apologize, but I am having trouble connecting to the concierge network. Please try again in a moment.',
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: 'I apologize, but I am currently offline. Please contact our human support team for immediate assistance.',
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[32px] shadow-3xl border border-slate-100 w-[380px] h-[550px] flex flex-col overflow-hidden mb-6"
          >
            {/* Header */}
            <div className="bg-slate-900 p-8 text-white relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center">
                  <Sparkles size={20} className="text-slate-900" />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-widest text-[11px] text-emerald-400">
                    Concierge Intelligence
                  </h3>
                  <p className="font-black text-sm tracking-tighter">Wayzza Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/50 no-scrollbar"
            >
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-100 text-emerald-600 shadow-sm'}`}
                  >
                    {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div
                    className={`p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm max-w-[80%] ${m.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white text-slate-600 border border-slate-50 rounded-tl-none italic font-medium'}`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {isThinking && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-white border border-slate-100 rounded-xl flex items-center justify-center animate-pulse">
                    <Loader2 size={14} className="animate-spin text-emerald-600" />
                  </div>
                  <div className="p-4 bg-white border border-slate-50 rounded-2xl rounded-tl-none text-[11px] text-slate-400 uppercase tracking-widest font-black">
                    Architecting Response...
                  </div>
                </div>
              )}

              {messages.length === 1 && !isThinking && (
                <div className="flex flex-wrap gap-2 pt-4">
                  {['Is the WiFi fast?', 'Breakfast options?', 'Check-in policy?'].map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="px-4 py-2 bg-white border border-slate-100 rounded-full text-[11px] font-bold text-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 bg-white border-t border-slate-100">
              <div className="relative group">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about amenities, views, or area..."
                  className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-4 pr-12 text-[13px] font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!query.trim() || isThinking}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-all disabled:opacity-30"
                >
                  <Send size={14} />
                </button>
              </div>
              <p className="text-[11px] text-slate-300 font-bold uppercase tracking-[0.2em] text-center mt-4">
                Orchestrated by Wayzza AI Protocol
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-slate-950 text-white rounded-[24px] shadow-3xl flex items-center justify-center relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <AnimatePresence mode="wait">
          {isOpen ? <X size={24} key="x" /> : <MessageSquare size={24} key="m" />}
        </AnimatePresence>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-slate-950 rounded-full" />
        )}
      </motion.button>
    </div>
  );
}
