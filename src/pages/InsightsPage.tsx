import { useMemo } from 'react';
import PageShell from '../components/PageShell';
import { generateDemoNutritionData, generateDemoFitnessData, DEMO_RECOMMENDATIONS } from '../data/demo';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Sparkles } from 'lucide-react';
import type { Recommendation } from '../types';

export default function InsightsPage() {
  const nutritionData = useMemo(() => generateDemoNutritionData(), []);
  const fitnessData = useMemo(() => generateDemoFitnessData(), []);

  const chartNutrition = nutritionData.map(d => ({
    date: d.date.slice(5),
    Calories: d.calories,
    Protein: d.protein,
    Carbs: d.carbs,
  }));

  const chartFitness = fitnessData.map(d => ({
    date: d.date.slice(5),
    Burned: d.calories_burned,
    Duration: d.duration_minutes,
  }));

  return (
    <PageShell title="Insights">
      {/* Nutrition chart */}
      <section className="mb-6 animate-fade-in">
        <h3 className="mb-3 text-xs font-medium text-white/40 uppercase tracking-wider">Nutrition · 14 Days</h3>
        <div className="glass rounded-2xl p-4">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartNutrition}>
              <defs>
                <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} width={35} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
              />
              <Area type="monotone" dataKey="Calories" stroke="#f97316" fill="url(#calGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Macro breakdown */}
      <section className="mb-6 animate-slide-up">
        <h3 className="mb-3 text-xs font-medium text-white/40 uppercase tracking-wider">Macros · 14 Days</h3>
        <div className="glass rounded-2xl p-4">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartNutrition}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} width={35} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
              />
              <Bar dataKey="Protein" fill="#4ade80" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Carbs" fill="#60a5fa" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Fitness chart */}
      <section className="mb-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
        <h3 className="mb-3 text-xs font-medium text-white/40 uppercase tracking-wider">Fitness · 14 Days</h3>
        <div className="glass rounded-2xl p-4">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartFitness}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} width={35} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
              />
              <Bar dataKey="Burned" fill="#22c55e" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Duration" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* All recommendations */}
      <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h3 className="mb-3 text-xs font-medium text-white/40 uppercase tracking-wider">All Recommendations</h3>
        <div className="space-y-2">
          {DEMO_RECOMMENDATIONS.map((rec: Recommendation) => (
            <div key={rec.id} className="glass rounded-2xl p-4">
              <div className="mb-1 flex items-center gap-2">
                <Sparkles size={14} className={rec.priority === 'high' ? 'text-red-400' : rec.priority === 'medium' ? 'text-yellow-400' : 'text-biosync-400'} />
                <span className="text-sm font-medium">{rec.title}</span>
                <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  rec.priority === 'high' ? 'bg-red-500/10 text-red-400' : rec.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-biosync-500/10 text-biosync-400'
                }`}>
                  {rec.priority}
                </span>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">{rec.description}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
