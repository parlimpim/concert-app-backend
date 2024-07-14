import { createMock } from '@golevelup/ts-jest';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { ResponseInterceptor } from './response.interceptor';
import { lastValueFrom, of } from 'rxjs';
import { Response } from 'express';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();
  });

  it('should be defined', () => {
    expect(new ResponseInterceptor()).toBeDefined();
  });

  it('should return correct response format', async () => {
    const data: any = {
      message: 'Login Successful',
      user: { id: '1', name: 'user 01' },
    };

    const context = createMock<ExecutionContext>();
    const handler = createMock<CallHandler>({
      handle: () => of(data),
    });

    const responseObservable = interceptor.intercept(context, handler);
    const response = await lastValueFrom(responseObservable);

    // should have success attribute
    expect(response).toHaveProperty('success');
    expect(response.success).toEqual(true);
  });

  it('should set tokens in cookie if data have tokens', () => {
    const data = {
      message: 'Login Successful',
      user: { id: '1', name: 'user 01' },
      tokens: {
        accessToken: 'access token',
        refreshToken: 'refresh token',
      },
    };

    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({
          cookie: jest.fn(),
        }),
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler: CallHandler = {
      handle: () => of(data),
    };

    const { tokens: _, ...dataWithoutTokens } = data;
    const response = { success: true, ...dataWithoutTokens };

    interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .subscribe((result) => {
        // should return response without tokens
        expect(result).toEqual(response);

        const res: Response = mockExecutionContext.switchToHttp().getResponse();

        // should have tokens in cookie
        expect(res.cookie).toHaveBeenCalledWith(
          'access_token',
          data.tokens.accessToken,
          expect.objectContaining({}),
        );

        expect(res.cookie).toHaveBeenCalledWith(
          'refresh_token',
          data.tokens.refreshToken,
          expect.objectContaining({}),
        );
      });
  });
});
