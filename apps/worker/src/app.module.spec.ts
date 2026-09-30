process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  'postgresql://bwes:bwes_local_dev@localhost:5432/bwes_test';

import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';

describe('AppModule', () => {
  it('should compile the worker application module', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(moduleRef).toBeDefined();

    await moduleRef.close();
  });
});
