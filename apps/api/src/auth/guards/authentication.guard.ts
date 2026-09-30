import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import {
  IDENTITY_RESOLVER,
  type IdentityResolver,
} from '../interfaces/identity-resolver.interface';
import { resolvePermissionsForRoles } from '@bwes/contracts';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    @Inject(IDENTITY_RESOLVER)
    private readonly identityResolver: IdentityResolver,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('Authentication is required');
    }

    const [scheme, token, ...extraParts] = authorization.trim().split(/\s+/);

    if (scheme?.toLowerCase() !== 'bearer' || !token || extraParts.length > 0) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    const identity = await this.identityResolver.resolve(token);

    if (!identity) {
      throw new UnauthorizedException('Invalid or expired credentials');
    }

    request.principal = {
      userId: identity.userId,
      roles: identity.roles,
      permissions: resolvePermissionsForRoles(identity.roles),
    };

    return true;
  }
}
