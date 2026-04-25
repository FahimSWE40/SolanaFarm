import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { TaskService } from './task.service';
import { CurrentUser } from '../../common/decorators';
import { IsOptional, IsString } from 'class-validator';

class CompleteTaskDto {
  @IsOptional()
  @IsString()
  proofUrl?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}

@Controller('tasks')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get()
  async getTasks(
    @CurrentUser('sub') userId: string,
    @Query('frequency') frequency?: string,
  ) {
    const tasks = await this.taskService.getAvailableTasks(
      userId,
      frequency as any,
    );
    return { success: true, data: tasks };
  }

  @Get('daily')
  async getDailyTasks(@CurrentUser('sub') userId: string) {
    const tasks = await this.taskService.getDailyTasks(userId);
    return { success: true, data: tasks };
  }

  @Get('weekly')
  async getWeeklyTasks(@CurrentUser('sub') userId: string) {
    const tasks = await this.taskService.getWeeklyTasks(userId);
    return { success: true, data: tasks };
  }

  @Post(':id/complete')
  async completeTask(
    @CurrentUser('sub') userId: string,
    @Param('id') taskId: string,
    @Body() dto: CompleteTaskDto,
  ) {
    const result = await this.taskService.completeTask(
      userId,
      taskId,
      dto.proofUrl,
      dto.metadata,
    );
    return { success: true, data: result };
  }

  @Post(':id/claim')
  async claimTask(
    @CurrentUser('sub') userId: string,
    @Param('id') taskId: string,
  ) {
    const result = await this.taskService.claimTask(userId, taskId);
    return { success: true, data: result };
  }
}
