import type { DatabaseClient } from '@bwes/database';
import { DatabaseLifecycleService } from './database-lifecycle.service';

describe('DatabaseLifecycleService', () => {
  it('disconnects the shared database client during application shutdown', async () => {
    const disconnect = jest.fn().mockResolvedValue(undefined);

    const database = {
      $disconnect: disconnect,
    } as unknown as DatabaseClient;

    const service = new DatabaseLifecycleService(database);

    await service.onApplicationShutdown();

    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
