import { Controller, Get } from '@nestjs/common';
import { RewardService } from './reward.service';
import { CurrentUser, Public } from '../../common/decorators';

@Controller('rewards')
export class RewardController {
  constructor(private rewardService: RewardService) {}

  @Get('eligibility')
  async getEligibility(@CurrentUser('sub') userId: string) {
    const result = await this.rewardService.getEligibility(userId);
    return { success: true, data: result };
  }

  @Public()
  @Get('tiers')
  async getTiers() {
    return { success: true, data: this.rewardService.getTiers() };
  }
}
