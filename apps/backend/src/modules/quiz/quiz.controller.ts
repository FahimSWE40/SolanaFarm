import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CurrentUser } from '../../common/decorators';

@Controller('quiz')
export class QuizController {
  constructor(private quizService: QuizService) {}

  @Get()
  async list() { return { success: true, data: await this.quizService.getActiveQuizzes() }; }

  @Get(':id')
  async get(@Param('id') id: string) { return { success: true, data: await this.quizService.getQuiz(id) }; }

  @Post(':id/submit')
  async submit(@CurrentUser('sub') userId: string, @Param('id') id: string, @Body('answers') answers: number[]) {
    return { success: true, data: await this.quizService.submitQuiz(userId, id, answers) };
  }
}
