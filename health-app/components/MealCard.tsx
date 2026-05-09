import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';
import { MealLog } from '../types';
import { calculateMealMacros } from '../data/foods';
import { useAppStore } from '../store/useAppStore';

interface Props {
  meal: MealLog;
}

const MEAL_LABELS: Record<MealLog['mealType'], { label: string; emoji: string; color: string }> = {
  breakfast: { label: 'Breakfast', emoji: '🌅', color: Colors.accentOrange },
  lunch: { label: 'Lunch', emoji: '☀️', color: Colors.primary },
  dinner: { label: 'Dinner', emoji: '🌙', color: Colors.accentPurple },
  snack: { label: 'Snack', emoji: '🍎', color: Colors.accentGold },
};

export default function MealCard({ meal }: Props) {
  const deleteMealLog = useAppStore((s) => s.deleteMealLog);
  const meta = MEAL_LABELS[meal.mealType];
  const totals = calculateMealMacros(meal.foods);

  const handleDelete = () => {
    Alert.alert('Remove Meal', 'Delete this meal entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMealLog(meal.id),
      },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.typeRow}>
          <Text style={styles.typeEmoji}>{meta.emoji}</Text>
          <Text style={[styles.typeLabel, { color: meta.color }]}>{meta.label}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.calories}>{Math.round(totals.calories)} kcal</Text>
          <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Text style={styles.deleteBtn}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.foods}>
        {meal.foods.map((lf, i) => (
          <View key={i} style={styles.foodRow}>
            <Text style={styles.foodEmoji}>{lf.food.emoji}</Text>
            <Text style={styles.foodName} numberOfLines={1}>{lf.food.name}</Text>
            <Text style={styles.foodCal}>
              {Math.round(lf.food.calories * lf.quantity)} kcal
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.macros}>
        <MacroChip label="P" value={Math.round(totals.protein)} color={Colors.protein} />
        <MacroChip label="C" value={Math.round(totals.carbs)} color={Colors.carbs} />
        <MacroChip label="F" value={Math.round(totals.fat)} color={Colors.fat} />
      </View>
    </View>
  );
}

function MacroChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.chip, { borderColor: color + '40' }]}>
      <Text style={[styles.chipLabel, { color }]}>{label}</Text>
      <Text style={styles.chipValue}>{value}g</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  typeEmoji: { fontSize: 16 },
  typeLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  calories: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  deleteBtn: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: FontWeight.bold,
  },
  foods: {
    gap: 4,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  foodEmoji: { fontSize: 13 },
  foodName: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  foodCal: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  macros: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    backgroundColor: Colors.bgElevated,
  },
  chipLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  chipValue: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
});
