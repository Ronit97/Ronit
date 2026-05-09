import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { FAMILY_MEMBERS, calculateBMI, getBMICategory } from '../data/profiles';
import { useAppStore } from '../store/useAppStore';
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow } from '../constants/theme';
import { FamilyMember } from '../types';
import {
  getMealLogsForDate,
  getWorkoutsForDate,
  getDailyLogForDate,
  getTodayString,
} from '../services/storage';
import { calculateHealthScore } from '../services/healthScore';
import HealthScoreRing from '../components/HealthScoreRing';

interface MemberStats {
  member: FamilyMember;
  score: number;
  calories: number;
  steps: number;
  workouts: number;
}

export default function FamilyScreen() {
  const { activeMember, setActiveMember } = useAppStore();
  const [memberStats, setMemberStats] = useState<MemberStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllStats();
  }, []);

  const loadAllStats = async () => {
    const today = getTodayString();
    const stats = await Promise.all(
      FAMILY_MEMBERS.map(async (member) => {
        const [meals, workouts, dailyLog] = await Promise.all([
          getMealLogsForDate(member.id, today),
          getWorkoutsForDate(member.id, today),
          getDailyLogForDate(member.id, today),
        ]);
        const score = calculateHealthScore(member, meals, workouts, dailyLog);
        const calories = meals
          .flatMap((m) => m.foods)
          .reduce((s, lf) => s + lf.food.calories * lf.quantity, 0);
        return {
          member,
          score: score.overall,
          calories: Math.round(calories),
          steps: dailyLog?.steps ?? 0,
          workouts: workouts.filter((w) => w.completed).length,
        };
      })
    );
    // Sort by score descending
    stats.sort((a, b) => b.score - a.score);
    setMemberStats(stats);
    setLoading(false);
  };

  const switchMember = async (member: FamilyMember) => {
    await setActiveMember(member);
    router.replace('/(tabs)');
  };

  const topScore = memberStats[0]?.score ?? 0;
  const familyAvg = memberStats.length
    ? Math.round(memberStats.reduce((s, m) => s + m.score, 0) / memberStats.length)
    : 0;
  const totalSteps = memberStats.reduce((s, m) => s + m.steps, 0);
  const totalWorkouts = memberStats.reduce((s, m) => s + m.workouts, 0);

  return (
    <LinearGradient colors={['#0D1B2A', '#0A1628']} style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Agarwal Family 👨‍👩‍👧‍👦</Text>
            <Text style={styles.subtitle}>Today's collective performance</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Family Summary Stats ─────────────────────────────────────── */}
          <View style={styles.summaryCard}>
            <LinearGradient
              colors={['#00D4AA20', '#4ECDC420']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Text style={styles.summaryTitle}>Family Health Today</Text>
            <View style={styles.summaryRow}>
              <SummaryPill emoji="⭐" label="Avg Score" value={`${familyAvg}`} color={Colors.primary} />
              <SummaryPill emoji="👣" label="Combined Steps" value={totalSteps.toLocaleString()} color={Colors.accentBlue} />
              <SummaryPill emoji="💪" label="Workouts Done" value={`${totalWorkouts}`} color={Colors.accentOrange} />
            </View>
          </View>

          {/* ── Leaderboard ──────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 Today's Leaderboard</Text>
            {memberStats.map((stat, index) => (
              <MemberLeaderboardRow
                key={stat.member.id}
                stat={stat}
                rank={index + 1}
                isActive={activeMember?.id === stat.member.id}
                onSwitch={switchMember}
              />
            ))}
          </View>

          {/* ── Family Challenge ──────────────────────────────────────────── */}
          <View style={[styles.challengeCard, Shadow.sm]}>
            <Text style={styles.challengeTitle}>🎯 Weekly Family Challenge</Text>
            <Text style={styles.challengeDesc}>Hit 10,000 steps every day this week</Text>
            <View style={styles.challengeMembers}>
              {memberStats.map((stat) => {
                const pct = Math.min(1, stat.steps / 10000);
                return (
                  <View key={stat.member.id} style={styles.challengeMember}>
                    <LinearGradient
                      colors={stat.member.profileGradient}
                      style={styles.challengeAvatar}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.challengeEmoji}>{stat.member.emoji}</Text>
                    </LinearGradient>
                    <Text style={styles.challengeName}>{stat.member.firstName}</Text>
                    <View style={styles.challengeTrack}>
                      <View
                        style={[
                          styles.challengeFill,
                          {
                            width: `${pct * 100}%`,
                            backgroundColor: stat.member.profileColor,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.challengePct, { color: stat.member.profileColor }]}>
                      {Math.round(pct * 100)}%
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* ── Quick Profile Switch ──────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Switch Profile</Text>
            <View style={styles.switchGrid}>
              {FAMILY_MEMBERS.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  style={[
                    styles.switchCard,
                    activeMember?.id === member.id && styles.switchCardActive,
                    { borderColor: member.profileColor + '60' },
                  ]}
                  onPress={() => switchMember(member)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={member.profileGradient}
                    style={styles.switchAvatar}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.switchEmoji}>{member.emoji}</Text>
                  </LinearGradient>
                  <Text style={styles.switchName}>{member.firstName}</Text>
                  <Text style={[styles.switchAge, { color: member.profileColor }]}>
                    {member.age}y
                  </Text>
                  {activeMember?.id === member.id && (
                    <View style={[styles.activeDot, { backgroundColor: member.profileColor }]} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Member detail cards ──────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Member Profiles</Text>
            {FAMILY_MEMBERS.map((member) => {
              const bmi = calculateBMI(member.weight, member.height);
              const bmiInfo = getBMICategory(bmi);
              const stat = memberStats.find((s) => s.member.id === member.id);
              return (
                <TouchableOpacity
                  key={member.id}
                  style={[styles.profileCard, Shadow.sm]}
                  onPress={() => switchMember(member)}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={member.profileGradient}
                    style={styles.profileAvatar}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.profileEmoji}>{member.emoji}</Text>
                  </LinearGradient>
                  <View style={styles.profileInfo}>
                    <View style={styles.profileNameRow}>
                      <Text style={styles.profileName}>{member.name}</Text>
                      {member.isAdmin && (
                        <View style={styles.adminBadge}>
                          <Text style={styles.adminText}>Admin</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.profileMeta}>
                      {member.age}y · {member.gender === 'male' ? 'M' : 'F'} · {member.height}cm · {member.weight}kg
                    </Text>
                    <View style={[styles.bmiChip, { backgroundColor: bmiInfo.color + '20' }]}>
                      <Text style={[styles.bmiText, { color: bmiInfo.color }]}>
                        BMI {bmi} · {bmiInfo.label}
                      </Text>
                    </View>
                    <Text style={styles.profileGoals} numberOfLines={1}>
                      🎯 {member.goals.map((g) => g.replace(/_/g, ' ')).join(' · ')}
                    </Text>
                  </View>
                  {stat !== undefined && (
                    <HealthScoreRing score={stat.score} size={60} strokeWidth={6} showLabel={false} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ height: Spacing.xxl }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function MemberLeaderboardRow({
  stat,
  rank,
  isActive,
  onSwitch,
}: {
  stat: MemberStats;
  rank: number;
  isActive: boolean;
  onSwitch: (m: FamilyMember) => void;
}) {
  const rankEmojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
  return (
    <TouchableOpacity
      style={[styles.lbRow, isActive && styles.lbRowActive, { borderLeftColor: stat.member.profileColor }]}
      onPress={() => onSwitch(stat.member)}
      activeOpacity={0.8}
    >
      <Text style={styles.lbRank}>{rankEmojis[rank - 1] ?? `${rank}.`}</Text>
      <LinearGradient
        colors={stat.member.profileGradient}
        style={styles.lbAvatar}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.lbAvatarEmoji}>{stat.member.emoji}</Text>
      </LinearGradient>
      <View style={styles.lbInfo}>
        <Text style={styles.lbName}>{stat.member.firstName}</Text>
        <Text style={styles.lbMeta}>
          {stat.calories > 0 ? `${stat.calories} kcal` : 'No meals logged'} · {stat.steps.toLocaleString()} steps
        </Text>
      </View>
      <View style={styles.lbScoreWrap}>
        <Text style={[styles.lbScore, { color: stat.member.profileColor }]}>{stat.score}</Text>
        <Text style={styles.lbScoreLabel}>score</Text>
      </View>
    </TouchableOpacity>
  );
}

function SummaryPill({
  emoji, label, value, color,
}: {
  emoji: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.summaryPill}>
      <Text style={styles.summaryPillEmoji}>{emoji}</Text>
      <Text style={[styles.summaryPillValue, { color }]}>{value}</Text>
      <Text style={styles.summaryPillLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 26,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
    lineHeight: 30,
  },
  title: {
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    fontWeight: FontWeight.extrabold,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  // Summary card
  summaryCard: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    padding: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: Colors.bgCard,
  },
  summaryTitle: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  summaryRow: { flexDirection: 'row', gap: Spacing.sm },
  summaryPill: { flex: 1, alignItems: 'center', gap: 3 },
  summaryPillEmoji: { fontSize: 22 },
  summaryPillValue: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  summaryPillLabel: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
  // Section
  section: { gap: Spacing.sm },
  sectionTitle: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  // Leaderboard
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderLeftWidth: 4,
  },
  lbRowActive: {
    backgroundColor: Colors.bgElevated,
  },
  lbRank: { fontSize: 20, width: 30 },
  lbAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lbAvatarEmoji: { fontSize: 20 },
  lbInfo: { flex: 1 },
  lbName: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  lbMeta: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  lbScoreWrap: { alignItems: 'center' },
  lbScore: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  lbScoreLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  // Challenge
  challengeCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  challengeTitle: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  challengeDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  challengeMembers: { gap: Spacing.sm },
  challengeMember: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  challengeAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeEmoji: { fontSize: 14 },
  challengeName: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    width: 50,
    fontWeight: FontWeight.medium,
  },
  challengeTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  challengeFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  challengePct: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    width: 32,
    textAlign: 'right',
  },
  // Switch grid
  switchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  switchCard: {
    width: '18%',
    alignItems: 'center',
    gap: 4,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgCard,
    borderWidth: 1.5,
    position: 'relative',
  },
  switchCardActive: {
    backgroundColor: Colors.bgElevated,
  },
  switchAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchEmoji: { fontSize: 20 },
  switchName: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  switchAge: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  activeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Profile cards
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  profileAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileEmoji: { fontSize: 26 },
  profileInfo: { flex: 1, gap: 3 },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  profileName: {
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
  adminText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  profileMeta: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  bmiChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  bmiText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  profileGoals: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
