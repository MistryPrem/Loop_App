import request from 'supertest';
import { createApp } from '../src/app.js';

describe('Loop Server API Health & Middleware', () => {
  const app = createApp();

  test('GET /health returns 200 with ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.uptime).toBeDefined();
  });

  test('GET /unknown-route returns friendly 404 error without stack traces', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('NOT_FOUND');
    expect(res.body.message).toBe('The requested page or endpoint could not be found.');
  });
});
