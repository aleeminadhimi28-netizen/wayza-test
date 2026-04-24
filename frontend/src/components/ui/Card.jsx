import React from "react";

export function Card({ children, className = "" }) {
    return (
        <div className={`bg-white rounded-[40px] shadow-sm border border-slate-100 p-10 ${className}`}>
            {children}
        </div>
    );
}

export const WayzzaCard = Card;
