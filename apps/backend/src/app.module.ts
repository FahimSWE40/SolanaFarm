import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';

import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { TaskModule } from './modules/task/task.module';
import { XpModule } from './modules/xp/xp.module';
import { StreakModule } from './modules/streak/streak.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { RewardModule } from './modules/reward/reward.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { ReferralModule } from './modules/referral/referral.module';
import { PremiumModule } from './modules/premium/premium.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { BadgeModule } from './modules/badge/badge.module';
import { NotificationModule } from './modules/notification/notification.module';
import { FraudModule } from './modules/fraud/fraud.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting: 60 requests per minute per IP
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),

    // Scheduled tasks (cron)
    ScheduleModule.forRoot(),

    // Core services
    PrismaModule,
    RedisModule,

    // Feature modules
    AuthModule,
    UserModule,
    TaskModule,
    XpModule,
    StreakModule,
    LeaderboardModule,
    RewardModule,
    WalletModule,
    ReferralModule,
    PremiumModule,
    QuizModule,
    BadgeModule,
    NotificationModule,
    FraudModule,
    AdminModule,
  ],
  providers: [
    // Apply rate limiting globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
