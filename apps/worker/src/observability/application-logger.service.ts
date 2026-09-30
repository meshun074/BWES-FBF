import { Injectable, Logger } from '@nestjs/common';
import {
  type LogContext,
  type LogLevel,
  serializeStructuredLogEntry,
} from '@bwes/observability';

@Injectable()
export class ApplicationLogger {
  private readonly logger = new Logger('Worker');
  private readonly application = 'bwes-worker';

  info(message: string, context?: LogContext): void {
    this.logger.log(this.format('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(this.format('warn', message, context));
  }

  error(message: string, context?: LogContext): void {
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
