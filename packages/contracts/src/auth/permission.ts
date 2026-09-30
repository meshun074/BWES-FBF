export const BwesPermission = {
  RESOURCE_CREATE: "resource:create",
  RESOURCE_EDIT: "resource:edit",
  RESOURCE_CLASSIFY: "resource:classify",
  RESOURCE_SUBMIT_REVIEW: "resource:submit-review",

  REVIEW_PERFORM: "review:perform",

  PUBLICATION_PUBLISH: "publication:publish",

  REVIEW_ASSIGN: "review:assign",

  USER_MANAGE: "user:manage",
  ROLE_MANAGE: "role:manage",
  PERMISSION_MANAGE: "permission:manage",

  VOCABULARY_MANAGE: "vocabulary:manage",
  GOVERNANCE_MANAGE: "governance:manage",
} as const;

export type BwesPermission =
  (typeof BwesPermission)[keyof typeof BwesPermission];
