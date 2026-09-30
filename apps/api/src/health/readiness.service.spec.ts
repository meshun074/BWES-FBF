import type { DatabaseClient } from '@bwes/database';
import { ReadinessService } from './readiness.service';

describe('ReadinessService', () => {
  let queryRaw: jest.Mock;
  let service: ReadinessService;

  beforeEach(() => {
    queryRaw = jest.fn();

    const database = {
      $queryRaw: queryRaw,
    } as unknown as DatabaseClient;

    service = new ReadinessService(database);
  });

  it('reports ready when the database query succeeds', async () => {
    queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    await expect(service.isReady()).resolves.toBe(true);
  });

  it('reports not ready when the database query fails', async () => {
    queryRaw.mockRejectedValue(new Error('Database unavailable'));

    await expect(service.isReady()).resolves.toBe(false);
  });
});
