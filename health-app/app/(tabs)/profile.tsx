import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow } from '../../constants/theme';
import { calculateBMI, getBMICategory, calculateTDEE } from '../../data/profiles';
import HealthScoreRing from '../../components/HealthScoreRing';

export default function ProfileScreen() {
  const { activeMember, healthScore, logout, updateDailyLog, todaysDailyLog } = useAppStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [weightInput, setWeightInput] = useState('');
  const [showWeightInput, setShowWeightInput] = useState(false);

  if (!activeMember) return null;

  const bmi = calculateBMI(activeMember.weight, activeMember.height);
  const bmiInfo = getBMICategory(bmi);
  const tdee = calculateTDEE(activeMember);
  const score = healthScore?.overall ?? 0;

  const weightProgress = activeMember.targetWeight
    ? activeMember.gender === 'female' ||
      activeMember.goals.includes('weight_loss')
      ? Math.max(
          0,
          Math.min(
            100,
            ((activeMember.weight - (activeMember.targetWeight ?? activeMember.weight)) /
              Math.max(1, activeMember.weight - (activeMember.targetWeight ?? activeMember.weight))) *
              100
          )
        )
      : Math.max(
          0,
          Math.min(
            100,
            (((activeMember.weight ?? 0) - activeMember.weight) /
              Math.max(1, (activeMember.targetWeight ?? activeMember.weight) - activeMember.weight)) *
              100
          )
        )
    : 0;

  const handleLogWeight = async () => {
    const w = parseFloat(weightInput);
    if (!isNaN(w) && w > 0 && w < 300) {
      await updateDailyLog({ weight: w });
      setShowWeightInput(false);
      setWeightInput('');
      Alert.alert('✅ Weight Logged', `${w}kg recorded for today.`);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Switch Profile',
      'Return to member selection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: () => {
            logout();
            router.replace('/(auth)');
          },
        },
      ]
    );
  };

  return (
    <LinearGradient colors={['#0D1B2A', '#0A1628']} style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Profile Hero ──────────────────────────────────────────────── */}
          <View style={[styles.heroCard, Shadow.lg]}>
            <LinearGradient
              colors={activeMember.profileGradient}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.heroContent}>
              <View style={styles.heroLeft}>
                <LinearGradient
                  colors={activeMember.profileGradient}
                  style={styles.heroBigAvatar}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.heroAvatarEmoji}>{activeMember.emoji}</Text>
                </LinearGradient>
                <Text style={styles.heroName}>{activeMember.name}</Text>
                <Text style={styles.heroAge}>
                  {activeMember.age}y · {activeMember.gender === 'male' ? 'Male' : 'Female'}
                </Text>
                {activeMember.isAdmin && (
                  <View style={styles.adminBadge}>
                    <Text style={styles.adminText}>Admin 👑</Text>
                  </View>
                )}
              </View>
              <HealthScoreRing score={score} size={110} strokeWidth={9} />
            </View>
            <Text style={styles.heroBio}>{activeMember.bio}</Text>
          </View>

          {/* ── Body Metrics ──────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Body Metrics</Text>
            <View style={[styles.metricsGrid, Shadow.sm]}>
              <MetricCell label="Height" value={`${activeMember.height} cm`} emoji="📏" />
              <MetricCell label="Weight" value={`${activeMember.weight} kg`} emoji="⚖️" />
              <MetricCell
                label="Target"
                value={`${activeMember.targetWeight ?? '-'} kg`}
                emoji="🎯"
                color={activeMember.profileColor}
              />
              <MetricCell label="BMI" value={`${bmi}`} emoji="📊" color={bmiInfo.color} note={bmiInfo.label} />
              <MetricCell label="TDEE" value={`${tdee} kcal`} emoji="🔥" />
              <MetricCell label="Blood Type" value={activeMember.bloodType ?? 'N/A'} emoji="🩸" />
            </View>
          </View>

          {/* ── Weight goal progress ─────────────────────────────────────── */}
          {activeMember.targetWeight && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Weight Goal</Text>
              <View style={styles.weightCard}>
                <View style={styles.weightRow}>
                  <View>
                    <Text style={styles.weightCurrent}>{activeMember.weight} kg</Text>
                    <Text style={styles.weightLabel}>Current</Text>
                  </View>
                  <View style={styles.weightArrow}>
                    <Text style={styles.weightArrowText}>→</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.weightTarget, { color: activeMember.profileColor }]}>
                      {activeMember.targetWeight} kg
                    </Text>
                    <Text style={styles.weightLabel}>Target</Text>
                  </View>
                </View>
                <View style={styles.weightTrack}>
                  <View
                    style={[
                      styles.weightFill,
                      {
                        width: '40%',
                        backgroundColor: activeMember.profileColor,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.weightDiff}>
                  {Math.abs(activeMember.weight - activeMember.targetWeight).toFixed(1)} kg to go
                </Text>

                {/* Log today's weight */}
                {!showWeightInput ? (
                  <TouchableOpacity
                    style={styles.logWeightBtn}
                    onPress={() => setShowWeightInput(true)}
                  >
                    <Text style={styles.logWeightText}>📝 Log Today's Weight</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.weightInputRow}>
                    <TextInput
                      style={styles.weightInput}
                      value={weightInput}
                      onChangeText={setWeightInput}
                      keyboardType="decimal-pad"
                      placeholder={`${activeMember.weight}`}
                      placeholderTextColor={Colors.textMuted}
                      returnKeyType="done"
                    />
                    <Text style={styles.weightUnit}>kg</Text>
                    <TouchableOpacity style={styles.logWeightConfirm} onPress={handleLogWeight}>
                      <Text style={styles.logWeightConfirmText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowWeightInput(false)}>
                      <Text style={styles.cancelText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* ── Goals ─────────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health Goals</Text>
            <View style={styles.goalsWrap}>
              {activeMember.goals.map((goal) => (
                <View
                  key={goal}
                  style={[styles.goalChip, { backgroundColor: activeMember.profileColor + '20', borderColor: activeMember.profileColor + '50' }]}
                >
                  <Text style={[styles.goalText, { color: activeMember.profileColor }]}>
                    {getGoalEmoji(goal)} {goal.replace(/_/g, ' ')}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Daily Targets ─────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Targets</Text>
            <View style={[styles.targetsCard, Shadow.sm]}>
              <TargetRow emoji="🔥" label="Calories" value={`${activeMember.dailyTargets.calories} kcal`} />
              <TargetRow emoji="🥩" label="Protein" value={`${activeMember.dailyTargets.protein}g`} />
              <TargetRow emoji="🍞" label="Carbs" value={`${activeMember.dailyTargets.carbs}g`} />
              <TargetRow emoji="🥑" label="Fat" value={`${activeMember.dailyTargets.fat}g`} />
              <TargetRow emoji="👣" label="Steps" value={`${activeMember.dailyTargets.steps.toLocaleString()}`} />
              <TargetRow emoji="💧" label="Water" value={`${(activeMember.dailyTargets.water / 1000).toFixed(1)}L`} />
              <TargetRow emoji="💪" label="Workouts/week" value={`${activeMember.dailyTargets.workoutsPerWeek}x`} />
              <TargetRow emoji="😴" label="Sleep" value={`${activeMember.dailyTargets.sleepHours}h`} last />
            </View>
          </View>

          {/* ── Health Conditions ──────────────────────────────────────────── */}
          {activeMember.conditions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Health Notes</Text>
              <View style={styles.conditionsCard}>
                {activeMember.conditions.map((c, i) => (
                  <View key={i} style={styles.conditionRow}>
                    <Text style={styles.conditionDot}>⚠️</Text>
                    <Text style={styles.conditionText}>{c}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── Diet & Activity ────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lifestyle</Text>
            <View style={styles.lifestyleCard}>
              <View style={styles.lifestyleRow}>
                <Text style={styles.lifestyleLabel}>Diet Type</Text>
                <View style={styles.lifestyleChip}>
                  <Text style={styles.lifestyleValue}>
                    {getDietEmoji(activeMember.dietType)} {activeMember.dietType}
                  </Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.lifestyleRow}>
                <Text style={styles.lifestyleLabel}>Activity Level</Text>
                <View style={styles.lifestyleChip}>
                  <Text style={styles.lifestyleValue}>
                    {getActivityEmoji(activeMember.activityLevel)} {activeMember.activityLevel.replace('_', ' ')}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ── Settings ──────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <View style={styles.settingsCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingEmoji}>🔔</Text>
                  <Text style={styles.settingLabel}>Meal & workout reminders</Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
                  thumbColor={notificationsEnabled ? Colors.primary : Colors.textMuted}
                />
              </View>
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => router.push('/family')}
              >
                <View style={styles.settingLeft}>
                  <Text style={styles.settingEmoji}>👨‍👩‍👧‍👦</Text>
                  <Text style={styles.settingLabel}>Family Dashboard</Text>
                </View>
                <Text style={styles.settingArrow}>›</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.settingRow} onPress={handleLogout}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingEmoji}>🔄</Text>
                  <Text style={styles.settingLabel}>Switch Profile</Text>
                </View>
                <Text style={styles.settingArrow}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── App Info ──────────────────────────────────────────────────── */}
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>💚 Agarwal Health · v1.0.0</Text>
            <Text style={styles.appInfoSub}>AI-powered · Private · Offline-first</Text>
          </View>

          <View style={{ height: 80 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function MetricCell({
  label, value, emoji, color, note,
}: {
  label: string;
  value: string;
  emoji: string;
  color?: string;
  note?: string;
}) {
  return (
    <View style={styles.metricCell}>
      <Text style={styles.metricEmoji}>{emoji}</Text>
      <Text style={[styles.metricValue, color ? { color } : {}]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      {note && <Text style={[styles.metricNote, { color }]}>{note}</Text>}
    </View>
  );
}

function TargetRow({
  emoji, label, value, last,
}: {
  emoji: string;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <>
      <View style={styles.targetRow}>
        <Text style={styles.targetEmoji}>{emoji}</Text>
        <Text style={styles.targetLabel}>{label}</Text>
        <Text style={styles.targetValue}>{value}</Text>
      </View>
      {!last && <View style={styles.divider} />}
    </>
  );
}

function getGoalEmoji(goal: string): string {
  const map: Record<string, string> = {
    weight_loss: '⬇️', weight_gain: '⬆️', muscle_gain: '💪',
    cardio_endurance: '🏃', longevity: '🌿', energy: '⚡',
    flexibility: '🧘', daily_functioning: '🌟',
  };
  return map[goal] ?? '🎯';
}

function getDietEmoji(diet: string): string {
  const map: Record<string, string> = {
    omnivore: '🍖', vegetarian: '🥗', vegan: '🌱', keto: '🥓', paleo: '🦴',
  };
  return map[diet] ?? '🍽️';
}

function getActivityEmoji(level: string): string {
  const map: Record<string, string> = {
    sedentary: '🛋️', light: '🚶', moderate: '🚴', active: '🏃', very_active: '🏋️',
  };
  return map[level] ?? '💪';
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  // Hero
  heroCard: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  heroLeft: { flex: 1, alignItems: 'flex-start', gap: Spacing.xs },
  heroBigAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAvatarEmoji: { fontSize: 36 },
  heroName: {
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    fontWeight: FontWeight.extrabold,
  },
  heroAge: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  adminBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary + '30',
  },
  adminText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  heroBio: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
    opacity: 0.9,
  },
  // Sections
  section: { gap: Spacing.sm },
  sectionTitle: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  // Metrics grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  metricCell: {
    width: '33.33%',
    padding: Spacing.md,
    alignItems: 'center',
    gap: 3,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.border,
  },
  metricEmoji: { fontSize: 20 },
  metricValue: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  metricLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  metricNote: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  // Weight goal
  weightCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weightCurrent: {
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    fontWeight: FontWeight.extrabold,
  },
  weightTarget: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
  },
  weightLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  weightArrow: { flex: 1, alignItems: 'center' },
  weightArrowText: {
    fontSize: FontSize.xxl,
    color: Colors.textMuted,
  },
  weightTrack: {
    height: 8,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  weightFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  weightDiff: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: FontWeight.medium,
  },
  logWeightBtn: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logWeightText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
  },
  weightInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  weightInput: {
    flex: 1,
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  weightUnit: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
  },
  logWeightConfirm: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  logWeightConfirmText: {
    fontSize: FontSize.sm,
    color: Colors.textOnPrimary,
    fontWeight: FontWeight.bold,
  },
  cancelText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    fontWeight: FontWeight.bold,
  },
  // Goals
  goalsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  goalChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  goalText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textTransform: 'capitalize',
  },
  // Targets
  targetsCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    overflow: 'hidden',
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: Spacing.sm,
  },
  targetEmoji: { fontSize: 18, width: 26 },
  targetLabel: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  targetValue: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  // Conditions
  conditionsCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  conditionDot: { fontSize: 16 },
  conditionText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
    fontWeight: FontWeight.medium,
  },
  // Lifestyle
  lifestyleCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
  },
  lifestyleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  lifestyleLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  lifestyleChip: {
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  lifestyleValue: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
    textTransform: 'capitalize',
  },
  // Settings
  settingsCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  settingEmoji: { fontSize: 20, width: 26 },
  settingLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  settingArrow: {
    fontSize: 22,
    color: Colors.textMuted,
    fontWeight: FontWeight.bold,
  },
  // App info
  appInfo: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: 4,
  },
  appInfoText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: FontWeight.semibold,
  },
  appInfoSub: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
