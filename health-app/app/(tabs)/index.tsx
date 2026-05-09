import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow } from '../../constants/theme';
import HealthScoreRing from '../../components/HealthScoreRing';
import MacroCard from '../../components/MacroCard';
import InsightCard from '../../components/InsightCard';
import StatPill from '../../components/StatPill';
import MealCard from '../../components/MealCard';
import { calculateMealMacros } from '../../data/foods';
import { generateInsights } from '../../services/healthScore';

export default function DashboardScreen() {
  const {
    activeMember,
    healthScore,
    todaysMeals,
    todaysWorkouts,
    todaysDailyLog,
    loadTodaysData,
    updateDailyLog,
  } = useAppStore();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTodaysData();
    setRefreshing(false);
  }, []);

  if (!activeMember) return null;

  // Aggregate today's nutrition
  const allFoods = todaysMeals.flatMap((m) => m.foods);
  const totalNutrition = allFoods.length > 0
    ? calculateMealMacros(allFoods)
    : { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

  const t = activeMember.dailyTargets;
  const score = healthScore?.overall ?? 0;
  const insights = generateInsights(activeMember, healthScore ?? {
    overall: 0, nutrition: 0, fitness: 0, activity: 0, wellness: 0, trend: 'stable'
  }, todaysDailyLog);

  const completedWorkouts = todaysWorkouts.filter((w) => w.completed).length;
  const today = new Date();
  const dayName = today.toLocaleDateString('en-IN', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  const addWater = async (ml: number) => {
    await updateDailyLog({
      waterIntake: (todaysDailyLog?.waterIntake ?? 0) + ml,
    });
  };

  return (
    <LinearGradient colors={['#0D1B2A', '#0A1628']} style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
        >
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>
                {getGreeting()}, {activeMember.firstName} {activeMember.emoji}
              </Text>
              <Text style={styles.dateLabel}>
                {dayName} · {dateStr}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/family')}
              style={styles.familyBtn}
            >
              <Text style={styles.familyBtnEmoji}>👨‍👩‍👧‍👦</Text>
            </TouchableOpacity>
          </View>

          {/* ── Health Score Hero ───────────────────────────────────────────── */}
          <View style={[styles.heroCard, Shadow.lg]}>
            <LinearGradient
              colors={activeMember.profileGradient}
              style={styles.heroGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.heroContent}>
              <View style={styles.heroLeft}>
                <Text style={styles.heroTitle}>Health Score</Text>
                <Text style={styles.heroBio} numberOfLines={2}>
                  {activeMember.bio}
                </Text>
                <View style={styles.heroGoals}>
                  {activeMember.goals.slice(0, 2).map((g) => (
                    <View key={g} style={styles.heroGoalChip}>
                      <Text style={styles.heroGoalText}>
                        {g.replace(/_/g, ' ')}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
              <HealthScoreRing score={score} size={120} strokeWidth={10} />
            </View>
          </View>

          {/* ── Daily Stats Grid ─────────────────────────────────────────────── */}
          <View style={styles.statsRow}>
            <StatPill
              emoji="👣"
              label="Steps"
              value={(todaysDailyLog?.steps ?? 0).toLocaleString()}
              subValue={`/ ${t.steps.toLocaleString()}`}
              color={Colors.accentBlue}
              progress={(todaysDailyLog?.steps ?? 0) / t.steps}
            />
            <StatPill
              emoji="💧"
              label="Water"
              value={`${((todaysDailyLog?.waterIntake ?? 0) / 1000).toFixed(1)}L`}
              subValue={`/ ${(t.water / 1000).toFixed(1)}L`}
              color={Colors.info}
              progress={(todaysDailyLog?.waterIntake ?? 0) / t.water}
            />
            <StatPill
              emoji="🏋️"
              label="Workouts"
              value={`${completedWorkouts}`}
              subValue={`/ ${t.workoutsPerWeek}/wk`}
              color={Colors.accentOrange}
              progress={completedWorkouts / Math.max(1, t.workoutsPerWeek / 7)}
            />
            <StatPill
              emoji="😴"
              label="Sleep"
              value={`${todaysDailyLog?.sleepHours ?? 0}h`}
              subValue={`/ ${t.sleepHours}h`}
              color={Colors.accentPurple}
              progress={(todaysDailyLog?.sleepHours ?? 0) / t.sleepHours}
            />
          </View>

          {/* ── Quick Log Actions ─────────────────────────────────────────────── */}
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionRow}>
              <QuickAction
                emoji="📸"
                label="Log Meal"
                color={Colors.primary}
                onPress={() => router.push('/(tabs)/log')}
              />
              <QuickAction
                emoji="💪"
                label="Workout"
                color={Colors.accentOrange}
                onPress={() => router.push('/(tabs)/workouts')}
              />
              <QuickAction
                emoji="💧"
                label="+250ml"
                color={Colors.info}
                onPress={() => addWater(250)}
              />
              <QuickAction
                emoji="📊"
                label="Log Steps"
                color={Colors.accentBlue}
                onPress={() => {
                  const current = todaysDailyLog?.steps ?? 0;
                  updateDailyLog({ steps: current + 1000 });
                }}
              />
            </View>
          </View>

          {/* ── Nutrition ──────────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Nutrition</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/log')}>
                <Text style={styles.seeAll}>+ Add</Text>
              </TouchableOpacity>
            </View>
            <MacroCard
              calories={{ current: totalNutrition.calories, target: t.calories }}
              protein={{ current: totalNutrition.protein, target: t.protein }}
              carbs={{ current: totalNutrition.carbs, target: t.carbs }}
              fat={{ current: totalNutrition.fat, target: t.fat }}
            />
          </View>

          {/* ── Score Breakdown ─────────────────────────────────────────────────── */}
          {healthScore && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Score Breakdown</Text>
              <View style={styles.scoreBreakdown}>
                <ScoreBar label="Nutrition" score={healthScore.nutrition} max={25} color={Colors.primary} emoji="🥗" />
                <ScoreBar label="Fitness" score={healthScore.fitness} max={25} color={Colors.accentOrange} emoji="💪" />
                <ScoreBar label="Activity" score={healthScore.activity} max={25} color={Colors.accentBlue} emoji="👣" />
                <ScoreBar label="Wellness" score={healthScore.wellness} max={25} color={Colors.accentPurple} emoji="😌" />
              </View>
            </View>
          )}

          {/* ── Today's Meals ──────────────────────────────────────────────────── */}
          {todaysMeals.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Today's Meals</Text>
              <View style={styles.mealList}>
                {todaysMeals.map((meal) => (
                  <MealCard key={meal.id} meal={meal} />
                ))}
              </View>
            </View>
          )}

          {/* ── Insights ───────────────────────────────────────────────────────── */}
          {insights.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Insights for You</Text>
              <View style={styles.insightList}>
                {insights.map((ins, i) => (
                  <InsightCard key={i} {...ins} />
                ))}
              </View>
            </View>
          )}

          {/* ── Mood Logger ────────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How are you feeling?</Text>
            <View style={styles.moodRow}>
              {[
                { mood: 1, emoji: '😞' },
                { mood: 2, emoji: '😕' },
                { mood: 3, emoji: '😐' },
                { mood: 4, emoji: '😊' },
                { mood: 5, emoji: '😄' },
              ].map(({ mood, emoji }) => (
                <TouchableOpacity
                  key={mood}
                  style={[
                    styles.moodBtn,
                    todaysDailyLog?.mood === mood && styles.moodBtnActive,
                  ]}
                  onPress={() => updateDailyLog({ mood })}
                >
                  <Text style={styles.moodEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ height: Spacing.xl }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function QuickAction({
  emoji,
  label,
  color,
  onPress,
}: {
  emoji: string;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '22' }]}>
        <Text style={styles.quickActionEmoji}>{emoji}</Text>
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function ScoreBar({
  label,
  score,
  max,
  color,
  emoji,
}: {
  label: string;
  score: number;
  max: number;
  color: string;
  emoji: string;
}) {
  return (
    <View style={styles.scoreBarRow}>
      <Text style={styles.scoreBarEmoji}>{emoji}</Text>
      <Text style={styles.scoreBarLabel}>{label}</Text>
      <View style={styles.scoreBarTrack}>
        <View
          style={[
            styles.scoreBarFill,
            { width: `${(score / max) * 100}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={[styles.scoreBarValue, { color }]}>
        {score}/{max}
      </Text>
    </View>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
  },
  greeting: {
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  dateLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  familyBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  familyBtnEmoji: { fontSize: 22 },
  // Hero card
  heroCard: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.bgCard,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  heroLeft: { flex: 1, gap: Spacing.sm },
  heroTitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroBio: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  heroGoals: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' },
  heroGoalChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
  },
  heroGoalText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
    fontWeight: FontWeight.medium,
  },
  // Stats
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  // Quick actions
  quickActions: { gap: Spacing.sm },
  actionRow: { flexDirection: 'row', gap: Spacing.sm },
  quickAction: { flex: 1, alignItems: 'center', gap: 6 },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionEmoji: { fontSize: 24 },
  quickActionLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  // Sections
  section: { gap: Spacing.sm },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  seeAll: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  mealList: { gap: Spacing.sm },
  insightList: { gap: Spacing.sm },
  // Score breakdown
  scoreBreakdown: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  scoreBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  scoreBarEmoji: { fontSize: 16, width: 24 },
  scoreBarLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    width: 68,
    fontWeight: FontWeight.medium,
  },
  scoreBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  scoreBarValue: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    width: 32,
    textAlign: 'right',
  },
  // Mood
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  moodBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgElevated,
  },
  moodBtnActive: {
    backgroundColor: Colors.primary + '30',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  moodEmoji: { fontSize: 24 },
});
