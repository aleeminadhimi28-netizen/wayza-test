import React from "react";

export function Input({ value, onChange, placeholder, type = "text", label }) {
    return (
        <div className="flex flex-col gap-2.5">
            {label && <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-sm shadow-inner"
            />
        </div>
    );
}

export const WayzzaInput = Input;
