import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../theme';
import api from '../api/client';

interface PremiumScreenProps {
  onClose?: () => void;
}

function FeatureRow({ icon, title, sub, gold }: {
  icon: string; title: string; sub: string; gold?: boolean;
}) {
  return (
    <View style={[s.featureRow, gold && s.featureRowGold]}>
      <View style={[s.featureIcon, gold && s.featureIconGold]}>
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.featureTitle}>{title}</Text>
        <Text style={s.featureSub}>{sub}</Text>
      </View>
    </View>
  );
}

function CheckItem({ text, gold }: { text: string; gold?: boolean }) {
  return (
    <View style={s.checkRow}>
      <Text style={[s.checkIcon, gold ? { color: colors.gold } : { color: colors.primary }]}>✓</Text>
      <Text style={[s.checkText, gold && { color: 'rgba(255,255,255,0.90)', fontFamily: typography.fontFamily.bodyMedium }]}>{text}</Text>
    </View>
  );
}

export default function PremiumScreen({ onClose }: PremiumScreenProps = {}) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = (plan: 'monthly' | 'yearly') => {
    const price = plan === 'monthly' ? '$4.99/mo' : '$9.99/mo';
    Alert.alert(
      'Upgrade to Elite',
      `Subscribe for ${price}?\n\n${plan === 'yearly' ? '2×' : '1.25×'} XP multiplier + all premium features.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upgrade',
          onPress: async () => {
            setLoading(true);
            try {
              await api.upgradePremium(plan);
              Alert.alert('Elite Status Activated!', 'Your XP multiplier is now live.');
              onClose?.();
            } catch {
              Alert.alert('Error', 'Upgrade failed. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />

      <View style={s.header}>
        <Text style={s.headerTitle}>Solana Seeker</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={s.closeBtn}>
            <Text style={s.closeIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Hero ── */}
        <View style={s.heroSection}>
          <View style={s.heroOrb1} />
          <View style={s.heroOrb2} />
          <Text style={s.heroTitle}>Elite Status{'\n'}Awaits</Text>
          <Text style={s.heroSub}>
            Elevate your presence on the Solana network with exclusive rewards and
            advanced tools designed for the top 1% of seekers.
          </Text>
        </View>

        {/* ── Feature highlights ── */}
        <View style={s.features}>
          <FeatureRow icon="⚡" title="XP Surge Protocol" sub="Activate a permanent 1.25x–2x multiplier on all XP gains." gold />
          <FeatureRow icon="💎" title="High-Stakes Missions" sub="Exclusive access to Tier 3 operations featuring rare NFT blueprints." />
          <FeatureRow icon="📊" title="On-Chain Intelligence" sub="Real-time performance analytics and predictive mission modeling." />
        </View>

        {/* ── Plan: Basic ── */}
        <View style={s.planCard}>
          <View style={s.planCardInner}>
            <Text style={s.planLabel}>SEEKER CORPS</Text>
            <Text style={s.planName}>Premium</Text>
            <View style={s.planPrice}>
              <Text style={s.planPriceNum}>$4.99</Text>
              <Text style={s.planPricePer}> / month</Text>
            </View>
            <View style={s.planFeatures}>
              <CheckItem text="1.25x XP Multiplier" />
              <CheckItem text="Tier 1 Premium Tasks" />
              <CheckItem text="Standard Analytics" />
            </View>
            <TouchableOpacity style={s.planBtnBasic} onPress={() => handleUpgrade('monthly')} disabled={loading}>
              <Text style={s.planBtnBasicText}>Select Basic</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Plan: Elite Pro ── */}
        <View style={s.elitePlanWrap}>
          <LinearGradient colors={['#D4AF37', '#9945FF']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={s.eliteBorder}>
            <View style={s.elitePlanInner}>
              <LinearGradient colors={['#D4AF37', '#F9E29C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.popularBadge}>
                <Text style={s.popularBadgeText}>Most Popular</Text>
              </LinearGradient>
              <Text style={s.elitePlanLabel}>ELITE COMMAND</Text>
              <View style={s.elitePlanNameRow}>
                <Text style={s.elitePlanName}>Premium Pro </Text>
                <Text style={{ fontSize: 18, color: colors.gold }}>★</Text>
              </View>
              <View style={s.planPrice}>
                <Text style={[s.planPriceNum, { fontSize: 40 }]}>$9.99</Text>
                <Text style={s.planPricePer}> / month</Text>
              </View>
              <View style={s.planFeatures}>
                <CheckItem text="2x XP Multiplier & Boosts" gold />
                <CheckItem text="All Premium Task Tiers" gold />
                <CheckItem text="Full Analytics Suite" gold />
                <CheckItem text="Alpha Drop Access" gold />
                <CheckItem text="VIP Support Channel" gold />
              </View>
              <TouchableOpacity onPress={() => handleUpgrade('yearly')} disabled={loading} activeOpacity={0.85}>
                <LinearGradient colors={['#D4AF37', '#F9E29C', '#9945FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.eliteBtn}>
                  <Text style={s.eliteBtnText}>{loading ? 'ACTIVATING...' : 'UPGRADE TO ELITE'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* ── Trust badges ── */}
        <View style={s.trust}>
          {[
            { icon: '🛡️', label: 'Solana Pay\nSecure' },
            { icon: '🔄', label: 'No\nCommitment' },
            { icon: '📋', label: 'Audited\nContracts' },
          ].map((t) => (
            <View key={t.label} style={s.trustItem}>
              <Text style={s.trustIcon}>{t.icon}</Text>
              <Text style={s.trustLabel}>{t.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05050a' },
  scroll: { paddingHorizontal: spacing.lg },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, height: 64, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  headerTitle: { fontFamily: typography.fontFamily.heading, fontSize: 18, color: colors.gold, letterSpacing: -0.5 },
  closeBtn: { padding: spacing.sm },
  closeIcon: { fontSize: 18, color: '#94a3b8' },

  heroSection: { alignItems: 'center', paddingTop: spacing['3xl'], paddingBottom: spacing['2xl'], overflow: 'hidden' },
  heroOrb1: { position: 'absolute', top: -48, left: '50%', marginLeft: -80, width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(212,175,55,0.10)' },
  heroOrb2: { position: 'absolute', top: '30%', left: '50%', marginLeft: -160, width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(153,69,255,0.08)' },
  heroTitle: { fontFamily: typography.fontFamily.heading, fontSize: 40, color: colors.gold, textAlign: 'center', letterSpacing: -1, lineHeight: 44, marginBottom: spacing.lg, zIndex: 1 },
  heroSub: { fontFamily: typography.fontFamily.body, fontSize: 15, color: '#94a3b8', textAlign: 'center', lineHeight: 22, maxWidth: 300, zIndex: 1 },

  features: { gap: spacing.md, marginBottom: spacing['2xl'] },
  featureRow: { backgroundColor: colors.glassCard, borderRadius: borderRadius['2xl'], padding: spacing.lg, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg, borderWidth: 1, borderColor: colors.outlineVariant },
  featureRowGold: { borderColor: 'rgba(212,175,55,0.15)' },
  featureIcon: { width: 48, height: 48, borderRadius: borderRadius.lg, backgroundColor: 'rgba(153,69,255,0.15)', borderWidth: 1, borderColor: 'rgba(153,69,255,0.25)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  featureIconGold: { backgroundColor: 'rgba(212,175,55,0.15)', borderColor: 'rgba(212,175,55,0.25)' },
  featureTitle: { fontFamily: typography.fontFamily.heading, fontSize: 16, color: '#fff', letterSpacing: -0.3, marginBottom: 4 },
  featureSub: { fontFamily: typography.fontFamily.body, fontSize: 13, color: '#94a3b8', lineHeight: 19 },

  planCard: { backgroundColor: colors.glassCard, borderRadius: borderRadius['3xl'], borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: spacing.xl },
  planCardInner: { backgroundColor: 'rgba(10,11,30,0.95)', borderRadius: borderRadius['3xl'] - 1, padding: spacing['2xl'] },
  elitePlanWrap: { borderRadius: borderRadius['3xl'], overflow: 'hidden', marginBottom: spacing['2xl'] },
  eliteBorder: { padding: 2, borderRadius: borderRadius['3xl'] },
  elitePlanInner: { backgroundColor: '#050614', borderRadius: borderRadius['3xl'] - 2, padding: spacing['2xl'], position: 'relative' },
  popularBadge: { position: 'absolute', top: spacing.lg, right: spacing.lg, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: borderRadius.full },
  popularBadgeText: { fontFamily: typography.fontFamily.heading, fontSize: 10, color: '#020205', letterSpacing: 0.5 },

  planLabel: { fontFamily: typography.fontFamily.heading, fontSize: 11, color: colors.textMuted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: spacing.sm },
  planName: { fontFamily: typography.fontFamily.heading, fontSize: 28, color: '#fff', letterSpacing: -0.5, marginBottom: spacing.lg },
  elitePlanLabel: { fontFamily: typography.fontFamily.heading, fontSize: 11, color: colors.gold, letterSpacing: 2, textTransform: 'uppercase', marginBottom: spacing.sm },
  elitePlanNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  elitePlanName: { fontFamily: typography.fontFamily.heading, fontSize: 28, color: '#fff', letterSpacing: -0.5 },

  planPrice: { flexDirection: 'row', alignItems: 'baseline', marginBottom: spacing['2xl'] },
  planPriceNum: { fontFamily: typography.fontFamily.heading, fontSize: 34, color: '#fff' },
  planPricePer: { fontFamily: typography.fontFamily.body, fontSize: 15, color: '#64748b' },

  planFeatures: { gap: spacing.md, marginBottom: spacing['2xl'] },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  checkIcon: { fontSize: 16, fontWeight: '700' },
  checkText: { fontFamily: typography.fontFamily.body, fontSize: 14, color: '#94a3b8', flex: 1 },

  planBtnBasic: { paddingVertical: spacing.lg, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center' },
  planBtnBasicText: { fontFamily: typography.fontFamily.heading, fontSize: 12, color: '#fff', letterSpacing: 1.5 },
  eliteBtn: { paddingVertical: spacing.xl, borderRadius: borderRadius['2xl'], alignItems: 'center' },
  eliteBtnText: { fontFamily: typography.fontFamily.heading, fontSize: 12, color: '#020205', letterSpacing: 2 },

  trust: { flexDirection: 'row', justifyContent: 'center', gap: spacing['2xl'], opacity: 0.35, marginBottom: spacing.xl },
  trustItem: { alignItems: 'center', gap: spacing.xs },
  trustIcon: { fontSize: 18 },
  trustLabel: { fontFamily: typography.fontFamily.heading, fontSize: 9, color: colors.textSecondary, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center' },
});
