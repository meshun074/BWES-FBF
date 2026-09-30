import { Logger } from '@nestjs/common';
import { REDACTED_VALUE, redactSensitiveData } from '@bwes/observability';
import { ApplicationLogger } from './application-logger.service';

interface LoggedEntry {
  level: string;
  message: string;
  timestamp: string;
  application: string;
  requestId?: string;
  context?: Record<string, unknown>;
}

function parseLoggedEntry(spy: { mock: { calls: unknown[][] } }): LoggedEntry {
  const serializedEntry = spy.mock.calls[0]?.[0];

  expect(typeof serializedEntry).toBe('string');

  return JSON.parse(serializedEntry as string) as LoggedEntry;
}

describe('ApplicationLogger', () => {
  let logger: ApplicationLogger;

  beforeEach(() => {
    logger = new ApplicationLogger();
    jest.restoreAllMocks();
  });

  it('logs a consistent structured entry without context', () => {
    const spy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    logger.info('Application started');

    const entry = parseLoggedEntry(spy);

    expect(Number.isNaN(Date.parse(entry.timestamp))).toBe(false);
    expect(entry).toEqual({
      level: 'info',
      message: 'Application started',
      timestamp: entry.timestamp,
      application: 'bwes-api',
    });
  });

  it('preserves normal structured context', () => {
    const spy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    logger.info('Resource processed', {
      resourceId: 'resource-1',
      operation: 'process',
      count: 2,
      active: true,
    });

    expect(parseLoggedEntry(spy).context).toEqual({
      resourceId: 'resource-1',
      operation: 'process',
      count: 2,
      active: true,
    });
  });

  it('redacts credential, authorization, token, cookie, and secret fields', () => {
    const spy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    logger.info('Sensitive context', {
      password: 'fake-password',
      passwd: 'fake-passwd',
      authorization: 'Bearer fake-access-token',
      cookie: 'fake-session-cookie',
      'set-cookie': 'fake-response-cookie',
      token: 'fake-token',
      accessToken: 'fake-access-token',
      refreshToken: 'fake-refresh-token',
      apiKey: 'fake-api-key',
      secret: 'fake-secret',
      clientSecret: 'fake-client-secret',
      databaseUrl: 'postgresql://fake-user:fake-password@localhost/fake-db',
      DATABASE_URL: 'postgresql://fake-user:fake-password@localhost/fake-db',
      S3_ACCESS_KEY: 'fake-s3-access-key',
      S3_SECRET_KEY: 'fake-s3-secret-key',
      DIRECTUS_SECRET: 'fake-directus-secret',
      DIRECTUS_ADMIN_PASSWORD: 'fake-directus-password',
      resourceId: 'resource-1',
    });

    expect(parseLoggedEntry(spy).context).toEqual({
      password: REDACTED_VALUE,
      passwd: REDACTED_VALUE,
      authorization: REDACTED_VALUE,
      cookie: REDACTED_VALUE,
      'set-cookie': REDACTED_VALUE,
      token: REDACTED_VALUE,
      accessToken: REDACTED_VALUE,
      refreshToken: REDACTED_VALUE,
      apiKey: REDACTED_VALUE,
      secret: REDACTED_VALUE,
      clientSecret: REDACTED_VALUE,
      databaseUrl: REDACTED_VALUE,
      DATABASE_URL: REDACTED_VALUE,
      S3_ACCESS_KEY: REDACTED_VALUE,
      S3_SECRET_KEY: REDACTED_VALUE,
      DIRECTUS_SECRET: REDACTED_VALUE,
      DIRECTUS_ADMIN_PASSWORD: REDACTED_VALUE,
      resourceId: 'resource-1',
    });
  });

  it('matches sensitive field names case-insensitively', () => {
    const spy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    logger.info('Mixed-case sensitive context', {
      PaSsWoRd: 'fake-password',
      AUTHORIZATION: 'Bearer fake-token',
      AccessTOKEN: 'fake-token',
      CoOkIe: 'fake-cookie',
      DatabaseUrl: 'postgresql://fake-url',
      s3_AcCeSs_KeY: 'fake-access-key',
      directus_Admin_Password: 'fake-password',
      status: 'safe',
    });

    expect(parseLoggedEntry(spy).context).toEqual({
      PaSsWoRd: REDACTED_VALUE,
      AUTHORIZATION: REDACTED_VALUE,
      AccessTOKEN: REDACTED_VALUE,
      CoOkIe: REDACTED_VALUE,
      DatabaseUrl: REDACTED_VALUE,
      s3_AcCeSs_KeY: REDACTED_VALUE,
      directus_Admin_Password: REDACTED_VALUE,
      status: 'safe',
    });
  });

  it('redacts nested sensitive fields, including fields inside arrays', () => {
    const spy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    logger.info('Nested context', {
      job: {
        id: 'job-1',
        credentials: {
          password: 'fake-password',
          username: 'safe-user',
        },
      },
      attempts: [
        { token: 'fake-token', status: 'failed' },
        { headers: { authorization: 'Bearer fake-token' }, status: 'queued' },
      ],
    });

    expect(parseLoggedEntry(spy).context).toEqual({
      job: {
        id: 'job-1',
        credentials: {
          password: REDACTED_VALUE,
          username: 'safe-user',
        },
      },
      attempts: [
        { token: REDACTED_VALUE, status: 'failed' },
        { headers: { authorization: REDACTED_VALUE }, status: 'queued' },
      ],
    });
  });

  it('does not mutate the original context', () => {
    const spy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const context = {
      account: {
        password: 'fake-password',
        roles: ['editor', { token: 'fake-token' }],
      },
    };

    logger.info('Immutable context', context);

    expect(context).toEqual({
      account: {
        password: 'fake-password',
        roles: ['editor', { token: 'fake-token' }],
      },
    });
    expect(parseLoggedEntry(spy).context).toEqual({
      account: {
        password: REDACTED_VALUE,
        roles: ['editor', { token: REDACTED_VALUE }],
      },
    });
  });

  it('promotes a supplied request ID while preserving other context', () => {
    const spy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    logger.info('Request handled', {
      requestId: 'generated-request-id',
      route: '/api/v1/resources',
    });

    const entry = parseLoggedEntry(spy);

    expect(Number.isNaN(Date.parse(entry.timestamp))).toBe(false);
    expect(entry).toEqual({
      level: 'info',
      message: 'Request handled',
      timestamp: entry.timestamp,
      application: 'bwes-api',
      requestId: 'generated-request-id',
      context: {
        route: '/api/v1/resources',
      },
    });
  });

  it('supports warning logging', () => {
    const spy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

    logger.warn('Resource approaching expiry');

    expect(parseLoggedEntry(spy).level).toBe('warn');
  });

  it('supports error logging with redacted context', () => {
    const spy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    logger.error('Operation failed', {
      operation: 'publish',
      clientSecret: 'fake-client-secret',
    });

    const entry = parseLoggedEntry(spy);

    expect(Number.isNaN(Date.parse(entry.timestamp))).toBe(false);
    expect(entry).toEqual({
      level: 'error',
      message: 'Operation failed',
      timestamp: entry.timestamp,
      application: 'bwes-api',
      context: {
        operation: 'publish',
        clientSecret: REDACTED_VALUE,
      },
    });
  });

  it('safely serializes null, undefined, primitives, and circular values', () => {
    const spy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const circular: Record<string, unknown> = { status: 'safe' };
    circular.self = circular;

    logger.info('Serialization safety', {
      nullValue: null,
      undefinedValue: undefined,
      numericValue: 7,
      bigintValue: BigInt(8),
      circular,
    });

    expect(parseLoggedEntry(spy).context).toEqual({
      nullValue: null,
      numericValue: 7,
      bigintValue: '8',
      circular: {
        status: 'safe',
        self: '[Circular]',
      },
    });
  });

  it('safely handles null, undefined, and primitive redaction inputs', () => {
    expect(redactSensitiveData(null)).toBeNull();
    expect(redactSensitiveData(undefined)).toBeUndefined();
    expect(redactSensitiveData('safe-value')).toBe('safe-value');
    expect(redactSensitiveData(42)).toBe(42);
    expect(redactSensitiveData(true)).toBe(true);
  });
});
