import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import { GlassCard, PrimaryButton } from '../components/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useAuthStore } from '../store';

export default function PremiumScreen() {
  const { user, fetchProfile } = useAuthStore();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<'monthly' | 'yearly'>('yearly');

  const { data: plans } = useQuery({
    queryKey: ['premium-plans'],
    queryFn: () => api.getPlans(),
  });

  const subscribeMutation = useMutation({
    mutationFn: (plan: string) => api.subscribe(plan.toUpperCase()),
    onSuccess: () => {
      Alert.alert(
        '⭐ Welcome to Premium!',
        'Your premium subscription is now active. Enjoy your XP multiplier!',
        [{ text: 'Awesome!', onPress: () => fetchProfile() }],
      );
      qc.invalidateQueries({ queryKey: ['xp-summary'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message || 'Subscription failed');
    },
  });

  const isPremium = user?.premiumStatus !== 'FREE';

  const planDetails = [
    {
      id: 'monthly',
      name: 'Premium',
      price: '$9.99',
      period: '/month',
      multiplier: '1.25x',
      color: colors.tertiary,
      features: [
        '1.25x XP multiplier on all tasks',
        'Access to premium-only tasks',
        'Advanced stats and analytics',
        'Premium profile badge',
        'Priority in leaderboard visibility',
      ],
    },
    {
      id: 'yearly',
      name: 'Premium Pro',
      price: '$79.99',
      period: '/year',
      multiplier: '1.5x',
      color: colors.primary,
      badge: 'Best Value',
      features: [
        '1.5x XP multiplier on all tasks',
        'All premium-only tasks',
        'Early access to campaigns',
        'Exclusive Premium Pro badge',
        'Priority support',
        'Save $39.89 vs monthly',
      ],
    },
  ];

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerEmoji}>⭐</Text>
          <Text style={s.title}>Upgrade to Premium</Text>
          <Text style={s.subtitle}>Boost your XP and unlock exclusive features</Text>
        </View>

        {/* Current Status */}
        {isPremium && (
          <GlassCard glowColor={colors.primary} style={s.activeCard}>
            <Text style={s.activeTitle}>⭐ {user?.premiumStatus === 'PREMIUM_PRO' ? 'Premium Pro' : 'Premium'} Active</Text>
            <Text style={s.activeDesc}>
              You're enjoying {user?.premiumStatus === 'PREMIUM_PRO' ? '1.5x' : '1.25x'} XP multiplier on all your tasks!
            </Text>
          </GlassCard>
        )}

        {/* XP Multiplier Comparison */}
        <Text style={s.sectionTitle}>XP Multiplier Comparison</Text>
        <GlassCard style={s.comparisonCard}>
          {[
            { tier: 'Free', multiplier: '1.0x', color: colors.textMuted, active: !isPremium },
            { tier: 'Premium', multiplier: '1.25x', color: colors.tertiary, active: user?.premiumStatus === 'PREMIUM' },
            { tier: 'Premium Pro', multiplier: '1.5x', color: colors.primary, active: user?.premiumStatus === 'PREMIUM_PRO' },
          ].map((row) => (
            <View key={row.tier} style={[s.compRow, row.active && s.compRowActive]}>
              <Text style={s.compTier}>{row.tier}</Text>
              <Text style={[s.compMul, { color: row.color }]}>{row.multiplier}</Text>
              {row.active && <Text style={s.compCurrent}>✓ Current</Text>}
            </View>
          ))}
        </GlassCard>

        {/* Plan Selector */}
        {!isPremium && (
          <>
            <Text style={s.sectionTitle}>Choose Your Plan</Text>
            <View style={s.planSelector}>
              {planDetails.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={[s.planCard, selected === plan.id && { borderColor: plan.color, borderWidth: 2 }]}
                  onPress={() => setSelected(plan.id as 'monthly' | 'yearly')}
                  activeOpacity={0.8}
                >
                  {plan.badge && (
                    <View style={[s.planBadge, { backgroundColor: plan.color }]}>
                      <Text style={s.planBadgeText}>{plan.badge}</Text>
                    </View>
                  )}
                  <Text style={[s.planName, { color: plan.color }]}>{plan.name}</Text>
                  <View style={s.planPrice}>
                    <Text style={s.planPriceVal}>{plan.price}</Text>
                    <Text style={s.planPricePeriod}>{plan.period}</Text>
                  </View>
                  <View style={s.planMultiplierBadge}>
                    <Text style={[s.planMultiplierText, { color: plan.color }]}>
                      {plan.multiplier} XP
                    </Text>
                  </View>
                  <View style={s.planFeatures}>
                    {plan.features.map((feature, i) => (
                      <View key={i} style={s.featureRow}>
                        <Text style={[s.featureCheck, { color: plan.color }]}>✓</Text>
                        <Text style={s.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                  {selected === plan.id && (
                    <View style={[s.selectedIndicator, { backgroundColor: plan.color + '20', borderColor: plan.color + '60' }]}>
                      <Text style={[s.selectedText, { color: plan.color }]}>Selected</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <PrimaryButton
              title={`Subscribe to ${selected === 'yearly' ? 'Premium Pro' : 'Premium'}`}
              onPress={() => {
                Alert.alert(
                  'Confirm Subscription',
                  `Subscribe to ${selected === 'yearly' ? 'Premium Pro ($79.99/year)' : 'Premium ($9.99/month)'}?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Subscribe',
                      onPress: () => subscribeMutation.mutate(selected),
                    },
                  ],
                );
              }}
              disabled={subscribeMutation.isPending}
              size="lg"
              style={s.subscribeBtn}
            />

            <Text style={s.disclaimer}>
              * Payment processing coming soon. Subscriptions will be activated via in-app purchases.
            </Text>
          </>
        )}

        {/* Benefits Overview */}
        <Text style={s.sectionTitle}>Why Go Premium?</Text>
        <GlassCard style={s.benefitsCard}>
          {[
            { icon: '⚡', title: 'More XP Per Task', desc: 'Earn up to 50% more XP on every task you complete' },
            { icon: '🎯', title: 'Exclusive Missions', desc: 'Access premium-only tasks with higher XP rewards' },
            { icon: '📊', title: 'Advanced Analytics', desc: 'Deep dive into your progress with detailed stats' },
            { icon: '🚀', title: 'Early Access', desc: 'Get first access to new campaigns and features' },
            { icon: '🏆', title: 'Climb Faster', desc: 'Reach higher tiers and better reward eligibility' },
          ].map((b) => (
            <View key={b.title} style={s.benefitRow}>
              <Text style={s.benefitIcon}>{b.icon}</Text>
              <View style={s.benefitInfo}>
                <Text style={s.benefitTitle}>{b.title}</Text>
                <Text style={s.benefitDesc}>{b.desc}</Text>
              </View>
            </View>
          ))}
        </GlassCard>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing['5xl'] },
  header: { alignItems: 'center', marginBottom: spacing['3xl'] },
  headerEmoji: { fontSize: 48, marginBottom: spacing.md },
  title: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes['3xl'],
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  activeCard: { marginBottom: spacing['2xl'], alignItems: 'center' },
  activeTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes.xl,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  activeDesc: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes.xl,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    marginTop: spacing.lg,
  },
  comparisonCard: { marginBottom: spacing.lg, gap: spacing.md },
  compRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  compRowActive: {
    backgroundColor: colors.primaryContainer + '20',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  compTier: {
    flex: 1,
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  compMul: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes.xl,
    marginRight: spacing.md,
  },
  compCurrent: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.xs,
    color: colors.secondary,
  },
  planSelector: { gap: spacing.lg, marginBottom: spacing.xl },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    position: 'relative',
  },
  planBadge: {
    position: 'absolute',
    top: -spacing.sm,
    right: spacing.xl,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  planBadgeText: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes.xs,
    color: colors.onPrimary,
  },
  planName: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes['2xl'],
    marginBottom: spacing.sm,
  },
  planPrice: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs, marginBottom: spacing.md },
  planPriceVal: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes['4xl'],
    color: colors.textPrimary,
  },
  planPricePeriod: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
  },
  planMultiplierBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryContainer + '40',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
  },
  planMultiplierText: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes.md,
  },
  planFeatures: { gap: spacing.sm },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  featureCheck: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes.md,
    width: 20,
  },
  featureText: {
    flex: 1,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  selectedIndicator: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  selectedText: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes.sm,
  },
  subscribeBtn: { marginBottom: spacing.md },
  disclaimer: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing['3xl'],
    lineHeight: 16,
  },
  benefitsCard: { gap: spacing.lg },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg },
  benefitIcon: { fontSize: 24, width: 32 },
  benefitInfo: { flex: 1 },
  benefitTitle: {
    fontFamily: typography.fontFamily.headingMedium,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  benefitDesc: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
});
