import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow } from '../constants/theme';
import { FamilyMember } from '../types';
import { calculateBMI, getBMICategory } from '../data/profiles';

interface Props {
  member: FamilyMember;
  healthScore?: number;
  onPress: (member: FamilyMember) => void;
  isActive?: boolean;
  compact?: boolean;
}

export default function FamilyMemberTile({
  member,
  healthScore,
  onPress,
  isActive,
  compact,
}: Props) {
  const bmi = calculateBMI(member.weight, member.height);
  const bmiInfo = getBMICategory(bmi);

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactTile, isActive && styles.compactActive]}
        onPress={() => onPress(member)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={member.profileGradient}
          style={styles.compactAvatar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.compactEmoji}>{member.emoji}</Text>
        </LinearGradient>
        <Text style={[styles.compactName, isActive && { color: member.profileColor }]} numberOfLines={1}>
          {member.firstName}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.tile, Shadow.md]}
      onPress={() => onPress(member)}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={member.profileGradient}
        style={styles.avatarGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.emoji}>{member.emoji}</Text>
      </LinearGradient>

      <View style={styles.info}>
        <Text style={styles.name}>{member.name}</Text>
        <Text style={styles.meta}>
          {member.age}y · {member.gender === 'male' ? 'M' : 'F'} · {member.height}cm · {member.weight}kg
        </Text>
        <View style={styles.row}>
          <View style={[styles.bmiChip, { backgroundColor: bmiInfo.color + '20' }]}>
            <Text style={[styles.bmiText, { color: bmiInfo.color }]}>
              BMI {bmi} · {bmiInfo.label}
            </Text>
          </View>
          {member.isAdmin && (
            <View style={styles.adminChip}>
              <Text style={styles.adminText}>Admin</Text>
            </View>
          )}
        </View>
        <Text style={styles.goals} numberOfLines={2}>
          🎯 {member.goals.map(g => g.replace(/_/g, ' ')).join(' · ')}
        </Text>
      </View>

      {healthScore !== undefined && (
        <View style={styles.scoreWrap}>
          <Text style={[styles.scoreNum, { color: member.profileColor }]}>
            {healthScore}
          </Text>
          <Text style={styles.scoreLabel}>score</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  avatarGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 28 },
  info: { flex: 1, gap: 4 },
  name: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  meta: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  bmiChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  bmiText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  adminChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary + '20',
  },
  adminText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  goals: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  scoreWrap: {
    alignItems: 'center',
  },
  scoreNum: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
  },
  scoreLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  // Compact
  compactTile: {
    alignItems: 'center',
    gap: 5,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  compactActive: {},
  compactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactEmoji: { fontSize: 22 },
  compactName: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
    maxWidth: 60,
  },
});
