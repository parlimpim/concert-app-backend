import { CallHandler, ExecutionContext } from '@nestjs/common';
import { ClearTokensInterceptor } from './clear-tokens.interceptor';
import { of } from 'rxjs';
import { Response } from 'express';

describe('ClearTokensInterceptor', () => {
  let interceptor: ClearTokensInterceptor;

  beforeEach(() => {
    interceptor = new ClearTokensInterceptor();
  });

  it('should be defined', () => {
    expect(new ClearTokensInterceptor()).toBeDefined();
  });

  it('response should not have tokens in cookie', () => {
    const clearCookie = jest.fn();
    const response = {
      clearCookie,
    } as unknown as Response;

    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(response),
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler: CallHandler = {
      handle: () => of({}),
    };

    interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .subscribe(() => {
        // should clear tokens in cookie
        expect(clearCookie).toHaveBeenCalledWith(
          'access_token',
          expect.objectContaining({}),
        );
        expect(clearCookie).toHaveBeenCalledWith(
          'refresh_token',
          expect.objectContaining({}),
        );
      });
  });
});
