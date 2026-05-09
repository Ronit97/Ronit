import { create } from 'zustand';
import {
  FamilyMember,
  MealLog,
  WorkoutSession,
  DailyLog,
  HealthScore,
  LoggedFood,
  LoggedExercise,
} from '../types';
import { FAMILY_MEMBERS } from '../data/profiles';
import * as storage from '../services/storage';
import {
  calculateHealthScore,
} from '../services/healthScore';

interface AppState {
  // Auth
  activeMember: FamilyMember | null;
  isLoading: boolean;

  // Today's data
  todaysMeals: MealLog[];
  todaysWorkouts: WorkoutSession[];
  todaysDailyLog: DailyLog | null;
  healthScore: HealthScore | null;

  // Actions
  setActiveMember: (member: FamilyMember) => Promise<void>;
  logout: () => void;
  loadTodaysData: () => Promise<void>;

  // Meals
  addMealLog: (
    mealType: MealLog['mealType'],
    foods: LoggedFood[],
    photoUri?: string,
    notes?: string
  ) => Promise<void>;
  deleteMealLog: (id: string) => Promise<void>;

  // Workouts
  startWorkout: (name: string, exercises: LoggedExercise[]) => Promise<WorkoutSession>;
  completeWorkout: (session: WorkoutSession) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;

  // Daily log
  updateDailyLog: (updates: Partial<DailyLog>) => Promise<void>;

  // Health score
  refreshHealthScore: () => void;

  // App init
  initialize: () => Promise<void>;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

export const useAppStore = create<AppState>((set, get) => ({
  activeMember: null,
  isLoading: true,
  todaysMeals: [],
  todaysWorkouts: [],
  todaysDailyLog: null,
  healthScore: null,

  initialize: async () => {
    set({ isLoading: true });
    const savedId = await storage.getActiveMember();
    if (savedId) {
      const member = FAMILY_MEMBERS.find((m) => m.id === savedId) ?? null;
      if (member) {
        set({ activeMember: member });
        await get().loadTodaysData();
      }
    }
    set({ isLoading: false });
  },

  setActiveMember: async (member) => {
    await storage.setActiveMember(member.id);
    set({ activeMember: member });
    await get().loadTodaysData();
  },

  logout: () => {
    set({
      activeMember: null,
      todaysMeals: [],
      todaysWorkouts: [],
      todaysDailyLog: null,
      healthScore: null,
    });
    storage.setActiveMember('');
  },

  loadTodaysData: async () => {
    const { activeMember } = get();
    if (!activeMember) return;
    const today = getTodayString();
    const [meals, workouts, dailyLog] = await Promise.all([
      storage.getMealLogsForDate(activeMember.id, today),
      storage.getWorkoutsForDate(activeMember.id, today),
      storage.getDailyLogForDate(activeMember.id, today),
    ]);
    set({ todaysMeals: meals, todaysWorkouts: workouts, todaysDailyLog: dailyLog });
    get().refreshHealthScore();
  },

  addMealLog: async (mealType, foods, photoUri, notes) => {
    const { activeMember } = get();
    if (!activeMember) return;
    const calories = foods.reduce(
      (s, lf) => s + lf.food.calories * lf.quantity,
      0
    );
    const log: MealLog = {
      id: storage.generateId(),
      memberId: activeMember.id,
      date: getTodayString(),
      mealType,
      foods,
      photoUri,
      notes,
      timestamp: Date.now(),
    };
    await storage.saveMealLog(log);
    set((s) => ({ todaysMeals: [...s.todaysMeals, log] }));
    get().refreshHealthScore();
    void calories;
  },

  deleteMealLog: async (id) => {
    await storage.deleteMealLog(id);
    set((s) => ({ todaysMeals: s.todaysMeals.filter((m) => m.id !== id) }));
    get().refreshHealthScore();
  },

  startWorkout: async (name, exercises) => {
    const { activeMember } = get();
    if (!activeMember) throw new Error('No active member');
    const session: WorkoutSession = {
      id: storage.generateId(),
      memberId: activeMember.id,
      date: getTodayString(),
      name,
      exercises,
      duration: 0,
      caloriesBurned: 0,
      timestamp: Date.now(),
      completed: false,
    };
    await storage.saveWorkoutSession(session);
    set((s) => ({ todaysWorkouts: [...s.todaysWorkouts, session] }));
    return session;
  },

  completeWorkout: async (session) => {
    await storage.saveWorkoutSession(session);
    set((s) => ({
      todaysWorkouts: s.todaysWorkouts.map((w) =>
        w.id === session.id ? session : w
      ),
    }));
    get().refreshHealthScore();
  },

  deleteWorkout: async (id) => {
    const sessions = await storage.getWorkoutSessions();
    const filtered = sessions.filter((s) => s.id !== id);
    set((s) => ({ todaysWorkouts: s.todaysWorkouts.filter((w) => w.id !== id) }));
    // persist directly
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem('@health:workoutSessions', JSON.stringify(filtered));
    get().refreshHealthScore();
  },

  updateDailyLog: async (updates) => {
    const { activeMember, todaysDailyLog } = get();
    if (!activeMember) return;
    const today = getTodayString();
    const current: DailyLog = todaysDailyLog ?? {
      date: today,
      memberId: activeMember.id,
      steps: 0,
      waterIntake: 0,
      sleepHours: 0,
      mood: 3,
    };
    const updated = { ...current, ...updates };
    await storage.saveDailyLog(updated);
    set({ todaysDailyLog: updated });
    get().refreshHealthScore();
  },

  refreshHealthScore: () => {
    const { activeMember, todaysMeals, todaysWorkouts, todaysDailyLog } = get();
    if (!activeMember) return;
    const score = calculateHealthScore(
      activeMember,
      todaysMeals,
      todaysWorkouts,
      todaysDailyLog
    );
    set({ healthScore: score });
  },
}));
