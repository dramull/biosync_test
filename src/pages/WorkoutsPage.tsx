import { useState } from 'react';
import { useApp } from '../hooks/useApp';
import PageShell from '../components/PageShell';
import InputModeSelector from '../components/InputModeSelector';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { isOpenRouterConfigured, analyzeWorkoutText } from '../services/openrouter';
import { Mic, MicOff, Send, X, Plus, ChevronDown, ChevronUp, Dumbbell, Timer, Flame } from 'lucide-react';
import type { WorkoutEntry, Exercise } from '../types';

type InputMode = 'photo' | 'voice' | 'manual';

export default function WorkoutsPage() {
  const { workouts, addWorkout, user } = useApp();
  const [mode, setMode] = useState<InputMode>('voice');
  const [showForm, setShowForm] = useState(false);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);

  return (
    <PageShell title="Workouts">
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-biosync-500 py-3 text-sm font-semibold text-black transition-all hover:bg-biosync-400 active:scale-[0.98]"
      >
        {showForm ? <X size={16} /> : <Plus size={16} />}
        {showForm ? 'Cancel' : 'Log a Workout'}
      </button>

      {showForm && (
        <div className="mb-6 animate-slide-up">
          <InputModeSelector current={mode} onChange={setMode} photoFirst={false} />
          <div className="mt-4">
            {mode === 'voice' && <VoiceWorkoutInput userId={user?.id || ''} onSave={(w) => { addWorkout(w); setShowForm(false); }} />}
            {mode === 'photo' && <PhotoWorkoutInput userId={user?.id || ''} onSave={(w) => { addWorkout(w); setShowForm(false); }} />}
            {mode === 'manual' && <ManualWorkoutInput userId={user?.id || ''} onSave={(w) => { addWorkout(w); setShowForm(false); }} />}
          </div>
        </div>
      )}

      {/* Workout list */}
      <div className="space-y-3">
        {workouts.length === 0 && (
          <p className="py-12 text-center text-sm text-white/30">No workouts logged yet.</p>
        )}
        {workouts.map(w => (
          <div key={w.id} className="glass rounded-2xl p-4">
            <button
              className="flex w-full items-center justify-between text-left"
              onClick={() => setExpandedWorkout(expandedWorkout === w.id ? null : w.id)}
            >
              <div>
                <span className="rounded-lg bg-biosync-500/10 px-2 py-0.5 text-[10px] font-medium text-biosync-400 uppercase">
                  {w.workout_type}
                </span>
                <p className="mt-1 text-sm font-medium">{w.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-white/40">
                    <Timer size={12} />{w.duration_minutes}m
                  </div>
                  <div className="flex items-center gap-1 text-xs text-biosync-400">
                    <Flame size={12} />{w.calories_burned}
                  </div>
                </div>
                {expandedWorkout === w.id ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
              </div>
            </button>

            {expandedWorkout === w.id && (
              <div className="mt-3 animate-fade-in border-t border-white/[0.06] pt-3 space-y-1.5">
                {w.exercises.map((ex, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-white/50">
                    <span className="flex items-center gap-1.5">
                      <Dumbbell size={10} className="text-white/20" />
                      {ex.name}
                    </span>
                    <span className="tabular-nums text-white/30">
                      {ex.sets && ex.reps && `${ex.sets}×${ex.reps}`}
                      {ex.weight_kg && ` @ ${ex.weight_kg}kg`}
                      {ex.duration_minutes && `${ex.duration_minutes}min`}
                      {ex.distance_km && ` · ${ex.distance_km}km`}
                    </span>
                  </div>
                ))}
                <div className="mt-2 flex items-center gap-1 text-[10px] text-white/20">
                  <span>Intensity: </span>
                  <span className={`font-medium ${w.intensity === 'high' ? 'text-red-400' : w.intensity === 'moderate' ? 'text-yellow-400' : 'text-biosync-400'}`}>
                    {w.intensity}
                  </span>
                  <span className="ml-2">· {w.input_method}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </PageShell>
  );
}

/* ------ Voice Input ------ */
function VoiceWorkoutInput({ userId, onSave }: { userId: string; onSave: (w: WorkoutEntry) => void }) {
  const { isListening, transcript, startListening, stopListening, setTranscript } = useVoiceInput();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    workout_type: string;
    exercises: Exercise[];
    duration_minutes: number;
    calories_burned: number;
    intensity: 'low' | 'moderate' | 'high';
  } | null>(null);

  const analyze = async () => {
    if (!transcript.trim()) return;
    if (isOpenRouterConfigured()) {
      setAnalyzing(true);
      try {
        const res = await analyzeWorkoutText(transcript);
        setResult(res);
      } catch {
        setResult({ workout_type: 'Workout', exercises: [], duration_minutes: 30, calories_burned: 200, intensity: 'moderate' });
      }
      setAnalyzing(false);
    } else {
      setResult({
        workout_type: 'General Workout',
        exercises: [{ name: transcript.slice(0, 50), duration_minutes: 30 }],
        duration_minutes: 30,
        calories_burned: 250,
        intensity: 'moderate',
      });
    }
  };

  const save = () => {
    if (!result) return;
    onSave({
      id: `workout-${Date.now()}`,
      user_id: userId,
      date: new Date().toISOString().split('T')[0],
      workout_type: result.workout_type,
      description: transcript,
      exercises: result.exercises,
      duration_minutes: result.duration_minutes,
      calories_burned: result.calories_burned,
      intensity: result.intensity,
      input_method: 'voice',
      created_at: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4">
        <textarea
          value={transcript}
          onChange={e => setTranscript(e.target.value)}
          placeholder="Describe your workout... e.g. 'Did 4 sets of bench press at 80kg, then 3 sets overhead press...'"
          rows={4}
          className="w-full resize-none bg-transparent text-sm text-white placeholder:text-white/20 outline-none"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
            isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-white/10 text-white/70'
          }`}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          {isListening ? 'Stop' : 'Record'}
        </button>
        <button
          onClick={analyze}
          disabled={!transcript.trim() || analyzing}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-biosync-500 py-2.5 text-sm font-semibold text-black disabled:opacity-30"
        >
          <Send size={14} />
          {analyzing ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>
      {result && <WorkoutResultEditor result={result} setResult={setResult} onSave={save} />}
    </div>
  );
}

/* ------ Photo Input (for workout plans/screenshots) ------ */
function PhotoWorkoutInput({ userId, onSave }: { userId: string; onSave: (w: WorkoutEntry) => void }) {
  const [text, setText] = useState('');

  const save = () => {
    onSave({
      id: `workout-${Date.now()}`,
      user_id: userId,
      date: new Date().toISOString().split('T')[0],
      workout_type: 'Workout',
      description: text || 'Photo-logged workout',
      exercises: [{ name: text || 'Workout', duration_minutes: 30 }],
      duration_minutes: 30,
      calories_burned: 200,
      intensity: 'moderate',
      input_method: 'photo',
      created_at: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-white/40">Photo analysis for workouts coming soon. Enter details manually:</p>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Describe the workout from your photo..."
        rows={3}
        className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none"
      />
      <button onClick={save} disabled={!text.trim()} className="w-full rounded-xl bg-biosync-500 py-2.5 text-sm font-semibold text-black disabled:opacity-30">Save Workout</button>
    </div>
  );
}

/* ------ Manual Input ------ */
function ManualWorkoutInput({ userId, onSave }: { userId: string; onSave: (w: WorkoutEntry) => void }) {
  const [type, setType] = useState('Strength Training');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [intensity, setIntensity] = useState<'low' | 'moderate' | 'high'>('moderate');

  const inputClass = 'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-biosync-500/50';

  const save = () => {
    onSave({
      id: `workout-${Date.now()}`,
      user_id: userId,
      date: new Date().toISOString().split('T')[0],
      workout_type: type,
      description: description || type,
      exercises: [{ name: description || type, duration_minutes: +duration || 30 }],
      duration_minutes: +duration || 30,
      calories_burned: +calories || 200,
      intensity,
      input_method: 'manual',
      created_at: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-3">
      <select value={type} onChange={e => setType(e.target.value)} className={inputClass}>
        <option value="Strength Training">Strength Training</option>
        <option value="Cardio">Cardio</option>
        <option value="HIIT">HIIT</option>
        <option value="Yoga">Yoga</option>
        <option value="Sports">Sports</option>
        <option value="Other">Other</option>
      </select>
      <input type="text" placeholder="Describe your workout" value={description} onChange={e => setDescription(e.target.value)} className={inputClass} />
      <div className="grid grid-cols-2 gap-2">
        <input type="number" placeholder="Duration (min)" value={duration} onChange={e => setDuration(e.target.value)} className={inputClass} />
        <input type="number" placeholder="Calories burned" value={calories} onChange={e => setCalories(e.target.value)} className={inputClass} />
      </div>
      <div className="flex gap-2">
        {(['low', 'moderate', 'high'] as const).map(level => (
          <button
            key={level}
            onClick={() => setIntensity(level)}
            className={`flex-1 rounded-xl py-2 text-xs font-medium transition-all ${
              intensity === level
                ? level === 'high' ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30'
                : level === 'moderate' ? 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/30'
                : 'bg-biosync-500/20 text-biosync-400 ring-1 ring-biosync-500/30'
                : 'bg-white/[0.04] text-white/40'
            }`}
          >
            {level}
          </button>
        ))}
      </div>
      <button onClick={save} className="w-full rounded-xl bg-biosync-500 py-2.5 text-sm font-semibold text-black">Save Workout</button>
    </div>
  );
}

/* ------ Result Editor ------ */
function WorkoutResultEditor({
  result,
  setResult,
  onSave,
}: {
  result: { workout_type: string; exercises: Exercise[]; duration_minutes: number; calories_burned: number; intensity: 'low' | 'moderate' | 'high' };
  setResult: (r: typeof result) => void;
  onSave: () => void;
}) {
  const inputClass = 'rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-biosync-500/50';

  return (
    <div className="animate-fade-in space-y-3">
      <input
        type="text"
        value={result.workout_type}
        onChange={e => setResult({ ...result, workout_type: e.target.value })}
        className={`w-full ${inputClass}`}
        placeholder="Workout type"
      />
      <div className="space-y-2">
        {result.exercises.map((ex, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <input
              value={ex.name}
              onChange={e => {
                const newEx = [...result.exercises];
                newEx[i] = { ...ex, name: e.target.value };
                setResult({ ...result, exercises: newEx });
              }}
              className={`flex-1 ${inputClass} text-xs`}
            />
            {ex.sets != null && (
              <span className="text-white/30 tabular-nums">{ex.sets}×{ex.reps}</span>
            )}
            {ex.weight_kg != null && (
              <span className="text-white/30 tabular-nums">{ex.weight_kg}kg</span>
            )}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg bg-white/[0.04] p-2">
          <p className="font-bold tabular-nums">{result.duration_minutes}</p>
          <p className="text-white/30">min</p>
        </div>
        <div className="rounded-lg bg-white/[0.04] p-2">
          <p className="font-bold tabular-nums text-biosync-400">{result.calories_burned}</p>
          <p className="text-white/30">cal</p>
        </div>
        <div className="rounded-lg bg-white/[0.04] p-2">
          <p className={`font-bold ${result.intensity === 'high' ? 'text-red-400' : result.intensity === 'moderate' ? 'text-yellow-400' : 'text-biosync-400'}`}>
            {result.intensity}
          </p>
          <p className="text-white/30">intensity</p>
        </div>
      </div>
      <button onClick={onSave} className="w-full rounded-xl bg-biosync-500 py-2.5 text-sm font-semibold text-black">Save Workout</button>
    </div>
  );
}
