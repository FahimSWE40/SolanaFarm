import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators';
import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

// ============ DTOs ============
class NonceRequestDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, {
    message: 'Invalid Solana wallet address format',
  })
  walletAddress!: string;
}

class VerifyWalletDto {
  @IsString()
  @IsNotEmpty()
  walletAddress!: string;

  @IsString()
  @IsNotEmpty()
  signature!: string;

  @IsOptional()
  @IsString()
  referralCode?: string;
}

class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

class LogoutDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

// ============ Controller ============
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /api/auth/nonce
   * Generate a nonce for wallet signature.
   */
  @Public()
  @Post('nonce')
  @HttpCode(HttpStatus.OK)
  async getNonce(@Body() dto: NonceRequestDto) {
    const result = await this.authService.generateNonce(dto.walletAddress);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * POST /api/auth/verify-wallet
   * Verify wallet signature and authenticate.
   */
  @Public()
  @Post('verify-wallet')
  @HttpCode(HttpStatus.OK)
  async verifyWallet(@Body() dto: VerifyWalletDto) {
    const result = await this.authService.verifyWallet(
      dto.walletAddress,
      dto.signature,
      dto.referralCode,
    );
    return {
      success: true,
      data: result,
    };
  }

  /**
   * POST /api/auth/refresh
   * Refresh access token.
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    const result = await this.authService.refreshToken(dto.refreshToken);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * POST /api/auth/logout
   * Invalidate refresh token.
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() dto: LogoutDto) {
    await this.authService.logout(dto.refreshToken);
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}
