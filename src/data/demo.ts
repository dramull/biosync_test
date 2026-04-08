import type { UserProfile, MealEntry, WorkoutEntry, DailyNutrition, DailyFitness, Recommendation } from '../types';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export const DEMO_USER: UserProfile = {
  id: 'demo-user-001',
  email: 'demo@biosync.app',
  gender: 'male',
  age: 28,
  bmi: 23.5,
  height_cm: 178,
  weight_kg: 74,
  name: 'Alex Demo',
  created_at: daysAgo(30),
};

export const DEMO_MEALS: MealEntry[] = [
  {
    id: 'meal-001',
    user_id: DEMO_USER.id,
    date: daysAgo(0),
    meal_type: 'breakfast',
    description: 'Oatmeal with blueberries and almonds',
    ingredients: [
      { name: 'Oatmeal', portion: '1 cup', calories: 150, protein: 5, carbs: 27, fat: 3 },
      { name: 'Blueberries', portion: '1/2 cup', calories: 42, protein: 0.5, carbs: 11, fat: 0.2 },
      { name: 'Almonds', portion: '1 oz', calories: 164, protein: 6, carbs: 6, fat: 14 },
    ],
    calories: 356,
    protein: 11.5,
    carbs: 44,
    fat: 17.2,
    input_method: 'photo',
    created_at: daysAgo(0),
  },
  {
    id: 'meal-002',
    user_id: DEMO_USER.id,
    date: daysAgo(0),
    meal_type: 'lunch',
    description: 'Grilled chicken salad with quinoa',
    ingredients: [
      { name: 'Chicken breast', portion: '6 oz', calories: 284, protein: 53, carbs: 0, fat: 6 },
      { name: 'Mixed greens', portion: '2 cups', calories: 18, protein: 1.5, carbs: 3, fat: 0.2 },
      { name: 'Quinoa', portion: '1/2 cup', calories: 111, protein: 4, carbs: 20, fat: 2 },
      { name: 'Olive oil dressing', portion: '2 tbsp', calories: 120, protein: 0, carbs: 1, fat: 14 },
    ],
    calories: 533,
    protein: 58.5,
    carbs: 24,
    fat: 22.2,
    input_method: 'photo',
    created_at: daysAgo(0),
  },
  {
    id: 'meal-003',
    user_id: DEMO_USER.id,
    date: daysAgo(1),
    meal_type: 'dinner',
    description: 'Salmon with roasted vegetables and rice',
    ingredients: [
      { name: 'Salmon fillet', portion: '6 oz', calories: 350, protein: 34, carbs: 0, fat: 22 },
      { name: 'Brown rice', portion: '1 cup', calories: 216, protein: 5, carbs: 45, fat: 2 },
      { name: 'Roasted vegetables', portion: '1.5 cups', calories: 90, protein: 3, carbs: 15, fat: 3 },
    ],
    calories: 656,
    protein: 42,
    carbs: 60,
    fat: 27,
    input_method: 'voice',
    created_at: daysAgo(1),
  },
];

export const DEMO_WORKOUTS: WorkoutEntry[] = [
  {
    id: 'workout-001',
    user_id: DEMO_USER.id,
    date: daysAgo(0),
    workout_type: 'Strength Training',
    description: 'Upper body push workout',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 8, weight_kg: 80 },
      { name: 'Overhead Press', sets: 3, reps: 10, weight_kg: 40 },
      { name: 'Incline Dumbbell Press', sets: 3, reps: 12, weight_kg: 28 },
      { name: 'Tricep Dips', sets: 3, reps: 15 },
    ],
    duration_minutes: 55,
    calories_burned: 420,
    intensity: 'high',
    input_method: 'voice',
    created_at: daysAgo(0),
  },
  {
    id: 'workout-002',
    user_id: DEMO_USER.id,
    date: daysAgo(1),
    workout_type: 'Cardio',
    description: 'Morning run in the park',
    exercises: [
      { name: 'Running', duration_minutes: 35, distance_km: 5.2 },
    ],
    duration_minutes: 35,
    calories_burned: 380,
    intensity: 'moderate',
    input_method: 'voice',
    created_at: daysAgo(1),
  },
  {
    id: 'workout-003',
    user_id: DEMO_USER.id,
    date: daysAgo(2),
    workout_type: 'Strength Training',
    description: 'Lower body workout',
    exercises: [
      { name: 'Squats', sets: 4, reps: 10, weight_kg: 100 },
      { name: 'Romanian Deadlifts', sets: 3, reps: 10, weight_kg: 70 },
      { name: 'Leg Press', sets: 3, reps: 12, weight_kg: 140 },
      { name: 'Calf Raises', sets: 4, reps: 15, weight_kg: 60 },
    ],
    duration_minutes: 60,
    calories_burned: 480,
    intensity: 'high',
    input_method: 'voice',
    created_at: daysAgo(2),
  },
];

export function generateDemoNutritionData(): DailyNutrition[] {
  const data: DailyNutrition[] = [];
  for (let i = 13; i >= 0; i--) {
    const base = 1800 + Math.floor(Math.random() * 600);
    data.push({
      date: daysAgo(i),
      calories: base,
      protein: 100 + Math.floor(Math.random() * 80),
      carbs: 180 + Math.floor(Math.random() * 100),
      fat: 50 + Math.floor(Math.random() * 40),
      meals: 2 + Math.floor(Math.random() * 2),
    });
  }
  return data;
}

export function generateDemoFitnessData(): DailyFitness[] {
  const data: DailyFitness[] = [];
  for (let i = 13; i >= 0; i--) {
    const hasWorkout = Math.random() > 0.3;
    data.push({
      date: daysAgo(i),
      calories_burned: hasWorkout ? 300 + Math.floor(Math.random() * 300) : 0,
      duration_minutes: hasWorkout ? 30 + Math.floor(Math.random() * 40) : 0,
      workouts: hasWorkout ? 1 : 0,
    });
  }
  return data;
}

export const DEMO_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec-001',
    type: 'nutrition',
    title: 'Increase protein intake',
    description: 'Your average protein intake is below optimal for muscle recovery. Aim for 1.6-2.2g per kg bodyweight. Try adding a protein shake post-workout.',
    priority: 'high',
  },
  {
    id: 'rec-002',
    type: 'fitness',
    title: 'Add active recovery days',
    description: 'Consider adding yoga or light stretching on rest days to improve flexibility and reduce muscle soreness.',
    priority: 'medium',
  },
  {
    id: 'rec-003',
    type: 'recovery',
    title: 'Optimize sleep schedule',
    description: 'Consistent sleep timing improves recovery. Aim for 7-9 hours and keep wake times consistent within 30 minutes.',
    priority: 'high',
  },
  {
    id: 'rec-004',
    type: 'nutrition',
    title: 'More fiber-rich foods',
    description: 'Increase fiber intake to 25-30g daily with vegetables, legumes, and whole grains for improved digestion and satiety.',
    priority: 'low',
  },
  {
    id: 'rec-005',
    type: 'general',
    title: 'Stay hydrated',
    description: 'Track water intake. Aim for at least 2.5L daily, more on workout days. Proper hydration improves performance and recovery.',
    priority: 'medium',
  },
];
