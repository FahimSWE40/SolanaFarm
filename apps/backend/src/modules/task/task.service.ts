import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { XpService } from '../xp/xp.service';
import { Frequency, TaskStatus, PremiumStatus } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(
    private prisma: PrismaService,
    private xpService: XpService,
  ) {}

  /**
   * Get all available tasks for a user.
   */
  async getAvailableTasks(userId: string, frequency?: Frequency) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { premiumStatus: true },
    });

    const where: any = {
      isActive: true,
      OR: [
        { startDate: null },
        { startDate: { lte: new Date() } },
      ],
      AND: [
        {
          OR: [
            { endDate: null },
            { endDate: { gte: new Date() } },
          ],
        },
      ],
    };

    if (frequency) where.frequency = frequency;

    // Non-premium users can't see premium-only tasks
    if (user?.premiumStatus === PremiumStatus.FREE) {
      where.premiumOnly = false;
    }

    const tasks = await this.prisma.task.findMany({
      where,
      orderBy: [{ frequency: 'asc' }, { xpReward: 'desc' }],
    });

    // Get user's task statuses for today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const userTasks = await this.prisma.userTask.findMany({
      where: {
        userId,
        taskId: { in: tasks.map((t) => t.id) },
        createdAt: { gte: todayStart },
      },
    });

    const userTaskMap = new Map(userTasks.map((ut) => [ut.taskId, ut]));

    return tasks.map((task) => {
      const userTask = userTaskMap.get(task.id);
      return {
        ...task,
        userStatus: userTask?.status || null,
        progress: userTask?.progress || 0,
        completedAt: userTask?.completedAt || null,
        claimedAt: userTask?.claimedAt || null,
      };
    });
  }

  /**
   * Get daily tasks for today.
   */
  async getDailyTasks(userId: string) {
    return this.getAvailableTasks(userId, Frequency.DAILY);
  }

  /**
   * Get weekly tasks.
   */
  async getWeeklyTasks(userId: string) {
    return this.getAvailableTasks(userId, Frequency.WEEKLY);
  }

  /**
   * Complete a task (mark as completed, pending claim).
   */
  async completeTask(userId: string, taskId: string, proofUrl?: string, metadata?: Record<string, unknown>) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { campaign: true },
    });

    if (!task) throw new NotFoundException('Task not found');
    if (!task.isActive) throw new BadRequestException('Task is no longer active');

    // Check for duplicate completion based on frequency
    const existingTask = await this.checkDuplicateCompletion(userId, taskId, task.frequency);
    if (existingTask) {
      throw new ConflictException('Task already completed for this period');
    }

    // Create user task record
    const userTask = await this.prisma.userTask.create({
      data: {
        userId,
        taskId,
        status: task.validationType === 'AUTOMATIC' ? TaskStatus.COMPLETED : TaskStatus.PENDING,
        progress: 1,
        completedAt: task.validationType === 'AUTOMATIC' ? new Date() : null,
        proofUrl,
        metadata: metadata || undefined,
      },
    });

    return userTask;
  }

  /**
   * Claim XP for a completed task.
   * XP is calculated server-side only.
   */
  async claimTask(userId: string, taskId: string) {
    // Find the user task
    const userTask = await this.prisma.userTask.findFirst({
      where: {
        userId,
        taskId,
        status: TaskStatus.COMPLETED,
        claimedAt: null,
      },
      include: {
        task: { include: { campaign: true } },
      },
    });

    if (!userTask) {
      throw new NotFoundException('No completed unclaimed task found');
    }

    // Prevent duplicate claims
    if (userTask.status === TaskStatus.CLAIMED) {
      throw new ConflictException('XP already claimed for this task');
    }

    // Get user for multiplier calculation
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { streakCount: true, premiumStatus: true },
    });

    if (!user) throw new NotFoundException('User not found');

    // Calculate XP server-side
    const campaignMultiplier = userTask.task.campaign?.bonusMultiplier || 1.0;
    const { totalXP, multiplier } = this.xpService.calculateXP(
      userTask.task.xpReward,
      user.streakCount,
      user.premiumStatus,
      campaignMultiplier,
    );

    // Award XP through the XP engine
    const xpResult = await this.xpService.awardXP({
      userId,
      amount: totalXP,
      reason: `Completed task: ${userTask.task.title}`,
      source: 'TASK',
      taskId,
      multiplier,
    });

    // Mark task as claimed
    await this.prisma.userTask.update({
      where: { id: userTask.id },
      data: {
        status: TaskStatus.CLAIMED,
        claimedAt: new Date(),
      },
    });

    return {
      taskTitle: userTask.task.title,
      baseXP: userTask.task.xpReward,
      multiplier,
      xpAwarded: totalXP,
      newTotal: xpResult.newTotal,
      newLevel: xpResult.newLevel,
      levelUp: xpResult.levelUp,
    };
  }

  // ============ Private Methods ============

  private async checkDuplicateCompletion(
    userId: string,
    taskId: string,
    frequency: Frequency,
  ) {
    let dateFilter: Date | undefined;

    const now = new Date();

    switch (frequency) {
      case Frequency.DAILY:
        dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case Frequency.WEEKLY:
        const dayOfWeek = now.getDay();
        dateFilter = new Date(now);
        dateFilter.setDate(now.getDate() - dayOfWeek);
        dateFilter.setHours(0, 0, 0, 0);
        break;
      case Frequency.ONCE:
        // Check for any completion ever
        return this.prisma.userTask.findFirst({
          where: {
            userId,
            taskId,
            status: { in: [TaskStatus.COMPLETED, TaskStatus.CLAIMED] },
          },
        });
      case Frequency.CAMPAIGN:
        dateFilter = undefined; // Campaigns may have their own logic
        break;
    }

    if (!dateFilter) return null;

    return this.prisma.userTask.findFirst({
      where: {
        userId,
        taskId,
        createdAt: { gte: dateFilter },
        status: { in: [TaskStatus.COMPLETED, TaskStatus.CLAIMED] },
      },
    });
  }
}
