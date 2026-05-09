import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';

interface Props {
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info' | 'tip';
  emoji: string;
}

const TYPE_COLORS = {
  success: { bg: '#00D4AA18', border: Colors.success, text: Colors.success },
  warning: { bg: '#FFD93D18', border: Colors.warning, text: Colors.warning },
  info: { bg: '#4ECDC418', border: Colors.info, text: Colors.info },
  tip: { bg: '#A29BFE18', border: Colors.accentPurple, text: Colors.accentPurple },
};

export default function InsightCard({ title, description, type, emoji }: Props) {
  const colors = TYPE_COLORS[type];
  return (
    <View style={[styles.card, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={styles.desc}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  emoji: {
    fontSize: 22,
    lineHeight: 26,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  desc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
