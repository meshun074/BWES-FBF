import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createTestApp } from './create-test-app';

interface ErrorResponseBody {
  error: {
    code: string;
    message: string | string[];
    requestId?: string;
  };
}

function parseErrorResponse(responseText: string): ErrorResponseBody {
  return JSON.parse(responseText) as ErrorResponseBody;
}

describe('BWES API integration', () => {
  let app: INestApplication;
  let httpServer: App;

  beforeAll(async () => {
    app = await createTestApp();
    httpServer = app.getHttpServer() as App;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('status endpoint', () => {
    it('GET /api/v1/status returns service status', async () => {
      await request(httpServer).get('/api/v1/status').expect(200).expect({
        service: 'bwes-api',
        status: 'ok',
      });
    });

    it('returns a server-generated request ID', async () => {
      const response = await request(httpServer)
        .get('/api/v1/status')
        .expect(200);

      expect(response.headers['x-request-id']).toEqual(expect.any(String));

      expect(response.headers['x-request-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('does not trust a client-supplied request ID', async () => {
      const response = await request(httpServer)
        .get('/api/v1/status')
        .set('x-request-id', 'client-controlled-value')
        .expect(200);

      expect(response.headers['x-request-id']).toEqual(expect.any(String));

      expect(response.headers['x-request-id']).not.toBe(
        'client-controlled-value',
      );
    });
  });

  describe('HTTP security', () => {
    it('applies security headers', async () => {
      const response = await request(httpServer)
        .get('/api/v1/status')
        .expect(200);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
      expect(response.headers['content-security-policy']).toEqual(
        expect.any(String),
      );
    });
  });

  describe('error responses', () => {
    it('returns the standardized error envelope for an unknown route', async () => {
      const response = await request(httpServer)
        .get('/api/v1/does-not-exist')
        .expect(404);

      const body = parseErrorResponse(response.text);

      expect(body.error.code).toBe('NOT_FOUND');
      expect(body.error.message).toBe('Cannot GET /api/v1/does-not-exist');

      expect(typeof body.error.requestId).toBe('string');
      expect(body.error.requestId).toBe(response.headers['x-request-id']);
    });

    it('replaces a client request ID on error responses', async () => {
      const response = await request(httpServer)
        .get('/api/v1/does-not-exist')
        .set('x-request-id', 'fake-client-id')
        .expect(404);

      const body = parseErrorResponse(response.text);

      expect(response.headers['x-request-id']).not.toBe('fake-client-id');
      expect(body.error.requestId).not.toBe('fake-client-id');

      expect(body.error.requestId).toBe(response.headers['x-request-id']);
    });
  });

  describe('CORS', () => {
    it('allows the configured frontend origin', async () => {
      const response = await request(httpServer)
        .options('/api/v1/status')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBe(
        'http://localhost:3000',
      );

      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });
  });

  describe('operational health', () => {
    it('reports the API process as healthy', async () => {
      const response = await request(httpServer)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'ok',
      });
    });

    it('reports the API as ready when PostgreSQL is available', async () => {
      const response = await request(httpServer)
        .get('/api/v1/ready')
        .expect(200);

      expect(response.body).toEqual({
        status: 'ready',
      });
    });
  });
});
