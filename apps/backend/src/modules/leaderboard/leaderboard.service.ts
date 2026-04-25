import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class LeaderboardService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  /**
   * Get leaderboard entries from Redis cache or database.
   */
  async getLeaderboard(
    period: 'daily' | 'weekly' | 'monthly' | 'all_time',
    page: number = 1,
    pageSize: number = 50,
  ) {
    const cacheKey = `leaderboard:${period}:page:${page}`;
    const cached = await this.redisService.getJSON<any[]>(cacheKey);
    if (cached) return { items: cached, page, pageSize };

    // Fallback to database
    const start = (page - 1) * pageSize;
    const dateFilter = this.getDateFilter(period);

    let entries;
    if (period === 'all_time') {
      entries = await this.prisma.user.findMany({
        where: { username: { not: null } },
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          xpTotal: true,
          level: true,
          premiumStatus: true,
        },
        orderBy: { xpTotal: 'desc' },
        skip: start,
        take: pageSize,
      });
    } else {
      // For time-based leaderboards, aggregate XP from logs
      const xpByUser = await this.prisma.xPLog.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: dateFilter },
        },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        skip: start,
        take: pageSize,
      });

      const userIds = xpByUser.map((x) => x.userId);
      const users = await this.prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          xpTotal: true,
          level: true,
          premiumStatus: true,
        },
      });

      const userMap = new Map(users.map((u) => [u.id, u]));

      entries = xpByUser.map((entry, index) => ({
        ...userMap.get(entry.userId),
        periodXP: entry._sum.amount || 0,
        rank: start + index + 1,
      }));
    }

    // Add rank numbers
    const ranked = entries.map((entry, index) => ({
      ...entry,
      rank: start + index + 1,
    }));

    // Cache for 5 minutes
    await this.redisService.setJSON(cacheKey, ranked, 300);

    return { items: ranked, page, pageSize };
  }

  /**
   * Get current user's rank position.
   */
  async getUserRank(userId: string): Promise<{ rank: number; total: number; percentile: number }> {
    // Try Redis first
    const rank = await this.redisService.zrevrank('leaderboard:all_time', userId);
    const total = await this.redisService.zcard('leaderboard:all_time');

    if (rank !== null && total > 0) {
      const position = rank + 1;
      const percentile = Math.round(((total - position) / total) * 100 * 10) / 10;
      return { rank: position, total, percentile };
    }

    // Fallback: calculate from database
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xpTotal: true },
    });

    if (!user) return { rank: 0, total: 0, percentile: 0 };

    const higherCount = await this.prisma.user.count({
      where: { xpTotal: { gt: user.xpTotal } },
    });
    const totalUsers = await this.prisma.user.count();

    const position = higherCount + 1;
    const percentile = Math.round(((totalUsers - position) / totalUsers) * 100 * 10) / 10;

    return { rank: position, total: totalUsers, percentile };
  }

  /**
   * Cron job: Recalculate leaderboard every hour.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async recalculateLeaderboard() {
    console.log('🏆 Recalculating leaderboard...');

    const users = await this.prisma.user.findMany({
      select: { id: true, xpTotal: true },
      orderBy: { xpTotal: 'desc' },
    });

    // Update Redis sorted set
    for (const user of users) {
      await this.redisService.zadd('leaderboard:all_time', user.xpTotal, user.id);
    }

    // Update user rank fields
    for (let i = 0; i < users.length; i++) {
      await this.prisma.user.update({
        where: { id: users[i].id },
        data: { rank: i + 1 },
      });
    }

    // Clear cache
    const client = this.redisService.getClient();
    const keys = await client.keys('leaderboard:*:page:*');
    if (keys.length > 0) await client.del(...keys);

    console.log(`🏆 Leaderboard updated for ${users.length} users`);
  }

  private getDateFilter(period: string): Date {
    const now = new Date();
    switch (period) {
      case 'daily':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        return weekStart;
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      default:
        return new Date(0);
    }
  }
}
