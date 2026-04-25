import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { XpService } from '../xp/xp.service';

@Injectable()
export class StreakService {
  constructor(
    private prisma: PrismaService,
    private xpService: XpService,
  ) {}

  /**
   * Process daily check-in for streak tracking.
   */
  async processCheckIn(userId: string): Promise<{
    streakCount: number;
    streakBroken: boolean;
    bonusXP: number;
    nextBonusAt: number | null;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { streakCount: true, lastCheckInAt: true, premiumStatus: true },
    });

    if (!user) throw new Error('User not found');

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    let newStreakCount = 1;
    let streakBroken = false;

    if (user.lastCheckInAt) {
      const lastCheckIn = new Date(user.lastCheckInAt);
      const lastCheckInDay = new Date(
        lastCheckIn.getFullYear(),
        lastCheckIn.getMonth(),
        lastCheckIn.getDate(),
      );

      // Already checked in today
      if (lastCheckInDay.getTime() === todayStart.getTime()) {
        return {
          streakCount: user.streakCount,
          streakBroken: false,
          bonusXP: 0,
          nextBonusAt: this.getNextBonusThreshold(user.streakCount),
        };
      }

      // Checked in yesterday — streak continues
      if (lastCheckInDay.getTime() === yesterdayStart.getTime()) {
        newStreakCount = user.streakCount + 1;
      } else {
        // Missed a day — streak broken
        newStreakCount = 1;
        streakBroken = true;
      }
    }

    // Update user streak
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        streakCount: newStreakCount,
        lastCheckInAt: now,
      },
    });

    // Award streak bonus XP if milestone hit
    let bonusXP = 0;
    const milestones = [3, 7, 14, 30];
    if (milestones.includes(newStreakCount)) {
      const bonusMap: Record<number, number> = { 3: 15, 7: 50, 14: 100, 30: 250 };
      bonusXP = bonusMap[newStreakCount] || 0;

      if (bonusXP > 0) {
        await this.xpService.awardXP({
          userId,
          amount: bonusXP,
          reason: `Streak milestone: ${newStreakCount} days`,
          source: 'STREAK_BONUS',
          multiplier: 1.0,
        });
      }
    }

    return {
      streakCount: newStreakCount,
      streakBroken,
      bonusXP,
      nextBonusAt: this.getNextBonusThreshold(newStreakCount),
    };
  }

  /**
   * Get streak status for a user.
   */
  async getStreakStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { streakCount: true, lastCheckInAt: true },
    });

    if (!user) return null;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const checkedInToday = user.lastCheckInAt
      ? new Date(user.lastCheckInAt) >= todayStart
      : false;

    // Check if streak is at risk (last check-in was yesterday and it's getting late)
    let atRisk = false;
    if (user.lastCheckInAt && !checkedInToday) {
      const lastCheckIn = new Date(user.lastCheckInAt);
      const hoursSince = (now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60);
      atRisk = hoursSince >= 20; // At risk if >20 hours since last check-in
    }

    // Get current bonus percentage
    let currentBonus = 0;
    if (user.streakCount >= 30) currentBonus = 35;
    else if (user.streakCount >= 14) currentBonus = 20;
    else if (user.streakCount >= 7) currentBonus = 10;
    else if (user.streakCount >= 3) currentBonus = 5;

    return {
      streakCount: user.streakCount,
      checkedInToday,
      atRisk,
      currentBonusPercent: currentBonus,
      nextBonusAt: this.getNextBonusThreshold(user.streakCount),
      lastCheckInAt: user.lastCheckInAt,
    };
  }

  private getNextBonusThreshold(currentStreak: number): number | null {
    const milestones = [3, 7, 14, 30];
    for (const milestone of milestones) {
      if (currentStreak < milestone) return milestone;
    }
    return null; // Max bonus achieved
  }
}
