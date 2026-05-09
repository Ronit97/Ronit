import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../../store/useAppStore';
import {
  Colors,
  FontSize,
  FontWeight,
  Radius,
  Spacing,
  Shadow,
} from '../../constants/theme';
import {
  EXERCISE_LIBRARY,
  WORKOUT_TEMPLATES,
  getExercisesByCategory,
  getExerciseById,
} from '../../data/exercises';
import ExerciseCard from '../../components/ExerciseCard';
import { Exercise, LoggedExercise, ExerciseSet, WorkoutSession } from '../../types';

type Tab = 'library' | 'templates' | 'history';
type ExCat = 'all' | 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'yoga';

export default function WorkoutsScreen() {
  const { activeMember, todaysWorkouts, startWorkout, completeWorkout } = useAppStore();

  const [tab, setTab] = useState<Tab>('library');
  const [filterCat, setFilterCat] = useState<ExCat>('all');
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [workoutName, setWorkoutName] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);

  if (!activeMember) return null;

  const exercises = getExercisesByCategory(filterCat);

  const toggleExercise = (ex: Exercise) => {
    setSelectedExercises((prev) =>
      prev.find((e) => e.id === ex.id)
        ? prev.filter((e) => e.id !== ex.id)
        : [...prev, ex]
    );
  };

  const startWorkoutSession = async (name: string, exercises: Exercise[]) => {
    const loggedExercises: LoggedExercise[] = exercises.map((ex) => ({
      exercise: ex,
      sets: [{ setNumber: 1, reps: 10, weight: 0, completed: false }],
    }));
    const session = await startWorkout(name, loggedExercises);
    setActiveSession(session);
    setSelectedExercises([]);
    // start timer
    const interval = setInterval(() => {
      setSessionTimer((t) => t + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const handleStartCustomWorkout = () => {
    if (selectedExercises.length === 0) {
      Alert.alert('No Exercises', 'Select at least one exercise to start.');
      return;
    }
    setWorkoutName(`${activeMember.firstName}'s Workout`);
    setShowNameModal(true);
  };

  const handleCompleteWorkout = async () => {
    if (!activeSession) return;
    if (timerInterval) clearInterval(timerInterval);

    const duration = Math.round(sessionTimer / 60);
    const caloriesBurned = activeSession.exercises.reduce((total, le) => {
      const sets = le.sets.filter((s) => s.completed).length || le.sets.length;
      return total + le.exercise.caloriesPerMinute * Math.max(1, duration / activeSession.exercises.length);
    }, 0);

    const completed: WorkoutSession = {
      ...activeSession,
      duration: Math.max(1, duration),
      caloriesBurned: Math.round(caloriesBurned),
      completed: true,
    };
    await completeWorkout(completed);
    setActiveSession(null);
    setSessionTimer(0);
    Alert.alert(
      '🎉 Workout Complete!',
      `Duration: ${Math.max(1, duration)} min\nCalories burned: ${Math.round(caloriesBurned)} kcal`,
      [{ text: 'Great!', style: 'default' }]
    );
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const cats: { value: ExCat; label: string; emoji: string }[] = [
    { value: 'all', label: 'All', emoji: '🏅' },
    { value: 'strength', label: 'Strength', emoji: '💪' },
    { value: 'cardio', label: 'Cardio', emoji: '🏃' },
    { value: 'hiit', label: 'HIIT', emoji: '🔥' },
    { value: 'flexibility', label: 'Flex', emoji: '🧘' },
    { value: 'yoga', label: 'Yoga', emoji: '☀️' },
  ];

  return (
    <LinearGradient colors={['#0D1B2A', '#0A1628']} style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Workouts 💪</Text>
          <Text style={styles.subtitle}>{activeMember.firstName}'s training hub</Text>
        </View>

        {/* Active Session Banner */}
        {activeSession && (
          <View style={styles.activeBanner}>
            <View style={styles.activeBannerLeft}>
              <Text style={styles.activeBannerTitle}>🏋️ Active: {activeSession.name}</Text>
              <Text style={styles.activeBannerTimer}>{formatTime(sessionTimer)}</Text>
            </View>
            <TouchableOpacity style={styles.finishBtn} onPress={handleCompleteWorkout}>
              <Text style={styles.finishBtnText}>Finish ✓</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['library', 'templates', 'history'] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'library' ? '📚 Library' : t === 'templates' ? '⚡ Plans' : '📅 History'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Library Tab ──────────────────────────────────────────────── */}
          {tab === 'library' && (
            <>
              {/* Category filter */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.catRow}>
                {cats.map((c) => (
                  <TouchableOpacity
                    key={c.value}
                    style={[styles.catBtn, filterCat === c.value && styles.catBtnActive]}
                    onPress={() => setFilterCat(c.value)}
                  >
                    <Text style={styles.catEmoji}>{c.emoji}</Text>
                    <Text style={[styles.catLabel, filterCat === c.value && styles.catLabelActive]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Selection counter */}
              {selectedExercises.length > 0 && (
                <TouchableOpacity
                  style={styles.startBar}
                  onPress={handleStartCustomWorkout}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[Colors.primary, Colors.primaryDark]}
                    style={styles.startBarGrad}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.startBarText}>
                      Start Workout · {selectedExercises.length} exercise{selectedExercises.length > 1 ? 's' : ''}
                    </Text>
                    <Text style={styles.startBarArrow}>→</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {/* Exercise list */}
              {exercises.map((ex) => (
                <ExerciseCard
                  key={ex.id}
                  exercise={ex}
                  onAdd={toggleExercise}
                  selected={selectedExercises.some((e) => e.id === ex.id)}
                />
              ))}
            </>
          )}

          {/* ── Templates Tab ─────────────────────────────────────────────── */}
          {tab === 'templates' && (
            <>
              <Text style={styles.sectionLabel}>
                Curated plans for {activeMember.firstName}'s goals
              </Text>
              {Object.entries(WORKOUT_TEMPLATES).map(([key, tmpl]) => {
                const exercises = tmpl.exercises
                  .map((id) => getExerciseById(id))
                  .filter((e): e is Exercise => !!e);
                const totalCals = exercises.reduce(
                  (s, e) => s + e.caloriesPerMinute * 3,
                  0
                );
                return (
                  <View key={key} style={[styles.templateCard, Shadow.sm]}>
                    <View style={styles.templateHeader}>
                      <Text style={styles.templateEmoji}>{tmpl.emoji}</Text>
                      <View style={styles.templateInfo}>
                        <Text style={styles.templateName}>{tmpl.name}</Text>
                        <Text style={styles.templateDesc}>{tmpl.description}</Text>
                      </View>
                    </View>
                    <View style={styles.templateMeta}>
                      <Text style={styles.templateMetaText}>
                        {exercises.length} exercises · ~{totalCals} kcal burn
                      </Text>
                    </View>
                    <View style={styles.templateExercises}>
                      {exercises.slice(0, 3).map((ex) => (
                        <View key={ex.id} style={styles.templateExRow}>
                          <Text style={styles.templateExEmoji}>{ex.emoji}</Text>
                          <Text style={styles.templateExName}>{ex.name}</Text>
                        </View>
                      ))}
                      {exercises.length > 3 && (
                        <Text style={styles.moreText}>
                          +{exercises.length - 3} more exercises
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.templateStartBtn}
                      onPress={() => startWorkoutSession(tmpl.name, exercises)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.templateStartText}>▶ Start Now</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </>
          )}

          {/* ── History Tab ──────────────────────────────────────────────── */}
          {tab === 'history' && (
            <>
              {todaysWorkouts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>🏋️</Text>
                  <Text style={styles.emptyTitle}>No workouts today</Text>
                  <Text style={styles.emptyDesc}>
                    Start a workout from the Library or Plans tab.
                  </Text>
                </View>
              ) : (
                todaysWorkouts.map((session) => (
                  <View key={session.id} style={[styles.historyCard, Shadow.sm]}>
                    <View style={styles.historyHeader}>
                      <View>
                        <Text style={styles.historyName}>{session.name}</Text>
                        <Text style={styles.historyDate}>
                          {new Date(session.timestamp).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                      <View style={[styles.statusChip, { backgroundColor: session.completed ? Colors.success + '25' : Colors.warning + '25' }]}>
                        <Text style={[styles.statusText, { color: session.completed ? Colors.success : Colors.warning }]}>
                          {session.completed ? '✓ Done' : '⏳ Active'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.historyStats}>
                      <StatChip emoji="⏱️" value={`${session.duration} min`} />
                      <StatChip emoji="🔥" value={`${session.caloriesBurned} kcal`} />
                      <StatChip emoji="💪" value={`${session.exercises.length} ex`} />
                    </View>
                    <View style={styles.exerciseList}>
                      {session.exercises.slice(0, 3).map((le, i) => (
                        <Text key={i} style={styles.exerciseItem}>
                          {le.exercise.emoji} {le.exercise.name}
                        </Text>
                      ))}
                    </View>
                  </View>
                ))
              )}
            </>
          )}

          <View style={{ height: 80 }} />
        </ScrollView>

        {/* Workout Name Modal */}
        <Modal visible={showNameModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Name Your Workout</Text>
              <TextInput
                style={styles.modalInput}
                value={workoutName}
                onChangeText={setWorkoutName}
                placeholder="e.g. Morning Push Day"
                placeholderTextColor={Colors.textMuted}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={() => {
                  setShowNameModal(false);
                  startWorkoutSession(workoutName, selectedExercises);
                }}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => setShowNameModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirm}
                  onPress={() => {
                    setShowNameModal(false);
                    startWorkoutSession(workoutName, selectedExercises);
                  }}
                >
                  <Text style={styles.modalConfirmText}>Start ▶</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

function StatChip({ emoji, value }: { emoji: string; value: string }) {
  return (
    <View style={styles.statChip}>
      <Text style={styles.statChipEmoji}>{emoji}</Text>
      <Text style={styles.statChipValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xxl,
    color: Colors.textPrimary,
    fontWeight: FontWeight.extrabold,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  // Active banner
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.primary + '20',
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  activeBannerLeft: { gap: 2 },
  activeBannerTitle: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  activeBannerTimer: {
    fontSize: FontSize.xxl,
    color: Colors.primary,
    fontWeight: FontWeight.extrabold,
  },
  finishBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  finishBtnText: {
    fontSize: FontSize.sm,
    color: Colors.textOnPrimary,
    fontWeight: FontWeight.bold,
  },
  // Tabs
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabBtnActive: {
    backgroundColor: Colors.accentOrange + '20',
    borderColor: Colors.accentOrange,
  },
  tabText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
  },
  tabTextActive: { color: Colors.accentOrange },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  // Category filter
  catRow: {
    gap: Spacing.sm,
    paddingBottom: 2,
  },
  catBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catBtnActive: {
    backgroundColor: Colors.accentOrange + '25',
    borderColor: Colors.accentOrange,
  },
  catEmoji: { fontSize: 14 },
  catLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
  },
  catLabelActive: { color: Colors.accentOrange },
  // Start bar
  startBar: {
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  startBarGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  startBarText: {
    fontSize: FontSize.md,
    color: Colors.textOnPrimary,
    fontWeight: FontWeight.bold,
  },
  startBarArrow: {
    fontSize: FontSize.xl,
    color: Colors.textOnPrimary,
    fontWeight: FontWeight.bold,
  },
  sectionLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
  },
  // Templates
  templateCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  templateEmoji: { fontSize: 30 },
  templateInfo: { flex: 1 },
  templateName: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  templateDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  templateMeta: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  templateMetaText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  templateExercises: { gap: 4 },
  templateExRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  templateExEmoji: { fontSize: 14 },
  templateExName: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  moreText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  templateStartBtn: {
    backgroundColor: Colors.accentOrange + '20',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.accentOrange,
  },
  templateStartText: {
    fontSize: FontSize.sm,
    color: Colors.accentOrange,
    fontWeight: FontWeight.bold,
  },
  // History
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: {
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  emptyDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  historyCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  historyName: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  historyDate: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  historyStats: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statChipEmoji: { fontSize: 12 },
  statChipValue: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
  },
  exerciseList: { gap: 4 },
  exerciseItem: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  modalCancel: {
    flex: 1,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
  },
  modalConfirm: {
    flex: 1,
    backgroundColor: Colors.accentOrange,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: FontSize.md,
    color: Colors.textOnPrimary,
    fontWeight: FontWeight.bold,
  },
});
