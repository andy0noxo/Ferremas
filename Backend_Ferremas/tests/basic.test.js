const request = require('supertest');
const app = require('../src/server');

describe('API de Ferremas', () => {
  it('GET /api/inicio debe responder con info general', async () => {
    const res = await request(app).get('/api/inicio');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('POST /api/auth/login debe fallar con credenciales inválidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'fake@fake.com', contrasena: '12345678' });
    expect(res.statusCode).toBe(401);
  });
});
