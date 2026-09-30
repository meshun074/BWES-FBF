import { SetMetadata } from '@nestjs/common';
import type { BwesPermissionType } from '@bwes/contracts';

export const REQUIRED_PERMISSIONS_KEY = 'bwes:required-permissions';

export const RequirePermissions = (
  ...permissions: BwesPermissionType[]
): MethodDecorator & ClassDecorator =>
  SetMetadata(REQUIRED_PERMISSIONS_KEY, permissions);
