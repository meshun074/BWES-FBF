import { Logger } from '@nestjs/common';
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
    logger = new ApplicationLogger();
    jest.restoreAllMocks();
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
