import { Controller, Get } from '@nestjs/common';
import { BadgeService } from './badge.service';
import { CurrentUser } from '../../common/decorators';

@Controller('badges')
export class BadgeController {
  constructor(private badgeService: BadgeService) {}

  @Get()
  async getBadges(@CurrentUser('sub') userId: string) {
    return { success: true, data: await this.badgeService.getUserBadges(userId) };
  }
}
