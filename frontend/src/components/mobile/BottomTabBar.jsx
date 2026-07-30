import { Link, useLocation } from 'react-router-dom';
import { Compass, Search, Sparkles, Calendar, User } from 'lucide-react';
import { useAuth } from '../../AuthContext.jsx';

export default function BottomTabBar() {
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname;

  const navItems = [
    {
      label: 'Explore',
      path: '/',
      icon: Compass,
      exact: true,
    },
    {
      label: 'Search',
      path: '/listings',
      icon: Search,
      exact: false,
    },
    {
      label: 'AI Trip',
      path: '/ai-trip-planner',
      icon: Sparkles,
      highlight: true,
      exact: false,
    },
    {
      label: 'Trips',
      path: user ? '/my-bookings' : '/login',
      icon: Calendar,
      exact: false,
    },
    {
      label: user ? 'Account' : 'Sign In',
      path: user ? '/profile' : '/login',
      icon: User,
      exact: false,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-3 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? currentPath === item.path
            : currentPath.startsWith(item.path) && item.path !== '/';

          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-emerald-600 scale-105 font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-semibold'
              }`}
            >
              <div className="relative">
                {item.highlight ? (
                  <div className={`p-1.5 rounded-full transition-all ${isActive ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                    <Icon size={18} strokeWidth={2.5} />
                  </div>
                ) : (
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                )}
                {isActive && !item.highlight && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600" />
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'font-extrabold text-emerald-600' : 'font-medium text-slate-500'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
