import { HttpStatus } from '@nestjs/common';
import { HealthController } from './health.controller';
import type { ReadinessService } from './readiness.service';

describe('HealthController', () => {
  const status = jest.fn();
  const json = jest.fn();

  const response = {
    status,
    json,
  } as unknown as Response;

  status.mockReturnValue(response);
  let controller: HealthController;
  let readinessService: jest.Mocked<Pick<ReadinessService, 'isReady'>>;

  beforeEach(() => {
    readinessService = {
      isReady: jest.fn(),
    };

    controller = new HealthController(
      readinessService as unknown as ReadinessService,
    );
  });

  it('reports the API process as alive', () => {
    expect(controller.getHealth()).toEqual({
      status: 'ok',
    });
  });

  it('reports ready when PostgreSQL is available', async () => {
    readinessService.isReady.mockResolvedValue(true);

    await controller.getReadiness(response);

    expect(status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(json).toHaveBeenCalledWith({
      status: 'ready',
    });
  });

  it('returns service unavailable when PostgreSQL is unavailable', async () => {
    readinessService.isReady.mockResolvedValue(false);

    await controller.getReadiness(response);

    expect(status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    expect(json).toHaveBeenCalledWith({
      status: 'not_ready',
    });
  });
});
