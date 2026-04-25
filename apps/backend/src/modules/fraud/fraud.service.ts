import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class FraudService {
  constructor(private prisma: PrismaService) {}

  async analyzeFraud(userId: string): Promise<{ score: number; flags: string[] }> {
    const flags: string[] = [];
    let score = 0;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        referralsMade: true,
        xpLogs: { orderBy: { createdAt: 'desc' }, take: 100 },
        userTasks: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
    if (!user) return { score: 0, flags: [] };

    // Check rapid XP farming
    const lastHourLogs = user.xpLogs.filter(
      (l) => l.createdAt > new Date(Date.now() - 3600000),
    );
    if (lastHourLogs.length > 15) { flags.push('RAPID_XP_FARMING'); score += 20; }

    // Check suspicious referral clusters
    if (user.referralsMade.length > 20) {
      const recentRefs = user.referralsMade.filter(
        (r) => r.createdAt > new Date(Date.now() - 86400000),
      );
      if (recentRefs.length > 10) { flags.push('SUSPICIOUS_REFERRAL_CLUSTER'); score += 30; }
    }

    // Check duplicate device fingerprint
    if (user.deviceFingerprint) {
      const sameDevice = await this.prisma.user.count({
        where: { deviceFingerprint: user.deviceFingerprint, id: { not: userId } },
      });
      if (sameDevice > 0) { flags.push('MULTIPLE_ACCOUNTS_SAME_DEVICE'); score += 25; }
    }

    // Bot-like task completion (all tasks completed in < 5 seconds)
    const quickCompletions = user.userTasks.filter((t) => {
      if (!t.completedAt) return false;
      const diff = t.completedAt.getTime() - t.createdAt.getTime();
      return diff < 5000;
    });
    if (quickCompletions.length > 5) { flags.push('BOT_LIKE_COMPLETION'); score += 15; }

    // Update fraud score
    const status = score >= 50 ? 'BLOCKED' : score >= 25 ? 'SUSPICIOUS' : 'NORMAL';
    await this.prisma.fraudScore.upsert({
      where: { userId },
      update: { score, reasonFlags: flags, status },
      create: { userId, score, reasonFlags: flags, status },
    });

    return { score, flags };
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async nightlyFraudScan() {
    console.log('🔍 Running nightly fraud scan...');
    const users = await this.prisma.user.findMany({ select: { id: true } });
    for (const user of users) {
      await this.analyzeFraud(user.id);
    }
    console.log(`🔍 Fraud scan complete for ${users.length} users`);
  }
}
