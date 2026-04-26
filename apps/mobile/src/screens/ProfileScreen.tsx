import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  TouchableOpacity, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../theme';
import { useAuthStore, useXPStore } from '../store';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

interface ProfileScreenProps {
  onOpenModal?: (modal: 'quiz' | 'referral' | 'premium' | null) => void;
}

function MenuRow({ icon, title, sub, right, onPress }: {
  icon: string; title: string; sub: string; right?: React.ReactNode; onPress?: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={s.menuRow}>
      <View style={s.menuIcon}><Text style={{ fontSize: 22 }}>{icon}</Text></View>
      <View style={s.menuText}>
        <Text style={s.menuTitle}>{title}</Text>
        <Text style={s.menuSub}>{sub}</Text>
      </View>
      {right ?? <Text style={s.menuChev}>›</Text>}
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ onOpenModal }: ProfileScreenProps = {}) {
  const { user, logout } = useAuthStore();
  const xp = useXPStore();
  const { data: badges } = useQuery({ queryKey: ['badges'], queryFn: () => api.getBadges() });
  const { data: wallet } = useQuery({ queryKey: ['wallet-score'], queryFn: () => api.getWalletScore() });

  const handleLogout = () => {
    Alert.alert('Terminate Session', 'Disconnect wallet and log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Terminate', style: 'destructive', onPress: logout },
    ]);
  };

  const handle = user?.username || 'Seeker#9821';
  const walletShort = user?.walletAddress
    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
    : '0x71C...4921';
  const lvl = xp.level || 12;
  const totalXP = (xp.xpTotal || 24580).toLocaleString();
  const progressPct = xp.progressPercent || 65;
  const isPremium = user?.premiumStatus !== 'FREE';
  const walletScore = Math.round((wallet?.reputationScore || 0.78) * 100);
  const badgeCount = badges?.earned?.length || 12;
  const earnedBadgeText = `${badgeCount} EARNED`;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={s.header}>
        <View style={s.avatarSmall}>
          <Text style={s.avatarSmallText}>{handle[0].toUpperCase()}</Text>
        </View>
        <Text style={s.headerTitle}>MISSION CONTROL</Text>
        <TouchableOpacity style={s.notifBtn}>
          <Text style={s.notifIcon}>🔔</Text>
          <View style={s.notifDot} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Avatar hero ── */}
        <View style={s.avatarHero}>
          <View style={s.avatarGlowWrap}>
            <LinearGradient
              colors={['#9945FF', '#14F195']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.avatarGlow}
            />
            <View style={s.avatarOuter}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{handle[0].toUpperCase()}</Text>
              </View>
            </View>
          </View>
          {isPremium && (
            <View style={s.premiumBadge}>
              <Text style={s.premiumText}>★ Premium</Text>
            </View>
          )}
        </View>

        <View style={s.nameBlock}>
          <Text style={s.nameText}>{handle}</Text>
          <TouchableOpacity style={s.walletRow}>
            <Text style={s.copyIcon}>⎘  </Text>
            <Text style={s.walletAddr}>{walletShort}</Text>
          </TouchableOpacity>
        </View>

        {/* ── XP / Level card ── */}
        <View style={s.xpCard}>
          <View style={s.xpCardAccent} />
          <View style={s.xpCardTop}>
            <View>
              <Text style={s.pilotLabel}>Pilot Experience</Text>
              <View style={s.levelRow}>
                <Text style={s.levelNum}>{lvl}</Text>
                <Text style={s.sectorLabel}> Sector Level</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.xpNum}>{totalXP}</Text>
              <Text style={s.xpSubLabel}>Total XP</Text>
            </View>
          </View>
          <View style={s.progressRow}>
            <Text style={s.progressLabel}>Rank Progress</Text>
            <Text style={[s.progressLabel, { color: colors.primary }]}>{progressPct}%</Text>
          </View>
          <View style={s.barTrack}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[s.barFill, { width: `${progressPct}%` as any }]}
            />
          </View>
          <View style={s.barSectors}>
            <Text style={s.barSectorText}>Sector {lvl - 1}</Text>
            <Text style={s.barSectorText}>Sector {lvl + 1}</Text>
          </View>
        </View>

        {/* ── 2-col stats ── */}
        <View style={s.statsRow}>
          <View style={[s.statCard, { borderColor: colors.outlineVariant }]}>
            <View style={[s.statIconBox, { backgroundColor: 'rgba(153,69,255,0.10)' }]}>
              <Text style={{ fontSize: 20 }}>🏆</Text>
            </View>
            <Text style={s.statCaption}>Global Rank</Text>
            <Text style={s.statValue}>#156</Text>
          </View>
          <View style={[s.statCard, { borderColor: colors.outlineVariant }]}>
            <View style={[s.statIconBox, { backgroundColor: 'rgba(255,138,80,0.10)' }]}>
              <Text style={{ fontSize: 20 }}>⚡</Text>
            </View>
            <Text style={s.statCaption}>Active Streak</Text>
            <Text style={s.statValue}>{xp.streakCount || 7} Days</Text>
          </View>
        </View>

        {/* ── Navigation menu ── */}
        <View style={s.menu}>
          <MenuRow
            icon="💼"
            title="Wallet Score"
            sub="Network integrity status"
            right={<Text style={[s.menuBadge, { color: colors.secondary }]}>{walletScore}/100</Text>}
          />
          <MenuRow
            icon="🏅"
            title="Achievement Hub"
            sub="Earned digital honors"
            right={
              <View style={s.earnedBadge}>
                <Text style={s.earnedBadgeText}>{earnedBadgeText}</Text>
              </View>
            }
          />
          <MenuRow
            icon="👥"
            title="Squad Program"
            sub="Fleet recruitment links"
            onPress={() => onOpenModal?.('referral')}
          />
          <MenuRow
            icon="⚙️"
            title="System Settings"
            sub="Privacy and node config"
          />
        </View>

        {/* ── Action buttons ── */}
        <LinearGradient
          colors={['#9945FF', '#14F195']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={s.backupBtn}
        >
          <TouchableOpacity style={s.backupBtnInner}>
            <Text style={s.backupBtnText}>SECURE CLOUD BACKUP</Text>
          </TouchableOpacity>
        </LinearGradient>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Text style={s.logoutText}>TERMINATE SESSION</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing['2xl'] },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, height: 64, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', backgroundColor: colors.background + 'CC' },
  avatarSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceBright, borderWidth: 1, borderColor: 'rgba(153,69,255,0.30)', alignItems: 'center', justifyContent: 'center' },
  avatarSmallText: { fontFamily: typography.fontFamily.heading, fontSize: 13, color: colors.primary },
  headerTitle: { fontFamily: typography.fontFamily.heading, fontSize: 16, letterSpacing: -0.3, color: 'transparent', includeFontPadding: false },
  // We render gradient title via a separate approach below — for now plain color
  notifBtn: { position: 'relative', padding: spacing.sm },
  notifIcon: { fontSize: 20, color: '#94a3b8' },
  notifDot: { position: 'absolute', top: spacing.sm + 2, right: spacing.sm + 2, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.secondary, borderWidth: 2, borderColor: colors.background },

  // Avatar hero
  avatarHero: { alignItems: 'center', paddingTop: spacing['2xl'], marginBottom: spacing.lg, position: 'relative' },
  avatarGlowWrap: { position: 'relative', marginBottom: spacing.sm },
  avatarGlow: { position: 'absolute', inset: -4, borderRadius: 70, opacity: 0.4, top: -4, left: -4, right: -4, bottom: -4 },
  avatarOuter: { padding: 3, borderRadius: 70, backgroundColor: colors.background },
  avatar: { width: 112, height: 112, borderRadius: 56, backgroundColor: colors.surfaceBright, borderWidth: 2, borderColor: 'rgba(255,255,255,0.10)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: typography.fontFamily.heading, fontSize: 48, color: colors.primary },
  premiumBadge: { position: 'absolute', bottom: 0, right: '30%', backgroundColor: colors.secondary, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full, flexDirection: 'row', alignItems: 'center' },
  premiumText: { fontFamily: typography.fontFamily.heading, fontSize: 9, color: '#000', letterSpacing: 1 },

  // Name
  nameBlock: { alignItems: 'center', marginBottom: spacing['2xl'] },
  nameText: { fontFamily: typography.fontFamily.heading, fontSize: 24, color: colors.textPrimary, letterSpacing: -0.5 },
  walletRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  copyIcon: { fontSize: 14, color: '#64748b' },
  walletAddr: { fontFamily: typography.fontFamily.body, fontSize: 14, color: '#64748b', letterSpacing: 0.5 },

  // XP card
  xpCard: { backgroundColor: colors.glassCard, borderRadius: borderRadius['2xl'], padding: spacing.xl, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden' },
  xpCardAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: colors.primary + '60', borderTopLeftRadius: borderRadius['2xl'], borderBottomLeftRadius: borderRadius['2xl'] },
  xpCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  pilotLabel: { fontFamily: typography.fontFamily.heading, fontSize: 10, color: '#64748b', letterSpacing: 2, textTransform: 'uppercase', marginBottom: spacing.xs },
  levelRow: { flexDirection: 'row', alignItems: 'baseline' },
  levelNum: { fontFamily: typography.fontFamily.heading, fontSize: 36, color: colors.primary },
  sectorLabel: { fontFamily: typography.fontFamily.heading, fontSize: 13, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
  xpNum: { fontFamily: typography.fontFamily.heading, fontSize: 18, color: colors.textPrimary },
  xpSubLabel: { fontFamily: typography.fontFamily.heading, fontSize: 10, color: '#64748b', letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  progressLabel: { fontFamily: typography.fontFamily.heading, fontSize: 10, color: '#64748b', letterSpacing: 2, textTransform: 'uppercase' },
  barTrack: { height: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  barSectors: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  barSectorText: { fontFamily: typography.fontFamily.body, fontSize: 9, color: '#475569', fontStyle: 'italic' },

  // 2-col stats
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  statCard: { flex: 1, backgroundColor: colors.glassCard, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, alignItems: 'center', gap: spacing.sm },
  statIconBox: { width: 32, height: 32, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  statCaption: { fontFamily: typography.fontFamily.heading, fontSize: 9, color: '#64748b', letterSpacing: 2, textTransform: 'uppercase' },
  statValue: { fontFamily: typography.fontFamily.heading, fontSize: 18, color: colors.textPrimary },

  // Menu
  menu: { backgroundColor: colors.glassCard, borderRadius: borderRadius['2xl'], marginBottom: spacing.md, borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  menuIcon: { width: 40, height: 40, borderRadius: borderRadius.lg, backgroundColor: colors.surfaceBright, borderWidth: 1, borderColor: colors.outlineVariant, alignItems: 'center', justifyContent: 'center' },
  menuText: { flex: 1 },
  menuTitle: { fontFamily: typography.fontFamily.heading, fontSize: 14, color: colors.textPrimary, letterSpacing: -0.2 },
  menuSub: { fontFamily: typography.fontFamily.body, fontSize: 10, color: '#64748b', marginTop: 2 },
  menuChev: { fontSize: 22, color: '#374151' },
  menuBadge: { fontFamily: typography.fontFamily.heading, fontSize: 14 },
  earnedBadge: { backgroundColor: colors.primaryContainer + '20', paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.primaryContainer + '40' },
  earnedBadgeText: { fontFamily: typography.fontFamily.heading, fontSize: 9, color: colors.primary, letterSpacing: 1.5 },

  // Buttons
  backupBtn: { borderRadius: borderRadius.xl, marginBottom: spacing.md },
  backupBtnInner: { paddingVertical: spacing.lg, alignItems: 'center' },
  backupBtnText: { fontFamily: typography.fontFamily.heading, fontSize: 12, color: '#020205', letterSpacing: 2 },
  logoutBtn: { paddingVertical: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,180,171,0.20)', borderRadius: borderRadius.xl },
  logoutText: { fontFamily: typography.fontFamily.heading, fontSize: 10, color: 'rgba(255,180,171,0.60)', letterSpacing: 2 },
});
