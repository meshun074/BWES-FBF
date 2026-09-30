import { Global, Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ApplicationLogger } from './application-logger.service';
import { RequestIdMiddleware } from './middleware/request-id.middleware';

@Global()
@Module({
  providers: [ApplicationLogger],
  exports: [ApplicationLogger],
})
export class ObservabilityModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('{*path}');
  }
}
