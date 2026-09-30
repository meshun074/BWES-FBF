import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('Worker');

  app.enableShutdownHooks();

  logger.log('BWES background worker started');

  // Temporary Phase 1 lifecycle handle.
  // Remove once pg-boss provides the worker's long-running lifecycle.
  setInterval(() => {
    // Intentionally empty.
  }, 60_000);
}

void bootstrap();
