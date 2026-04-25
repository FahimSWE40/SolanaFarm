import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { XpService } from '../xp/xp.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private xpService: XpService,
  ) {}

  async login(email: string, password: string) {
    const admin = await this.prisma.adminUser.findUnique({ where: { email } });
    if (!admin || !admin.isActive) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return { id: admin.id, email: admin.email, name: admin.name, role: admin.role };
  }

  async getUsers(search?: string, page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;
    const where = search ? {
      OR: [
        { username: { contains: search, mode: 'insensitive' as const } },
        { walletAddress: { contains: search } },
      ],
    } : {};
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({ where, skip, take: pageSize, orderBy: { createdAt: 'desc' },
        select: { id: true, walletAddress: true, username: true, xpTotal: true, level: true, rank: true, premiumStatus: true, streakCount: true, createdAt: true },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async getTasks(page: number = 1) {
    const skip = (page - 1) * 20;
    return this.prisma.task.findMany({ skip, take: 20, orderBy: { createdAt: 'desc' } });
  }

  async createTask(data: any, adminId: string) {
    const task = await this.prisma.task.create({ data });
    await this.prisma.adminAuditLog.create({ data: { adminId, action: 'CREATE_TASK', targetType: 'task', targetId: task.id } });
    return task;
  }

  async updateTask(taskId: string, data: any, adminId: string) {
    const task = await this.prisma.task.update({ where: { id: taskId }, data });
    await this.prisma.adminAuditLog.create({ data: { adminId, action: 'UPDATE_TASK', targetType: 'task', targetId: taskId, metadata: data } });
    return task;
  }

  async deleteTask(taskId: string, adminId: string) {
    await this.prisma.task.update({ where: { id: taskId }, data: { isActive: false } });
    await this.prisma.adminAuditLog.create({ data: { adminId, action: 'DELETE_TASK', targetType: 'task', targetId: taskId } });
  }

  async getFraudFlags(page: number = 1) {
    return this.prisma.fraudScore.findMany({
      where: { status: { not: 'NORMAL' } },
      include: { user: { select: { id: true, username: true, walletAddress: true } } },
      orderBy: { score: 'desc' },
      skip: (page - 1) * 20, take: 20,
    });
  }

  async getXPLogs(userId?: string, page: number = 1) {
    const where = userId ? { userId } : {};
    return this.prisma.xPLog.findMany({
      where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * 50, take: 50,
      include: { user: { select: { username: true } }, task: { select: { title: true } } },
    });
  }

  async adjustXP(userId: string, amount: number, reason: string, adminId: string) {
    return this.xpService.adminAdjustXP({ userId, amount, reason, adminId });
  }

  async getAnalytics() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalUsers, activeToday, totalXP, premiumUsers, tasksCompletedToday] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { lastCheckInAt: { gte: todayStart } } }),
      this.prisma.xPLog.aggregate({ _sum: { amount: true } }),
      this.prisma.user.count({ where: { premiumStatus: { not: 'FREE' } } }),
      this.prisma.userTask.count({ where: { status: 'CLAIMED', claimedAt: { gte: todayStart } } }),
    ]);

    return { totalUsers, activeToday, totalXPAwarded: totalXP._sum.amount || 0, premiumUsers, tasksCompletedToday };
  }
}
