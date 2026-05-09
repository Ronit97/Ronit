import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FAMILY_MEMBERS, calculateBMI, getBMICategory } from '../../data/profiles';
import { useAppStore } from '../../store/useAppStore';
import { FamilyMember } from '../../types';
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow } from '../../constants/theme';

const { width } = Dimensions.get('window');
const CARD_W = width - Spacing.lg * 2;

export default function AuthScreen() {
  const setActiveMember = useAppStore((s) => s.setActiveMember);

  const handleSelect = async (member: FamilyMember) => {
    await setActiveMember(member);
    router.replace('/(tabs)');
  };

  return (
    <LinearGradient colors={['#0D1B2A', '#0A1628']} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appIcon}>💚</Text>
          <Text style={styles.appName}>Agarwal Health</Text>
          <Text style={styles.subtitle}>
            AI-powered wellness for the whole family
          </Text>
        </View>

        {/* Member list */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>Who's checking in today?</Text>

          {FAMILY_MEMBERS.map((member) => (
            <MemberCard key={member.id} member={member} onSelect={handleSelect} />
          ))}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Your data is stored securely on-device. 🔒
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function MemberCard({
  member,
  onSelect,
}: {
  member: FamilyMember;
  onSelect: (m: FamilyMember) => void;
}) {
  const bmi = calculateBMI(member.weight, member.height);
  const bmiInfo = getBMICategory(bmi);

  return (
    <TouchableOpacity
      style={[styles.card, Shadow.md]}
      onPress={() => onSelect(member)}
      activeOpacity={0.88}
    >
      {/* Left: avatar */}
      <LinearGradient
        colors={member.profileGradient}
        style={styles.avatar}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.avatarEmoji}>{member.emoji}</Text>
      </LinearGradient>

      {/* Middle: info */}
      <View style={styles.memberInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.memberName}>{member.name}</Text>
          {member.isAdmin && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          )}
        </View>
        <Text style={styles.memberMeta}>
          Age {member.age} · {member.gender === 'male' ? 'Male' : 'Female'} · {member.height}cm
        </Text>
        <View style={styles.goalChips}>
          {member.goals.slice(0, 2).map((g) => (
            <View
              key={g}
              style={[styles.goalChip, { backgroundColor: member.profileColor + '20' }]}
            >
              <Text style={[styles.goalText, { color: member.profileColor }]}>
                {g.replace(/_/g, ' ')}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Right: BMI + arrow */}
      <View style={styles.right}>
        <View style={[styles.bmiBox, { backgroundColor: bmiInfo.color + '20' }]}>
          <Text style={[styles.bmiNum, { color: bmiInfo.color }]}>{bmi}</Text>
          <Text style={[styles.bmiLabel, { color: bmiInfo.color }]}>BMI</Text>
        </View>
        <Text style={[styles.arrow, { color: member.profileColor }]}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  appIcon: { fontSize: 52 },
  appName: {
    fontSize: FontSize.xxxl,
    color: Colors.textPrimary,
    fontWeight: FontWeight.extrabold,
    marginTop: Spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  sectionLabel: {
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    gap: Spacing.md,
    width: CARD_W,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 30 },
  memberInfo: { flex: 1, gap: 4 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  memberName: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  adminBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary + '30',
  },
  adminBadgeText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  memberMeta: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  goalChips: { flexDirection: 'row', gap: 5, flexWrap: 'wrap' },
  goalChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  goalText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textTransform: 'capitalize',
  },
  right: {
    alignItems: 'center',
    gap: 4,
  },
  bmiBox: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  bmiNum: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
  },
  bmiLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  arrow: {
    fontSize: 24,
    fontWeight: FontWeight.bold,
  },
  footer: {
    alignItems: 'center',
    paddingTop: Spacing.md,
  },
  footerText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
