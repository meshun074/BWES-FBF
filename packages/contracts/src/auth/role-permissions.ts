import { BwesPermission } from "./permission";
import { BwesRole } from "./role";

export const BWES_ROLE_PERMISSIONS = {
  [BwesRole.CONTRIBUTOR]: [
    BwesPermission.RESOURCE_CREATE,
    BwesPermission.RESOURCE_EDIT,
    BwesPermission.RESOURCE_CLASSIFY,
    BwesPermission.RESOURCE_SUBMIT_REVIEW,
  ],

  [BwesRole.REVIEWER]: [BwesPermission.REVIEW_PERFORM],

  [BwesRole.RESEARCH_EVIDENCE_LEAD]: [
    BwesPermission.REVIEW_PERFORM,
    BwesPermission.RESEARCH_EVIDENCE_REVIEW,
  ],

  [BwesRole.PRIVACY_CONSENT_OFFICER]: [
    BwesPermission.REVIEW_PERFORM,
    BwesPermission.LIVED_EXPERIENCE_REVIEW,
    BwesPermission.CONSENT_RECORD_ACCESS,
  ],

  [BwesRole.PUBLISHER]: [
    BwesPermission.PUBLICATION_PUBLISH,
    BwesPermission.PUBLICATION_UNPUBLISH,
    BwesPermission.RESOURCE_ARCHIVE,
  ],

  [BwesRole.ADMINISTRATOR]: [
    BwesPermission.REVIEW_ASSIGN,
    BwesPermission.USER_MANAGE,
    BwesPermission.ROLE_MANAGE,
    BwesPermission.PERMISSION_MANAGE,
    BwesPermission.AI_KNOWLEDGE_SOURCE_MANAGE,
    BwesPermission.RESOURCE_PERMANENT_DELETE,
    BwesPermission.VOCABULARY_MANAGE,
    BwesPermission.GOVERNANCE_MANAGE,
  ],
} satisfies Record<BwesRole, readonly BwesPermission[]>;
