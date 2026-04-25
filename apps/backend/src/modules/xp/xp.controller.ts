import { Controller, Get, Query } from '@nestjs/common';
import { XpService } from './xp.service';
import { CurrentUser } from '../../common/decorators';

@Controller('xp')
export class XpController {
  constructor(private xpService: XpService) {}

  @Get('logs')
  async getXPLogs(
    @CurrentUser('sub') userId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
  ) {
    const result = await this.xpService.getXPLogs(userId, page, pageSize);
    return { success: true, data: result };
  }

  @Get('summary')
  async getXPSummary(@CurrentUser('sub') userId: string) {
    const result = await this.xpService.getXPSummary(userId);
    return { success: true, data: result };
  }
}
