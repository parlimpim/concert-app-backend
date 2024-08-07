import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, username: string, password: string) {
    const user = await this.authService.validateUser(username, password);
    const isAdmin = req.body['isAdmin'];
    if (!user) {
      throw new UnauthorizedException();
    }
    return { user, isAdmin };
  }
}
