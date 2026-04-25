import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import { GlassCard, XPProgressBar, StatBadge, SectionHeader, TaskCard } from '../components/ui';
import { useAuthStore, useXPStore } from '../store';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../api/client';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  onOpenModal?: (modal: 'quiz' | 'referral' | 'premium' | null) => void;
}

export default function HomeScreen({ onOpenModal }: HomeScreenProps = {}) {
  const { user, fetchProfile } = useAuthStore();
  const xpStore = useXPStore();

  const { data: tasks, refetch: refetchTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['daily-tasks'],
    queryFn: () => api.getDailyTasks(),
  });

  const { data: xpSummary, refetch: refetchXP } = useQuery({
    queryKey: ['xp-summary'],
    queryFn: () => api.getXPSummary(),
    enabled: !!user,
  });

  const claimMutation = useMutation({
    mutationFn: (taskId: string) => api.claimTask(taskId),
    onSuccess: () => {
      refetchTasks();
      refetchXP();
      fetchProfile();
    },
  });

  useEffect(() => {
    if (xpSummary) {
      xpStore.setXPSummary(xpSummary);
    }
  }, [xpSummary]);

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchTasks(), refetchXP(), fetchProfile()]);
    setRefreshing(false);
  };

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}, Seeker</Text>
            <Text style={styles.username}>
              {user?.username || `${user?.walletAddress?.slice(0, 4)}...${user?.walletAddress?.slice(-4)}`}
            </Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lv {xpStore.level}</Text>
          </View>
        </View>

        {/* XP Overview Card */}
        <GlassCard glowColor={colors.primary} style={styles.xpCard}>
          <View style={styles.xpCardHeader}>
            <View>
              <Text style={styles.xpLabel}>Total XP</Text>
              <Text style={styles.xpValue}>{xpStore.xpTotal.toLocaleString()}</Text>
            </View>
            <View style={styles.xpMultiplierBadge}>
              <Text style={styles.xpMultiplierText}>
                {xpStore.premiumMultiplier > 1 ? `${xpStore.premiumMultiplier}x` : '1x'}
              </Text>
            </View>
          </View>

          <View style={styles.xpProgressSection}>
            <View style={styles.xpProgressLabel}>
              <Text style={styles.xpProgressText}>Level {xpStore.level}</Text>
              <Text style={styles.xpProgressText}>Level {xpStore.level + 1}</Text>
            </View>
            <XPProgressBar progress={xpStore.progressPercent} height={10} color={colors.primary} />
            <Text style={styles.xpToNext}>
              {xpStore.xpToNextLevel.toLocaleString()} XP to next level
            </Text>
          </View>

          <View style={styles.statsRow}>
            <StatBadge icon="🔥" label="Streak" value={xpStore.streakCount} color={colors.accentOrange} />
            <StatBadge icon="⭐" label="Today" value={`+${xpStore.todayXP}`} color={colors.accent} />
            <StatBadge icon="📈" label="Bonus" value={`${xpStore.streakBonusPercent}%`} color={colors.secondary} />
          </View>
        </GlassCard>

        {/* Daily Streak */}
        <GlassCard glowColor={colors.accentOrange} style={styles.streakCard}>
          <View style={styles.streakRow}>
            <Text style={styles.streakIcon}>🔥</Text>
            <View style={styles.streakInfo}>
              <Text style={styles.streakTitle}>{xpStore.streakCount}-Day Streak</Text>
              <Text style={styles.streakSubtitle}>
                {xpStore.streakBonusPercent > 0
                  ? `+${xpStore.streakBonusPercent}% XP bonus active!`
                  : 'Keep going to unlock streak bonuses!'}
              </Text>
            </View>
            <TouchableOpacity style={styles.checkinButton}>
              <Text style={styles.checkinText}>✓</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Daily Tasks */}
        <SectionHeader
          title="Daily Missions"
          subtitle="Complete tasks to earn XP"
          action={{ label: 'See All →', onPress: () => {} }}
        />

        {tasks?.map((task: any) => (
          <TaskCard
            key={task.id}
            title={task.title}
            description={task.description}
            xpReward={task.xpReward}
            iconName={task.iconName}
            difficulty={task.difficulty}
            status={task.userStatus}
            onPress={() => {
              if (task.userStatus === 'COMPLETED') {
                claimMutation.mutate(task.id);
              } else if (!task.userStatus) {
                api.completeTask(task.id).then(() => refetchTasks());
              }
            }}
          />
        ))}

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" />
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionCard} onPress={() => onOpenModal?.('quiz')}>
            <Text style={styles.quickActionIcon}>🧠</Text>
            <Text style={styles.quickActionLabel}>Quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard} onPress={() => onOpenModal?.('referral')}>
            <Text style={styles.quickActionIcon}>👥</Text>
            <Text style={styles.quickActionLabel}>Refer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard} onPress={() => onOpenModal?.('premium')}>
            <Text style={styles.quickActionIcon}>⭐</Text>
            <Text style={styles.quickActionLabel}>Premium</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard} onPress={() => onOpenModal?.('quiz')}>
            <Text style={styles.quickActionIcon}>💎</Text>
            <Text style={styles.quickActionLabel}>Rewards</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['5xl'],
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  greeting: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
  },
  username: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes['3xl'],
    color: colors.textPrimary,
    marginTop: spacing.xxs,
  },
  levelBadge: {
    backgroundColor: colors.primaryContainer,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
  },
  levelText: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes.md,
    color: colors.primary,
  },

  // XP Card
  xpCard: {
    marginBottom: spacing.lg,
  },
  xpCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  xpLabel: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  xpValue: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes['5xl'],
    color: colors.textPrimary,
    marginTop: -4,
  },
  xpMultiplierBadge: {
    backgroundColor: colors.secondary + '20',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.secondary + '40',
  },
  xpMultiplierText: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes.md,
    color: colors.secondary,
  },

  // XP Progress
  xpProgressSection: {
    marginBottom: spacing.lg,
  },
  xpProgressLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  xpProgressText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  xpToNext: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.xs,
    color: colors.primaryDim,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },

  // Streak Card
  streakCard: {
    marginBottom: spacing['2xl'],
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  streakIcon: {
    fontSize: 32,
  },
  streakInfo: {
    flex: 1,
  },
  streakTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes.xl,
    color: colors.textPrimary,
  },
  streakSubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  checkinButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.secondary + '40',
  },
  checkinText: {
    fontSize: 20,
    color: colors.secondary,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  quickActionLabel: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});
