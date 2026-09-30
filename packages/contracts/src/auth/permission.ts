export const BwesPermission = {
  RESOURCE_CREATE: "resource:create",
  RESOURCE_EDIT: "resource:edit",
  RESOURCE_CLASSIFY: "resource:classify",
  RESOURCE_SUBMIT_REVIEW: "resource:submit-review",

  REVIEW_PERFORM: "review:perform",
  RESEARCH_EVIDENCE_REVIEW: "review:research-evidence",
  LIVED_EXPERIENCE_REVIEW: "review:lived-experience",
  CONSENT_RECORD_ACCESS: "consent-record:access",

  PUBLICATION_PUBLISH: "publication:publish",
  PUBLICATION_UNPUBLISH: "publication:unpublish",
  RESOURCE_ARCHIVE: "resource:archive",

  REVIEW_ASSIGN: "review:assign",

  USER_MANAGE: "user:manage",
  ROLE_MANAGE: "role:manage",
  PERMISSION_MANAGE: "permission:manage",

  AI_KNOWLEDGE_SOURCE_MANAGE: "ai-knowledge-source:manage",
  RESOURCE_PERMANENT_DELETE: "resource:permanent-delete",

  VOCABULARY_MANAGE: "vocabulary:manage",
  GOVERNANCE_MANAGE: "governance:manage",
} as const;

export type BwesPermission =
  (typeof BwesPermission)[keyof typeof BwesPermission];
