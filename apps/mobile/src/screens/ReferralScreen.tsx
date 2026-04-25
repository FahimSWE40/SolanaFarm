import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Share,
  TextInput,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing, typography, borderRadius } from '../theme';
import { GlassCard, PrimaryButton } from '../components/ui';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../api/client';
import { useAuthStore } from '../store';

export default function ReferralScreen() {
  const { user } = useAuthStore();
  const [applyCode, setApplyCode] = useState('');
  const [copied, setCopied] = useState(false);

  const { data: referralCode } = useQuery({
    queryKey: ['referral-code'],
    queryFn: () => api.getReferralCode(),
  });

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['referral-stats'],
    queryFn: () => api.getReferralStats(),
  });

  const applyMutation = useMutation({
    mutationFn: (code: string) => api.applyReferralCode(code),
    onSuccess: () => {
      Alert.alert('Success!', 'Referral code applied. You received 50 bonus XP!');
      setApplyCode('');
      refetchStats();
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to apply referral code');
    },
  });

  const handleCopy = async () => {
    if (referralCode?.code) {
      await Clipboard.setStringAsync(referralCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!referralCode?.link) return;
    try {
      await Share.share({
        message: `Join me on Solana Seeker! 🚀 Complete missions, earn XP, and qualify for future rewards.\n\nUse my referral code: ${referralCode.code}\n\n${referralCode.link}`,
        title: 'Join Solana Seeker',
      });
    } catch (e) {
      console.error('Share error:', e);
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: colors.accent,
    QUALIFIED: colors.tertiary,
    REWARDED: colors.secondary,
    REJECTED: colors.error,
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.title}>👥 Referrals</Text>
        <Text style={s.subtitle}>Invite friends, earn XP together</Text>

        {/* Referral Code Card */}
        <GlassCard glowColor={colors.secondary} style={s.codeCard}>
          <Text style={s.codeLabel}>Your Referral Code</Text>
          <TouchableOpacity onPress={handleCopy} activeOpacity={0.7}>
            <View style={s.codeBox}>
              <Text style={s.code}>{referralCode?.code || '---'}</Text>
              <Text style={s.copyIcon}>{copied ? '✓' : '📋'}</Text>
            </View>
          </TouchableOpacity>
          <Text style={s.codeHint}>Tap to copy</Text>

          <View style={s.shareButtons}>
            <PrimaryButton
              title="Share Link"
              onPress={handleShare}
              icon="📤"
              size="md"
              style={s.shareBtn}
            />
          </View>
        </GlassCard>

        {/* Stats */}
        <GlassCard style={s.statsCard}>
          <Text style={s.statsTitle}>Your Impact</Text>
          <View style={s.statsRow}>
            <View style={s.statItem}>
              <Text style={s.statVal}>{stats?.total || 0}</Text>
              <Text style={s.statLbl}>Total Referred</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={[s.statVal, { color: colors.secondary }]}>{stats?.rewarded || 0}</Text>
              <Text style={s.statLbl}>Rewarded</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={[s.statVal, { color: colors.accent }]}>{stats?.totalXPEarned || 0}</Text>
              <Text style={s.statLbl}>XP Earned</Text>
            </View>
          </View>
        </GlassCard>

        {/* Apply referral code (only if not already referred) */}
        {!user?.referredBy && (
          <>
            <Text style={s.applyTitle}>Have a Referral Code?</Text>
            <GlassCard style={s.applyCard}>
              <Text style={s.applyHint}>Enter a friend's code to get 50 bonus XP</Text>
              <View style={s.applyRow}>
                <TextInput
                  style={s.applyInput}
                  value={applyCode}
                  onChangeText={setApplyCode}
                  placeholder="e.g. SS-ABC123"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="characters"
                  maxLength={9}
                />
                <PrimaryButton
                  title="Apply"
                  onPress={() => applyCode && applyMutation.mutate(applyCode)}
                  disabled={!applyCode || applyMutation.isPending}
                  size="sm"
                />
              </View>
            </GlassCard>
          </>
        )}

        {/* How it works */}
        <Text style={s.howTitle}>How It Works</Text>
        <GlassCard style={s.howCard}>
          {[
            { step: '1', text: 'Share your unique referral code with friends' },
            { step: '2', text: 'Friend signs up using your code' },
            { step: '3', text: 'Friend connects wallet and completes 2+ tasks' },
            { step: '4', text: 'You both earn XP! (+100 XP for you, +50 welcome bonus for them)' },
          ].map((item) => (
            <View key={item.step} style={s.howRow}>
              <View style={s.howStep}>
                <Text style={s.howStepText}>{item.step}</Text>
              </View>
              <Text style={s.howText}>{item.text}</Text>
            </View>
          ))}
        </GlassCard>

        {/* Referral list */}
        {stats?.referrals && stats.referrals.length > 0 && (
          <>
            <Text style={s.referralListTitle}>Referred Users</Text>
            {stats.referrals.map((r: any, i: number) => (
              <GlassCard key={i} style={s.referralItem}>
                <View style={s.referralRow}>
                  <View style={s.referralAvatar}>
                    <Text style={s.referralAvatarText}>
                      {(r.username || 'S')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={s.referralInfo}>
                    <Text style={s.referralName}>{r.username || 'Anonymous Seeker'}</Text>
                    <Text style={s.referralDate}>
                      Joined {new Date(r.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View
                    style={[
                      s.statusBadge,
                      { backgroundColor: (statusColors[r.status] || colors.textMuted) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        s.statusText,
                        { color: statusColors[r.status] || colors.textMuted },
                      ]}
                    >
                      {r.status}
                    </Text>
                  </View>
                </View>
                {r.xpAwarded > 0 && (
                  <Text style={s.xpEarned}>+{r.xpAwarded} XP earned</Text>
                )}
              </GlassCard>
            ))}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing['5xl'] },
  title: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes['4xl'],
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing['2xl'],
  },
  codeCard: { alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  codeLabel: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceVariant,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.secondary + '40',
  },
  code: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes['3xl'],
    color: colors.secondary,
    letterSpacing: 3,
  },
  copyIcon: { fontSize: 20 },
  codeHint: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  shareButtons: { width: '100%' },
  shareBtn: {},
  statsCard: { marginBottom: spacing.lg },
  statsTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes.xl,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center' },
  statVal: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes['3xl'],
    color: colors.textPrimary,
  },
  statLbl: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },
  statDivider: { width: 1, height: 40, backgroundColor: colors.outlineVariant },
  applyTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes.xl,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  applyCard: { marginBottom: spacing.lg },
  applyHint: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  applyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  applyInput: {
    flex: 1,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes.lg,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    letterSpacing: 1,
  },
  howTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes.xl,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  howCard: { marginBottom: spacing.lg, gap: spacing.lg },
  howRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  howStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  howStepText: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes.sm,
    color: colors.primary,
  },
  howText: {
    flex: 1,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  referralListTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes.xl,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  referralItem: { marginBottom: spacing.sm },
  referralRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  referralAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralAvatarText: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes.xl,
    color: colors.primary,
  },
  referralInfo: { flex: 1 },
  referralName: {
    fontFamily: typography.fontFamily.headingMedium,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  referralDate: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.sizes.xs,
  },
  xpEarned: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.sizes.sm,
    color: colors.secondary,
    marginTop: spacing.sm,
    paddingLeft: 56,
  },
});
