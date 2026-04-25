// Reward Module
import { Module } from '@nestjs/common';
import { RewardService } from './reward.service';
import { RewardController } from './reward.controller';

@Module({
  providers: [RewardService],
  controllers: [RewardController],
  exports: [RewardService],
})
export class RewardModule {}
