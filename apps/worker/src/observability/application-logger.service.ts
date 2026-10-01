import { Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  type LogContext,
  type LogLevel,
  resolveLogLevel,
  serializeStructuredLogEntry,
  shouldLog,
} from '@bwes/observability';

@Injectable()
export class ApplicationLogger {
  private readonly logger = new Logger('Worker');
  private readonly application = 'bwes-worker';
  private readonly minimumLevel: LogLevel;

  constructor(@Optional() configService?: ConfigService) {
    this.minimumLevel = resolveLogLevel(
      configService?.get<string>('LOG_LEVEL') ?? process.env.LOG_LEVEL,
    );
  }

  info(message: string, context?: LogContext): void {
    if (!shouldLog('info', this.minimumLevel)) {
      return;
    }

    this.logger.log(this.format('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    if (!shouldLog('warn', this.minimumLevel)) {
      return;
    }

    this.logger.warn(this.format('warn', message, context));
  }

  error(message: string, context?: LogContext): void {
    if (!shouldLog('error', this.minimumLevel)) {
      return;
    }

    this.logger.error(this.format('error', message, context));
  }

  private format(
    level: LogLevel,
    message: string,
    context?: LogContext,
  ): string {
    return serializeStructuredLogEntry(
      level,
      message,
      this.application,
      context,
    );
  }
}
