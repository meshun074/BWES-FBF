import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BwesPermission, BwesRole } from '@bwes/contracts';
import { PermissionGuard } from './permission.guard';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

describe('PermissionGuard', () => {
  let reflector: jest.Mocked<Reflector>;
  let guard: PermissionGuard;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new PermissionGuard(reflector);
  });

  function createContext(
    principal?: AuthenticatedRequest['principal'],
  ): ExecutionContext {
    const request = {
      principal,
    } as AuthenticatedRequest;

    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  it('allows access when no permissions are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('rejects an unauthenticated request when permissions are required', () => {
    reflector.getAllAndOverride.mockReturnValue([
      BwesPermission.REVIEW_PERFORM,
    ]);

    expect(() => guard.canActivate(createContext())).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects an authenticated principal without the required permission', () => {
    reflector.getAllAndOverride.mockReturnValue([
      BwesPermission.REVIEW_PERFORM,
    ]);

    const context = createContext({
      userId: 'user-1',
      roles: [BwesRole.CONTRIBUTOR],
      permissions: [BwesPermission.RESOURCE_CREATE],
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('allows an authenticated principal with the required permission', () => {
    reflector.getAllAndOverride.mockReturnValue([
      BwesPermission.REVIEW_PERFORM,
    ]);

    const context = createContext({
      userId: 'user-1',
      roles: [BwesRole.REVIEWER],
      permissions: [BwesPermission.REVIEW_PERFORM],
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('requires every declared permission', () => {
    reflector.getAllAndOverride.mockReturnValue([
      BwesPermission.RESOURCE_EDIT,
      BwesPermission.RESOURCE_SUBMIT_REVIEW,
    ]);

    const context = createContext({
      userId: 'user-1',
      roles: [BwesRole.CONTRIBUTOR],
      permissions: [BwesPermission.RESOURCE_EDIT],
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
