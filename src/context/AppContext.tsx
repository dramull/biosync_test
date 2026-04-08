import { useState, useCallback, type ReactNode } from 'react';
import type { UserProfile, MealEntry, WorkoutEntry } from '../types';
import { DEMO_USER, DEMO_MEALS, DEMO_WORKOUTS } from '../data/demo';
import { isSupabaseConfigured, getSupabase } from '../services/supabase';
import { AppContext } from './appContextDef';

interface AppState {
  isDemo: boolean;
  user: UserProfile | null;
  meals: MealEntry[];
  workouts: WorkoutEntry[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    isDemo: false,
    user: null,
    meals: [],
    workouts: [],
    isAuthenticated: false,
    isLoading: false,
  });

  const loginDemo = useCallback(() => {
    setState({
      isDemo: true,
      user: DEMO_USER,
      meals: [...DEMO_MEALS],
      workouts: [...DEMO_WORKOUTS],
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      throw new Error('Supabase not configured. Use demo mode.');
    }
    setState(s => ({ ...s, isLoading: true }));
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setState(s => ({ ...s, isLoading: false }));
      throw error;
    }
    setState(s => ({
      ...s,
      isAuthenticated: true,
      isLoading: false,
      isDemo: false,
      user: { id: 'live-user', email, gender: '', age: 0, bmi: 0, created_at: new Date().toISOString() },
    }));
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      throw new Error('Supabase not configured. Use demo mode.');
    }
    setState(s => ({ ...s, isLoading: true }));
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setState(s => ({ ...s, isLoading: false }));
      throw error;
    }
    setState(s => ({ ...s, isLoading: false }));
  }, []);

  const logout = useCallback(() => {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      supabase.auth.signOut();
    }
    setState({
      isDemo: false,
      user: null,
      meals: [],
      workouts: [],
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const setUser = useCallback((user: UserProfile) => {
    setState(s => ({ ...s, user }));
  }, []);

  const addMeal = useCallback((meal: MealEntry) => {
    setState(s => ({ ...s, meals: [meal, ...s.meals] }));
  }, []);

  const addWorkout = useCallback((workout: WorkoutEntry) => {
    setState(s => ({ ...s, workouts: [workout, ...s.workouts] }));
  }, []);

  return (
    <AppContext.Provider value={{ ...state, loginDemo, loginWithEmail, signUpWithEmail, logout, setUser, addMeal, addWorkout }}>
      {children}
    </AppContext.Provider>
  );
}
