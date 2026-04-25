import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async registerDevice(userId: string, fcmToken: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { fcmToken } });
  }

  async updateSettings(userId: string, enabled: boolean, reminderTime?: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { notificationsEnabled: enabled, reminderTime },
    });
  }

  async createNotification(userId: string, title: string, body: string, type: NotificationType, metadata?: any) {
    return this.prisma.notification.create({
      data: { userId, title, body, type, metadata },
    });
  }

  async getNotifications(userId: string, page: number = 1) {
    const skip = (page - 1) * 20;
    const [items, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId }, orderBy: { createdAt: 'desc' }, skip, take: 20,
      }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return { items, unreadCount };
  }

  async markAsRead(userId: string, notificationId: string) {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }
}
