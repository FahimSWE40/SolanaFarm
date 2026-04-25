import { Controller, Get, Query } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { CurrentUser, Public } from '../../common/decorators';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private leaderboardService: LeaderboardService) {}

  @Get('daily')
  async getDaily(@Query('page') page: number = 1) {
    const result = await this.leaderboardService.getLeaderboard('daily', page);
    return { success: true, data: result };
  }

  @Get('weekly')
  async getWeekly(@Query('page') page: number = 1) {
    const result = await this.leaderboardService.getLeaderboard('weekly', page);
    return { success: true, data: result };
  }

  @Get('monthly')
  async getMonthly(@Query('page') page: number = 1) {
    const result = await this.leaderboardService.getLeaderboard('monthly', page);
    return { success: true, data: result };
  }

  @Get('all-time')
  async getAllTime(@Query('page') page: number = 1) {
    const result = await this.leaderboardService.getLeaderboard('all_time', page);
    return { success: true, data: result };
  }

  @Get('me')
  async getMyRank(@CurrentUser('sub') userId: string) {
    const result = await this.leaderboardService.getUserRank(userId);
    return { success: true, data: result };
  }
}
