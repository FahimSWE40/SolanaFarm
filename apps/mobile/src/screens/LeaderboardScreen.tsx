import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import { GlassCard, LeaderboardRow } from '../components/ui';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { useAuthStore } from '../store';

type Period = 'daily' | 'weekly' | 'monthly' | 'all-time';

export default function LeaderboardScreen() {
  const [period, setPeriod] = useState<Period>('all-time');
  const { user } = useAuthStore();

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard', period],
    queryFn: () => api.getLeaderboard(period),
  });

  const { data: myRank } = useQuery({
    queryKey: ['my-rank'],
    queryFn: () => api.getMyRank(),
    enabled: !!user,
  });

  const periods: { key: Period; label: string }[] = [
    { key: 'daily', label: 'Today' },
    { key: 'weekly', label: 'Week' },
    { key: 'monthly', label: 'Month' },
    { key: 'all-time', label: 'All Time' },
  ];

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <View style={s.header}>
        <Text style={s.title}>🏆 Leaderboard</Text>
      </View>
      <View style={s.tabBar}>
        {periods.map((p) => (
          <TouchableOpacity key={p.key} style={[s.tab, period === p.key && s.tabActive]} onPress={() => setPeriod(p.key)}>
            <Text style={[s.tabText, period === p.key && s.tabTextActive]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {myRank && (
        <GlassCard glowColor={colors.primary} style={s.rankCard}>
          <View style={s.rankRow}>
            <View><Text style={s.rl}>Your Rank</Text><Text style={s.rv}>#{myRank.rank}</Text></View>
            <View style={s.div} />
            <View><Text style={s.rl}>Percentile</Text><Text style={[s.rv,{color:colors.secondary}]}>Top {(100-myRank.percentile).toFixed(1)}%</Text></View>
          </View>
        </GlassCard>
      )}
      <ScrollView style={s.list} showsVerticalScrollIndicator={false}>
        {leaderboard?.items?.map((e: any) => (
          <LeaderboardRow key={e.rank} rank={e.rank} username={e.username} xpTotal={e.xpTotal||0} level={e.level} isCurrentUser={e.id===user?.id} />
        ))}
        <View style={{height:100}} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: spacing['5xl'], paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  title: { fontFamily: typography.fontFamily.heading, fontSize: typography.sizes['4xl'], color: colors.textPrimary },
  tabBar: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.lg, gap: spacing.sm },
  tab: { flex:1, paddingVertical: spacing.md, borderRadius: borderRadius.md, backgroundColor: colors.surface, alignItems:'center', borderWidth:1, borderColor: colors.outlineVariant },
  tabActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primary+'60' },
  tabText: { fontFamily: typography.fontFamily.bodyMedium, fontSize: typography.sizes.sm, color: colors.textMuted },
  tabTextActive: { color: colors.primary },
  rankCard: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  rankRow: { flexDirection:'row', justifyContent:'space-around', alignItems:'center' },
  rl: { fontFamily: typography.fontFamily.body, fontSize: typography.sizes.xs, color: colors.textMuted, textAlign:'center' },
  rv: { fontFamily: typography.fontFamily.heading, fontSize: typography.sizes['2xl'], color: colors.textPrimary, textAlign:'center' },
  div: { width:1, height:40, backgroundColor: colors.outlineVariant },
  list: { paddingHorizontal: spacing.lg },
});
