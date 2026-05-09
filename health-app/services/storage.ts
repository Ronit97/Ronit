import AsyncStorage from '@react-native-async-storage/async-storage';
import { MealLog, WorkoutSession, DailyLog } from '../types';

const KEYS = {
  ACTIVE_MEMBER: '@health:activeMember',
  MEAL_LOGS: '@health:mealLogs',
  WORKOUT_SESSIONS: '@health:workoutSessions',
  DAILY_LOGS: '@health:dailyLogs',
  FIRST_LAUNCH: '@health:firstLaunch',
} as const;

// ── Generic helpers ──────────────────────────────────────────────────────────

async function get<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

async function set<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// ── Active member ─────────────────────────────────────────────────────────────

export const getActiveMember = () => get<string>(KEYS.ACTIVE_MEMBER);
export const setActiveMember = (id: string) => set(KEYS.ACTIVE_MEMBER, id);

// ── Meal logs ─────────────────────────────────────────────────────────────────

export const getMealLogs = async (): Promise<MealLog[]> =>
  (await get<MealLog[]>(KEYS.MEAL_LOGS)) ?? [];

export const saveMealLog = async (log: MealLog): Promise<void> => {
  const logs = await getMealLogs();
  const idx = logs.findIndex((l) => l.id === log.id);
  if (idx >= 0) logs[idx] = log;
  else logs.push(log);
  await set(KEYS.MEAL_LOGS, logs);
};

export const deleteMealLog = async (id: string): Promise<void> => {
  const logs = await getMealLogs();
  await set(
    KEYS.MEAL_LOGS,
    logs.filter((l) => l.id !== id)
  );
};

export const getMealLogsForDate = async (
  memberId: string,
  date: string
): Promise<MealLog[]> => {
  const all = await getMealLogs();
  return all.filter((l) => l.memberId === memberId && l.date === date);
};

// ── Workout sessions ──────────────────────────────────────────────────────────

export const getWorkoutSessions = async (): Promise<WorkoutSession[]> =>
  (await get<WorkoutSession[]>(KEYS.WORKOUT_SESSIONS)) ?? [];

export const saveWorkoutSession = async (session: WorkoutSession): Promise<void> => {
  const sessions = await getWorkoutSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) sessions[idx] = session;
  else sessions.push(session);
  await set(KEYS.WORKOUT_SESSIONS, sessions);
};

export const getWorkoutsForDate = async (
  memberId: string,
  date: string
): Promise<WorkoutSession[]> => {
  const all = await getWorkoutSessions();
  return all.filter((s) => s.memberId === memberId && s.date === date);
};

export const getWorkoutsThisWeek = async (
  memberId: string
): Promise<WorkoutSession[]> => {
  const all = await getWorkoutSessions();
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  return all.filter(
    (s) =>
      s.memberId === memberId &&
      s.completed &&
      new Date(s.date) >= weekAgo
  );
};

// ── Daily logs ────────────────────────────────────────────────────────────────

export const getDailyLogs = async (): Promise<DailyLog[]> =>
  (await get<DailyLog[]>(KEYS.DAILY_LOGS)) ?? [];

export const saveDailyLog = async (log: DailyLog): Promise<void> => {
  const logs = await getDailyLogs();
  const idx = logs.findIndex(
    (l) => l.memberId === log.memberId && l.date === log.date
  );
  if (idx >= 0) logs[idx] = log;
  else logs.push(log);
  await set(KEYS.DAILY_LOGS, logs);
};

export const getDailyLogForDate = async (
  memberId: string,
  date: string
): Promise<DailyLog | null> => {
  const all = await getDailyLogs();
  return all.find((l) => l.memberId === memberId && l.date === date) ?? null;
};

export const getRecentDailyLogs = async (
  memberId: string,
  days: number
): Promise<DailyLog[]> => {
  const all = await getDailyLogs();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return all
    .filter(
      (l) => l.memberId === memberId && new Date(l.date) >= cutoff
    )
    .sort((a, b) => a.date.localeCompare(b.date));
};

// ── Utilities ─────────────────────────────────────────────────────────────────

export const getTodayString = (): string =>
  new Date().toISOString().split('T')[0];

export const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const isFirstLaunch = async (): Promise<boolean> => {
  const val = await get<boolean>(KEYS.FIRST_LAUNCH);
  if (val === null) {
    await set(KEYS.FIRST_LAUNCH, false);
    return true;
  }
  return false;
};

export const clearAllData = async (): Promise<void> => {
  await AsyncStorage.multiRemove(Object.values(KEYS));
};
