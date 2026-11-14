import request from 'supertest';
import { app } from '../src/app.js';
describe('doctors', () => {
  it('rejects invalid ids with the error shape', async () => {
    const response = await request(app).get('/api/v1/doctors/not-an-id');
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_ID');
  });
});
