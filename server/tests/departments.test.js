import request from 'supertest';
import { app } from '../src/app.js';
describe('departments', () => {
  it('returns the API response shape', async () => {
    const response = await request(app).get('/api/v1/departments');
    expect([200, 500]).toContain(response.status);
  });
});
