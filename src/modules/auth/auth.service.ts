import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { Role } from 'src/enums/role.enum';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokensService } from '../refresh-tokens/refresh-tokens.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private refreshTokensService: RefreshTokensService,
  ) {}

  async validateUser(email: string, password: string) {
    const user: User = await this.usersService.findOne({ email });
    const isPasswordMatches = await bcrypt.compare(password, user.password);
    if (user && isPasswordMatches) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const { id, email, name, role } = user;

    // generate tokens
    const tokens = await this.generateTokens(id, email, role, true);

    // hash refresh token
    const tokenHash = await bcrypt.hash(tokens.refreshToken, 10);

    // store refresh token in db
    await this.refreshTokensService.update(id, tokenHash);

    return { user: { id, name, email, role }, tokens };
  }

  async logout(userId: string) {
    // clear refresh token in db
    await this.refreshTokensService.update(userId, null);
  }

  async generateTokens(
    userId: string,
    email: string,
    role: Role,
    needRefreshToken?: boolean,
  ) {
    const payload = { email, sub: userId, role };
    const JWT_SECRET = this.configService.get<string>('JWT_SECRET');

    const promise = [
      this.jwtService.signAsync(payload, {
        secret: JWT_SECRET,
        expiresIn: '15m',
      }),
    ];

    if (needRefreshToken) {
      promise.push(
        this.jwtService.signAsync(payload, {
          secret: JWT_SECRET,
          expiresIn: '7d',
        }),
      );
    }
    const [accessToken, refreshToken] = await Promise.all(promise);

    return {
      accessToken,
      refreshToken,
    };
  }
}
