import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        walletScore: true,
        badges: { include: { badge: true } },
        subscription: true,
        fraudScore: { select: { status: true } },
        _count: {
          select: {
            userTasks: { where: { status: 'CLAIMED' } },
            referralsMade: { where: { status: 'REWARDED' } },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return {
      id: user.id,
      walletAddress: user.walletAddress,
      username: user.username,
      avatarUrl: user.avatarUrl,
      email: user.email,
      xpTotal: user.xpTotal,
      level: user.level,
      rank: user.rank,
      streakCount: user.streakCount,
      lastCheckInAt: user.lastCheckInAt,
      premiumStatus: user.premiumStatus,
      referralCode: user.referralCode,
      walletScore: user.walletScore,
      badges: user.badges.map((ub) => ({
        ...ub.badge,
        earnedAt: ub.earnedAt,
      })),
      subscription: user.subscription,
      completedTasks: user._count.userTasks,
      totalReferrals: user._count.referralsMade,
      createdAt: user.createdAt,
    };
  }

  async getPublicProfile(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        xpTotal: true,
        level: true,
        rank: true,
        streakCount: true,
        premiumStatus: true,
        createdAt: true,
        badges: {
          include: { badge: true },
          orderBy: { earnedAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            userTasks: { where: { status: 'CLAIMED' } },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return {
      ...user,
      completedTasks: user._count.userTasks,
      badges: user.badges.map((ub) => ({
        ...ub.badge,
        earnedAt: ub.earnedAt,
      })),
    };
  }

  async updateProfile(userId: string, data: {
    username?: string;
    avatarUrl?: string;
    email?: string;
  }) {
    // Validate username uniqueness
    if (data.username) {
      // Validate username format
      if (!/^[a-zA-Z0-9_]{3,15}$/.test(data.username)) {
        throw new BadRequestException(
          'Username must be 3-15 characters, alphanumeric and underscores only',
        );
      }

      const existing = await this.prisma.user.findUnique({
        where: { username: data.username },
      });

      if (existing && existing.id !== userId) {
        throw new ConflictException('Username already taken');
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        email: true,
        updatedAt: true,
      },
    });
  }

  async checkUsernameAvailability(username: string): Promise<boolean> {
    if (!/^[a-zA-Z0-9_]{3,15}$/.test(username)) return false;
    const existing = await this.prisma.user.findUnique({
      where: { username },
    });
    return !existing;
  }
}
