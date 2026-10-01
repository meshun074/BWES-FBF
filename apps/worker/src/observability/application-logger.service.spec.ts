import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REDACTED_VALUE } from '@bwes/observability';
import { ApplicationLogger } from './application-logger.service';

interface LoggedEntry {
  level: string;
  message: string;
  timestamp: string;
  application: string;
  context?: Record<string, unknown>;
}

function parseLoggedEntry(spy: { mock: { calls: unknown[][] } }): LoggedEntry {
  const serializedEntry = spy.mock.calls[0]?.[0];

  expect(typeof serializedEntry).toBe('string');

  return JSON.parse(serializedEntry as string) as LoggedEntry;
}

describe('Worker ApplicationLogger', () => {
  let logger: ApplicationLogger;

  beforeEach(() => {
    jest.restoreAllMocks();
    logger = new ApplicationLogger(new ConfigService({ LOG_LEVEL: 'info' }));
  });

  it('emits info, warn, and error at the info threshold', () => {
    const infoSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    logger.info('Info message');
    logger.warn('Warn message');
    logger.error('Error message');

    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  it('emits warn and error only at the warn threshold', () => {
    logger = new ApplicationLogger(new ConfigService({ LOG_LEVEL: 'warn' }));
    const infoSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    logger.info('Info message');
    logger.warn('Warn message');
    logger.error('Error message');

    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  it('emits error only at the error threshold', () => {
    logger = new ApplicationLogger(new ConfigService({ LOG_LEVEL: 'error' }));
    const infoSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    logger.info('Info message');
    logger.warn('Warn message');
    logger.error('Error message');

    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  it('uses the environment threshold before Nest dependency injection exists', () => {
    const originalLogLevel = process.env.LOG_LEVEL;
    process.env.LOG_LEVEL = 'error';

    try {
      const bootstrapLogger = new ApplicationLogger();
      const infoSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
      const errorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();

      bootstrapLogger.info('Bootstrap info');
      bootstrapLogger.error('Bootstrap failure');

      expect(infoSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledTimes(1);
    } finally {
      if (originalLogLevel === undefined) {
        delete process.env.LOG_LEVEL;
      } else {
        process.env.LOG_LEVEL = originalLogLevel;
      }
    }
  });

  it('writes structured startup logs with worker application context', () => {
    const spy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    logger.info('BWES background worker started');

    const entry = parseLoggedEntry(spy);

    expect(Number.isNaN(Date.parse(entry.timestamp))).toBe(false);
    expect(entry).toEqual({
      level: 'info',
      message: 'BWES background worker started',
      timestamp: entry.timestamp,
      application: 'bwes-worker',
    });
  });

  it('redacts nested sensitive context from worker error logs', () => {
    const spy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    logger.error('Job failed', {
      jobId: 'job-1',
      credentials: {
        S3_SECRET_KEY: 'fake-s3-secret-key',
      },
      attempts: [{ refreshToken: 'fake-refresh-token' }],
    });

    const entry = parseLoggedEntry(spy);

    expect(Number.isNaN(Date.parse(entry.timestamp))).toBe(false);
    expect(entry).toEqual({
      level: 'error',
      message: 'Job failed',
      timestamp: entry.timestamp,
      application: 'bwes-worker',
      context: {
        jobId: 'job-1',
        credentials: {
          S3_SECRET_KEY: REDACTED_VALUE,
        },
        attempts: [{ refreshToken: REDACTED_VALUE }],
      },
    });
  });
});
