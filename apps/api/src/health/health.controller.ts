import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ReadinessService } from './readiness.service';
import { Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller()
export class HealthController {
  constructor(private readonly readinessService: ReadinessService) {}

  @Get('health')
  getHealth(): { status: 'ok' } {
    return {
      status: 'ok',
    };
  }

  @Get('ready')
  async getReadiness(@Res() response: Response): Promise<void> {
    const ready = await this.readinessService.isReady();

    if (!ready) {
      response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'not_ready',
      });
      return;
    }

    response.status(HttpStatus.OK).json({
      status: 'ready',
    });
  }
}
