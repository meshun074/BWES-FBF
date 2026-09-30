import { assertTestDatabase } from './assert-test-database';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  'postgresql://bwes:bwes_local_dev@localhost:5432/bwes_test';

assertTestDatabase();
