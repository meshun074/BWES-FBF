import type { ResolvedIdentity } from './resolved-identity.interface';

export const IDENTITY_RESOLVER = Symbol('IDENTITY_RESOLVER');

export interface IdentityResolver {
  resolve(accessToken: string): Promise<ResolvedIdentity | null>;
}
