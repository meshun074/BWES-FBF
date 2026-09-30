import type { BwesPermissionType, BwesRoleType } from '@bwes/contracts';

export interface AuthenticatedPrincipal {
  userId: string;
  roles: readonly BwesRoleType[];
  permissions: readonly BwesPermissionType[];
}
