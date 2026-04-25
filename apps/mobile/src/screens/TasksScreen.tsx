import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import { GlassCard, TaskCard, SectionHeader } from '../components/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';

type Tab = 'daily' | 'weekly' | 'all';

export default function TasksScreen() {
  const [tab, setTab] = useState<Tab>('daily');
  const [refreshing, setRefreshing] = useState(false);
  const qc = useQueryClient();

  const { data: dailyTasks, refetch: refetchDaily } = useQuery({
    queryKey: ['tasks', 'daily'],
    queryFn: () => api.getDailyTasks(),
  });

  const { data: weeklyTasks, refetch: refetchWeekly } = useQuery({
    queryKey: ['tasks', 'weekly'],
    queryFn: () => api.getWeeklyTasks(),
  });

  const { data: allTasks, refetch: refetchAll } = useQuery({
    queryKey: ['tasks', 'all'],
    queryFn: () => api.getTasks(),
  });

  const completeMutation = useMutation({
    mutationFn: (taskId: string) => api.completeTask(taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['xp-summary'] });
    },
  });

  const claimMutation = useMutation({
    mutationFn: (taskId: string) => api.claimTask(taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['xp-summary'] });
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchDaily(), refetchWeekly(), refetchAll()]);
    setRefreshing(false);
  };

  const activeTasks =
    tab === 'daily' ? dailyTasks :
    tab === 'weekly' ? weeklyTasks :
    allTasks;

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'daily', label: 'Daily', icon: '☀️' },
    { key: 'weekly', label: 'Weekly', icon: '📅' },
    { key: 'all', label: 'All Tasks', icon: '⚡' },
  ];

  const handleTaskPress = (task: any) => {
    if (task.userStatus === 'COMPLETED') {
      claimMutation.mutate(task.id);
    } else if (!task.userStatus || task.userStatus === 'PENDING') {
      completeMutation.mutate(task.id);
    }
  };

  const completedCount = activeTasks?.filter((t: any) => t.userStatus === 'CLAIMED').length || 0;
  const totalCount = activeTasks?.length || 0;

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>⚡ Missions</Text>
        {totalCount > 0 && (
          <View style={s.progressBadge}>
            <Text style={s.progressText}>{completedCount}/{totalCount}</Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[s.tab, tab === t.key && s.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={s.tabIcon}>{t.icon}</Text>
            <Text style={[s.tabLabel, tab === t.key && s.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={s.list}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Stats summary */}
        {totalCount > 0 && (
          <GlassCard style={s.summaryCard}>
            <View style={s.summaryRow}>
              <View style={s.summaryItem}>
                <Text style={s.summaryVal}>{completedCount}</Text>
                <Text style={s.summaryLbl}>Completed</Text>
              </View>
              <View style={s.summaryDivider} />
              <View style={s.summaryItem}>
                <Text style={s.summaryVal}>{totalCount - completedCount}</Text>
                <Text style={s.summaryLbl}>Remaining</Text>
              </View>
              <View style={s.summaryDivider} />
              <View style={s.summaryItem}>
                <Text style={[s.summaryVal, { color: colors.secondary }]}>
                  +{activeTasks?.filter((t: any) => !t.userStatus || t.userStatus === 'PENDING')
                    .reduce((sum: number, t: any) => sum + t.xpReward, 0) || 0}
                </Text>
                <Text style={s.summaryLbl}>XP Available</Text>
              </View>
            </View>
          </GlassCard>
        )}

        {/* Task list */}
        {activeTasks?.length === 0 && (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🎯</Text>
            <Text style={s.emptyTitle}>All done!</Text>
            <Text style={s.emptyDesc}>Check back later for more missions.</Text>
          </View>
        )}

        {activeTasks?.map((task: any) => (
          <TaskCard
            key={task.id}
            title={task.title}
            description={task.description}
            xpReward={task.xpReward}
            iconName={task.iconName}
            difficulty={task.difficulty}
            status={task.userStatus}
            onPress={() => handleTaskPress(task)}
          />
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing['5xl'],
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes['4xl'],
    color: colors.textPrimary,
  },
  progressBadge: {
    backgroundColor: colors.primaryContainer,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes.md,
    color: colors.primary,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  tabActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary + '60',
  },
  tabIcon: { fontSize: 14 },
  tabLabel: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  tabLabelActive: { color: colors.primary },
  list: { flex: 1 },
  listContent: { paddingHorizontal: spacing.lg },
  summaryCard: { marginBottom: spacing.lg },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  summaryItem: { alignItems: 'center' },
  summaryVal: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes['2xl'],
    color: colors.textPrimary,
  },
  summaryLbl: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.outlineVariant,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing['6xl'],
  },
  emptyIcon: { fontSize: 48, marginBottom: spacing.lg },
  emptyTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes['2xl'],
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyDesc: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
  },
});
