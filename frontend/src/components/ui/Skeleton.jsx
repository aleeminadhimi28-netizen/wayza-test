import React from "react";

export function Skeleton({ className = "" }) {
    return (
        <div className={`animate-pulse bg-slate-100 rounded-[24px] ${className}`} />
    );
}

export const WayzaSkeleton = Skeleton;
