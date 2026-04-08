import { createContext } from 'react';
import type { UserProfile, MealEntry, WorkoutEntry } from '../types';

interface AppState {
  isDemo: boolean;
  user: UserProfile | null;
  meals: MealEntry[];
  workouts: WorkoutEntry[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AppContextValue extends AppState {
  loginDemo: () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: UserProfile) => void;
  addMeal: (meal: MealEntry) => void;
  addWorkout: (workout: WorkoutEntry) => void;
}

export const AppContext = createContext<AppContextValue | null>(null);
