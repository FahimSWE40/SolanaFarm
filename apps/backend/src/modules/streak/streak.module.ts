import { Module } from '@nestjs/common';
import { StreakService } from './streak.service';
import { StreakController } from './streak.controller';
import { XpModule } from '../xp/xp.module';

@Module({
  imports: [XpModule],
  providers: [StreakService],
  controllers: [StreakController],
  exports: [StreakService],
})
export class StreakModule {}
