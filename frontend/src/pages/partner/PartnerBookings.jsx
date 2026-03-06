import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck, Search, CheckCircle, Clock, Download,
  XCircle, ChevronDown
} from "lucide-react";

import { api } from "../../utils/api.js";

const STATUS_CONFIG = {
  paid: { label: "Confirmed", color: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-500", icon: CheckCircle },
  pending: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-100", dot: "bg-amber-400", icon: Clock },
  cancelled: { label: "Cancelled", color: "bg-rose-50 text-rose-600 border-rose-100", dot: "bg-rose-400", icon: XCircle },
};

export default function PartnerBookings() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!user?.email) return;

    api.getPartnerBookings()
      .then(data => {
        setBookings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user?.email]);

  const visible = bookings.filter(b => {
    const matchStatus = filter === "all" || b.status === filter;
    const matchSearch = !search ||
      b.guestEmail?.toLowerCase().includes(search.toLowerCase()) ||
      b.title?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    all: bookings.length,
    paid: bookings.filter(b => b.status === "paid").length,
    pending: bookings.filter(b => b.status === "pending").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
  };

  const totalRevenue = visible.filter(b => b.status === "paid").reduce((s, b) => s + (b.totalPrice || 0), 0);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
      <p className="text-sm font-semibold text-slate-500">Loading reservations...</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 font-sans pb-20">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide">
            <CalendarCheck size={14} /> Reservations
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            Booking <span className="text-emerald-500">Register</span>
          </h1>
          <p className="text-slate-500 text-sm">
            {bookings.length} total {bookings.length === 1 ? "reservation" : "reservations"} across your properties.
          </p>
        </div>
        <button className="h-10 px-5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors">
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* FILTERS + SEARCH */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { key: "all", label: "All" },
            { key: "paid", label: "Confirmed" },
            { key: "pending", label: "Pending" },
            { key: "cancelled", label: "Cancelled" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all flex items-center gap-2 border ${filter === tab.key
                ? "bg-slate-900 text-white border-slate-900 shadow-md"
                : "bg-white text-slate-500 border-slate-200 hover:text-slate-900 hover:border-slate-300"}`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${filter === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search guest or property..."
            className="h-10 w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
          />
        </div>
      </div>

      {/* TABLE / EMPTY */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">

        {visible.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center gap-4">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
              <CalendarCheck size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No reservations found</h3>
            <p className="text-slate-500 text-sm max-w-xs">
              {search || filter !== "all"
                ? "Try adjusting your search or filter."
                : "Your bookings will appear here once guests start reserving your properties."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">Property</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">Guest</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">Dates</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence>
                  {visible.map((b, i) => {
                    const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                    const StatusIcon = cfg.icon;
                    return (
                      <motion.tr
                        key={b._id || i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center font-bold text-sm border border-emerald-100">
                              {(b.title || "W").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-sm truncate max-w-[160px]">{b.title || "Untitled"}</p>
                              <p className="text-xs text-slate-400">#{b._id?.slice(-6).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-xs text-slate-600">
                              {(b.guestEmail || "G").charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-slate-700 truncate max-w-[120px]">
                              {b.guestEmail?.split("@")[0]}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-700 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-slate-400">In:</span>
                              <span>{b.checkIn}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-slate-400">Out:</span>
                              <span>{b.checkOut}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${cfg.color}`}>
                            <StatusIcon size={12} />
                            {cfg.label}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <span className="text-base font-bold text-slate-900">₹{(b.totalPrice || 0).toLocaleString()}</span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className="text-xs font-semibold text-slate-500">
                Showing {visible.length} of {bookings.length} reservations
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Confirmed Revenue:</span>
                <span className="text-lg font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
