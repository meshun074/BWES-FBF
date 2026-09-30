import type { BwesPermission } from "./permission";
import { BWES_ROLE_PERMISSIONS } from "./role-permissions";
import type { BwesRole } from "./role";

export function resolvePermissionsForRoles(
  roles: readonly BwesRole[],
): BwesPermission[] {
  const permissions = new Set<BwesPermission>();

  for (const role of roles) {
    for (const permission of BWES_ROLE_PERMISSIONS[role]) {
      permissions.add(permission);
    }
  }

  return [...permissions];
}
