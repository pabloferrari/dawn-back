// backend/src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  // Credenciales hardcodeadas para un solo usuario
  private readonly ADMIN_USERNAME = 'admin';
  private readonly ADMIN_PASSWORD = 'dawn2026'; // Cambiar esto

  constructor(private jwtService: JwtService) { }

  async login(username: string, password: string) {
    if (username !== this.ADMIN_USERNAME || password !== this.ADMIN_PASSWORD) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username, sub: 1 };
    return {
      access_token: this.jwtService.sign(payload),
      username,
    };
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}