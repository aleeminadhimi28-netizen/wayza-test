import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
    Home,
    Building2,
    Calendar,
    DollarSign,
    BarChart3,
    MessageCircle,
    Menu,
    ChevronLeft,
    Moon,
    Sun,
} from "lucide-react";

export default function PartnerLayout() {
    const navigate = useNavigate();

    /* ================= DARK MODE ================= */
    const [dark, setDark] = useState(
        localStorage.getItem("theme") === "dark"
    );

    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [dark]);

    /* ================= SIDEBAR COLLAPSE ================= */
    const [collapsed, setCollapsed] = useState(true);

    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-300">

            {/* ================= SIDEBAR ================= */}
            <aside
                className={`${collapsed ? "w-20" : "w-64"
                    } bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out`}
            >
                {/* Logo + Toggle */}
                <div className="flex items-center justify-between px-4 py-6">
                    {!collapsed && (
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                            Wayza
                        </h2>
                    )}

                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                    >
                        {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2 px-2">
                    <NavItem to="/partner" icon={<Home size={18} />} label="Dashboard" collapsed={collapsed} />
                    <NavItem to="/partner/properties" icon={<Building2 size={18} />} label="Properties" collapsed={collapsed} />
                    <NavItem to="/partner/calendar" icon={<Calendar size={18} />} label="Calendar" collapsed={collapsed} />
                    <NavItem to="/partner/earnings" icon={<DollarSign size={18} />} label="Earnings" collapsed={collapsed} />
                    <NavItem to="/partner/analytics" icon={<BarChart3 size={18} />} label="Analytics" collapsed={collapsed} />
                    <NavItem to="/partner/chat" icon={<MessageCircle size={18} />} label="Chat" collapsed={collapsed} />
                </nav>

                {/* Footer */}
                {!collapsed && (
                    <div className="p-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
                        test@wayza.com
                    </div>
                )}
            </aside>

            {/* ================= MAIN ================= */}
            <div className="flex-1 flex flex-col">

                {/* ================= TOPBAR ================= */}
                <header className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-5 transition-colors duration-300">

                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                        Dashboard
                    </h2>

                    <div className="flex items-center gap-6">

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={() => setDark(!dark)}
                            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                        >
                            {dark ? (
                                <Sun size={18} className="text-yellow-400" />
                            ) : (
                                <Moon size={18} className="text-slate-600 dark:text-slate-300" />
                            )}
                        </button>

                        {/* View Website Button */}
                        <button
                            onClick={() => navigate("/")}
                            className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition shadow-sm"
                        >
                            View Website
                        </button>

                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-slate-300 dark:bg-slate-700" />
                    </div>
                </header>

                {/* ================= CONTENT ================= */}
                <main className="flex-1 overflow-y-auto px-10 py-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

/* ================= NAV ITEM ================= */
function NavItem({ to, icon, label, collapsed }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                    ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-600 dark:text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`
            }
        >
            {icon}
            {!collapsed && <span>{label}</span>}
        </NavLink>
    );
}