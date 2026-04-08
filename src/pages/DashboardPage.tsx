import { useApp } from '../hooks/useApp';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import MacroBar from '../components/MacroBar';
import { DEMO_RECOMMENDATIONS, generateDemoNutritionData, generateDemoFitnessData } from '../data/demo';
import { useMemo } from 'react';
import {
  Plus,
  UtensilsCrossed,
  Dumbbell,
  Flame,
  TrendingUp,
  LogOut,
  Sparkles,
} from 'lucide-react';
import type { Recommendation } from '../types';

function priorityColor(p: string) {
  if (p === 'high') return 'text-red-400';
  if (p === 'medium') return 'text-yellow-400';
  return 'text-biosync-400';
}

function typeIcon(t: string) {
  if (t === 'nutrition') return UtensilsCrossed;
  if (t === 'fitness') return Dumbbell;
  return Sparkles;
}

export default function DashboardPage() {
  const { user, meals, workouts, logout } = useApp();
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split('T')[0];

  const todayMeals = meals.filter(m => m.date === todayStr);
  const todayWorkouts = workouts.filter(w => w.date === todayStr);

  const todayCalories = todayMeals.reduce((s, m) => s + m.calories, 0);
  const todayProtein = todayMeals.reduce((s, m) => s + m.protein, 0);
  const todayCarbs = todayMeals.reduce((s, m) => s + m.carbs, 0);
  const todayFat = todayMeals.reduce((s, m) => s + m.fat, 0);
  const todayBurned = todayWorkouts.reduce((s, w) => s + w.calories_burned, 0);

  const nutritionData = useMemo(() => generateDemoNutritionData(), []);
  const fitnessData = useMemo(() => generateDemoFitnessData(), []);
  const weekAvgCal = useMemo(() => {
    const last7 = nutritionData.slice(-7);
    return Math.round(last7.reduce((s, d) => s + d.calories, 0) / 7);
  }, [nutritionData]);
  const weekTotalBurned = useMemo(() => {
    const last7 = fitnessData.slice(-7);
    return last7.reduce((s, d) => s + d.calories_burned, 0);
  }, [fitnessData]);

  return (
    <PageShell>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-white/40">Welcome back</p>
          <h2 className="text-xl font-bold tracking-tight">{user?.name || 'User'}</h2>
        </div>
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="rounded-xl p-2 text-white/30 hover:bg-white/[0.06] hover:text-white/60 transition-all"
          aria-label="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* Today summary card */}
      <div className="glass mb-4 rounded-3xl p-5 animate-fade-in">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Today</span>
          <span className="text-xs text-white/30">{todayStr}</span>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-orange-400">
              <Flame size={14} />
              <span className="text-lg font-bold tabular-nums">{todayCalories}</span>
            </div>
            <p className="text-[10px] text-white/40">Eaten</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-biosync-400">
              <Dumbbell size={14} />
              <span className="text-lg font-bold tabular-nums">{todayBurned}</span>
            </div>
            <p className="text-[10px] text-white/40">Burned</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-blue-400">
              <TrendingUp size={14} />
              <span className="text-lg font-bold tabular-nums">{todayCalories - todayBurned}</span>
            </div>
            <p className="text-[10px] text-white/40">Net</p>
          </div>
        </div>

        <div className="space-y-3">
          <MacroBar label="Protein" value={todayProtein} max={180} color="#4ade80" />
          <MacroBar label="Carbs" value={todayCarbs} max={300} color="#60a5fa" />
          <MacroBar label="Fat" value={todayFat} max={80} color="#fbbf24" />
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-4 grid grid-cols-2 gap-3 animate-slide-up">
        <button
          onClick={() => navigate('/meals')}
          className="glass flex items-center gap-3 rounded-2xl p-4 text-left transition-all hover:bg-white/[0.06] active:scale-[0.98]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15">
            <Plus size={18} className="text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-medium">Log Meal</p>
            <p className="text-[10px] text-white/40">{todayMeals.length} today</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/workouts')}
          className="glass flex items-center gap-3 rounded-2xl p-4 text-left transition-all hover:bg-white/[0.06] active:scale-[0.98]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-biosync-500/15">
            <Plus size={18} className="text-biosync-400" />
          </div>
          <div>
            <p className="text-sm font-medium">Log Workout</p>
            <p className="text-[10px] text-white/40">{todayWorkouts.length} today</p>
          </div>
        </button>
      </div>

      {/* Weekly summary */}
      <div className="glass mb-4 rounded-3xl p-5 animate-slide-up" style={{ animationDelay: '0.05s' }}>
        <span className="text-xs font-medium text-white/40 uppercase tracking-wider">7-Day Average</span>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold tabular-nums">{weekAvgCal}</p>
            <p className="text-[10px] text-white/40">cal / day</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold tabular-nums text-biosync-400">{weekTotalBurned}</p>
            <p className="text-[10px] text-white/40">cal burned</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h3 className="mb-3 text-xs font-medium text-white/40 uppercase tracking-wider">Recommendations</h3>
        <div className="space-y-2">
          {DEMO_RECOMMENDATIONS.slice(0, 3).map((rec: Recommendation) => {
            const Icon = typeIcon(rec.type);
            return (
              <div key={rec.id} className="glass rounded-2xl p-4">
                <div className="mb-1 flex items-center gap-2">
                  <Icon size={14} className={priorityColor(rec.priority)} />
                  <span className="text-sm font-medium">{rec.title}</span>
                </div>
                <p className="text-xs text-white/40 leading-relaxed">{rec.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
