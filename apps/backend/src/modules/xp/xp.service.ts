import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { PremiumStatus, XPSource } from '@prisma/client';

// Level thresholds
const LEVEL_THRESHOLDS: Record<number, number> = {
  1: 0, 2: 100, 3: 300, 4: 700, 5: 1500,
  6: 3000, 7: 5000, 8: 8000, 9: 12000, 10: 20000,
};

@Injectable()
export class XpService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  /**
   * Calculate XP with all applicable multipliers.
   * This is the ONLY place XP amounts are calculated.
   */
  calculateXP(
    baseXP: number,
    streakCount: number,
    premiumStatus: PremiumStatus,
    campaignMultiplier: number = 1.0,
  ): { totalXP: number; multiplier: number } {
    let multiplier = 1.0;

    // Streak bonus
    if (streakCount >= 30) multiplier += 0.35;
    else if (streakCount >= 14) multiplier += 0.20;
    else if (streakCount >= 7) multiplier += 0.10;
    else if (streakCount >= 3) multiplier += 0.05;

    // Premium multiplier
    if (premiumStatus === PremiumStatus.PREMIUM) multiplier += 0.25;
    else if (premiumStatus === PremiumStatus.PREMIUM_PRO) multiplier += 0.50;

    // Campaign bonus
    if (campaignMultiplier > 1.0) {
      multiplier += (campaignMultiplier - 1.0);
    }

    const totalXP = Math.floor(baseXP * multiplier);

    return { totalXP, multiplier };
  }

  /**
   * Award XP to a user. Creates XPLog and updates user total.
   * This is the SINGLE entry point for all XP changes.
   */
  async awardXP(params: {
    userId: string;
    amount: number;
    reason: string;
    source: XPSource;
    taskId?: string;
    multiplier?: number;
  }): Promise<{ xpAwarded: number; newTotal: number; newLevel: number; levelUp: boolean }> {
    const { userId, amount, reason, source, taskId, multiplier = 1.0 } = params;

    if (amount <= 0) {
      throw new BadRequestException('XP amount must be positive');
    }

    // Rate limiting: max 20 XP actions per hour
    const rateLimitKey = `xp:rate:${userId}`;
    const currentCount = await this.redisService.get(rateLimitKey);
    if (currentCount && parseInt(currentCount) >= 20) {
      throw new BadRequestException('XP earning rate limit exceeded. Try again later.');
    }

    // Increment rate limit counter
    const client = this.redisService.getClient();
    await client.multi()
      .incr(rateLimitKey)
      .expire(rateLimitKey, 3600) // 1 hour TTL
      .exec();

    // Create XP log entry
    await this.prisma.xPLog.create({
      data: {
        userId,
        taskId,
        amount,
        reason,
        multiplier,
        source,
      },
    });

    // Update user total XP
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        xpTotal: { increment: amount },
      },
    });

    // Calculate new level
    const newLevel = this.calculateLevel(user.xpTotal);
    const levelUp = newLevel > (user.level || 1);

    // Update level if changed
    if (levelUp) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { level: newLevel },
      });
    }

    // Update leaderboard in Redis
    await this.redisService.zadd('leaderboard:all_time', user.xpTotal, userId);

    return {
      xpAwarded: amount,
      newTotal: user.xpTotal,
      newLevel,
      levelUp,
    };
  }

  /**
   * Admin XP adjustment (with audit logging).
   */
  async adminAdjustXP(params: {
    userId: string;
    amount: number;
    reason: string;
    adminId: string;
  }): Promise<void> {
    const { userId, amount, reason, adminId } = params;

    // Create XP log
    await this.prisma.xPLog.create({
      data: {
        userId,
        amount,
        reason: `[ADMIN] ${reason}`,
        multiplier: 1.0,
        source: 'ADMIN_ADJUSTMENT',
      },
    });

    // Update user XP
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        xpTotal: { increment: amount },
      },
    });

    // Recalculate level
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const newLevel = this.calculateLevel(user.xpTotal);
      await this.prisma.user.update({
        where: { id: userId },
        data: { level: newLevel },
      });
    }

    // Admin audit log
    await this.prisma.adminAuditLog.create({
      data: {
        adminId,
        action: 'XP_ADJUSTMENT',
        targetType: 'user',
        targetId: userId,
        metadata: { amount, reason },
      },
    });
  }

  /**
   * Get XP logs for a user.
   */
  async getXPLogs(userId: string, page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      this.prisma.xPLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          task: { select: { title: true, taskType: true, iconName: true } },
        },
      }),
      this.prisma.xPLog.count({ where: { userId } }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      hasMore: skip + items.length < total,
    };
  }

  /**
   * Get XP summary for dashboard.
   */
  async getXPSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xpTotal: true, level: true, streakCount: true, premiumStatus: true },
    });

    if (!user) return null;

    const currentLevel = user.level;
    const nextLevelXP = this.getXPForNextLevel(currentLevel);
    const currentLevelXP = this.getXPForLevel(currentLevel);
    const xpInCurrentLevel = user.xpTotal - currentLevelXP;
    const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
    const progressPercent = Math.min(100, Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100));

    // Get today's earned XP
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayXP = await this.prisma.xPLog.aggregate({
      where: {
        userId,
        createdAt: { gte: todayStart },
      },
      _sum: { amount: true },
    });

    // Get current streak bonus
    let streakBonus = 0;
    if (user.streakCount >= 30) streakBonus = 35;
    else if (user.streakCount >= 14) streakBonus = 20;
    else if (user.streakCount >= 7) streakBonus = 10;
    else if (user.streakCount >= 3) streakBonus = 5;

    return {
      xpTotal: user.xpTotal,
      level: currentLevel,
      nextLevelXP,
      xpToNextLevel: nextLevelXP - user.xpTotal,
      progressPercent,
      todayXP: todayXP._sum.amount || 0,
      streakCount: user.streakCount,
      streakBonusPercent: streakBonus,
      premiumMultiplier: user.premiumStatus === 'PREMIUM' ? 1.25
        : user.premiumStatus === 'PREMIUM_PRO' ? 1.5 : 1.0,
    };
  }

  // ============ Private Methods ============

  private calculateLevel(xp: number): number {
    let level = 1;
    for (const [lvl, threshold] of Object.entries(LEVEL_THRESHOLDS)) {
      if (xp >= threshold) level = parseInt(lvl);
    }
    // For levels > 10: 100 * (level ^ 1.8)
    if (xp >= 20000) {
      let lvl = 10;
      while (Math.floor(100 * Math.pow(lvl + 1, 1.8)) <= xp) {
        lvl++;
      }
      level = lvl;
    }
    return level;
  }

  private getXPForLevel(level: number): number {
    if (level <= 10) return LEVEL_THRESHOLDS[level] || 0;
    return Math.floor(100 * Math.pow(level, 1.8));
  }

  private getXPForNextLevel(level: number): number {
    if (level < 10) return LEVEL_THRESHOLDS[level + 1] || 0;
    return Math.floor(100 * Math.pow(level + 1, 1.8));
  }
}
