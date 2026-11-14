import request from 'supertest';
import { app } from '../src/app.js';
describe('health', () => {
  it('returns an ok response', async () => {
    const response = await request(app).get('/api/v1/health');
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('ok');
  });
});
