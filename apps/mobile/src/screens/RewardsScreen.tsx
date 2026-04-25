import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import { GlassCard, XPProgressBar, PrimaryButton } from '../components/ui';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { useAuthStore } from '../store';

interface RewardsScreenProps {
  onUpgrade?: () => void;
}

export default function RewardsScreen({ onUpgrade }: RewardsScreenProps = {}) {
  const { user } = useAuthStore();
  const isPremium = user?.premiumStatus !== 'FREE';
  const { data: eligibility } = useQuery({ queryKey: ['eligibility'], queryFn: () => api.getEligibility() });
  const { data: tiers } = useQuery({ queryKey: ['tiers'], queryFn: () => api.getTiers() });

  const tierColors: Record<string, string> = {
    DIAMOND: colors.diamond, PLATINUM: colors.platinum, GOLD: colors.gold, SILVER: colors.silver, BRONZE: colors.bronze,
  };
  const tierEmojis: Record<string, string> = {
    DIAMOND: '💎', PLATINUM: '🏆', GOLD: '🥇', SILVER: '🥈', BRONZE: '🥉',
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>💎 Rewards</Text>
        <Text style={s.subtitle}>Your eligibility for future rewards</Text>

        {eligibility && (
          <GlassCard glowColor={tierColors[eligibility.tier]} style={s.tierCard}>
            <Text style={s.tierEmoji}>{tierEmojis[eligibility.tier]}</Text>
            <Text style={[s.tierName, { color: tierColors[eligibility.tier] }]}>{eligibility.tier}</Text>
            <Text style={s.tierScore}>Score: {eligibility.score}/100</Text>
            <XPProgressBar progress={eligibility.score} height={12} color={tierColors[eligibility.tier]} showLabel />

            <View style={s.breakdown}>
              {Object.entries(eligibility.breakdown).map(([key, val]) => (
                <View key={key} style={s.breakdownRow}>
                  <Text style={s.breakdownLabel}>{key.replace('Score','').replace(/([A-Z])/g,' $1').trim()}</Text>
                  <Text style={s.breakdownVal}>{val as number}</Text>
                </View>
              ))}
            </View>

            {eligibility.nextTier && (
              <View style={s.nextTier}>
                <Text style={s.nextTierText}>
                  {eligibility.pointsToNextTier} points to {eligibility.nextTier}
                </Text>
              </View>
            )}
          </GlassCard>
        )}

        {!isPremium && onUpgrade && (
          <GlassCard glowColor={colors.primary} style={s.upgradeCard}>
            <Text style={s.upgradeTitle}>⭐ Boost Your Eligibility</Text>
            <Text style={s.upgradeDesc}>Premium members earn up to 1.5x XP, climbing tiers faster.</Text>
            <PrimaryButton title="Upgrade to Premium" onPress={onUpgrade} size="md" />
          </GlassCard>
        )}

        <Text style={s.sectionTitle}>Reward Tiers</Text>
        {tiers?.map((tier: any) => (
          <GlassCard key={tier.id} style={s.tierInfoCard}>
            <View style={s.tierInfoRow}>
              <Text style={[s.tierInfoName, { color: tierColors[tier.id] || colors.textPrimary }]}>
                {tierEmojis[tier.id]} {tier.name}
              </Text>
              <Text style={s.tierInfoMin}>Min: {tier.minScore}</Text>
            </View>
            <Text style={s.tierInfoDesc}>{tier.description}</Text>
            <View style={s.benefits}>
              {tier.benefits?.map((b: string, i: number) => (
                <Text key={i} style={s.benefit}>• {b}</Text>
              ))}
            </View>
          </GlassCard>
        ))}
        <View style={{height:100}} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing['5xl'] },
  title: { fontFamily: typography.fontFamily.heading, fontSize: typography.sizes['4xl'], color: colors.textPrimary },
  subtitle: { fontFamily: typography.fontFamily.body, fontSize: typography.sizes.md, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing['2xl'] },
  tierCard: { alignItems:'center', marginBottom: spacing['2xl'] },
  tierEmoji: { fontSize:48, marginBottom: spacing.sm },
  tierName: { fontFamily: typography.fontFamily.heading, fontSize: typography.sizes['3xl'] },
  tierScore: { fontFamily: typography.fontFamily.body, fontSize: typography.sizes.md, color: colors.textMuted, marginVertical: spacing.md },
  breakdown: { width:'100%', marginTop: spacing.lg, gap: spacing.sm },
  breakdownRow: { flexDirection:'row', justifyContent:'space-between' },
  breakdownLabel: { fontFamily: typography.fontFamily.body, fontSize: typography.sizes.sm, color: colors.textMuted, textTransform:'capitalize' },
  breakdownVal: { fontFamily: typography.fontFamily.heading, fontSize: typography.sizes.md, color: colors.textPrimary },
  nextTier: { backgroundColor: colors.primaryContainer+'40', paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: borderRadius.full, marginTop: spacing.lg },
  nextTierText: { fontFamily: typography.fontFamily.bodyMedium, fontSize: typography.sizes.sm, color: colors.primary },
  sectionTitle: { fontFamily: typography.fontFamily.heading, fontSize: typography.sizes['2xl'], color: colors.textPrimary, marginBottom: spacing.lg },
  tierInfoCard: { marginBottom: spacing.md },
  tierInfoRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom: spacing.sm },
  tierInfoName: { fontFamily: typography.fontFamily.heading, fontSize: typography.sizes.xl },
  tierInfoMin: { fontFamily: typography.fontFamily.body, fontSize: typography.sizes.sm, color: colors.textMuted },
  tierInfoDesc: { fontFamily: typography.fontFamily.body, fontSize: typography.sizes.sm, color: colors.textMuted, marginBottom: spacing.sm },
  benefits: { gap: spacing.xs },
  benefit: { fontFamily: typography.fontFamily.body, fontSize: typography.sizes.sm, color: colors.textSecondary },
  upgradeCard: { marginBottom: spacing['2xl'], gap: spacing.md },
  upgradeTitle: { fontFamily: typography.fontFamily.heading, fontSize: typography.sizes.xl, color: colors.primary },
  upgradeDesc: { fontFamily: typography.fontFamily.body, fontSize: typography.sizes.sm, color: colors.textSecondary },
});
