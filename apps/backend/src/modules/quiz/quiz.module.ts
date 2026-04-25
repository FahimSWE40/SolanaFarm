import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { XpModule } from '../xp/xp.module';
@Module({ imports: [XpModule], providers: [QuizService], controllers: [QuizController], exports: [QuizService] })
export class QuizModule {}
