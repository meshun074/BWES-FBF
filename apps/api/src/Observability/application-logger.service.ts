import { Injectable, Logger } from '@nestjs/common';

export interface LogContext {
  [key: string]: unknown;
}

@Injectable()
export class ApplicationLogger {
  private readonly logger = new Logger('BWES');

  info(message: string, context?: LogContext): void {
    this.logger.log(this.format(message, context));
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(this.format(message, context));
  }

  error(message: string, context?: LogContext): void {
    this.logger.error(this.format(message, context));
  }

  private format(message: string, context?: LogContext): string {
    if (!context || Object.keys(context).length === 0) {
      return message;
    }

    return `${message} ${JSON.stringify(context)}`;
  }
}
