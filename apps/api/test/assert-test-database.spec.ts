import { assertTestDatabase } from './assert-test-database';

describe('assertTestDatabase', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  afterEach(() => {
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
  });

  it('accepts the BWES test database', () => {
    process.env.DATABASE_URL =
      'postgresql://bwes:bwes_local_dev@localhost:5432/bwes_test';

    expect(() => assertTestDatabase()).not.toThrow();
  });

  it('rejects the development database', () => {
    process.env.DATABASE_URL =
      'postgresql://bwes:bwes_local_dev@localhost:5432/bwes';

    expect(() => assertTestDatabase()).toThrow(
      'Refusing to run database-backed tests against "bwes". Expected "bwes_test".',
    );
  });

  it('rejects a missing DATABASE_URL', () => {
    delete process.env.DATABASE_URL;

    expect(() => assertTestDatabase()).toThrow(
      'DATABASE_URL is required for database-backed tests.',
    );
  });
});
