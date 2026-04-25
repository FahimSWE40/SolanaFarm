import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PremiumService {
  constructor(private prisma: PrismaService) {}

  getPlans() {
    return [
      { id: 'monthly', name: 'Premium Monthly', price: 9.99, currency: 'USD', multiplier: 1.25, features: ['1.25x XP', 'Premium tasks', 'Advanced stats', 'Profile badge'] },
      { id: 'yearly', name: 'Premium Pro Yearly', price: 79.99, currency: 'USD', multiplier: 1.5, features: ['1.5x XP', 'All premium tasks', 'Priority support', 'Exclusive badge', 'Early access'] },
    ];
  }

  async subscribe(userId: string, plan: 'MONTHLY' | 'YEARLY') {
    const existing = await this.prisma.subscription.findUnique({ where: { userId } });
    if (existing?.status === 'ACTIVE') throw new BadRequestException('Already subscribed');

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + (plan === 'YEARLY' ? 12 : 1));

    const premiumStatus = plan === 'YEARLY' ? 'PREMIUM_PRO' : 'PREMIUM';

    await this.prisma.subscription.upsert({
      where: { userId },
      update: { plan, status: 'ACTIVE', startDate: new Date(), endDate },
      create: { userId, plan, status: 'ACTIVE', endDate },
    });

    await this.prisma.user.update({ where: { id: userId }, data: { premiumStatus } });
    return { status: 'ACTIVE', plan, endDate, premiumStatus };
  }

  async cancel(userId: string) {
    await this.prisma.subscription.update({ where: { userId }, data: { status: 'CANCELLED' } });
    await this.prisma.user.update({ where: { id: userId }, data: { premiumStatus: 'FREE' } });
    return { status: 'CANCELLED' };
  }
}
