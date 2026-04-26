import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../theme';
import { useAuthStore, useXPStore } from '../store';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

interface HomeScreenProps {
  onOpenModal?: (modal: 'quiz' | 'referral' | 'premium' | null) => void;
}

// ─── Reusable glass card ──────────────────────────────────────────────────────
function GC({ children, style, accent }: {
  children: React.ReactNode;
  style?: object;
  accent?: string;
}) {
  return (
    <View style={[gc.card, accent ? { borderColor: accent + '30' } : {}, style]}>
      {children}
    </View>
  );
}
const gc = StyleSheet.create({
  card: {
    backgroundColor: colors.glassCard,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.lg,
  },
});

// ─── Streak dot ──────────────────────────────────────────────────────────────
function StreakDot({ day, state }: { day: string; state: 'done' | 'today' | 'empty' | 'milestone' }) {
  const pulse = React.useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (state === 'today') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.4, duration: 800, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [state]);

  let dotStyle: object = s.dotEmpty;
  let textStyle: object = s.dotDayEmpty;
  let inner: React.ReactNode = null;

  if (state === 'done') {
    dotStyle = s.dotDone;
    textStyle = s.dotDayMuted;
    inner = <Text style={s.dotCheck}>✓</Text>;
  } else if (state === 'today') {
    dotStyle = s.dotToday;
    textStyle = s.dotDayActive;
    inner = (
      <>
        <Animated.View style={[s.dotPulseRing, { transform: [{ scale: pulse }] }]} />
        <View style={s.dotTodayDot} />
      </>
    );
  } else if (state === 'milestone') {
    dotStyle = s.dotMilestone;
    textStyle = s.dotDayEmpty;
    inner = <Text style={{ fontSize: 14, opacity: 0.4 }}>★</Text>;
  }

  return (
    <View style={s.streakDotWrapper}>
      <View style={[s.streakDot, dotStyle]}>{inner}</View>
      <Text style={[s.dotDay, textStyle]}>{day}</Text>
    </View>
  );
}

// ─── Task row ─────────────────────────────────────────────────────────────────
function MissionRow({
  icon, title, subtitle, xp, status, progress, onPress,
}: {
  icon: string; title: string; subtitle?: string; xp: string;
  status: 'done' | 'active' | 'locked'; progress?: number; onPress?: () => void;
}) {
  const locked = status === 'locked';
  const done = status === 'done';
  const iconBg = done
    ? 'rgba(20,241,149,0.10)'
    : status === 'active'
      ? 'rgba(153,69,255,0.12)'
      : 'rgba(117,209,255,0.08)';
  const iconBorder = done
    ? 'rgba(20,241,149,0.22)'
    : status === 'active'
      ? 'rgba(153,69,255,0.28)'
      : 'rgba(117,209,255,0.15)';
  const xpColor = done ? colors.secondary : status === 'active' ? colors.primary : colors.textMuted;

  return (
    <TouchableOpacity
      onPress={locked ? undefined : onPress}
      activeOpacity={locked ? 1 : 0.75}
      style={[s.missionRow, locked && s.missionLocked, status === 'active' && s.missionActive]}
    >
      <View style={[s.missionIcon, { backgroundColor: iconBg, borderColor: iconBorder }]}>
        <Text style={s.missionIconText}>{icon}</Text>
      </View>
      <View style={s.missionInfo}>
        <View style={s.missionTitleRow}>
          <Text style={[s.missionTitle, locked && { opacity: 0.6 }]}>{title}</Text>
          {done && (
            <View style={s.doneBadge}>
              <Text style={s.doneBadgeText}>DONE</Text>
            </View>
          )}
        </View>
        {subtitle && !progress && (
          <Text style={s.missionSub}>{subtitle}</Text>
        )}
        {progress !== undefined && (
          <View style={s.miniProgress}>
            <View style={[s.miniProgressFill, { width: `${progress}%` as any }]} />
          </View>
        )}
      </View>
      <View style={s.missionRight}>
        <Text style={[s.missionXP, { color: xpColor }]}>{xp}</Text>
        {locked && <Text style={s.lockIcon}>🔒</Text>}
      </View>
    </TouchableOpacity>
  );
}

// ─── Leaderboard row ──────────────────────────────────────────────────────────
function LBRow({ rank, initial, name, xp, isYou }: {
  rank: string | number; initial: string; name: string; xp: string; isYou?: boolean;
}) {
  return (
    <View style={[s.lbRow, isYou && s.lbYou]}>
      <Text style={[s.lbRank, isYou && { color: colors.primaryContainer }]}>{rank}</Text>
      <View style={[s.lbAvatar, isYou && s.lbAvatarYou]}>
        <Text style={[s.lbInitial, isYou && { color: colors.primaryContainer }]}>{initial}</Text>
      </View>
      <Text style={[s.lbName, isYou && { color: colors.primaryContainer }]}>{name}</Text>
      <Text style={[s.lbXP, isYou && { color: colors.primaryContainer }]}>{xp}</Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function HomeScreen({ onOpenModal }: HomeScreenProps = {}) {
  const { user } = useAuthStore();
  const xpStore = useXPStore();
  const { data: xpSummary, refetch: refetchXP } = useQuery({
    queryKey: ['xp-summary'],
    queryFn: () => api.getXPSummary(),
  });

  const { data: tasks, refetch: refetchTasks } = useQuery({
    queryKey: ['daily-tasks'],
    queryFn: () => api.getDailyTasks(),
  });


  useEffect(() => {
    if (xpSummary) xpStore.setXPSummary(xpSummary);
  }, [xpSummary]);

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchTasks(), refetchXP()]);
    setRefreshing(false);
  };

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  })();

  const handle = user?.username
    || (user?.walletAddress ? `${user.walletAddress.slice(0, 4)}...${user.walletAddress.slice(-4)}` : 'Seeker');

  const lvl = xpStore.level || 12;
  const totalXP = (xpStore.xpTotal || 24580).toLocaleString();
  const progressPct = xpStore.progressPercent || 65;
  const streak = xpStore.streakCount || 7;
  const todayXP = xpStore.todayXP || 120;
  const rank = 156;

  // Weekly streak days: Sun already on index 6, map from Mon
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;
  const dotStates: ('done' | 'today' | 'empty' | 'milestone')[] = [
    'done', 'done', 'done', 'today', 'empty', 'empty', 'milestone',
  ];

  const activeTasks = tasks?.slice(0, 3) || [];

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor={colors.primaryContainer} colors={[colors.primaryContainer]} />
        }
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.logoRow}>
            <Text style={s.logoHex}>⬡</Text>
            <Text style={s.logoText}>Seeker</Text>
          </View>
          <View style={s.headerRight}>
            <TouchableOpacity style={s.notifBtn}>
              <Text style={s.notifIcon}>🔔</Text>
              <View style={s.notifDot} />
            </TouchableOpacity>
            <View style={s.avatarRing}>
              <View style={s.avatarInner} />
            </View>
          </View>
        </View>

        {/* ── Hero XP Card ── */}
        <LinearGradient
          colors={['rgba(153,69,255,0.14)', 'rgba(10,11,30,0.75)', 'rgba(20,241,149,0.05)']}
          start={{ x: 0.1, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.heroCard}
        >
          {/* Ambient orb */}
          <View style={s.heroOrb} />

          {/* Top row */}
          <View style={s.heroTop}>
            <View>
              <Text style={s.heroGreeting}>{greeting.toUpperCase()}</Text>
              <Text style={s.heroHandle}>
                {handle.includes('#') ? handle : `Seeker`}
                <Text style={{ color: colors.primaryContainer }}>
                  {handle.includes('#') ? '' : '#9821'}
                </Text>
              </Text>
            </View>
            <View style={s.streakChip}>
              <Text style={s.streakChipText}>🔥 {streak}-Day Streak</Text>
            </View>
          </View>

          {/* Level + XP total */}
          <View style={s.heroMid}>
            <View>
              <Text style={s.sectorLabel}>Sector Level</Text>
              <View style={s.levelRow}>
                <Text style={s.levelNum}>{lvl}</Text>
                <Text style={s.levelMax}> / 20</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.xpTotal}>{totalXP}</Text>
              <Text style={s.xpTotalLabel}>XP TOTAL</Text>
            </View>
          </View>

          {/* XP bar */}
          <View style={s.xpBarTrack}>
            <LinearGradient
              colors={['#9945FF', '#b87cff', '#14F195']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[s.xpBarFill, { width: `${progressPct}%` as any }]}
            />
          </View>
          <View style={s.xpBarLabels}>
            <Text style={s.xpBarLabelLeft}>Sector {lvl - 1}</Text>
            <Text style={s.xpBarLabelRight}>{progressPct}% · {xpStore.xpToNextLevel?.toLocaleString() || '8,920'} XP to next rank</Text>
          </View>
        </LinearGradient>

        {/* ── Quick Stats ── */}
        <View style={s.statsGrid}>
          {[
            { label: 'RANK', value: `#${rank}`, sub: '↑ 4 today', accent: colors.primaryContainer, bg: 'rgba(153,69,255,0.05)' },
            { label: 'TODAY XP', value: `+${todayXP}`, sub: 'of 300 goal', accent: colors.secondary, bg: 'rgba(20,241,149,0.04)' },
            { label: 'TASKS', value: `${activeTasks.filter((t: any) => t.userStatus === 'CLAIMED').length}/5`, sub: 'done', accent: colors.tertiary, bg: 'rgba(117,209,255,0.04)' },
          ].map((stat) => (
            <View key={stat.label} style={[s.statCard, { borderBottomColor: stat.accent }]}>
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: stat.bg, borderRadius: borderRadius['2xl'] }]} />
              <Text style={s.statLabel}>{stat.label}</Text>
              <Text style={[s.statValue, { color: stat.accent }]}>{stat.value}</Text>
              <Text style={s.statSub}>{stat.sub}</Text>
            </View>
          ))}
        </View>

        {/* ── Weekly Streak ── */}
        <GC style={s.weeklyCard}>
          <View style={s.weeklyHeader}>
            <Text style={s.weeklyTitle}>THIS WEEK</Text>
            <View style={s.onFireChip}>
              <Text style={s.onFireText}>🔥 On fire</Text>
            </View>
          </View>
          <View style={s.weeklyDots}>
            {days.map((d, i) => (
              <StreakDot key={i} day={d} state={dotStates[i]} />
            ))}
          </View>
        </GC>

        {/* ── Active Missions ── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Active Missions</Text>
          <TouchableOpacity>
            <Text style={s.sectionAction}>SEE ALL →</Text>
          </TouchableOpacity>
        </View>

        <View style={s.missions}>
          <MissionRow icon="📅" title="Daily Check-in" subtitle="Maintain your streak" xp="+10 XP" status="done" />
          <MissionRow icon="🧠" title="Web3 Basics Quiz" xp="+250 XP" status="active" progress={40} />
          <MissionRow icon="💼" title="Wallet Activity Scan" subtitle="Analyze your on-chain history" xp="+75 XP" status="locked" />
        </View>

        {/* ── Featured Quest (Gold Banner) ── */}
        <TouchableOpacity onPress={() => onOpenModal?.('premium')} activeOpacity={0.85}>
          <LinearGradient
            colors={['rgba(212,175,55,0.10)', 'rgba(153,69,255,0.12)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.questBanner}
          >
            <View style={s.questIcon}>
              <Text style={{ fontSize: 24 }}>👑</Text>
            </View>
            <View style={s.questInfo}>
              <Text style={s.questSuperLabel}>Elite Command</Text>
              <Text style={s.questTitle}>Upgrade for 2× XP boost</Text>
              <Text style={s.questSub}>+1,200 XP this week if you upgrade now</Text>
            </View>
            <LinearGradient
              colors={['#D4AF37', '#F9E29C']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.questBtn}
            >
              <Text style={s.questBtnText}>GO PRO</Text>
            </LinearGradient>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Leaderboard Preview ── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Top Seekers</Text>
          <TouchableOpacity>
            <Text style={s.sectionAction}>FULL RANKS →</Text>
          </TouchableOpacity>
        </View>

        <GC>
          <LBRow rank="1" initial="A" name="Apex#4402" xp="48,210" />
          <View style={s.lbDivider} />
          <LBRow rank="2" initial="V" name="Volta#8871" xp="41,990" />
          <View style={s.lbDivider} />
          <LBRow rank={rank} initial="S" name={`${handle.replace(/#.*/, '')}#9821  YOU`} xp={totalXP} isYou />
        </GC>

        {/* ── Referral CTA ── */}
        <TouchableOpacity onPress={() => onOpenModal?.('referral')} activeOpacity={0.85}>
          <LinearGradient
            colors={['rgba(153,69,255,0.14)', 'rgba(20,241,149,0.08)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[s.referralBanner, { borderColor: 'rgba(153,69,255,0.22)' }]}
          >
            <View style={s.referralIcon}>
              <Text style={{ fontSize: 22 }}>👥</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.referralSuperLabel}>3 more referrals</Text>
              <Text style={s.referralTitle}>Unlock "Night Owl" badge</Text>
            </View>
            <View style={s.referralBtn}>
              <Text style={s.referralBtnText}>INVITE</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing['4xl'] },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logoHex: { fontSize: 22, color: colors.primaryContainer },
  logoText: { fontFamily: typography.fontFamily.heading, fontSize: 19, letterSpacing: -0.5, color: colors.primaryContainer },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  notifBtn: { position: 'relative', padding: spacing.sm },
  notifIcon: { fontSize: 20, color: '#94a3b8' },
  notifDot: { position: 'absolute', top: spacing.sm + 2, right: spacing.sm + 2, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.secondary },
  avatarRing: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: colors.primaryContainer + '60', padding: 2, alignItems: 'center', justifyContent: 'center' },
  avatarInner: { width: '100%', height: '100%', borderRadius: 99, backgroundColor: colors.surfaceBright },

  // Hero XP Card
  heroCard: { borderRadius: borderRadius['3xl'], padding: spacing.xl, marginBottom: spacing.md, borderWidth: 1, borderColor: 'rgba(153,69,255,0.18)', overflow: 'hidden' },
  heroOrb: { position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(153,69,255,0.18)', opacity: 0.5 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xl },
  heroGreeting: { fontFamily: typography.fontFamily.heading, fontSize: 10, color: 'rgba(20,241,149,0.7)', letterSpacing: 2.8, marginBottom: 2 },
  heroHandle: { fontFamily: typography.fontFamily.heading, fontSize: 22, color: '#fff', letterSpacing: -0.5 },
  streakChip: { backgroundColor: 'rgba(20,241,149,0.10)', borderWidth: 1, borderColor: 'rgba(20,241,149,0.22)', paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: borderRadius.full, flexDirection: 'row', alignItems: 'center' },
  streakChipText: { fontFamily: typography.fontFamily.heading, fontSize: 11, color: colors.secondary },
  heroMid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: spacing.md },
  sectorLabel: { fontFamily: typography.fontFamily.heading, fontSize: 9, color: '#64748b', letterSpacing: 1.8, textTransform: 'uppercase' },
  levelRow: { flexDirection: 'row', alignItems: 'baseline' },
  levelNum: { fontFamily: typography.fontFamily.heading, fontSize: 42, color: '#fff', lineHeight: 44 },
  levelMax: { fontFamily: typography.fontFamily.heading, fontSize: 12, color: '#64748b', letterSpacing: 2 },
  xpTotal: { fontFamily: typography.fontFamily.heading, fontSize: 18, color: colors.primary },
  xpTotalLabel: { fontFamily: typography.fontFamily.heading, fontSize: 9, color: '#64748b', letterSpacing: 2, marginTop: 2 },
  xpBarTrack: { height: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 5, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  xpBarFill: { height: '100%', borderRadius: 5 },
  xpBarLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  xpBarLabelLeft: { fontFamily: typography.fontFamily.body, fontSize: 9, color: '#475569', fontStyle: 'italic' },
  xpBarLabelRight: { fontFamily: typography.fontFamily.body, fontSize: 9, color: 'rgba(153,69,255,0.7)', fontStyle: 'italic' },

  // Quick Stats
  statsGrid: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statCard: { flex: 1, backgroundColor: colors.glassCard, borderRadius: borderRadius['2xl'], paddingVertical: spacing.md, paddingHorizontal: spacing.sm, alignItems: 'center', borderBottomWidth: 2, borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden' },
  statLabel: { fontFamily: typography.fontFamily.heading, fontSize: 9, color: '#64748b', letterSpacing: 2, marginBottom: spacing.xs },
  statValue: { fontFamily: typography.fontFamily.heading, fontSize: 22, lineHeight: 24 },
  statSub: { fontFamily: typography.fontFamily.heading, fontSize: 9, color: '#475569', marginTop: 2 },

  // Weekly Streak
  weeklyCard: { marginBottom: spacing.md, padding: spacing.lg },
  weeklyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  weeklyTitle: { fontFamily: typography.fontFamily.heading, fontSize: 10, color: '#94a3b8', letterSpacing: 2 },
  onFireChip: { backgroundColor: 'rgba(20,241,149,0.10)', paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.full },
  onFireText: { fontFamily: typography.fontFamily.heading, fontSize: 10, color: colors.secondary },
  weeklyDots: { flexDirection: 'row', justifyContent: 'space-between' },
  streakDotWrapper: { alignItems: 'center', gap: 6 },
  streakDot: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: 'rgba(20,241,149,0.15)', borderWidth: 1.5, borderColor: 'rgba(20,241,149,0.5)' },
  dotToday: { backgroundColor: 'rgba(153,69,255,0.18)', borderWidth: 2, borderColor: colors.primaryContainer, position: 'relative' },
  dotEmpty: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.07)' },
  dotMilestone: { backgroundColor: 'rgba(212,175,55,0.08)', borderWidth: 1.5, borderColor: 'rgba(212,175,55,0.2)' },
  dotCheck: { fontSize: 14, color: colors.secondary, fontWeight: '700' },
  dotTodayDot: { width: 8, height: 8, backgroundColor: colors.primaryContainer, borderRadius: 4 },
  dotPulseRing: { position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 10, backgroundColor: 'rgba(153,69,255,0.4)' },
  dotDay: { fontFamily: typography.fontFamily.heading, fontSize: 9 },
  dotDayMuted: { color: '#64748b' },
  dotDayActive: { color: colors.primaryContainer, fontWeight: '800' },
  dotDayEmpty: { color: '#374151' },

  // Sections
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md, marginTop: spacing.md, paddingHorizontal: spacing.xs },
  sectionTitle: { fontFamily: typography.fontFamily.heading, fontSize: 11, color: '#94a3b8', letterSpacing: 2.5, textTransform: 'uppercase' },
  sectionAction: { fontFamily: typography.fontFamily.heading, fontSize: 10, color: colors.primaryContainer, letterSpacing: 2 },

  // Mission rows
  missions: { gap: spacing.sm, marginBottom: spacing.md },
  missionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.glassCardBright, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.outlineVariant },
  missionActive: { borderColor: 'rgba(153,69,255,0.20)' },
  missionLocked: { opacity: 0.5 },
  missionIcon: { width: 40, height: 40, borderRadius: borderRadius.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, flexShrink: 0 },
  missionIconText: { fontSize: 20 },
  missionInfo: { flex: 1 },
  missionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  missionTitle: { fontFamily: typography.fontFamily.heading, fontSize: 13, color: '#fff', letterSpacing: -0.3 },
  missionSub: { fontFamily: typography.fontFamily.body, fontSize: 11, color: '#64748b', marginTop: 2 },
  doneBadge: { backgroundColor: 'rgba(20,241,149,0.10)', borderRadius: borderRadius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  doneBadgeText: { fontFamily: typography.fontFamily.heading, fontSize: 9, color: colors.secondary, letterSpacing: 1 },
  miniProgress: { height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginTop: spacing.sm },
  miniProgressFill: { height: '100%', borderRadius: 2, backgroundColor: colors.primaryContainer },
  missionRight: { alignItems: 'flex-end', gap: spacing.xs, flexShrink: 0 },
  missionXP: { fontFamily: typography.fontFamily.heading, fontSize: 12 },
  lockIcon: { fontSize: 12 },

  // Featured Quest Banner
  questBanner: { borderRadius: borderRadius['2xl'], padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: 'rgba(212,175,55,0.20)' },
  questIcon: { width: 48, height: 48, borderRadius: borderRadius.lg, backgroundColor: 'rgba(212,175,55,0.15)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  questInfo: { flex: 1 },
  questSuperLabel: { fontFamily: typography.fontFamily.heading, fontSize: 9, color: 'rgba(212,175,55,0.8)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 },
  questTitle: { fontFamily: typography.fontFamily.heading, fontSize: 13, color: '#fff', letterSpacing: -0.3 },
  questSub: { fontFamily: typography.fontFamily.body, fontSize: 11, color: '#64748b', marginTop: 2 },
  questBtn: { borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, flexShrink: 0 },
  questBtnText: { fontFamily: typography.fontFamily.heading, fontSize: 11, color: '#020205', letterSpacing: 1.5 },

  // Leaderboard
  lbRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  lbYou: { backgroundColor: 'rgba(153,69,255,0.08)', marginHorizontal: -spacing.lg, paddingHorizontal: spacing.lg, borderLeftWidth: 2, borderLeftColor: 'rgba(153,69,255,0.5)' },
  lbRank: { fontFamily: typography.fontFamily.heading, fontSize: 13, color: '#D4AF37', width: 28, textAlign: 'center' },
  lbAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceBright, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', alignItems: 'center', justifyContent: 'center' },
  lbAvatarYou: { borderColor: 'rgba(153,69,255,0.4)' },
  lbInitial: { fontFamily: typography.fontFamily.heading, fontSize: 12, color: colors.textMuted },
  lbName: { flex: 1, fontFamily: typography.fontFamily.heading, fontSize: 12, color: 'rgba(255,255,255,0.9)' },
  lbXP: { fontFamily: typography.fontFamily.heading, fontSize: 12, color: colors.primary },
  lbDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.04)' },

  // Referral Banner
  referralBanner: { borderRadius: borderRadius['2xl'], padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, marginBottom: spacing.md },
  referralIcon: { width: 44, height: 44, borderRadius: borderRadius.lg, backgroundColor: 'rgba(153,69,255,0.15)', borderWidth: 1, borderColor: 'rgba(153,69,255,0.3)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  referralSuperLabel: { fontFamily: typography.fontFamily.heading, fontSize: 9, color: 'rgba(20,241,149,0.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 },
  referralTitle: { fontFamily: typography.fontFamily.heading, fontSize: 13, color: '#fff', letterSpacing: -0.3 },
  referralBtn: { backgroundColor: colors.primaryContainer, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.lg, flexShrink: 0, shadowColor: colors.primaryContainer, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 20, elevation: 8 },
  referralBtnText: { fontFamily: typography.fontFamily.heading, fontSize: 11, color: '#fff', letterSpacing: 1.5 },
});
