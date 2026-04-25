import { Controller, Get, Post, Body } from '@nestjs/common';
import { PremiumService } from './premium.service';
import { CurrentUser, Public } from '../../common/decorators';
import { IsEnum } from 'class-validator';

enum PlanEnum { MONTHLY = 'MONTHLY', YEARLY = 'YEARLY' }
class SubscribeDto { @IsEnum(PlanEnum) plan!: PlanEnum; }

@Controller('premium')
export class PremiumController {
  constructor(private premiumService: PremiumService) {}

  @Public() @Get('plans')
  async getPlans() { return { success: true, data: this.premiumService.getPlans() }; }

  @Post('subscribe')
  async subscribe(@CurrentUser('sub') userId: string, @Body() dto: SubscribeDto) {
    return { success: true, data: await this.premiumService.subscribe(userId, dto.plan as any) };
  }

  @Post('cancel')
  async cancel(@CurrentUser('sub') userId: string) {
    return { success: true, data: await this.premiumService.cancel(userId) };
  }
}
