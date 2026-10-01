import { envValidationSchema } from './env.validation';

const REQUIRED_ENV = {
  DATABASE_URL: 'postgresql://fake-user:fake-password@localhost:5432/fake-db',
};

describe('Worker environment validation', () => {
  it('defaults LOG_LEVEL to info', () => {
    const result = envValidationSchema.validate(REQUIRED_ENV);
    const value = result.value as Record<string, unknown>;

    expect(result.error).toBeUndefined();
    expect(value.LOG_LEVEL).toBe('info');
  });

  it.each(['info', 'warn', 'error'])('accepts LOG_LEVEL=%s', (logLevel) => {
    const result = envValidationSchema.validate({
      ...REQUIRED_ENV,
      LOG_LEVEL: logLevel,
    });
    const value = result.value as Record<string, unknown>;

    expect(result.error).toBeUndefined();
    expect(value.LOG_LEVEL).toBe(logLevel);
  });

  it('rejects an unsupported LOG_LEVEL', () => {
    const result = envValidationSchema.validate({
      ...REQUIRED_ENV,
      LOG_LEVEL: 'debug',
    });

    expect(result.error).toBeDefined();
  });
});
