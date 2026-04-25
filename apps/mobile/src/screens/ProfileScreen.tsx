import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import { GlassCard, PrimaryButton, XPProgressBar } from '../components/ui';
import { useAuthStore, useXPStore } from '../store';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

interface ProfileScreenProps {
  onOpenModal?: (modal: 'quiz' | 'referral' | 'premium' | null) => void;
}

export default function ProfileScreen({ onOpenModal }: ProfileScreenProps = {}) {
  const { user, logout } = useAuthStore();
  const xp = useXPStore();
  const { data: badges } = useQuery({ queryKey: ['badges'], queryFn: () => api.getBadges() });
  const { data: referral } = useQuery({ queryKey: ['referral-stats'], queryFn: () => api.getReferralStats() });
  const { data: wallet } = useQuery({ queryKey: ['wallet-score'], queryFn: () => api.getWalletScore() });

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={s.profileHeader}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{(user?.username || 'S')[0].toUpperCase()}</Text>
          </View>
          <Text style={s.name}>{user?.username || 'Seeker'}</Text>
          <Text style={s.wallet}>{user?.walletAddress ? `${user.walletAddress.slice(0,6)}...${user.walletAddress.slice(-4)}` : ''}</Text>
          <View style={s.premiumBadge}>
            <Text style={s.premiumText}>{user?.premiumStatus === 'FREE' ? '🆓 Free' : '⭐ Premium'}</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={s.statsGrid}>
          <GlassCard style={s.statCard}>
            <Text style={s.statVal}>{xp.xpTotal.toLocaleString()}</Text>
            <Text style={s.statLbl}>Total XP</Text>
          </GlassCard>
          <GlassCard style={s.statCard}>
            <Text style={s.statVal}>{xp.level}</Text>
            <Text style={s.statLbl}>Level</Text>
          </GlassCard>
          <GlassCard style={s.statCard}>
            <Text style={s.statVal}>{xp.streakCount}</Text>
            <Text style={s.statLbl}>Streak 🔥</Text>
          </GlassCard>
          <GlassCard style={s.statCard}>
            <Text style={s.statVal}>{user?.completedTasks || 0}</Text>
            <Text style={s.statLbl}>Tasks Done</Text>
          </GlassCard>
        </View>

        {/* Badges */}
        <Text style={s.section}>🏅 Badges ({badges?.earned?.length || 0})</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.badgeScroll}>
          {badges?.earned?.map((b: any, i: number) => (
            <View key={i} style={s.badgeItem}>
              <Text style={s.badgeIcon}>{b.icon === 'stars' ? '⭐' : b.icon === 'local_fire_department' ? '🔥' : b.icon === 'leaderboard' ? '🏆' : '🏅'}</Text>
              <Text style={s.badgeName}>{b.name}</Text>
            </View>
          ))}
          {(!badges?.earned || badges.earned.length === 0) && (
            <Text style={s.emptyText}>Complete tasks to earn badges!</Text>
          )}
        </ScrollView>

        {/* Referral */}
        <Text style={s.section}>👥 Referrals</Text>
        <GlassCard style={s.referralCard}>
          <Text style={s.referralCode}>{user?.referralCode || 'Loading...'}</Text>
          <Text style={s.referralStats}>
            {referral?.total || 0} referred • {referral?.totalXPEarned || 0} XP earned
          </Text>
          <PrimaryButton title="Share Referral Link" onPress={() => onOpenModal?.('referral')} size="sm" variant="secondary" />
        </GlassCard>

        {/* Wallet */}
        <Text style={s.section}>💰 Wallet Score</Text>
        <GlassCard>
          <View style={s.walletRow}>
            <Text style={s.walletLabel}>Reputation</Text>
            <Text style={s.walletVal}>{((wallet?.reputationScore || 0) * 100).toFixed(0)}%</Text>
          </View>
          <XPProgressBar progress={(wallet?.reputationScore || 0) * 100} color={colors.secondary} />
          <View style={s.walletStats}>
            <View><Text style={s.ws}>{wallet?.transactionCount || 0}</Text><Text style={s.wl}>Txns</Text></View>
            <View><Text style={s.ws}>{wallet?.tokenCount || 0}</Text><Text style={s.wl}>Tokens</Text></View>
            <View><Text style={s.ws}>{wallet?.walletAgeDays || 0}d</Text><Text style={s.wl}>Age</Text></View>
          </View>
        </GlassCard>

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
        <View style={{height:100}} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing['5xl'] },
  profileHeader: { alignItems:'center', marginBottom: spacing['2xl'] },
  avatar: { width:80, height:80, borderRadius:40, backgroundColor: colors.primaryContainer, alignItems:'center', justifyContent:'center', marginBottom: spacing.md },
  avatarText: { fontFamily: typography.fontFamily.heading, fontSize: typography.sizes['4xl'], color: colors.primary },
  name: { fontFamily: typography.fontFamily.heading, fontSize: typography.sizes['3xl'], color: colors.textPrimary },
  wallet: { fontFamily: typography.fontFamily.body, fontSize: typography.sizes.sm, color: colors.textMuted, marginTop: spacing.xs },
  premiumBadge: { backgroundColor: colors.surfaceVariant, paddingVertical: spacing.xs, paddingHorizontal: spacing.lg, borderRadius: borderRadius.full, marginTop: spacing.md },
  premiumText: { fontFamily: typography.fontFamily.bodyMedium, fontSize: typography.sizes.sm, color: colors.textSecondary },
  statsGrid: { flexDirection:'row', flexWrap:'wrap', gap: spacing.md, marginBottom: spacing['2xl'] },
  statCard: { flex:1, minWidth:'45%', alignItems:'center' },
  statVal: { fontFamily: typography.fontFamily.heading, fontSize: typography.sizes['3xl'], color: colors.textPrimary },
  statLbl: { fontFamily: typography.fontFamily.body, fontSize: typography.sizes.sm, color: colors.textMuted, marginTop: spacing.xs },
  section: { fontFamily: typography.fontFamily.heading, fontSize: typography.sizes.xl, color: colors.textPrimary, marginBottom: spacing.lg, marginTop: spacing.lg },
  badgeScroll: { marginBottom: spacing.lg },
  badgeItem: { alignItems:'center', marginRight: spacing.lg, width:64 },
  badgeIcon: { fontSize:32 },
  badgeName: { fontFamily: typography.fontFamily.body, fontSize: typography.sizes.xs, color: colors.textMuted, textAlign:'center', marginTop: spacing.xs },
  emptyText: { fontFamily: typography.fontFamily.body, fontSize: typography.sizes.sm, color: colors.textMuted },
  referralCard: { alignItems:'center', gap: spacing.md },
  referralCode: { fontFamily: typography.fontFamily.heading, fontSize: typography.sizes['2xl'], color: colors.primary, letterSpacing: 2 },
  referralStats: { fontFamily: typography.fontFamily.body, fontSize: typography.sizes.sm, color: colors.textMuted },
  walletRow: { flexDirection:'row', justifyContent:'space-between', marginBottom: spacing.sm },
  walletLabel: { fontFamily: typography.fontFamily.body, fontSize: typography.sizes.md, color: colors.textMuted },
  walletVal: { fontFamily: typography.fontFamily.heading, fontSize: typography.sizes.lg, color: colors.secondary },
  walletStats: { flexDirection:'row', justifyContent:'space-around', marginTop: spacing.lg },
  ws: { fontFamily: typography.fontFamily.heading, fontSize: typography.sizes.xl, color: colors.textPrimary, textAlign:'center' },
  wl: { fontFamily: typography.fontFamily.body, fontSize: typography.sizes.xs, color: colors.textMuted, textAlign:'center' },
  logoutBtn: { alignItems:'center', paddingVertical: spacing.lg, marginTop: spacing['2xl'] },
  logoutText: { fontFamily: typography.fontFamily.bodyMedium, fontSize: typography.sizes.lg, color: colors.error },
});
