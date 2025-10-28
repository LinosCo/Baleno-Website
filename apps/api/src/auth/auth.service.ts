import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: any) {
    // TODO: Implement user registration with validation
    // Hash password, create user, return tokens
    throw new Error('Not implemented yet');
  }

  async login(loginDto: any) {
    // TODO: Implement login with email/password
    // Validate credentials, generate tokens
    throw new Error('Not implemented yet');
  }

  async refreshToken(refreshTokenDto: any) {
    // TODO: Implement refresh token logic
    throw new Error('Not implemented yet');
  }

  async logout(userId: string) {
    // TODO: Implement logout (invalidate refresh token)
    throw new Error('Not implemented yet');
  }

  async googleLogin(user: any) {
    // TODO: Implement Google OAuth login
    // Create or find user, generate tokens
    throw new Error('Not implemented yet');
  }

  async validateUser(email: string, password: string): Promise<any> {
    // TODO: Implement user validation
    throw new Error('Not implemented yet');
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
