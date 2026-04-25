import { Controller, Post, Patch, Get, Body, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CurrentUser } from '../../common/decorators';

@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post('register-device')
  async register(@CurrentUser('sub') userId: string, @Body('fcmToken') token: string) {
    await this.notificationService.registerDevice(userId, token);
    return { success: true };
  }

  @Patch('settings')
  async updateSettings(
    @CurrentUser('sub') userId: string,
    @Body() body: { enabled: boolean; reminderTime?: string },
  ) {
    await this.notificationService.updateSettings(userId, body.enabled, body.reminderTime);
    return { success: true };
  }

  @Get()
  async getNotifications(@CurrentUser('sub') userId: string, @Query('page') page: number = 1) {
    return { success: true, data: await this.notificationService.getNotifications(userId, page) };
  }
}
