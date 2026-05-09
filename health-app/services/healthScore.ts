import { FamilyMember, MealLog, WorkoutSession, DailyLog, HealthScore } from '../types';
import { calculateMealMacros } from '../data/foods';

export const calculateHealthScore = (
  member: FamilyMember,
  todaysMeals: MealLog[],
  todaysWorkouts: WorkoutSession[],
  dailyLog: DailyLog | null
): HealthScore => {
  const nutrition = calcNutritionScore(member, todaysMeals);
  const fitness = calcFitnessScore(member, todaysWorkouts);
  const activity = calcActivityScore(member, dailyLog);
  const wellness = calcWellnessScore(member, dailyLog);
  const overall = Math.round(nutrition + fitness + activity + wellness);
  return {
    overall: Math.min(100, overall),
    nutrition,
    fitness,
    activity,
    wellness,
    trend: 'stable',
  };
};

function calcNutritionScore(member: FamilyMember, meals: MealLog[]): number {
  if (meals.length === 0) return 0;

  const allFoods = meals.flatMap((m) => m.foods);
  const totals = calculateMealMacros(allFoods);
  const t = member.dailyTargets;

  // Calorie score (0-10): penalise > 15% over/under target
  const calRatio = totals.calories / t.calories;
  const calScore = calRatio < 0.4
    ? 3
    : calRatio > 1.3
    ? 5
    : 10 - Math.abs(1 - calRatio) * 10;

  // Protein score (0-8): reward hitting protein target
  const proteinRatio = totals.protein / t.protein;
  const protScore = proteinRatio >= 0.9 ? 8 : proteinRatio * 8;

  // Meal variety score (0-4): reward eating 3+ distinct meals
  const mealTypes = new Set(meals.map((m) => m.mealType)).size;
  const varietyScore = Math.min(4, mealTypes * 1.5);

  // Fiber score (0-3): 25g+ daily fiber
  const fiberScore = Math.min(3, (totals.fiber / 25) * 3);

  return Math.min(25, Math.round(calScore + protScore + varietyScore + fiberScore));
}

function calcFitnessScore(member: FamilyMember, workouts: WorkoutSession[]): number {
  if (workouts.length === 0) return 0;

  const completed = workouts.filter((w) => w.completed);
  if (completed.length === 0) return 0;

  const totalDuration = completed.reduce((s, w) => s + w.duration, 0);
  const targetDuration = 45; // minutes

  // Duration score (0-15)
  const durScore = Math.min(15, (totalDuration / targetDuration) * 15);

  // Intensity score (0-10): based on calories burned
  const totalCals = completed.reduce((s, w) => s + w.caloriesBurned, 0);
  const intensityScore = Math.min(10, (totalCals / 300) * 10);

  return Math.min(25, Math.round(durScore + intensityScore));
}

function calcActivityScore(member: FamilyMember, dailyLog: DailyLog | null): number {
  if (!dailyLog) return 5; // baseline credit

  const stepRatio = dailyLog.steps / member.dailyTargets.steps;
  const stepScore = Math.min(18, stepRatio * 18);

  const waterRatio = dailyLog.waterIntake / member.dailyTargets.water;
  const waterScore = Math.min(7, waterRatio * 7);

  return Math.min(25, Math.round(stepScore + waterScore));
}

function calcWellnessScore(member: FamilyMember, dailyLog: DailyLog | null): number {
  if (!dailyLog) return 8; // baseline

  // Sleep score (0-12)
  const sleepRatio = dailyLog.sleepHours / member.dailyTargets.sleepHours;
  const sleepScore = sleepRatio < 0.5
    ? 3
    : sleepRatio > 1.2
    ? 10
    : Math.min(12, sleepRatio * 12);

  // Mood score (0-8): 1-5 scale → 0-8
  const moodScore = ((dailyLog.mood - 1) / 4) * 8;

  // Weight tracking bonus (0-5)
  const weightBonus = dailyLog.weight ? 5 : 2;

  return Math.min(25, Math.round(sleepScore + moodScore + weightBonus));
}

export const getScoreColor = (score: number): string => {
  if (score >= 80) return '#00D4AA';
  if (score >= 60) return '#FFD93D';
  if (score >= 40) return '#FF9F43';
  return '#FF6B6B';
};

export const getScoreLabel = (score: number): string => {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Fair';
  if (score >= 40) return 'Needs Work';
  return 'Getting Started';
};

export const generateInsights = (
  member: FamilyMember,
  score: HealthScore,
  dailyLog: DailyLog | null
): Array<{ title: string; description: string; type: 'success' | 'warning' | 'info' | 'tip'; emoji: string }> => {
  const insights = [];

  if (score.nutrition < 10) {
    insights.push({
      title: 'Log your meals',
      description: 'Start tracking food to unlock nutrition insights and hit your goals faster.',
      type: 'tip' as const,
      emoji: '🍽️',
    });
  } else if (score.nutrition >= 20) {
    insights.push({
      title: 'Nutrition on track!',
      description: `Great job hitting your ${member.dailyTargets.protein}g protein target today.`,
      type: 'success' as const,
      emoji: '✅',
    });
  }

  if (dailyLog && dailyLog.steps < member.dailyTargets.steps * 0.5) {
    insights.push({
      title: 'Move more today',
      description: `You're at ${dailyLog.steps.toLocaleString()} steps. A 20-min walk will make a big difference.`,
      type: 'warning' as const,
      emoji: '🚶',
    });
  }

  if (dailyLog && dailyLog.sleepHours < 6) {
    insights.push({
      title: 'Prioritise sleep',
      description: 'Less than 6h sleep impairs recovery and increases appetite. Aim for 7-8h tonight.',
      type: 'warning' as const,
      emoji: '😴',
    });
  }

  if (member.goals.includes('weight_loss')) {
    insights.push({
      title: 'Weight loss tip',
      description: 'High-protein meals keep you full longer. Try adding dal or paneer to lunch.',
      type: 'tip' as const,
      emoji: '💡',
    });
  }

  if (member.goals.includes('muscle_gain')) {
    insights.push({
      title: 'Muscle building',
      description: `Hit ${member.dailyTargets.protein}g protein daily and ensure 48h rest per muscle group.`,
      type: 'info' as const,
      emoji: '💪',
    });
  }

  return insights.slice(0, 3);
};
