import {
  cleanTestDatabase,
  disconnectTestDatabase,
  getTestDatabase,
} from './test-database';

describe('Database integration', () => {
  const database = getTestDatabase();

  beforeEach(async () => {
    await cleanTestDatabase();
  });

  afterAll(async () => {
    await cleanTestDatabase();
    await disconnectTestDatabase();
  });

  it('persists and retrieves an audit event using PostgreSQL', async () => {
    const created = await database.auditEvent.create({
      data: {
        actorId: 'integration-test-user',
        action: 'integration.test',
        entityType: 'test-entity',
        entityId: 'entity-1',
        metadata: {
          source: 'database-integration-test',
        },
      },
    });

    const persisted = await database.auditEvent.findUnique({
      where: {
        id: created.id,
      },
    });

    expect(persisted).not.toBeNull();
    expect(persisted?.id).toBe(created.id);
    expect(persisted?.actorId).toBe('integration-test-user');
    expect(persisted?.action).toBe('integration.test');
    expect(persisted?.entityType).toBe('test-entity');
    expect(persisted?.entityId).toBe('entity-1');
    expect(persisted?.metadata).toEqual({
      source: 'database-integration-test',
    });
  });

  it('starts each test with a clean database', async () => {
    const count = await database.auditEvent.count();

    expect(count).toBe(0);
  });
});
