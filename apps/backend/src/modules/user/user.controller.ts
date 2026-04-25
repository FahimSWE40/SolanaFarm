import { Controller, Get, Patch, Body, Param, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '../../common/decorators';
import { IsString, IsOptional, IsEmail, Matches, MaxLength } from 'class-validator';

class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9_]{3,15}$/, {
    message: 'Username must be 3-15 characters, alphanumeric and underscores only',
  })
  username?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  async getMe(@CurrentUser('sub') userId: string) {
    const profile = await this.userService.getProfile(userId);
    return { success: true, data: profile };
  }

  @Patch('me')
  async updateMe(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    const updated = await this.userService.updateProfile(userId, dto);
    return { success: true, data: updated };
  }

  @Get('profile/:username')
  async getPublicProfile(@Param('username') username: string) {
    const profile = await this.userService.getPublicProfile(username);
    return { success: true, data: profile };
  }

  @Get('check-username')
  async checkUsername(@Query('username') username: string) {
    const available = await this.userService.checkUsernameAvailability(username);
    return { success: true, data: { available } };
  }
}
