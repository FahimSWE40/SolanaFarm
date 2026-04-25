import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BadgeService {
  constructor(private prisma: PrismaService) {}

  async getUserBadges(userId: string) {
    const earned = await this.prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    });
    const allBadges = await this.prisma.badge.findMany();
    const earnedIds = new Set(earned.map((ub) => ub.badgeId));
    return {
      earned: earned.map((ub) => ({ ...ub.badge, earnedAt: ub.earnedAt })),
      locked: allBadges.filter((b) => !earnedIds.has(b.id)),
    };
  }

  async checkAndAwardBadges(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        badges: true,
        _count: { select: { userTasks: { where: { status: 'CLAIMED' } }, referralsMade: { where: { status: 'REWARDED' } } } },
      },
    });
    if (!user) return;

    const earnedBadgeIds = new Set(user.badges.map((ub) => ub.badgeId));
    const badges = await this.prisma.badge.findMany();

    for (const badge of badges) {
      if (earnedBadgeIds.has(badge.id)) continue;
      const condition = badge.condition as any;
      let earned = false;

      switch (condition.type) {
        case 'first_task': earned = user._count.userTasks >= 1; break;
        case 'streak': earned = user.streakCount >= (condition.days || 7); break;
        case 'top_percent': earned = user.rank !== null && user.rank <= (condition.rank || 100); break;
        case 'xp_total': earned = user.xpTotal >= (condition.amount || 1000); break;
        case 'referrals': earned = user._count.referralsMade >= (condition.count || 5); break;
        case 'level': earned = user.level >= (condition.level || 10); break;
      }

      if (earned) {
        await this.prisma.userBadge.create({ data: { userId, badgeId: badge.id } });
      }
    }
  }
}
