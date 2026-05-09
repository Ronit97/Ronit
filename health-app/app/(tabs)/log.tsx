import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '../../store/useAppStore';
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow } from '../../constants/theme';
import { FoodItem, LoggedFood, MealType } from '../../types';
import { searchFoods, getIndianFoods, calculateMealMacros } from '../../data/foods';
import { recognizeMealFromPhoto, getQuickFoodSuggestions } from '../../services/aiRecognition';

type Tab = 'photo' | 'search' | 'quick';

const MEAL_TYPES: { value: MealType; label: string; emoji: string; color: string }[] = [
  { value: 'breakfast', label: 'Breakfast', emoji: '🌅', color: Colors.accentOrange },
  { value: 'lunch', label: 'Lunch', emoji: '☀️', color: Colors.primary },
  { value: 'dinner', label: 'Dinner', emoji: '🌙', color: Colors.accentPurple },
  { value: 'snack', label: 'Snack', emoji: '🍎', color: Colors.accentGold },
];

export default function LogScreen() {
  const { activeMember, addMealLog, todaysMeals, updateDailyLog, todaysDailyLog } = useAppStore();
  const [tab, setTab] = useState<Tab>('quick');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
  const [loggedFoods, setLoggedFoods] = useState<LoggedFood[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>(getIndianFoods().slice(0, 12));
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<LoggedFood[] | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!activeMember) return null;

  const quickSuggestions = getQuickFoodSuggestions(activeMember.id);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    setSearchResults(searchFoods(q));
  }, []);

  const addFood = (food: FoodItem, quantity = 1) => {
    setLoggedFoods((prev) => {
      const existing = prev.findIndex((lf) => lf.food.id === food.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + quantity };
        return updated;
      }
      return [...prev, { food, quantity }];
    });
  };

  const removeFood = (foodId: string) => {
    setLoggedFoods((prev) => prev.filter((lf) => lf.food.id !== foodId));
  };

  const handlePhotoCapture = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera Access', 'Please allow camera access to use AI meal recognition.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled) {
      processPhoto(result.assets[0].uri);
    }
  };

  const handleGalleryPick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled) {
      processPhoto(result.assets[0].uri);
    }
  };

  const processPhoto = async (uri: string) => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const recognition = await recognizeMealFromPhoto(uri);
      const foods: LoggedFood[] = recognition.foods.map((rf) => ({
        food: rf.food,
        quantity: rf.estimatedQuantity,
      }));
      setAiResult(foods);
      setLoggedFoods(foods);
    } catch {
      Alert.alert('Recognition Error', 'Could not identify foods. Please add manually.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (loggedFoods.length === 0) {
      Alert.alert('No Foods', 'Please add at least one food item.');
      return;
    }
    await addMealLog(selectedMealType, loggedFoods);
    setLoggedFoods([]);
    setAiResult(null);
    setSearchQuery('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const totals = loggedFoods.length > 0 ? calculateMealMacros(loggedFoods) : null;

  return (
    <LinearGradient colors={['#0D1B2A', '#0A1628']} style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Log Meal</Text>
          <Text style={styles.subtitle}>
            {activeMember.firstName} · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </Text>
        </View>

        {/* Meal type selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mealTypeScroll}
          contentContainerStyle={styles.mealTypeRow}>
          {MEAL_TYPES.map((mt) => (
            <TouchableOpacity
              key={mt.value}
              style={[
                styles.mealTypeBtn,
                selectedMealType === mt.value && {
                  backgroundColor: mt.color + '25',
                  borderColor: mt.color,
                },
              ]}
              onPress={() => setSelectedMealType(mt.value)}
            >
              <Text style={styles.mealTypeEmoji}>{mt.emoji}</Text>
              <Text style={[styles.mealTypeLabel, selectedMealType === mt.value && { color: mt.color }]}>
                {mt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tab switcher */}
        <View style={styles.tabs}>
          {(['quick', 'search', 'photo'] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'quick' ? '⚡ Quick' : t === 'search' ? '🔍 Search' : '📸 AI Photo'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Photo Tab ─────────────────────────────────────────────────── */}
          {tab === 'photo' && (
            <View style={styles.photoSection}>
              <View style={styles.aiHero}>
                <Text style={styles.aiTitle}>AI Meal Recognition</Text>
                <Text style={styles.aiDesc}>
                  Snap a photo of your meal. Our AI identifies foods and estimates portions automatically.
                </Text>
              </View>
              <View style={styles.photoButtons}>
                <TouchableOpacity
                  style={[styles.photoBtn, { borderColor: Colors.primary }]}
                  onPress={handlePhotoCapture}
                  disabled={aiLoading}
                >
                  <Text style={styles.photoBtnEmoji}>📷</Text>
                  <Text style={[styles.photoBtnLabel, { color: Colors.primary }]}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.photoBtn, { borderColor: Colors.accentPurple }]}
                  onPress={handleGalleryPick}
                  disabled={aiLoading}
                >
                  <Text style={styles.photoBtnEmoji}>🖼️</Text>
                  <Text style={[styles.photoBtnLabel, { color: Colors.accentPurple }]}>Gallery</Text>
                </TouchableOpacity>
              </View>
              {aiLoading && (
                <View style={styles.aiLoading}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                  <Text style={styles.aiLoadingText}>Analysing your meal...</Text>
                  <Text style={styles.aiLoadingSubtext}>
                    Identifying foods · Estimating portions · Calculating macros
                  </Text>
                </View>
              )}
              {aiResult && !aiLoading && (
                <View style={styles.aiResults}>
                  <Text style={styles.aiResultsTitle}>🎯 AI Recognised</Text>
                  {aiResult.map((lf, i) => (
                    <View key={i} style={styles.aiFoodRow}>
                      <Text style={styles.aiFoodEmoji}>{lf.food.emoji}</Text>
                      <View style={styles.aiFoodInfo}>
                        <Text style={styles.aiFoodName}>{lf.food.name}</Text>
                        <Text style={styles.aiFoodCal}>
                          {Math.round(lf.food.calories * lf.quantity)} kcal · {lf.food.servingUnit}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => removeFood(lf.food.id)}>
                        <Text style={styles.removeBtn}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <Text style={styles.aiNote}>
                    ✓ Review and adjust quantities, then tap Save
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ── Search Tab ────────────────────────────────────────────────── */}
          {tab === 'search' && (
            <View style={styles.searchSection}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search dal, rice, chicken..."
                placeholderTextColor={Colors.textMuted}
                value={searchQuery}
                onChangeText={handleSearch}
                returnKeyType="search"
                autoCapitalize="none"
              />
              <FlatList
                data={searchResults}
                keyExtractor={(f) => f.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchResultRow}
                    onPress={() => addFood(item)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.searchEmoji}>{item.emoji}</Text>
                    <View style={styles.searchInfo}>
                      <Text style={styles.searchName}>{item.name}</Text>
                      <Text style={styles.searchMeta}>
                        {item.servingUnit} · {item.calories} kcal
                      </Text>
                    </View>
                    <View style={styles.macroMini}>
                      <Text style={styles.macroMiniText}>
                        P{Math.round(item.macros.protein)}  C{Math.round(item.macros.carbs)}  F{Math.round(item.macros.fat)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.addCircle}
                      onPress={() => addFood(item)}
                    >
                      <Text style={styles.addCircleText}>+</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {/* ── Quick Tab ─────────────────────────────────────────────────── */}
          {tab === 'quick' && (
            <View style={styles.quickSection}>
              <Text style={styles.quickTitle}>Suggested for {activeMember.firstName}</Text>
              <View style={styles.quickGrid}>
                {quickSuggestions.map((food) => (
                  <TouchableOpacity
                    key={food.id}
                    style={[
                      styles.quickItem,
                      loggedFoods.some((lf) => lf.food.id === food.id) && styles.quickItemAdded,
                    ]}
                    onPress={() => addFood(food)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.quickEmoji}>{food.emoji}</Text>
                    <Text style={styles.quickName} numberOfLines={2}>{food.name}</Text>
                    <Text style={styles.quickCal}>{food.calories} kcal</Text>
                    {loggedFoods.some((lf) => lf.food.id === food.id) && (
                      <Text style={styles.quickCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.quickTitle} style={{ marginTop: Spacing.md }}>
                Popular Indian Foods
              </Text>
              {getIndianFoods().slice(0, 10).map((food) => (
                <TouchableOpacity
                  key={food.id}
                  style={styles.searchResultRow}
                  onPress={() => addFood(food)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.searchEmoji}>{food.emoji}</Text>
                  <View style={styles.searchInfo}>
                    <Text style={styles.searchName}>{food.name}</Text>
                    <Text style={styles.searchMeta}>
                      {food.servingUnit} · {food.calories} kcal
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.addCircle} onPress={() => addFood(food)}>
                    <Text style={styles.addCircleText}>+</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ── Staged Foods Summary ─────────────────────────────────────── */}
          {loggedFoods.length > 0 && (
            <View style={styles.stagingCard}>
              <View style={styles.stagingHeader}>
                <Text style={styles.stagingTitle}>
                  🍽️ Selected ({loggedFoods.length})
                </Text>
                <TouchableOpacity onPress={() => setLoggedFoods([])}>
                  <Text style={styles.clearBtn}>Clear all</Text>
                </TouchableOpacity>
              </View>
              {loggedFoods.map((lf) => (
                <View key={lf.food.id} style={styles.stagedRow}>
                  <Text style={styles.stagedEmoji}>{lf.food.emoji}</Text>
                  <Text style={styles.stagedName} numberOfLines={1}>{lf.food.name}</Text>
                  <Text style={styles.stagedCal}>
                    {Math.round(lf.food.calories * lf.quantity)} kcal
                  </Text>
                  <TouchableOpacity onPress={() => removeFood(lf.food.id)}>
                    <Text style={styles.removeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {totals && (
                <View style={styles.stagingTotals}>
                  <Text style={styles.stagingTotalCal}>{Math.round(totals.calories)} kcal total</Text>
                  <Text style={styles.stagingTotalMacros}>
                    P {Math.round(totals.protein)}g · C {Math.round(totals.carbs)}g · F {Math.round(totals.fat)}g
                  </Text>
                </View>
              )}
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <LinearGradient colors={Colors.primary ? [Colors.primary, Colors.primaryDark] : ['#00D4AA', '#00A88A']}
                  style={styles.saveBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.saveBtnText}>Save Meal</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Water & Steps Quick Log ───────────────────────────────────── */}
          <View style={styles.quickLogSection}>
            <Text style={styles.sectionTitle}>Log Activity</Text>
            <View style={styles.activityRow}>
              <TouchableOpacity
                style={styles.activityCard}
                onPress={() => updateDailyLog({ waterIntake: (todaysDailyLog?.waterIntake ?? 0) + 250 })}
              >
                <Text style={styles.activityEmoji}>💧</Text>
                <Text style={styles.activityLabel}>+250ml Water</Text>
                <Text style={styles.activityCurrent}>
                  {((todaysDailyLog?.waterIntake ?? 0) / 1000).toFixed(1)}L today
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.activityCard}
                onPress={() => updateDailyLog({ steps: (todaysDailyLog?.steps ?? 0) + 1000 })}
              >
                <Text style={styles.activityEmoji}>👣</Text>
                <Text style={styles.activityLabel}>+1,000 Steps</Text>
                <Text style={styles.activityCurrent}>
                  {(todaysDailyLog?.steps ?? 0).toLocaleString()} today
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.activityRow}>
              <TouchableOpacity
                style={styles.activityCard}
                onPress={() => {
                  const curr = todaysDailyLog?.sleepHours ?? 0;
                  updateDailyLog({ sleepHours: Math.min(12, curr + 0.5) });
                }}
              >
                <Text style={styles.activityEmoji}>😴</Text>
                <Text style={styles.activityLabel}>Log Sleep +30min</Text>
                <Text style={styles.activityCurrent}>
                  {todaysDailyLog?.sleepHours ?? 0}h logged
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.activityCard}
                onPress={() => {
                  const curr = todaysDailyLog?.weight;
                  updateDailyLog({ weight: curr ? curr : activeMember.weight });
                  Alert.alert('Weight Logged', `Logged ${activeMember.weight}kg. Update in Profile.`);
                }}
              >
                <Text style={styles.activityEmoji}>⚖️</Text>
                <Text style={styles.activityLabel}>Log Weight</Text>
                <Text style={styles.activityCurrent}>{activeMember.weight}kg current</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 80 }} />
        </ScrollView>

        {/* Success toast */}
        {showSuccess && (
          <View style={styles.successToast}>
            <Text style={styles.successText}>✅ Meal saved successfully!</Text>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
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
  mealTypeScroll: { maxHeight: 60 },
  mealTypeRow: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  mealTypeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  mealTypeEmoji: { fontSize: 15 },
  mealTypeLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
  },
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
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
  },
  tabTextActive: { color: Colors.primary },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  // Photo
  photoSection: { gap: Spacing.md },
  aiHero: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  aiTitle: {
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  aiDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  photoButtons: { flexDirection: 'row', gap: Spacing.md },
  photoBtn: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 2,
  },
  photoBtnEmoji: { fontSize: 40 },
  photoBtnLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  aiLoading: {
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  aiLoadingText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  aiLoadingSubtext: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  aiResults: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  aiResultsTitle: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  aiFoodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  aiFoodEmoji: { fontSize: 20 },
  aiFoodInfo: { flex: 1 },
  aiFoodName: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
  },
  aiFoodCal: { fontSize: FontSize.xs, color: Colors.textMuted },
  aiNote: {
    fontSize: FontSize.xs,
    color: Colors.success,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.xs,
  },
  // Search
  searchSection: { gap: Spacing.sm },
  searchInput: {
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  searchEmoji: { fontSize: 22, width: 30 },
  searchInfo: { flex: 1 },
  searchName: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
  },
  searchMeta: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  macroMini: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
  },
  macroMiniText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
  },
  addCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary + '25',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCircleText: {
    fontSize: FontSize.lg,
    color: Colors.primary,
    fontWeight: FontWeight.bold,
    lineHeight: 22,
  },
  // Quick
  quickSection: { gap: Spacing.sm },
  quickTitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickItem: {
    width: '30%',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  quickItemAdded: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  quickEmoji: { fontSize: 28 },
  quickName: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: FontWeight.medium,
  },
  quickCal: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  quickCheck: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  // Staging
  stagingCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  stagingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stagingTitle: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  clearBtn: {
    fontSize: FontSize.sm,
    color: Colors.danger,
    fontWeight: FontWeight.semibold,
  },
  stagedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stagedEmoji: { fontSize: 18 },
  stagedName: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  stagedCal: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  removeBtn: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: FontWeight.bold,
    paddingHorizontal: 4,
  },
  stagingTotals: {
    alignItems: 'center',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 3,
  },
  stagingTotalCal: {
    fontSize: FontSize.lg,
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  stagingTotalMacros: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  saveBtn: { borderRadius: Radius.md, overflow: 'hidden', marginTop: Spacing.xs },
  saveBtnGrad: { padding: Spacing.md, alignItems: 'center' },
  saveBtnText: {
    fontSize: FontSize.md,
    color: Colors.textOnPrimary,
    fontWeight: FontWeight.bold,
  },
  // Quick log
  quickLogSection: { gap: Spacing.sm },
  sectionTitle: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  activityRow: { flexDirection: 'row', gap: Spacing.sm },
  activityCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  activityEmoji: { fontSize: 28 },
  activityLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
  activityCurrent: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  // Toast
  successToast: {
    position: 'absolute',
    bottom: 100,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.success,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  successText: {
    fontSize: FontSize.md,
    color: Colors.textOnPrimary,
    fontWeight: FontWeight.bold,
  },
});
