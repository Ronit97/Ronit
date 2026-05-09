import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';

interface MacroProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

function MacroBar({ label, current, target, unit, color }: MacroProps) {
  const pct = Math.min(1, current / Math.max(1, target));
  return (
    <View style={styles.macroRow}>
      <View style={styles.macroHeader}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValue}>
          <Text style={{ color }}>{Math.round(current)}</Text>
          <Text style={styles.macroTarget}>/{target}{unit}</Text>
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

interface Props {
  calories: { current: number; target: number };
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
}

export default function MacroCard({ calories, protein, carbs, fat }: Props) {
  const calPct = Math.min(1, calories.current / Math.max(1, calories.target));

  return (
    <View style={styles.card}>
      {/* Calorie ring summary */}
      <View style={styles.calRow}>
        <View>
          <Text style={styles.calLabel}>Calories</Text>
          <View style={styles.calNumbers}>
            <Text style={styles.calCurrent}>{Math.round(calories.current)}</Text>
            <Text style={styles.calSep}> / </Text>
            <Text style={styles.calTarget}>{calories.target} kcal</Text>
          </View>
        </View>
        <View style={styles.calBar}>
          <View style={[styles.calFill, { width: `${calPct * 100}%` }]} />
        </View>
      </View>

      <View style={styles.divider} />

      <MacroBar
        label="Protein"
        current={protein.current}
        target={protein.target}
        unit="g"
        color={Colors.protein}
      />
      <MacroBar
        label="Carbs"
        current={carbs.current}
        target={carbs.target}
        unit="g"
        color={Colors.carbs}
      />
      <MacroBar
        label="Fat"
        current={fat.current}
        target={fat.target}
        unit="g"
        color={Colors.fat}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  calRow: {
    gap: Spacing.xs,
  },
  calLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    marginBottom: 2,
  },
  calNumbers: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  calCurrent: {
    fontSize: FontSize.xl,
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  calSep: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  calTarget: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  calBar: {
    height: 6,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.full,
    marginTop: Spacing.xs,
    overflow: 'hidden',
  },
  calFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  macroRow: {
    gap: 4,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  macroValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  macroTarget: {
    color: Colors.textMuted,
  },
  track: {
    height: 4,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
