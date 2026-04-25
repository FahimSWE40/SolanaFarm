import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { XpService } from '../xp/xp.service';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService, private xpService: XpService) {}

  async getActiveQuizzes() {
    return this.prisma.quizModule.findMany({
      where: { isActive: true },
      select: { id: true, title: true, xpReward: true, questions: true, lessonContent: true },
    });
  }

  async getQuiz(quizId: string) {
    const quiz = await this.prisma.quizModule.findUnique({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz not found');
    // Strip correct answers from questions for client
    const questions = (quiz.questions as any[]).map((q: any, i: number) => ({
      id: i,
      question: q.question,
      options: q.options,
      explanation: undefined, // Don't send until answered
    }));
    return { ...quiz, questions };
  }

  async submitQuiz(userId: string, quizId: string, answers: number[]) {
    const quiz = await this.prisma.quizModule.findUnique({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const questions = quiz.questions as any[];
    if (answers.length !== questions.length) {
      throw new BadRequestException('Answer count mismatch');
    }

    // Grade quiz server-side
    let correct = 0;
    const results = questions.map((q: any, i: number) => {
      const isCorrect = answers[i] === q.correctAnswer;
      if (isCorrect) correct++;
      return { question: q.question, correct: isCorrect, explanation: q.explanation, correctAnswer: q.correctAnswer, userAnswer: answers[i] };
    });

    const score = Math.round((correct / questions.length) * 100);
    const isPerfect = score === 100;

    // Calculate XP (bonus for perfect score)
    let xpAmount = quiz.xpReward;
    if (isPerfect) xpAmount = Math.floor(xpAmount * 1.5);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { streakCount: true, premiumStatus: true },
    });

    if (user) {
      const { totalXP } = this.xpService.calculateXP(xpAmount, user.streakCount, user.premiumStatus);
      await this.xpService.awardXP({
        userId, amount: totalXP, reason: `Quiz completed: ${quiz.title}`, source: 'TASK',
      });
      xpAmount = totalXP;
    }

    return { score, correct, total: questions.length, isPerfect, xpAwarded: xpAmount, results };
  }
}
