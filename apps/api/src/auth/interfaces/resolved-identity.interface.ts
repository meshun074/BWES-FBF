import type { BwesRoleType } from '@bwes/contracts';

export interface ResolvedIdentity {
  userId: string;
  roles: readonly BwesRoleType[];
}
