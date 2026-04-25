// Shared types between backend, mobile, and admin

// ============ User Types ============
export enum PremiumStatus {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
  PREMIUM_PRO = 'PREMIUM_PRO',
}

export interface UserProfile {
  id: string;
  walletAddress: string;
  username: string | null;
  avatarUrl: string | null;
  email: string | null;
  xpTotal: number;
  level: number;
  rank: number | null;
  streakCount: number;
  lastCheckInAt: string | null;
  premiumStatus: PremiumStatus;
  referralCode: string;
  referredBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============ Task Types ============
export enum TaskType {
  DAILY_CHECKIN = 'DAILY_CHECKIN',
  QUIZ = 'QUIZ',
  SOCIAL_FOLLOW = 'SOCIAL_FOLLOW',
  SOCIAL_JOIN = 'SOCIAL_JOIN',
  REFERRAL = 'REFERRAL',
  WALLET_CONNECT = 'WALLET_CONNECT',
  SOLANA_TRANSACTION = 'SOLANA_TRANSACTION',
  NFT_HOLD = 'NFT_HOLD',
  TOKEN_HOLD = 'TOKEN_HOLD',
  DAPP_USE = 'DAPP_USE',
  INVITE = 'INVITE',
  LEARNING_MODULE = 'LEARNING_MODULE',
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXPERT = 'EXPERT',
}

export enum Frequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  ONCE = 'ONCE',
  CAMPAIGN = 'CAMPAIGN',
}

export enum ValidationType {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC',
  BLOCKCHAIN = 'BLOCKCHAIN',
  SOCIAL = 'SOCIAL',
  QUIZ = 'QUIZ',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CLAIMED = 'CLAIMED',
  REJECTED = 'REJECTED',
}

export interface Task {
  id: string;
  title: string;
  description: string;
  taskType: TaskType;
  xpReward: number;
  difficulty: Difficulty;
  frequency: Frequency;
  validationType: ValidationType;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  premiumOnly: boolean;
  campaignId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserTask {
  id: string;
  userId: string;
  taskId: string;
  status: TaskStatus;
  progress: number;
  completedAt: string | null;
  claimedAt: string | null;
  proofUrl: string | null;
  metadata: Record<string, unknown> | null;
  task?: Task;
}

// ============ XP Types ============
export enum XPSource {
  TASK = 'TASK',
  STREAK_BONUS = 'STREAK_BONUS',
  REFERRAL = 'REFERRAL',
  ADMIN_ADJUSTMENT = 'ADMIN_ADJUSTMENT',
  PREMIUM_BONUS = 'PREMIUM_BONUS',
  CAMPAIGN_BONUS = 'CAMPAIGN_BONUS',
  WELCOME_BONUS = 'WELCOME_BONUS',
}

export interface XPLog {
  id: string;
  userId: string;
  taskId: string | null;
  amount: number;
  reason: string;
  multiplier: number;
  source: XPSource;
  createdAt: string;
}

// ============ Leaderboard Types ============
export enum LeaderboardPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  ALL_TIME = 'ALL_TIME',
}

export interface LeaderboardEntry {
  userId: string;
  username: string | null;
  avatarUrl: string | null;
  xpTotal: number;
  level: number;
  rank: number;
  premiumStatus: PremiumStatus;
}

// ============ Reward Types ============
export enum RewardTier {
  DIAMOND = 'DIAMOND',
  PLATINUM = 'PLATINUM',
  GOLD = 'GOLD',
  SILVER = 'SILVER',
  BRONZE = 'BRONZE',
}

export interface RewardEligibility {
  tier: RewardTier;
  score: number;
  xpScore: number;
  rankScore: number;
  streakScore: number;
  walletScore: number;
  referralScore: number;
  taskCompletionScore: number;
  antiFraudScore: number;
  percentile: number;
}

// ============ Wallet Types ============
export interface WalletScore {
  id: string;
  userId: string;
  walletAddress: string;
  transactionCount: number;
  walletAgeDays: number;
  nftCount: number;
  tokenCount: number;
  reputationScore: number;
  lastSyncedAt: string | null;
}

// ============ Referral Types ============
export enum ReferralStatus {
  PENDING = 'PENDING',
  QUALIFIED = 'QUALIFIED',
  REWARDED = 'REWARDED',
  REJECTED = 'REJECTED',
}

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  status: ReferralStatus;
  xpAwarded: number;
  createdAt: string;
}

// ============ Badge Types ============
export enum BadgeRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  condition: Record<string, unknown>;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
  badge?: Badge;
}

// ============ Subscription Types ============
export enum SubscriptionPlan {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

// ============ Notification Types ============
export enum NotificationType {
  NEW_TASK = 'NEW_TASK',
  STREAK_REMINDER = 'STREAK_REMINDER',
  RANK_CHANGE = 'RANK_CHANGE',
  NEW_CAMPAIGN = 'NEW_CAMPAIGN',
  XP_CLAIMED = 'XP_CLAIMED',
  PREMIUM_OFFER = 'PREMIUM_OFFER',
  REWARD_UPDATE = 'REWARD_UPDATE',
  BADGE_EARNED = 'BADGE_EARNED',
}

// ============ Fraud Types ============
export enum FraudStatus {
  NORMAL = 'NORMAL',
  SUSPICIOUS = 'SUSPICIOUS',
  BLOCKED = 'BLOCKED',
}

// ============ Admin Types ============
export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  CAMPAIGN_MANAGER = 'CAMPAIGN_MANAGER',
  SUPPORT_ADMIN = 'SUPPORT_ADMIN',
}

// ============ Auth Types ============
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface NonceResponse {
  nonce: string;
  expiresAt: string;
}

// ============ API Response Types ============
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============ Level System ============
export const LEVEL_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 100,
  3: 300,
  4: 700,
  5: 1500,
  6: 3000,
  7: 5000,
  8: 8000,
  9: 12000,
  10: 20000,
};

export function getLevelForXP(xp: number): number {
  let level = 1;
  for (const [lvl, threshold] of Object.entries(LEVEL_THRESHOLDS)) {
    if (xp >= threshold) level = parseInt(lvl);
  }
  // For levels > 10, use formula: 100 * (level ^ 1.8)
  if (xp >= 20000) {
    let lvl = 10;
    while (100 * Math.pow(lvl + 1, 1.8) <= xp) {
      lvl++;
    }
    level = lvl;
  }
  return level;
}

export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel < 10) {
    return LEVEL_THRESHOLDS[currentLevel + 1] || 0;
  }
  return Math.floor(100 * Math.pow(currentLevel + 1, 1.8));
}

// ============ Streak Bonuses ============
export const STREAK_BONUSES: Record<number, number> = {
  3: 0.05,   // +5%
  7: 0.10,   // +10%
  14: 0.20,  // +20%
  30: 0.35,  // +35%
};

export function getStreakBonus(streakDays: number): number {
  if (streakDays >= 30) return 0.35;
  if (streakDays >= 14) return 0.20;
  if (streakDays >= 7) return 0.10;
  if (streakDays >= 3) return 0.05;
  return 0;
}
