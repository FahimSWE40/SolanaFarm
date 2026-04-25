import { Module } from '@nestjs/common';
import { XpService } from './xp.service';
import { XpController } from './xp.controller';

@Module({
  providers: [XpService],
  controllers: [XpController],
  exports: [XpService],
})
export class XpModule {}
