import type { Request } from 'express';
import type { AuthenticatedPrincipal } from './authenticated-principal.interface';

export interface AuthenticatedRequest extends Request {
  principal?: AuthenticatedPrincipal;
}
