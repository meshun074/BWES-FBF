import { Global, Module } from '@nestjs/common';
import { databaseProvider } from './database.provider';
import { DatabaseLifecycleService } from './database-lifecycle.service';

@Global()
@Module({
  providers: [databaseProvider, DatabaseLifecycleService],
  exports: [databaseProvider],
})
export class DatabaseModule {}
