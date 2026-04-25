import { Controller, Get, Post } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CurrentUser } from '../../common/decorators';

@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('score')
  async getScore(@CurrentUser('sub') userId: string) {
    const result = await this.walletService.getWalletScore(userId);
    return { success: true, data: result };
  }

  @Post('sync')
  async sync(@CurrentUser('sub') userId: string) {
    const result = await this.walletService.syncWallet(userId);
    return { success: true, data: result };
  }
}
