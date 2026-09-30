import { Logger } from '@nestjs/common';
import { ApplicationLogger } from './application-logger.service';

describe('ApplicationLogger', () => {
  let logger: ApplicationLogger;

  beforeEach(() => {
    logger = new ApplicationLogger();
    jest.restoreAllMocks();
  });

  it('logs a message without context', () => {
    const spy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    logger.info('Application started');

    expect(spy).toHaveBeenCalledWith('Application started');
  });

  it('logs structured context', () => {
    const spy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    logger.info('Resource processed', {
      resourceId: 'resource-1',
      operation: 'process',
    });

    expect(spy).toHaveBeenCalledWith(
      'Resource processed {"resourceId":"resource-1","operation":"process"}',
    );
  });

  it('supports warning logging', () => {
    const spy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

    logger.warn('Resource approaching expiry');

    expect(spy).toHaveBeenCalledWith('Resource approaching expiry');
  });

  it('supports error logging', () => {
    const spy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    logger.error('Operation failed', {
      operation: 'publish',
    });

    expect(spy).toHaveBeenCalledWith(
      'Operation failed {"operation":"publish"}',
    );
  });
});
