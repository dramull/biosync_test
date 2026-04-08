import { useState, useRef } from 'react';
import { useApp } from '../hooks/useApp';
import PageShell from '../components/PageShell';
import InputModeSelector from '../components/InputModeSelector';
import MacroBar from '../components/MacroBar';
import { useCamera } from '../hooks/useCamera';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { isOpenRouterConfigured, analyzeMealPhoto, analyzeMealText } from '../services/openrouter';
import { Camera, Mic, MicOff, Send, X, ImagePlus, ChevronDown, ChevronUp } from 'lucide-react';
import type { MealEntry, Ingredient } from '../types';

type InputMode = 'photo' | 'voice' | 'manual';

export default function MealsPage() {
  const { meals, addMeal, user } = useApp();
  const [mode, setMode] = useState<InputMode>('photo');
  const [showForm, setShowForm] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  return (
    <PageShell title="Meals">
      {/* Toggle form */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-biosync-500 py-3 text-sm font-semibold text-black transition-all hover:bg-biosync-400 active:scale-[0.98]"
      >
        {showForm ? <X size={16} /> : <ImagePlus size={16} />}
        {showForm ? 'Cancel' : 'Log a Meal'}
      </button>

      {showForm && (
        <div className="mb-6 animate-slide-up">
          <InputModeSelector current={mode} onChange={setMode} photoFirst />
          <div className="mt-4">
            {mode === 'photo' && <PhotoMealInput userId={user?.id || ''} onSave={(m) => { addMeal(m); setShowForm(false); }} />}
            {mode === 'voice' && <VoiceMealInput userId={user?.id || ''} onSave={(m) => { addMeal(m); setShowForm(false); }} />}
            {mode === 'manual' && <ManualMealInput userId={user?.id || ''} onSave={(m) => { addMeal(m); setShowForm(false); }} />}
          </div>
        </div>
      )}

      {/* Meal list */}
      <div className="space-y-3">
        {meals.length === 0 && (
          <p className="py-12 text-center text-sm text-white/30">No meals logged yet. Tap above to start!</p>
        )}
        {meals.map(meal => (
          <div key={meal.id} className="glass rounded-2xl p-4">
            <button
              className="flex w-full items-center justify-between text-left"
              onClick={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-white/40 uppercase">
                    {meal.meal_type}
                  </span>
                  <span className="text-[10px] text-white/20">{meal.input_method}</span>
                </div>
                <p className="mt-1 text-sm font-medium">{meal.description}</p>
              </div>
              <div className="flex items-center gap-2 text-right">
                <div>
                  <p className="text-sm font-bold tabular-nums text-orange-400">{meal.calories}</p>
                  <p className="text-[10px] text-white/30">cal</p>
                </div>
                {expandedMeal === meal.id ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
              </div>
            </button>

            {expandedMeal === meal.id && (
              <div className="mt-3 animate-fade-in border-t border-white/[0.06] pt-3">
                <div className="mb-3 space-y-2">
                  <MacroBar label="Protein" value={meal.protein} max={60} color="#4ade80" />
                  <MacroBar label="Carbs" value={meal.carbs} max={100} color="#60a5fa" />
                  <MacroBar label="Fat" value={meal.fat} max={40} color="#fbbf24" />
                </div>
                <div className="space-y-1">
                  {meal.ingredients.map((ing, i) => (
                    <div key={i} className="flex justify-between text-xs text-white/40">
                      <span>{ing.name} · {ing.portion}</span>
                      <span className="tabular-nums">{ing.calories} cal</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </PageShell>
  );
}

/* ------ Photo Input ------ */
function PhotoMealInput({ userId, onSave }: { userId: string; onSave: (m: MealEntry) => void }) {
  const { videoRef, isActive, startCamera, stopCamera, capturePhoto } = useCamera();
  const [photo, setPhoto] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ description: string; ingredients: Ingredient[]; total: { calories: number; protein: number; carbs: number; fat: number } } | null>(null);
  const [mealType, setMealType] = useState<MealEntry['meal_type']>('lunch');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async () => {
    const dataUrl = capturePhoto();
    if (!dataUrl) return;
    setPhoto(dataUrl);
    stopCamera();
    await analyzePhoto(dataUrl);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPhoto(dataUrl);
      stopCamera();
      await analyzePhoto(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const analyzePhoto = async (dataUrl: string) => {
    if (isOpenRouterConfigured()) {
      setAnalyzing(true);
      try {
        const res = await analyzeMealPhoto(dataUrl);
        setResult(res);
      } catch {
        setResult({ description: 'Meal', ingredients: [], total: { calories: 0, protein: 0, carbs: 0, fat: 0 } });
      }
      setAnalyzing(false);
    } else {
      // Demo fallback
      setResult({
        description: 'Photographed meal',
        ingredients: [
          { name: 'Estimated serving', portion: '1 plate', calories: 450, protein: 25, carbs: 45, fat: 15 },
        ],
        total: { calories: 450, protein: 25, carbs: 45, fat: 15 },
      });
    }
  };

  const save = () => {
    if (!result) return;
    onSave({
      id: `meal-${Date.now()}`,
      user_id: userId,
      date: new Date().toISOString().split('T')[0],
      meal_type: mealType,
      description: result.description,
      ingredients: result.ingredients,
      calories: result.total.calories,
      protein: result.total.protein,
      carbs: result.total.carbs,
      fat: result.total.fat,
      input_method: 'photo',
      created_at: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-4">
      {!photo ? (
        <>
          <div className="relative h-56 overflow-hidden rounded-2xl bg-surface">
            {isActive ? (
              <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3">
                <Camera size={32} className="text-white/10" />
                <button onClick={() => startCamera('environment')} className="rounded-xl bg-white/10 px-4 py-2 text-xs font-medium">Open Camera</button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {isActive && (
              <button onClick={handleCapture} className="flex-1 rounded-xl bg-biosync-500 py-2.5 text-sm font-semibold text-black">Capture</button>
            )}
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 rounded-xl bg-white/10 py-2.5 text-sm font-medium">Upload</button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          </div>
        </>
      ) : (
        <>
          <img src={photo} alt="Meal" className="h-40 w-full rounded-2xl object-cover" />
          {analyzing && <p className="text-center text-sm text-white/40">Analyzing meal...</p>}
          {result && (
            <MealResultEditor result={result} setResult={setResult} mealType={mealType} setMealType={setMealType} onSave={save} />
          )}
        </>
      )}
    </div>
  );
}

/* ------ Voice Input ------ */
function VoiceMealInput({ userId, onSave }: { userId: string; onSave: (m: MealEntry) => void }) {
  const { isListening, transcript, startListening, stopListening, setTranscript } = useVoiceInput();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ description: string; ingredients: Ingredient[]; total: { calories: number; protein: number; carbs: number; fat: number } } | null>(null);
  const [mealType, setMealType] = useState<MealEntry['meal_type']>('lunch');

  const analyze = async () => {
    if (!transcript.trim()) return;
    if (isOpenRouterConfigured()) {
      setAnalyzing(true);
      try {
        const res = await analyzeMealText(transcript);
        setResult(res);
      } catch {
        setResult({ description: transcript, ingredients: [], total: { calories: 0, protein: 0, carbs: 0, fat: 0 } });
      }
      setAnalyzing(false);
    } else {
      setResult({
        description: transcript,
        ingredients: [{ name: 'Estimated meal', portion: '1 serving', calories: 500, protein: 30, carbs: 50, fat: 20 }],
        total: { calories: 500, protein: 30, carbs: 50, fat: 20 },
      });
    }
  };

  const save = () => {
    if (!result) return;
    onSave({
      id: `meal-${Date.now()}`,
      user_id: userId,
      date: new Date().toISOString().split('T')[0],
      meal_type: mealType,
      description: result.description,
      ingredients: result.ingredients,
      calories: result.total.calories,
      protein: result.total.protein,
      carbs: result.total.carbs,
      fat: result.total.fat,
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
          placeholder="Describe your meal..."
          rows={3}
          className="w-full resize-none bg-transparent text-sm text-white placeholder:text-white/20 outline-none"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
            isListening ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/70'
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
      {result && (
        <MealResultEditor result={result} setResult={setResult} mealType={mealType} setMealType={setMealType} onSave={save} />
      )}
    </div>
  );
}

/* ------ Manual Input ------ */
function ManualMealInput({ userId, onSave }: { userId: string; onSave: (m: MealEntry) => void }) {
  const [description, setDescription] = useState('');
  const [mealType, setMealType] = useState<MealEntry['meal_type']>('lunch');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const save = () => {
    onSave({
      id: `meal-${Date.now()}`,
      user_id: userId,
      date: new Date().toISOString().split('T')[0],
      meal_type: mealType,
      description: description || 'Meal',
      ingredients: [{ name: description || 'Meal', portion: '1 serving', calories: +calories || 0, protein: +protein || 0, carbs: +carbs || 0, fat: +fat || 0 }],
      calories: +calories || 0,
      protein: +protein || 0,
      carbs: +carbs || 0,
      fat: +fat || 0,
      input_method: 'manual',
      created_at: new Date().toISOString(),
    });
  };

  const inputClass = 'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-biosync-500/50';

  return (
    <div className="space-y-3">
      <select value={mealType} onChange={e => setMealType(e.target.value as MealEntry['meal_type'])} className={inputClass}>
        <option value="breakfast">Breakfast</option>
        <option value="lunch">Lunch</option>
        <option value="dinner">Dinner</option>
        <option value="snack">Snack</option>
      </select>
      <input type="text" placeholder="What did you eat?" value={description} onChange={e => setDescription(e.target.value)} className={inputClass} />
      <div className="grid grid-cols-2 gap-2">
        <input type="number" placeholder="Calories" value={calories} onChange={e => setCalories(e.target.value)} className={inputClass} />
        <input type="number" placeholder="Protein (g)" value={protein} onChange={e => setProtein(e.target.value)} className={inputClass} />
        <input type="number" placeholder="Carbs (g)" value={carbs} onChange={e => setCarbs(e.target.value)} className={inputClass} />
        <input type="number" placeholder="Fat (g)" value={fat} onChange={e => setFat(e.target.value)} className={inputClass} />
      </div>
      <button onClick={save} className="w-full rounded-xl bg-biosync-500 py-2.5 text-sm font-semibold text-black">Save Meal</button>
    </div>
  );
}

/* ------ Shared Result Editor ------ */
function MealResultEditor({
  result,
  setResult,
  mealType,
  setMealType,
  onSave,
}: {
  result: { description: string; ingredients: Ingredient[]; total: { calories: number; protein: number; carbs: number; fat: number } };
  setResult: (r: typeof result) => void;
  mealType: MealEntry['meal_type'];
  setMealType: (t: MealEntry['meal_type']) => void;
  onSave: () => void;
}) {
  const inputClass = 'w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-biosync-500/50';

  return (
    <div className="animate-fade-in space-y-3">
      <select value={mealType} onChange={e => setMealType(e.target.value as MealEntry['meal_type'])} className={inputClass}>
        <option value="breakfast">Breakfast</option>
        <option value="lunch">Lunch</option>
        <option value="dinner">Dinner</option>
        <option value="snack">Snack</option>
      </select>
      <input
        type="text"
        value={result.description}
        onChange={e => setResult({ ...result, description: e.target.value })}
        className={inputClass}
        placeholder="Description"
      />
      <div className="space-y-2">
        {result.ingredients.map((ing, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <input value={ing.name} onChange={e => {
              const newIng = [...result.ingredients];
              newIng[i] = { ...ing, name: e.target.value };
              setResult({ ...result, ingredients: newIng });
            }} className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-white outline-none" />
            <input value={ing.portion} onChange={e => {
              const newIng = [...result.ingredients];
              newIng[i] = { ...ing, portion: e.target.value };
              setResult({ ...result, ingredients: newIng });
            }} className="w-20 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-white outline-none" />
            <span className="tabular-nums text-white/40">{ing.calories}cal</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div className="rounded-lg bg-white/[0.04] p-2">
          <p className="font-bold tabular-nums">{result.total.calories}</p>
          <p className="text-white/30">cal</p>
        </div>
        <div className="rounded-lg bg-white/[0.04] p-2">
          <p className="font-bold tabular-nums text-green-400">{result.total.protein}g</p>
          <p className="text-white/30">protein</p>
        </div>
        <div className="rounded-lg bg-white/[0.04] p-2">
          <p className="font-bold tabular-nums text-blue-400">{result.total.carbs}g</p>
          <p className="text-white/30">carbs</p>
        </div>
        <div className="rounded-lg bg-white/[0.04] p-2">
          <p className="font-bold tabular-nums text-yellow-400">{result.total.fat}g</p>
          <p className="text-white/30">fat</p>
        </div>
      </div>
      <button onClick={onSave} className="w-full rounded-xl bg-biosync-500 py-2.5 text-sm font-semibold text-black">Save Meal</button>
    </div>
  );
}
