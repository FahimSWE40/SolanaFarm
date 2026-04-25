import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

export interface EligibilityResult {
  tier: 'DIAMOND' | 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';
  score: number;
  breakdown: {
    xpScore: number;
    rankScore: number;
    streakScore: number;
    walletScore: number;
    referralScore: number;
    taskCompletionScore: number;
    antiFraudScore: number;
  };
  percentile: number;
  nextTier: string | null;
  pointsToNextTier: number;
}

@Injectable()
export class RewardService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  /**
   * Calculate reward eligibility for a user.
   * Eligibility is based on multiple factors weighted by importance.
   */
  async getEligibility(userId: string): Promise<EligibilityResult> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        walletScore: true,
        fraudScore: true,
        _count: {
          select: {
            userTasks: { where: { status: 'CLAIMED' } },
            referralsMade: { where: { status: 'REWARDED' } },
          },
        },
      },
    });

    if (!user) throw new Error('User not found');

    // Calculate individual scores (each out of max contribution)
    // XP Score (30% weight, max 30 points)
    const xpScore = Math.min(30, Math.floor((user.xpTotal / 50000) * 30));

    // Rank Score (20% weight, max 20 points)
    const totalUsers = await this.prisma.user.count();
    const rankPercentile = user.rank ? ((totalUsers - user.rank) / totalUsers) : 0;
    const rankScore = Math.min(20, Math.floor(rankPercentile * 20));

    // Streak Score (10% weight, max 10 points)
    const streakScore = Math.min(10, Math.floor((user.streakCount / 30) * 10));

    // Wallet Score (15% weight, max 15 points)
    const walletRep = user.walletScore?.reputationScore || 0;
    const walletScore = Math.min(15, Math.floor(walletRep * 15));

    // Referral Score (10% weight, max 10 points)
    const referralScore = Math.min(10, user._count.referralsMade * 2);

    // Task Completion Score (10% weight, max 10 points)
    const taskCompletionScore = Math.min(10, Math.floor(user._count.userTasks / 10));

    // Anti-fraud Score (5% weight, max 5 points)
    const fraudStatus = user.fraudScore?.status || 'NORMAL';
    const antiFraudScore = fraudStatus === 'NORMAL' ? 5
      : fraudStatus === 'SUSPICIOUS' ? 2 : 0;

    const totalScore = xpScore + rankScore + streakScore + walletScore
      + referralScore + taskCompletionScore + antiFraudScore;

    // Determine tier
    const tier = this.determineTier(totalScore, rankPercentile);

    // Calculate percentile among all users
    const percentile = Math.round(rankPercentile * 100 * 10) / 10;

    // Next tier info
    const tierThresholds: Record<string, number> = {
      DIAMOND: 90, PLATINUM: 75, GOLD: 60, SILVER: 40, BRONZE: 0,
    };
    const tiers = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
    const currentTierIndex = tiers.indexOf(tier);
    const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;
    const pointsToNextTier = nextTier
      ? Math.max(0, tierThresholds[nextTier] - totalScore) : 0;

    return {
      tier,
      score: totalScore,
      breakdown: {
        xpScore,
        rankScore,
        streakScore,
        walletScore,
        referralScore,
        taskCompletionScore,
        antiFraudScore,
      },
      percentile,
      nextTier,
      pointsToNextTier,
    };
  }

  /**
   * Get tier definitions.
   */
  getTiers() {
    return [
      {
        name: 'Diamond',
        id: 'DIAMOND',
        description: 'Top 1% — Legendary Seekers',
        minScore: 90,
        color: '#B9F2FF',
        benefits: ['Maximum reward allocation', 'Exclusive NFT drops', 'Priority access'],
      },
      {
        name: 'Platinum',
        id: 'PLATINUM',
        description: 'Top 5% — Elite Seekers',
        minScore: 75,
        color: '#E5E4E2',
        benefits: ['High reward allocation', 'Early access to campaigns', 'Platinum badge'],
      },
      {
        name: 'Gold',
        id: 'GOLD',
        description: 'Top 10% — Distinguished Seekers',
        minScore: 60,
        color: '#FFD700',
        benefits: ['Standard reward allocation', 'Gold badge', 'Premium task access'],
      },
      {
        name: 'Silver',
        id: 'SILVER',
        description: 'Top 25% — Active Seekers',
        minScore: 40,
        color: '#C0C0C0',
        benefits: ['Basic reward allocation', 'Silver badge'],
      },
      {
        name: 'Bronze',
        id: 'BRONZE',
        description: 'Active users — Rising Seekers',
        minScore: 0,
        color: '#CD7F32',
        benefits: ['Participation reward', 'Bronze badge'],
      },
    ];
  }

  private determineTier(score: number, percentile: number): EligibilityResult['tier'] {
    // Use both score and percentile
    if (score >= 90 || percentile >= 0.99) return 'DIAMOND';
    if (score >= 75 || percentile >= 0.95) return 'PLATINUM';
    if (score >= 60 || percentile >= 0.90) return 'GOLD';
    if (score >= 40 || percentile >= 0.75) return 'SILVER';
    return 'BRONZE';
  }
}
