import { Controller, Get, Post, Body } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { CurrentUser } from '../../common/decorators';
import { IsString, IsNotEmpty } from 'class-validator';

class ApplyReferralDto { @IsString() @IsNotEmpty() referralCode!: string; }

@Controller('referral')
export class ReferralController {
  constructor(private referralService: ReferralService) {}

  @Get('code')
  async getCode(@CurrentUser('sub') userId: string) {
    return { success: true, data: await this.referralService.getReferralCode(userId) };
  }

  @Get('stats')
  async getStats(@CurrentUser('sub') userId: string) {
    return { success: true, data: await this.referralService.getReferralStats(userId) };
  }

  @Post('apply')
  async apply(@CurrentUser('sub') userId: string, @Body() dto: ApplyReferralDto) {
    return { success: true, data: await this.referralService.applyReferralCode(userId, dto.referralCode) };
  }
}
