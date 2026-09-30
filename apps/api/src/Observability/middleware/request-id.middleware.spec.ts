import type { NextFunction, Response } from 'express';
import { RequestIdMiddleware } from './request-id.middleware';
import type { RequestWithContext } from '../interfaces/request-with-context.interface';
import { REQUEST_ID_HEADER } from '../request-context.constants';

describe('RequestIdMiddleware', () => {
  let middleware: RequestIdMiddleware;

  beforeEach(() => {
    middleware = new RequestIdMiddleware();
  });

  it('generates and attaches a request ID', () => {
    const request = {} as RequestWithContext;

    const setHeader = jest.fn();
    const response = {
      setHeader,
    } as unknown as Response;

    const next = jest.fn() as NextFunction;

    middleware.use(request, response, next);

    expect(request.requestId).toEqual(expect.any(String));
    expect(request.requestId).toHaveLength(36);

    expect(setHeader).toHaveBeenCalledWith(
      REQUEST_ID_HEADER,
      request.requestId,
    );

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('does not trust an incoming request ID', () => {
    const request = {
      headers: {
        [REQUEST_ID_HEADER]: 'caller-controlled-id',
      },
    } as unknown as RequestWithContext;

    const setHeader = jest.fn();
    const response = {
      setHeader,
    } as unknown as Response;

    const next = jest.fn() as NextFunction;

    middleware.use(request, response, next);

    expect(request.requestId).not.toBe('caller-controlled-id');

    expect(setHeader).toHaveBeenCalledWith(
      REQUEST_ID_HEADER,
      request.requestId,
    );

    expect(next).toHaveBeenCalledTimes(1);
  });
});
