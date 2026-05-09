export type Gender = 'male' | 'female';
export type DietType = 'omnivore' | 'vegetarian' | 'vegan' | 'keto' | 'paleo';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type GoalType =
  | 'weight_loss'
  | 'weight_gain'
  | 'muscle_gain'
  | 'cardio_endurance'
  | 'longevity'
  | 'energy'
  | 'flexibility'
  | 'daily_functioning';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type ExerciseCategory = 'strength' | 'cardio' | 'flexibility' | 'hiit' | 'yoga';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface DailyTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  steps: number;
  water: number;
  workoutsPerWeek: number;
  sleepHours: number;
}

export interface FamilyMember {
  id: string;
  name: string;
  firstName: string;
  age: number;
  gender: Gender;
  height: number;
  weight: number;
  targetWeight?: number;
  bloodType?: string;
  profileColor: string;
  profileGradient: [string, string];
  goals: GoalType[];
  conditions: string[];
  dietType: DietType;
  activityLevel: ActivityLevel;
  isAdmin: boolean;
  dailyTargets: DailyTargets;
  bio: string;
  emoji: string;
}

export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface FoodItem {
  id: string;
  name: string;
  nameHindi?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  macros: Macros;
  category: string;
  isIndian: boolean;
  emoji: string;
}

export interface LoggedFood {
  food: FoodItem;
  quantity: number;
}

export interface MealLog {
  id: string;
  memberId: string;
  date: string;
  mealType: MealType;
  foods: LoggedFood[];
  photoUri?: string;
  notes?: string;
  timestamp: number;
}

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroups: string[];
  equipment: string[];
  difficulty: Difficulty;
  description: string;
  caloriesPerMinute: number;
  emoji: string;
  isCompound: boolean;
}

export interface ExerciseSet {
  setNumber: number;
  reps?: number;
  weight?: number;
  duration?: number;
  completed: boolean;
}

export interface LoggedExercise {
  exercise: Exercise;
  sets: ExerciseSet[];
}

export interface WorkoutSession {
  id: string;
  memberId: string;
  date: string;
  name: string;
  exercises: LoggedExercise[];
  duration: number;
  caloriesBurned: number;
  timestamp: number;
  completed: boolean;
}

export interface DailyLog {
  date: string;
  memberId: string;
  steps: number;
  waterIntake: number;
  sleepHours: number;
  mood: number;
  weight?: number;
}

export interface HealthScore {
  overall: number;
  nutrition: number;
  fitness: number;
  activity: number;
  wellness: number;
  trend: 'up' | 'down' | 'stable';
}

export interface RecognizedFood {
  food: FoodItem;
  confidence: number;
  estimatedQuantity: number;
}

export interface AIRecognitionResult {
  foods: RecognizedFood[];
  confidence: number;
  processingTime: number;
}

export interface WeeklyInsight {
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info' | 'tip';
  emoji: string;
}
