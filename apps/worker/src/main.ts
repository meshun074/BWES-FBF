import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApplicationLogger } from './observability/application-logger.service';

const bootstrapLogger = new ApplicationLogger();

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = app.get(ApplicationLogger);

  app.enableShutdownHooks();

  logger.info('BWES background worker started');

  // Temporary Phase 1 lifecycle handle.
  // Remove once pg-boss provides the worker's long-running lifecycle.
  setInterval(() => {
    // Intentionally empty.
  }, 60_000);
}

void bootstrap().catch((error: unknown) => {
  bootstrapLogger.error('BWES background worker failed to start', {
    errorType: error instanceof Error ? error.name : typeof error,
  });
  process.exitCode = 1;
});
