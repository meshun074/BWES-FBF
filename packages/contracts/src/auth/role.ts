export const BwesRole = {
  STAFF: "staff",
  REVIEWER: "reviewer",
  PUBLISHER: "publisher",
  ADMINISTRATOR: "administrator",
} as const;

export type BwesRole = (typeof BwesRole)[keyof typeof BwesRole];
