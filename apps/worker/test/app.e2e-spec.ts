import type { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { DatabaseClient } from '@bwes/database';
import { AppModule } from '../src/app.module';
import { PRISMA_CLIENT } from '../src/database/database.provider';
import { assertTestDatabase } from './assert-test-database';

describe('Worker integration', () => {
  let app: INestApplicationContext;
  let database: DatabaseClient;

  beforeAll(async () => {
    assertTestDatabase();

    app = await NestFactory.createApplicationContext(AppModule, {
      logger: false,
    });

    database = app.get<DatabaseClient>(PRISMA_CLIENT);
  });

  afterAll(async () => {
    await app.close();
  });

  it('starts the worker application context', () => {
    expect(app).toBeDefined();
  });

  it('connects to the isolated PostgreSQL test database', async () => {
    const result = await database.$queryRaw<Array<{ database_name: string }>>`
      SELECT current_database() AS database_name
    `;

    expect(result).toEqual([{ database_name: 'bwes_test' }]);
  });
});
