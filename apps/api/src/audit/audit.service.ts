import { Inject, Injectable } from '@nestjs/common';
import { PRISMA_CLIENT } from '../database/database.provider';
import type { DatabaseClient } from '@bwes/database';
import type { RecordAuditEventInput } from './interfaces/record-audit-event.interface';

@Injectable()
export class AuditService {
  constructor(
    @Inject(PRISMA_CLIENT)
    private readonly database: DatabaseClient,
  ) {}

  async record(input: RecordAuditEventInput): Promise<void> {
    await this.database.auditEvent.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        requestId: input.requestId,
        metadata: input.metadata,
      },
    });
  }
}
