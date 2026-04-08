export interface UserProfile {
  id: string;
  email: string;
  gender: string;
  age: number;
  bmi: number;
  height_cm?: number;
  weight_kg?: number;
  name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface MealEntry {
  id: string;
  user_id: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  ingredients: Ingredient[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  image_url?: string;
  input_method: 'photo' | 'voice' | 'manual';
  created_at: string;
}

export interface Ingredient {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface WorkoutEntry {
  id: string;
  user_id: string;
  date: string;
  workout_type: string;
  description: string;
  exercises: Exercise[];
  duration_minutes: number;
  calories_burned: number;
  intensity: 'low' | 'moderate' | 'high';
  input_method: 'voice' | 'photo' | 'manual';
  created_at: string;
}

export interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  weight_kg?: number;
  duration_minutes?: number;
  distance_km?: number;
}

export interface DailyNutrition {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: number;
}

export interface DailyFitness {
  date: string;
  calories_burned: number;
  duration_minutes: number;
  workouts: number;
}

export interface Recommendation {
  id: string;
  type: 'nutrition' | 'fitness' | 'recovery' | 'general';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}
