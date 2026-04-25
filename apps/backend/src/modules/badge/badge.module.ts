import { Module } from '@nestjs/common';
import { BadgeService } from './badge.service';
import { BadgeController } from './badge.controller';
@Module({ providers: [BadgeService], controllers: [BadgeController], exports: [BadgeService] })
export class BadgeModule {}
