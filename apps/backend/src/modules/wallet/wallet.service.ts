import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Connection, PublicKey } from '@solana/web3.js';

@Injectable()
export class WalletService {
  private connection: Connection;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const rpcUrl = this.configService.get('SOLANA_RPC_URL', 'https://api.mainnet-beta.solana.com');
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  async getWalletScore(userId: string) {
    return this.prisma.walletScore.findUnique({ where: { userId } });
  }

  async syncWallet(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddress: true },
    });
    if (!user) throw new Error('User not found');

    try {
      const pubkey = new PublicKey(user.walletAddress);

      // Get transaction count
      const signatures = await this.connection.getSignaturesForAddress(pubkey, { limit: 1000 });
      const transactionCount = signatures.length;

      // Get token accounts (SPL tokens)
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(pubkey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      });
      const tokenCount = tokenAccounts.value.length;

      // Calculate wallet age from first transaction
      let walletAgeDays = 0;
      if (signatures.length > 0) {
        const oldest = signatures[signatures.length - 1];
        if (oldest.blockTime) {
          const ageMs = Date.now() - oldest.blockTime * 1000;
          walletAgeDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
        }
      }

      // Calculate reputation score (0-1)
      const reputationScore = Math.min(1.0,
        (transactionCount / 500) * 0.3 +
        (walletAgeDays / 365) * 0.3 +
        (tokenCount / 20) * 0.2 +
        0.2 // Base score for having a wallet
      );

      // Update wallet score
      const updated = await this.prisma.walletScore.upsert({
        where: { userId },
        update: {
          transactionCount,
          walletAgeDays,
          tokenCount,
          reputationScore,
          lastSyncedAt: new Date(),
        },
        create: {
          userId,
          walletAddress: user.walletAddress,
          transactionCount,
          walletAgeDays,
          tokenCount,
          reputationScore,
          lastSyncedAt: new Date(),
        },
      });

      return updated;
    } catch (error) {
      console.error('Wallet sync error:', error);
      // Return existing data on error
      return this.prisma.walletScore.findUnique({ where: { userId } });
    }
  }
}
