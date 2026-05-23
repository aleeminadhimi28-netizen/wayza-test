import { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
];

// Fallback rates (used when API is unavailable)
const FALLBACK_RATES = { INR: 1, USD: 0.012, EUR: 0.011, AED: 0.044 };

const CACHE_KEY = 'wayzza_fx_rates';
const CACHE_TS_KEY = 'wayzza_fx_rates_ts';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour — BUG-010 fix

/**
 * Fetch live INR-based exchange rates with 1-hour localStorage cache.
 * Uses exchangerate-api.com (free tier, no key required for open endpoint).
 * Falls back to hardcoded rates if the request fails.
 */
async function fetchLiveRates() {
  try {
    const cachedTs = localStorage.getItem(CACHE_TS_KEY);
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedTs && cachedData && Date.now() - Number(cachedTs) < CACHE_TTL_MS) {
      return JSON.parse(cachedData);
    }

    const res = await fetch('https://open.er-api.com/v6/latest/INR');
    if (!res.ok) throw new Error('FX fetch failed');
    const json = await res.json();

    if (json.result === 'success' && json.rates) {
      const rates = {
        INR: 1,
        USD: json.rates.USD || FALLBACK_RATES.USD,
        EUR: json.rates.EUR || FALLBACK_RATES.EUR,
        AED: json.rates.AED || FALLBACK_RATES.AED,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(rates));
      localStorage.setItem(CACHE_TS_KEY, String(Date.now()));
      return rates;
    }
    throw new Error('Invalid FX response');
  } catch {
    // Return fallback rates silently — non-critical feature
    return FALLBACK_RATES;
  }
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [ratesStale, setRatesStale] = useState(false);

  // Load saved currency preference
  useEffect(() => {
    const saved = localStorage.getItem('wayzza_currency');
    if (saved) {
      const found = CURRENCIES.find((c) => c.code === saved);
      if (found) setCurrency(found);
    }
  }, []);

  // Fetch live rates on mount and check if cache is stale
  useEffect(() => {
    const cachedTs = localStorage.getItem(CACHE_TS_KEY);
    const isStale = !cachedTs || Date.now() - Number(cachedTs) >= CACHE_TTL_MS;
    setRatesStale(isStale);

    fetchLiveRates().then(setRates);
  }, []);

  const changeCurrency = (code) => {
    const found = CURRENCIES.find((c) => c.code === code);
    if (found) {
      setCurrency(found);
      localStorage.setItem('wayzza_currency', code);
    }
  };

  const formatPrice = (amount) => {
    if (amount === undefined || amount === null) return '';
    const rate = rates[currency.code] ?? FALLBACK_RATES[currency.code] ?? 1;
    const converted = amount * rate;
    return `${currency.symbol}${converted.toLocaleString(undefined, {
      maximumFractionDigits: currency.code === 'INR' ? 0 : 2,
    })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, formatPrice, ratesStale }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
