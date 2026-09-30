export function assertTestDatabase(): void {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for database-backed tests.');
  }

  const url = new URL(databaseUrl);
  const databaseName = url.pathname.replace(/^\//, '');

  if (databaseName !== 'bwes_test') {
    throw new Error(
      `Refusing to run database-backed tests against "${databaseName}". Expected "bwes_test".`,
    );
  }
}
