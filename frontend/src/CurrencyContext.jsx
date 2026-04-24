import React, { createContext, useContext, useState, useEffect } from "react";

const CurrencyContext = createContext();

export const CURRENCIES = [
    { code: "INR", symbol: "₹", rate: 1, label: "Indian Rupee" },
    { code: "USD", symbol: "$", rate: 0.012, label: "US Dollar" },
    { code: "EUR", symbol: "€", rate: 0.011, label: "Euro" },
    { code: "AED", symbol: "د.إ", rate: 0.044, label: "UAE Dirham" },
];

export function CurrencyProvider({ children }) {
    const [currency, setCurrency] = useState(CURRENCIES[0]);

    useEffect(() => {
        const saved = localStorage.getItem("wayzza_currency");
        if (saved) {
            const found = CURRENCIES.find(c => c.code === saved);
            if (found) setCurrency(found);
        }
    }, []);

    const changeCurrency = (code) => {
        const found = CURRENCIES.find(c => c.code === code);
        if (found) {
            setCurrency(found);
            localStorage.setItem("wayzza_currency", code);
        }
    };

    const formatPrice = (amount) => {
        if (amount === undefined || amount === null) return "";
        const converted = amount * currency.rate;
        return `${currency.symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: (currency.code === 'INR' ? 0 : 2) })}`;
    };

    return (
        <CurrencyContext.Provider value={{ currency, changeCurrency, formatPrice }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export const useCurrency = () => useContext(CurrencyContext);
