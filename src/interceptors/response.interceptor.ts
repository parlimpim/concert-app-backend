import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: any = {}) => {
        const { tokens, ...res } = data;

        // Set the tokens in cookie
        if (tokens) {
          const ctx = context.switchToHttp();
          const response: Response = ctx.getResponse();
          const { accessToken, refreshToken } = tokens;

          if (accessToken) {
            response.cookie('access_token', accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite:
                process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            });
          }

          if (refreshToken) {
            response.cookie('refresh_token', refreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite:
                process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            });
          }
        }

        const result = {
          success: true,
          ...res,
        };

        return result;
      }),
    );
  }
}
