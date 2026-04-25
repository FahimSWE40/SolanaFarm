import { Controller, Get, Post } from '@nestjs/common';
import { StreakService } from './streak.service';
import { CurrentUser } from '../../common/decorators';

@Controller('streak')
export class StreakController {
  constructor(private streakService: StreakService) {}

  @Post('checkin')
  async checkIn(@CurrentUser('sub') userId: string) {
    const result = await this.streakService.processCheckIn(userId);
    return { success: true, data: result };
  }

  @Get('status')
  async getStatus(@CurrentUser('sub') userId: string) {
    const result = await this.streakService.getStreakStatus(userId);
    return { success: true, data: result };
  }
}
