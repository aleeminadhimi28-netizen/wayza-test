import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import { Search, ArrowUpRight, ArrowDownRight } from "lucide-react";
import CountUp from "react-countup";

const API = "http://localhost:5000";

export default function PartnerDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);

    useEffect(() => {
        if (!user?.email) return;

        const token = localStorage.getItem("token");

        fetch(`${API}/owner/bookings`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((d) => setBookings(Array.isArray(d) ? d : []));

        fetch(`${API}/partner/monthly-revenue`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((d) => d.ok && setMonthlyData(d.data));
    }, [user?.email]);

    return (
        <div className="space-y-12">

            {/* ================= KPI SECTION ================= */}
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 sm:col-span-6 xl:col-span-3">
                    <KpiCard title="Total Revenue" value={24500} trend={12} positive />
                </div>

                <div className="col-span-12 sm:col-span-6 xl:col-span-3">
                    <KpiCard title="Bookings" value={120} trend={8} positive />
                </div>

                <div className="col-span-12 sm:col-span-6 xl:col-span-3">
                    <KpiCard title="Pending" value={8} trend={-4} />
                </div>

                <div className="col-span-12 sm:col-span-6 xl:col-span-3">
                    <KpiCard title="Cancelled" value={5} trend={-2} />
                </div>
            </div>

            {/* ================= REVENUE CHART ================= */}
            {monthlyData.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-10 border border-slate-200 dark:border-slate-800">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-8">
                        Revenue Overview
                    </h3>

                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* ================= RECENT BOOKINGS ================= */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 border border-slate-200 dark:border-slate-800">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                            Recent Bookings
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Monitor your latest reservations
                        </p>
                    </div>

                    <div className="relative w-64">
                        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <div>Property</div>
                    <div>Guest</div>
                    <div>Dates</div>
                    <div>Status</div>
                    <div className="text-right">Amount</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {bookings.slice(0, 5).map((b, index) => (
                        <motion.div
                            key={b._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="grid grid-cols-5 items-center py-5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition rounded-xl"
                        >
                            <div>
                                <div className="font-medium text-slate-800 dark:text-white">
                                    {b.title}
                                </div>
                                <div className="text-xs text-slate-400">
                                    ID: {b._id.slice(-6)}
                                </div>
                            </div>

                            <div className="text-slate-500 dark:text-slate-400">
                                {b.guestEmail}
                            </div>

                            <div className="text-slate-500 dark:text-slate-400">
                                {b.checkIn} → {b.checkOut}
                            </div>

                            <div>
                                <span
                                    className={`px-3 py-1 text-xs rounded-full font-medium ${b.status === "paid"
                                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                                            : b.status === "cancelled"
                                                ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                                                : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400"
                                        }`}
                                >
                                    {b.status}
                                </span>
                            </div>

                            <div className="text-right font-semibold text-slate-800 dark:text-white">
                                ₹{b.totalPrice}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ================= COMPONENTS ================= */

function KpiCard({ title, value, trend, positive }) {
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {title}
                    </p>

                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                        <CountUp end={value} duration={1.5} separator="," />
                    </h2>
                </div>

                <div
                    className={`flex items-center gap-1 text-sm font-medium ${positive ? "text-emerald-500" : "text-red-500"
                        }`}
                >
                    {positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {trend}%
                </div>
            </div>
        </div>
    );
}