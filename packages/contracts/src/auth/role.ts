export const BwesRole = {
  CONTRIBUTOR: "contributor",
  RESEARCH_EVIDENCE_LEAD: "research-evidence-lead",
  PRIVACY_CONSENT_OFFICER: "privacy-consent-officer",
  REVIEWER: "reviewer",
  PUBLISHER: "publisher",
  ADMINISTRATOR: "administrator",
} as const;

export type BwesRole = (typeof BwesRole)[keyof typeof BwesRole];
