import { createPrismaClient, type DatabaseClient } from '@bwes/database';
import { assertTestDatabase } from './assert-test-database';

let testDatabaseClient: DatabaseClient | undefined;

export function getTestDatabase(): DatabaseClient {
  assertTestDatabase();

  if (testDatabaseClient) {
    return testDatabaseClient;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for database-backed tests.');
  }

  testDatabaseClient = createPrismaClient({
    databaseUrl,
  });

  return testDatabaseClient;
}

export async function cleanTestDatabase(): Promise<void> {
  assertTestDatabase();

  const database = getTestDatabase();

  await database.auditEvent.deleteMany();
}

export async function disconnectTestDatabase(): Promise<void> {
  if (!testDatabaseClient) {
    return;
  }

  await testDatabaseClient.$disconnect();
  testDatabaseClient = undefined;
}
