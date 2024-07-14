import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { CookieOptions, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class ClearTokensInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(() => {
        const ctx = context.switchToHttp();
        const response: Response = ctx.getResponse();
        const options: CookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        };

        // clear access_token
        response.clearCookie('access_token', options);

        // clear refresh_token
        response.clearCookie('refresh_token', options);
      }),
    );
  }
}
