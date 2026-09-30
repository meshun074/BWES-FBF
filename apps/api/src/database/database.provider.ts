import { ConfigService } from '@nestjs/config';
import { createPrismaClient } from '@bwes/database';

export const PRISMA_CLIENT = Symbol('PRISMA_CLIENT');

export const databaseProvider = {
  provide: PRISMA_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const databaseUrl = configService.getOrThrow<string>('DATABASE_URL');

    return createPrismaClient({
      databaseUrl,
    });
  },
};
