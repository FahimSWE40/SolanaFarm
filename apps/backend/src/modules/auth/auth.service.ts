import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { v4 as uuidv4 } from 'uuid';
import * as nacl from 'tweetnacl';
import * as bs58 from 'bs58';
import { PublicKey } from '@solana/web3.js';

export interface JwtPayload {
  sub: string; // userId
  wallet: string; // walletAddress
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  /**
   * Generate a nonce for wallet signature verification.
   * Stored in Redis with 5-minute TTL.
   */
  async generateNonce(walletAddress: string): Promise<{ nonce: string; expiresAt: string }> {
    // Validate wallet address format
    try {
      new PublicKey(walletAddress);
    } catch {
      throw new BadRequestException('Invalid Solana wallet address');
    }

    const nonce = `Solana Seeker Auth\nNonce: ${uuidv4()}\nTimestamp: ${Date.now()}`;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store nonce in Redis
    await this.redisService.set(
      `auth:nonce:${walletAddress}`,
      nonce,
      300, // 5 min TTL
    );

    return { nonce, expiresAt: expiresAt.toISOString() };
  }

  /**
   * Verify wallet signature and return JWT tokens.
   * Creates user if first time.
   */
  async verifyWallet(
    walletAddress: string,
    signature: string,
    referralCode?: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    isNewUser: boolean;
  }> {
    // Validate wallet address
    let publicKey: PublicKey;
    try {
      publicKey = new PublicKey(walletAddress);
    } catch {
      throw new BadRequestException('Invalid Solana wallet address');
    }

    // Retrieve nonce from Redis
    const nonce = await this.redisService.get(`auth:nonce:${walletAddress}`);
    if (!nonce) {
      throw new UnauthorizedException('Nonce expired or not found. Please request a new nonce.');
    }

    // Verify signature
    const isValid = this.verifySignature(nonce, signature, publicKey);
    if (!isValid) {
      throw new UnauthorizedException('Invalid wallet signature');
    }

    // Delete used nonce (one-time use)
    await this.redisService.del(`auth:nonce:${walletAddress}`);

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { walletAddress },
    });

    const isNewUser = !user;

    if (!user) {
      // Create new user
      const createData: any = {
        walletAddress,
        referralCode: this.generateReferralCode(),
      };

      // Handle referral if provided
      if (referralCode) {
        const referrer = await this.prisma.user.findUnique({
          where: { referralCode },
        });

        if (referrer && referrer.walletAddress !== walletAddress) {
          createData.referredBy = referrer.id;
        }
      }

      user = await this.prisma.user.create({ data: createData });

      // Create referral record if applicable
      if (user.referredBy) {
        await this.prisma.referral.create({
          data: {
            referrerId: user.referredBy,
            referredUserId: user.id,
            status: 'PENDING',
          },
        });
      }

      // Create initial wallet score record
      await this.prisma.walletScore.create({
        data: {
          userId: user.id,
          walletAddress,
        },
      });

      // Create initial fraud score
      await this.prisma.fraudScore.create({
        data: {
          userId: user.id,
          score: 0,
          status: 'NORMAL',
        },
      });
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, walletAddress);

    return { ...tokens, isNewUser };
  }

  /**
   * Refresh access token using refresh token.
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Verify refresh token from Redis
    const payload = await this.redisService.getJSON<JwtPayload>(`auth:refresh:${refreshToken}`);
    if (!payload) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Verify user still exists
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Invalidate old refresh token
    await this.redisService.del(`auth:refresh:${refreshToken}`);

    // Generate new tokens
    return this.generateTokens(user.id, user.walletAddress);
  }

  /**
   * Logout: invalidate refresh token.
   */
  async logout(refreshToken: string): Promise<void> {
    await this.redisService.del(`auth:refresh:${refreshToken}`);
  }

  // ============ Private Methods ============

  private verifySignature(message: string, signature: string, publicKey: PublicKey): boolean {
    try {
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = bs58.decode(signature);
      const publicKeyBytes = publicKey.toBytes();

      return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
    } catch {
      return false;
    }
  }

  private async generateTokens(
    userId: string,
    walletAddress: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: userId,
      wallet: walletAddress,
    };

    // Generate access token (15 min)
    const accessToken = this.jwtService.sign(payload);

    // Generate refresh token (7 days)
    const refreshToken = uuidv4();
    await this.redisService.setJSON(
      `auth:refresh:${refreshToken}`,
      payload,
      7 * 24 * 60 * 60, // 7 days
    );

    return { accessToken, refreshToken };
  }

  private generateReferralCode(): string {
    // Generate a short, memorable referral code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'SS-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
