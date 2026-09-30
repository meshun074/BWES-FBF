import { Inject, Injectable } from '@nestjs/common';
import type { DatabaseClient } from '@bwes/database';
import { PRISMA_CLIENT } from '../database/database.provider';

@Injectable()
export class ReadinessService {
  constructor(
    @Inject(PRISMA_CLIENT)
    private readonly database: DatabaseClient,
  ) {}

  async isReady(): Promise<boolean> {
    try {
      await this.database.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
