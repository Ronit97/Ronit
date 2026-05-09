import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';
import { Exercise } from '../types';

interface Props {
  exercise: Exercise;
  onAdd?: (exercise: Exercise) => void;
  selected?: boolean;
  compact?: boolean;
}

const DIFFICULTY_COLORS: Record<Exercise['difficulty'], string> = {
  beginner: Colors.success,
  intermediate: Colors.warning,
  advanced: Colors.danger,
};

const CATEGORY_COLORS: Record<Exercise['category'], string> = {
  strength: Colors.accent,
  cardio: Colors.primary,
  flexibility: Colors.accentPurple,
  hiit: Colors.accentOrange,
  yoga: Colors.accentBlue,
};

export default function ExerciseCard({ exercise, onAdd, selected, compact }: Props) {
  const diffColor = DIFFICULTY_COLORS[exercise.difficulty];
  const catColor = CATEGORY_COLORS[exercise.category];

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compact, selected && styles.compactSelected]}
        onPress={() => onAdd?.(exercise)}
        activeOpacity={0.7}
      >
        <Text style={styles.compactEmoji}>{exercise.emoji}</Text>
        <Text style={styles.compactName} numberOfLines={2}>{exercise.name}</Text>
        {selected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <Text style={styles.emoji}>{exercise.emoji}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{exercise.name}</Text>
          <View style={styles.tags}>
            <View style={[styles.tag, { backgroundColor: catColor + '25', borderColor: catColor + '60' }]}>
              <Text style={[styles.tagText, { color: catColor }]}>
                {exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1)}
              </Text>
            </View>
            <View style={[styles.tag, { backgroundColor: diffColor + '25', borderColor: diffColor + '60' }]}>
              <Text style={[styles.tagText, { color: diffColor }]}>
                {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
              </Text>
            </View>
          </View>
        </View>
        {onAdd && (
          <TouchableOpacity
            style={[styles.addBtn, selected && styles.addBtnSelected]}
            onPress={() => onAdd(exercise)}
            activeOpacity={0.7}
          >
            <Text style={[styles.addBtnText, selected && styles.addBtnTextSelected]}>
              {selected ? '✓' : '+'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.desc} numberOfLines={2}>{exercise.description}</Text>
      <View style={styles.bottomRow}>
        <Text style={styles.muscles}>
          💪 {exercise.muscleGroups.slice(0, 3).join(' · ')}
        </Text>
        <Text style={styles.cals}>🔥 {exercise.caloriesPerMinute} kcal/min</Text>
      </View>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 22 },
  info: { flex: 1, gap: 4 },
  name: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  tags: { flexDirection: 'row', gap: Spacing.xs },
  tag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  tagText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnSelected: {
    backgroundColor: Colors.primary,
  },
  addBtnText: {
    fontSize: FontSize.lg,
    color: Colors.primary,
    fontWeight: FontWeight.bold,
    lineHeight: 22,
  },
  addBtnTextSelected: {
    color: Colors.textOnPrimary,
  },
  desc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  muscles: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    flex: 1,
  },
  cals: {
    fontSize: FontSize.xs,
    color: Colors.accentOrange,
    fontWeight: FontWeight.semibold,
  },
  // Compact
  compact: {
    flex: 1,
    minWidth: 90,
    maxWidth: 110,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  compactSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  compactEmoji: { fontSize: 26 },
  compactName: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: FontWeight.medium,
  },
  checkmark: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
});
