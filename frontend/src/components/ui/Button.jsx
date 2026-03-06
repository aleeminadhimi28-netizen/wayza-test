import React from "react";

export function Button({ children, onClick, variant = "primary", className = "", type = "button" }) {
    const styles = {
        primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/10",
        secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
    };
    return (
        <button
            type={type}
            onClick={onClick}
            className={`px-8 py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg ${styles[variant]} ${className}`}
        >
            {children}
        </button>
    );
}

export const WayzaButton = Button;
