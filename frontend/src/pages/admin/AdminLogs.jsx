import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Clock, ShieldAlert, Zap, Server, Globe } from "lucide-react";
import { api } from "../../utils/api.js";
import { useToast } from "../../ToastContext.jsx";

export default function AdminLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        loadLogs();
        const t = setInterval(loadLogs, 15000); // refresh every 15s
        return () => clearInterval(t);
    }, []);

    const loadLogs = async () => {
        try {
            const d = await api.adminGetLogs();
            if (d.ok) setLogs(d.data || []);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    function translateAction(method, url) {
        method = method.toUpperCase();
        if (url.includes("/admin/coupons") && method === "POST") return { text: "Minted new promo code", type: "system" };
        if (url.includes("/admin/coupons") && method === "DELETE") return { text: "Revoked a promo code", type: "system" };
        if (url.includes("/bookings/book") && method === "POST") return { text: "Created a reservation", type: "business" };
        if (url.includes("/bookings/confirm") && method === "POST") return { text: "Confirmed payment", type: "business" };
        if (url.includes("/auth/login") && method === "POST") return { text: "User authenticated", type: "auth" };
        if (url.includes("/auth/signup") && method === "POST") return { text: "Registered new account", type: "auth" };
        if (url.includes("/listings") && method === "POST") return { text: "Submitted new listing", type: "content" };
        if (url.includes("/admin/listings/") && url.includes("/approve")) return { text: "Moderated a property", type: "system" };
        
        return { text: `${method} ${url}`, type: "other" };
    }

    const typeThemes = {
        system: "bg-emerald-50 text-emerald-700 border-emerald-100",
        business: "bg-blue-50 text-blue-700 border-blue-100",
        auth: "bg-amber-50 text-amber-700 border-amber-100",
        content: "bg-purple-50 text-purple-700 border-purple-100",
        other: "bg-slate-50 text-slate-600 border-slate-100"
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg">
                            <Activity size={18} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Activity & Audit Logs</h2>
                            <p className="text-sm text-slate-500">Real-time surveillance of all mutations across the platform.</p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">Timestamp</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">Originator</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">Activity</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">Network Node</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.map((log) => {
                                const { text, type } = translateAction(log.method, log.url);
                                const d = new Date(log.createdAt);
                                
                                return (
                                    <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-500 font-medium whitespace-nowrap">
                                                <Clock size={14} className="text-slate-400" />
                                                <span>{d.toLocaleDateString()}</span>
                                                <span className="text-xs">{d.toLocaleTimeString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                                                    {(log.actor || "?").charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-sm text-slate-800 truncate max-w-[200px]" title={log.actor}>
                                                    {log.actor}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${typeThemes[type] || typeThemes.other}`}>
                                                    {text}
                                                </span>
                                                {type === 'other' && (
                                                    <span className="text-[10px] font-mono text-slate-400 max-w-xs truncate">
                                                        {log.method} {log.url}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 font-mono bg-slate-50 px-2 py-1 rounded inline-flex">
                                                <Globe size={12} className="text-slate-400" />
                                                {log.ip || "0.0.0.0"}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {logs.length === 0 && (
                        <div className="py-20 text-center">
                            <Server size={32} className="text-slate-200 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-slate-900 mb-1">No Activity Detected</h3>
                            <p className="text-sm text-slate-500">The log buffer is currently empty.</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
