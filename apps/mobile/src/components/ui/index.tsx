import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';

const { width } = Dimensions.get('window');

// ============ GlassCard ============
interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  glowColor?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  onPress,
  glowColor,
}) => {
  const Container = onPress ? TouchableOpacity : View;
  return (
    <Container
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[
        styles.glassCard,
        glowColor && {
          borderColor: glowColor + '40',
          shadowColor: glowColor,
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 6,
        },
        style,
      ]}
    >
      {children}
    </Container>
  );
};

// ============ XPProgressBar ============
interface XPProgressBarProps {
  progress: number; // 0-100
  height?: number;
  showLabel?: boolean;
  color?: string;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({
  progress,
  height = 8,
  showLabel = false,
  color = colors.primary,
}) => (
  <View>
    <View style={[styles.progressTrack, { height }]}>
      <View
        style={[
          styles.progressFill,
          {
            width: `${Math.min(100, Math.max(0, progress))}%`,
            height,
            backgroundColor: color,
            shadowColor: color,
            shadowOpacity: 0.5,
            shadowRadius: 8,
          },
        ]}
      />
    </View>
    {showLabel && (
      <Text style={styles.progressLabel}>{Math.round(progress)}%</Text>
    )}
  </View>
);

// ============ StatBadge ============
interface StatBadgeProps {
  icon: string;
  label: string;
  value: string | number;
  color?: string;
}

export const StatBadge: React.FC<StatBadgeProps> = ({
  icon,
  label,
  value,
  color = colors.primary,
}) => (
  <View style={styles.statBadge}>
    <Text style={[styles.statIcon, { color }]}>{icon}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ============ PrimaryButton ============
interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled,
  variant = 'primary',
  size = 'md',
  icon,
}) => {
  const buttonStyles = [
    styles.button,
    variant === 'primary' && styles.buttonPrimary,
    variant === 'secondary' && styles.buttonSecondary,
    variant === 'ghost' && styles.buttonGhost,
    size === 'sm' && styles.buttonSm,
    size === 'lg' && styles.buttonLg,
    disabled && styles.buttonDisabled,
  ];

  const textStyles = [
    styles.buttonText,
    variant === 'primary' && styles.buttonTextPrimary,
    variant === 'secondary' && styles.buttonTextSecondary,
    variant === 'ghost' && styles.buttonTextGhost,
    size === 'sm' && styles.buttonTextSm,
    disabled && styles.buttonTextDisabled,
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={buttonStyles}
    >
      {icon && <Text style={[styles.buttonIcon, { color: variant === 'primary' ? colors.onPrimary : colors.primary }]}>{icon}</Text>}
      <Text style={textStyles}>{title}</Text>
    </TouchableOpacity>
  );
};

// ============ SectionHeader ============
export const SectionHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}> = ({ title, subtitle, action }) => (
  <View style={styles.sectionHeader}>
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
    {action && (
      <TouchableOpacity onPress={action.onPress}>
        <Text style={styles.sectionAction}>{action.label}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ============ TaskCard ============
interface TaskCardProps {
  title: string;
  description: string;
  xpReward: number;
  iconName?: string;
  difficulty: string;
  status: string | null;
  onPress: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  title,
  description,
  xpReward,
  iconName,
  difficulty,
  status,
  onPress,
}) => {
  const difficultyColor =
    difficulty === 'HARD' || difficulty === 'EXPERT'
      ? colors.accentOrange
      : difficulty === 'MEDIUM'
      ? colors.accent
      : colors.secondary;

  const isClaimed = status === 'CLAIMED';
  const isCompleted = status === 'COMPLETED';

  return (
    <GlassCard
      onPress={isClaimed ? undefined : onPress}
      style={[styles.taskCard, isClaimed && { opacity: 0.6 }]}
    >
      <View style={styles.taskCardHeader}>
        <View style={[styles.taskIconContainer, { backgroundColor: difficultyColor + '20' }]}>
          <Text style={[styles.taskIconText, { color: difficultyColor }]}>
            {iconName === 'login' ? '🔑' :
             iconName === 'psychology' ? '🧠' :
             iconName === 'person_add' ? '👤' :
             iconName === 'forum' ? '💬' :
             iconName === 'group_add' ? '👥' :
             iconName === 'bolt' ? '⚡' :
             iconName === 'diamond' ? '💎' :
             iconName === 'school' ? '📚' :
             iconName === 'ios_share' ? '📤' :
             '⭐'}
          </Text>
        </View>
        <View style={styles.taskCardContent}>
          <Text style={styles.taskTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.taskDescription} numberOfLines={1}>{description}</Text>
        </View>
        <View style={styles.taskXPContainer}>
          <Text style={styles.taskXPValue}>+{xpReward}</Text>
          <Text style={styles.taskXPLabel}>XP</Text>
        </View>
      </View>
      {isCompleted && (
        <View style={styles.taskClaimBanner}>
          <Text style={styles.taskClaimText}>✨ Tap to claim XP!</Text>
        </View>
      )}
      {isClaimed && (
        <View style={styles.taskClaimedBanner}>
          <Text style={styles.taskClaimedText}>✅ Claimed</Text>
        </View>
      )}
    </GlassCard>
  );
};

// ============ LeaderboardRow ============
interface LeaderboardRowProps {
  rank: number;
  username: string | null;
  xpTotal: number;
  level: number;
  isCurrentUser?: boolean;
  avatarUrl?: string | null;
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  rank,
  username,
  xpTotal,
  level,
  isCurrentUser,
}) => {
  const medalEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;

  return (
    <View
      style={[
        styles.leaderboardRow,
        isCurrentUser && {
          borderColor: colors.primary + '60',
          borderWidth: 1,
          backgroundColor: colors.primaryContainer + '20',
        },
      ]}
    >
      <View style={styles.leaderboardRank}>
        {medalEmoji ? (
          <Text style={styles.medalEmoji}>{medalEmoji}</Text>
        ) : (
          <Text style={styles.rankNumber}>#{rank}</Text>
        )}
      </View>
      <View style={styles.leaderboardInfo}>
        <Text style={[styles.leaderboardName, isCurrentUser && { color: colors.primary }]}>
          {username || `Seeker_${rank}`}
        </Text>
        <Text style={styles.leaderboardLevel}>Level {level}</Text>
      </View>
      <Text style={styles.leaderboardXP}>{xpTotal.toLocaleString()} XP</Text>
    </View>
  );
};

// ============ Styles ============
const styles = StyleSheet.create({
  // GlassCard
  glassCard: {
    backgroundColor: colors.surface + 'E0',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },

  // ProgressBar
  progressTrack: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: borderRadius.full,
  },
  progressLabel: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.xxs,
  },

  // StatBadge
  statBadge: {
    alignItems: 'center',
    minWidth: 72,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes.xl,
    color: colors.textPrimary,
  },
  statLabel: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },

  // Buttons
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonSm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  buttonLg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['3xl'],
    borderRadius: borderRadius['2xl'],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: typography.fontFamily.headingMedium,
    fontSize: typography.sizes.lg,
  },
  buttonTextPrimary: {
    color: colors.onPrimary,
  },
  buttonTextSecondary: {
    color: colors.primary,
  },
  buttonTextGhost: {
    color: colors.primary,
  },
  buttonTextSm: {
    fontSize: typography.sizes.md,
  },
  buttonTextDisabled: {
    color: colors.textDisabled,
  },
  buttonIcon: {
    fontSize: 18,
  },

  // SectionHeader
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes['2xl'],
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },
  sectionAction: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.sizes.md,
    color: colors.primary,
  },

  // TaskCard
  taskCard: {
    padding: 0,
    overflow: 'hidden',
  },
  taskCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  taskIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskIconText: {
    fontSize: 22,
  },
  taskCardContent: {
    flex: 1,
  },
  taskTitle: {
    fontFamily: typography.fontFamily.headingMedium,
    fontSize: typography.sizes.lg,
    color: colors.textPrimary,
  },
  taskDescription: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  taskXPContainer: {
    alignItems: 'center',
    backgroundColor: colors.primaryContainer + '40',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  taskXPValue: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes.lg,
    color: colors.primary,
  },
  taskXPLabel: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.xs,
    color: colors.primaryDim,
  },
  taskClaimBanner: {
    backgroundColor: colors.secondary + '20',
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  taskClaimText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.sizes.sm,
    color: colors.secondary,
  },
  taskClaimedBanner: {
    backgroundColor: colors.surfaceVariant,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  taskClaimedText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },

  // LeaderboardRow
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface + 'A0',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  leaderboardRank: {
    width: 40,
    alignItems: 'center',
  },
  medalEmoji: {
    fontSize: 22,
  },
  rankNumber: {
    fontFamily: typography.fontFamily.headingMedium,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
  },
  leaderboardInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  leaderboardName: {
    fontFamily: typography.fontFamily.headingMedium,
    fontSize: typography.sizes.lg,
    color: colors.textPrimary,
  },
  leaderboardLevel: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  leaderboardXP: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.sizes.md,
    color: colors.primary,
  },
});
