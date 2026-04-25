import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Public } from '../../common/decorators';

// Note: In production, use a separate admin JWT guard.
// For MVP, admin endpoints should be protected with admin-specific auth.

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Public()
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return { success: true, data: await this.adminService.login(body.email, body.password) };
  }

  @Get('users')
  async getUsers(@Query('search') search?: string, @Query('page') page: number = 1) {
    return { success: true, data: await this.adminService.getUsers(search, page) };
  }

  @Get('tasks')
  async getTasks(@Query('page') page: number = 1) {
    return { success: true, data: await this.adminService.getTasks(page) };
  }

  @Post('tasks')
  async createTask(@Body() body: any) {
    return { success: true, data: await this.adminService.createTask(body, 'admin') };
  }

  @Patch('tasks/:id')
  async updateTask(@Param('id') id: string, @Body() body: any) {
    return { success: true, data: await this.adminService.updateTask(id, body, 'admin') };
  }

  @Delete('tasks/:id')
  async deleteTask(@Param('id') id: string) {
    await this.adminService.deleteTask(id, 'admin');
    return { success: true };
  }

  @Get('fraud')
  async getFraud(@Query('page') page: number = 1) {
    return { success: true, data: await this.adminService.getFraudFlags(page) };
  }

  @Get('xp-logs')
  async getXPLogs(@Query('userId') userId?: string, @Query('page') page: number = 1) {
    return { success: true, data: await this.adminService.getXPLogs(userId, page) };
  }

  @Post('xp-adjust')
  async adjustXP(@Body() body: { userId: string; amount: number; reason: string }) {
    await this.adminService.adjustXP(body.userId, body.amount, body.reason, 'admin');
    return { success: true };
  }

  @Get('analytics')
  async getAnalytics() {
    return { success: true, data: await this.adminService.getAnalytics() };
  }
}
