import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import type { DatabaseClient } from '@bwes/database';
import { PRISMA_CLIENT } from './database.provider';

@Injectable()
export class DatabaseLifecycleService implements OnApplicationShutdown {
  constructor(
    @Inject(PRISMA_CLIENT)
    private readonly database: DatabaseClient,
  ) {}

  async onApplicationShutdown(): Promise<void> {
    await this.database.$disconnect();
  }
}
