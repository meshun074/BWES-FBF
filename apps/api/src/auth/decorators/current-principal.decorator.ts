import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedPrincipal } from '../interfaces/authenticated-principal.interface';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

export const CurrentPrincipal = createParamDecorator(
  (
    _data: unknown,
    context: ExecutionContext,
  ): AuthenticatedPrincipal | undefined => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    return request.principal;
  },
);
