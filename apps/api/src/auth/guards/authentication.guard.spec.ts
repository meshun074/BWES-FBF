import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { BwesPermission, BwesRole } from '@bwes/contracts';
import { AuthenticationGuard } from './authentication.guard';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import type { IdentityResolver } from '../interfaces/identity-resolver.interface';

describe('AuthenticationGuard', () => {
  let resolveIdentity: jest.MockedFunction<IdentityResolver['resolve']>;
  let identityResolver: IdentityResolver;
  let guard: AuthenticationGuard;

  beforeEach(() => {
    resolveIdentity = jest.fn();

    identityResolver = {
      resolve: resolveIdentity,
    };

    guard = new AuthenticationGuard(identityResolver);
  });

  function createContext(authorization?: string): {
    context: ExecutionContext;
    request: AuthenticatedRequest;
  } {
    const request = {
      headers: authorization ? { authorization } : {},
    } as AuthenticatedRequest;

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;

    return { context, request };
  }

  it('rejects a request without an authorization header', async () => {
    const { context } = createContext();

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    expect(resolveIdentity).not.toHaveBeenCalled();
  });

  it('rejects a malformed authorization header', async () => {
    const { context } = createContext('Basic credentials');

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    expect(resolveIdentity).not.toHaveBeenCalled();
  });

  it('rejects a bearer header without a token', async () => {
    const { context } = createContext('Bearer');

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    expect(resolveIdentity).not.toHaveBeenCalled();
  });

  it('rejects credentials that cannot be resolved', async () => {
    resolveIdentity.mockResolvedValue(null);

    const { context } = createContext('Bearer invalid-token');

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    expect(resolveIdentity).toHaveBeenCalledWith('invalid-token');
  });

  it('attaches the resolved principal to the request', async () => {
    const identity = {
      userId: 'user-1',
      roles: [BwesRole.REVIEWER],
    } as const;

    resolveIdentity.mockResolvedValue(identity);

    const { context, request } = createContext('Bearer valid-token');

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(resolveIdentity).toHaveBeenCalledWith('valid-token');

    expect(request.principal).toEqual({
      userId: 'user-1',
      roles: [BwesRole.REVIEWER],
      permissions: [BwesPermission.REVIEW_PERFORM],
    });
  });

  it('accepts the bearer scheme case-insensitively', async () => {
    resolveIdentity.mockResolvedValue({
      userId: 'user-1',
      roles: [BwesRole.CONTRIBUTOR],
    });

    const { context } = createContext('bearer valid-token');

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('rejects unexpected extra authorization components', async () => {
    const { context } = createContext('Bearer token unexpected');

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    expect(resolveIdentity).not.toHaveBeenCalled();
  });

  it('derives the combined permissions for multiple trusted roles', async () => {
    resolveIdentity.mockResolvedValue({
      userId: 'user-1',
      roles: [BwesRole.CONTRIBUTOR, BwesRole.REVIEWER],
    });

    const { context, request } = createContext('Bearer valid-token');

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(request.principal?.permissions).toEqual([
      BwesPermission.RESOURCE_CREATE,
      BwesPermission.RESOURCE_EDIT,
      BwesPermission.RESOURCE_CLASSIFY,
      BwesPermission.RESOURCE_SUBMIT_REVIEW,
      BwesPermission.REVIEW_PERFORM,
    ]);
  });
});
