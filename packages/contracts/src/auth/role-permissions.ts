import { BwesPermission } from "./permission";
import { BwesRole } from "./role";

export const BWES_ROLE_PERMISSIONS = {
  [BwesRole.STAFF]: [
    BwesPermission.RESOURCE_CREATE,
    BwesPermission.RESOURCE_EDIT,
    BwesPermission.RESOURCE_CLASSIFY,
    BwesPermission.RESOURCE_SUBMIT_REVIEW,
  ],

  [BwesRole.REVIEWER]: [BwesPermission.REVIEW_PERFORM],

  [BwesRole.PUBLISHER]: [BwesPermission.PUBLICATION_PUBLISH],

  [BwesRole.ADMINISTRATOR]: [
    BwesPermission.REVIEW_ASSIGN,
    BwesPermission.USER_MANAGE,
    BwesPermission.ROLE_MANAGE,
    BwesPermission.PERMISSION_MANAGE,
    BwesPermission.VOCABULARY_MANAGE,
    BwesPermission.GOVERNANCE_MANAGE,
  ],
} satisfies Record<BwesRole, readonly BwesPermission[]>;
