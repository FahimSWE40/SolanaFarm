import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { XpService } from '../xp/xp.service';

@Injectable()
export class ReferralService {
  constructor(private prisma: PrismaService, private xpService: XpService) {}

  async getReferralCode(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });
    return { code: user?.referralCode, link: `https://solanaseeker.app/r/${user?.referralCode}` };
  }

  async getReferralStats(userId: string) {
    const referrals = await this.prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: { select: { username: true, avatarUrl: true, createdAt: true, xpTotal: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      total: referrals.length,
      rewarded: referrals.filter((r) => r.status === 'REWARDED').length,
      pending: referrals.filter((r) => r.status === 'PENDING').length,
      totalXPEarned: referrals.reduce((sum, r) => sum + r.xpAwarded, 0),
      referrals: referrals.map((r) => ({
        username: r.referred.username,
        avatarUrl: r.referred.avatarUrl,
        status: r.status,
        xpAwarded: r.xpAwarded,
        createdAt: r.createdAt,
      })),
    };
  }

  async applyReferralCode(userId: string, referralCode: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    if (user.referredBy) throw new BadRequestException('Already referred');
    if (user.referralCode === referralCode) throw new BadRequestException('Cannot refer yourself');

    const referrer = await this.prisma.user.findUnique({ where: { referralCode } });
    if (!referrer) throw new BadRequestException('Invalid referral code');
    if (referrer.id === userId) throw new BadRequestException('Cannot refer yourself');

    await this.prisma.user.update({
      where: { id: userId },
      data: { referredBy: referrer.id },
    });

    await this.prisma.referral.create({
      data: { referrerId: referrer.id, referredUserId: userId, status: 'PENDING' },
    });

    // Award welcome XP to referred user
    await this.xpService.awardXP({
      userId, amount: 50, reason: 'Welcome bonus (referred)', source: 'WELCOME_BONUS',
    });

    return { success: true, message: 'Referral applied!' };
  }

  // Called internally when a referred user completes 2+ tasks
  async checkAndRewardReferral(referredUserId: string) {
    const referral = await this.prisma.referral.findUnique({
      where: { referredUserId },
    });

    if (!referral || referral.status !== 'PENDING') return;

    const completedTasks = await this.prisma.userTask.count({
      where: { userId: referredUserId, status: 'CLAIMED' },
    });

    if (completedTasks >= 2) {
      await this.prisma.referral.update({
        where: { id: referral.id },
        data: { status: 'REWARDED', xpAwarded: 100 },
      });

      await this.xpService.awardXP({
        userId: referral.referrerId,
        amount: 100,
        reason: 'Referral reward',
        source: 'REFERRAL',
      });
    }
  }
}
