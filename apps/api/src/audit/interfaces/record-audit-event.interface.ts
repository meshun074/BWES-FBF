import type { DatabaseJsonInput } from '@bwes/database';

export interface RecordAuditEventInput {
  actorId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  requestId?: string;
  metadata?: DatabaseJsonInput;
}
