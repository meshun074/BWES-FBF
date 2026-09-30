import type { DatabaseClient } from '@bwes/database';
import { AuditService } from './audit.service';

describe('AuditService', () => {
  const createAuditEvent = jest.fn();

  const database = {
    auditEvent: {
      create: createAuditEvent,
    },
  } as unknown as DatabaseClient;

  let service: AuditService;

  beforeEach(() => {
    jest.clearAllMocks();
    createAuditEvent.mockResolvedValue({});
    service = new AuditService(database);
  });

  it('records an audit event', async () => {
    await service.record({
      actorId: 'user-1',
      action: 'resource.publish',
      entityType: 'resource',
      entityId: 'resource-1',
      requestId: 'b7828ca3-858f-4d01-98c7-ab8a0d0cbfbb',
      metadata: {
        previousStatus: 'approved',
        newStatus: 'published',
      },
    });

    expect(createAuditEvent).toHaveBeenCalledTimes(1);

    expect(createAuditEvent).toHaveBeenCalledWith({
      data: {
        actorId: 'user-1',
        action: 'resource.publish',
        entityType: 'resource',
        entityId: 'resource-1',
        requestId: 'b7828ca3-858f-4d01-98c7-ab8a0d0cbfbb',
        metadata: {
          previousStatus: 'approved',
          newStatus: 'published',
        },
      },
    });
  });

  it('supports system events without an actor or request', async () => {
    await service.record({
      action: 'resource.auto_archive',
      entityType: 'resource',
      entityId: 'resource-1',
    });

    expect(createAuditEvent).toHaveBeenCalledWith({
      data: {
        actorId: undefined,
        action: 'resource.auto_archive',
        entityType: 'resource',
        entityId: 'resource-1',
        requestId: undefined,
        metadata: undefined,
      },
    });
  });
});
