import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  validateUser(username: string, password: string): boolean {
    // Basic hardcoded check
    return username === 'admin' && password === 'admin123';
  }

  generateToken(username: string): string {
    const payload = { username };
    return this.jwtService.sign(payload);
  }
}