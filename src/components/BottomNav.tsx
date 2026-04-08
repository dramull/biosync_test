import { useLocation, Link } from 'react-router-dom';
import { Home, UtensilsCrossed, Dumbbell, BarChart3 } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Home', icon: Home },
  { path: '/meals', label: 'Meals', icon: UtensilsCrossed },
  { path: '/workouts', label: 'Workouts', icon: Dumbbell },
  { path: '/insights', label: 'Insights', icon: BarChart3 },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] bg-black/90 backdrop-blur-xl safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 transition-all ${
                isActive
                  ? 'text-biosync-400'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.5} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
