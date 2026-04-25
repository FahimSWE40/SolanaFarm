import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { XpModule } from '../xp/xp.module';
@Module({ imports: [XpModule], providers: [AdminService], controllers: [AdminController], exports: [AdminService] })
export class AdminModule {}
