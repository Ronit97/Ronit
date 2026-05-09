import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';

interface Props {
  emoji: string;
  label: string;
  value: string;
  subValue?: string;
  color?: string;
  progress?: number; // 0-1
}

export default function StatPill({ emoji, label, value, subValue, color = Colors.primary, progress }: Props) {
  return (
    <View style={styles.pill}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {subValue && <Text style={styles.sub}>{subValue}</Text>}
      {progress !== undefined && (
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.min(100, progress * 100)}%`, backgroundColor: color }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 3,
    minWidth: 80,
  },
  emoji: {
    fontSize: 24,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  value: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  sub: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  track: {
    height: 3,
    width: '100%',
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.full,
    marginTop: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
